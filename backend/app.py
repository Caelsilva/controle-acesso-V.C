import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, Usuario, Funcionario
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'sua_chave_ultra_secreta_aqui'

# ✅ URL do banco: usa variável de ambiente no Render, senão usa local
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://postgres:123456@localhost/controle_acesso'  # fallback local
)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

# CORS para frontend no Render
CORS(app, supports_credentials=True, origins=[
    "https://controle-acesso-frontend.onrender.com"
])

db.init_app(app)

# ---------------------- ROTAS ----------------------

@app.route('/')
def home():
    return "Servidor Flask rodando! Vista Campinas na área 🚀"

@app.route('/login', methods=['POST'])
def login():
    try:
        dados = request.json
        email = dados.get('email')
        senha = dados.get('senha')

        usuario = Usuario.query.filter_by(email=email).first()

        if usuario and check_password_hash(usuario.senha, senha):
            session['usuario_id'] = usuario.id
            session['usuario_email'] = usuario.email
            session['usuario_tipo'] = usuario.tipo

            return jsonify({
                "status": "ok",
                "mensagem": "Login realizado com sucesso!",
                "tipo": usuario.tipo
            })
        else:
            return jsonify({
                "status": "erro",
                "mensagem": "Usuário ou senha inválidos!"
            }), 401

    except Exception as e:
        print("❌ ERRO NA ROTA /login:", e)
        return jsonify({"erro": f"Erro interno no login: {str(e)}"}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"status": "ok", "mensagem": "Sessão encerrada com sucesso!"})

@app.route('/usuario_logado', methods=['GET'])
def usuario_logado():
    if 'usuario_email' in session:
        return jsonify({
            "email": session['usuario_email'],
            "tipo": session['usuario_tipo']
        })
    else:
        return jsonify({"erro": "Não autenticado"}), 401

@app.route('/cadastrar_usuario', methods=['POST'])
def cadastrar_usuario():
    dados = request.json
    nome = dados.get('nome')
    email = dados.get('login')
    senha = dados.get('senha')
    tipo = dados.get('tipo')

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"mensagem": "Usuário já existe!"}), 400

    senha_hash = generate_password_hash(senha)
    novo_usuario = Usuario(nome=nome, email=email, senha=senha_hash, tipo=tipo)
    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"mensagem": "Usuário cadastrado com sucesso!"}), 201

@app.route('/usuarios', methods=['GET'])
def listar_usuarios():
    tipo = session.get('usuario_tipo')
    email = session.get('usuario_email')

    if not email:
        return jsonify([])

    if tipo == "admin":
        usuarios = Usuario.query.all()
    else:
        usuario_logado = Usuario.query.filter_by(email=email).first()
        usuarios = Usuario.query.filter_by(criador_id=usuario_logado.id).all()

    return jsonify([u.to_dict() for u in usuarios])

@app.route('/excluir_usuario/<int:id>', methods=['DELETE'])
def excluir_usuario(id):
    usuario = Usuario.query.get(id)

    if not usuario:
        return jsonify({"mensagem": "Usuário não encontrado!"}), 404

    try:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({"mensagem": "Usuário excluído com sucesso!"})
    except Exception as e:
        return jsonify({"erro": f"Erro ao excluir usuário: {str(e)}"}), 500

@app.route('/cadastrar_funcionario', methods=['POST'])
def cadastrar_funcionário():
    if 'usuario_email' not in session:
        return jsonify({'erro': 'Usuário não autenticado'}), 401

    dados = request.get_json()

    try:
        data_inicio = datetime.strptime(dados['dataInicio'], '%Y-%m-%d').date()
        data_fim = datetime.strptime(dados['dataFim'], '%Y-%m-%d').date()

        criador = Usuario.query.filter_by(email=session['usuario_email']).first()
        if not criador:
            raise Exception("Usuário logado não encontrado na base.")

        novo_funcionario = Funcionario(
            nome=dados['nome'],
            cpf=dados['cpf'],
            telefone=dados['telefone'],
            lote=dados['lote'],
            dataNascimento=dados['dataNascimento'],
            periodo=dados['periodo'],
            observacao=dados['observacao'],
            dataInicio=data_inicio,
            dataFim=data_fim,
            criador_id=criador.id
        )

        db.session.add(novo_funcionario)
        db.session.commit()

        return jsonify({'mensagem': 'Funcionário cadastrado com sucesso!'}), 200

    except Exception as e:
        print("❌ Erro ao cadastrar funcionário:", e)
        return jsonify({'erro': f'Erro ao salvar no banco de dados: {str(e)}'}), 400

@app.route('/listar_funcionarios', methods=['GET'])
def listar_funcionarios():
    tipo = session.get('usuario_tipo')
    email = session.get('usuario_email')
    apenas_meus = request.args.get("apenas_meus") == "true"

    if not email:
        return jsonify([])

    usuario = Usuario.query.filter_by(email=email).first()
    if not usuario:
        return jsonify([])

    if tipo == "prestador" or apenas_meus:
        funcionarios = Funcionario.query.filter_by(criador_id=usuario.id).all()
    else:
        funcionarios = Funcionario.query.all()

    resposta = []
    for f in funcionarios:
        resposta.append({
            "id": f.id,
            "nome": f.nome,
            "cpf": f.cpf,
            "lote": f.lote,
            "telefone": f.telefone,
            "dataNascimento": f.dataNascimento,
            "periodo": f.periodo,
            "dataInicio": f.dataInicio,
            "dataFim": f.dataFim,
            "observacao": f.observacao,
            "usuario": f.criador.email
        })

    return jsonify(resposta)

@app.route('/redefinir_senha', methods=['POST'])
def redefinir_senha():
    dados = request.json
    usuario_id = dados.get('id')
    nova_senha = dados.get('nova_senha')

    if not usuario_id or not nova_senha:
        return jsonify({"erro": "Dados incompletos"}), 400

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return jsonify({"erro": "Usuário não encontrado!"}), 404

    usuario.senha = generate_password_hash(nova_senha)
    db.session.commit()

    return jsonify({"mensagem": "Senha redefinida com sucesso!"})

@app.route("/resetar_admin", methods=["GET"])
def resetar_admin():
    try:
        admin = Usuario.query.filter_by(email="admin@vistacampinas.com").first()
        if admin:
            admin.senha = generate_password_hash("123456")
            db.session.commit()
            return jsonify({"mensagem": "Senha resetada com sucesso!"})
        return jsonify({"erro": "Admin não encontrado!"}), 404
    except Exception as e:
        print("❌ ERRO NA ROTA /resetar_admin:", e)
        return jsonify({"erro": str(e)}), 500

# ---------------------- RODAR SERVIDOR ----------------------

with app.app_context():
    print("🔄 Criando tabelas se não existirem...")
    db.create_all()

    admin = Usuario.query.filter_by(email="admin@vistacampinas.com").first()
    if not admin:
        print("✅ Criando admin padrão...")
        admin = Usuario(
            nome="Administrador",
            email="admin@vistacampinas.com",
            senha=generate_password_hash("123456"),
            tipo="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin criado com sucesso!")
    else:
        print("⚠️ Admin já existe.")