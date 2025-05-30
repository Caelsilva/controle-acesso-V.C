from flask_sqlalchemy import SQLAlchemy
from datetime import date

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)  # usado como login
    senha = db.Column(db.String(255), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # admin, prestador, funcionario

    # Relacionamento com funcionários criados por esse usuário
    funcionarios = db.relationship(
        'Funcionario',
        backref='criador',
        cascade="all, delete",
        lazy=True
    )

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'tipo': self.tipo
        }

class Funcionario(db.Model):
    __tablename__ = 'funcionario'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    cpf = db.Column(db.String(20), nullable=False)
    lote = db.Column(db.String(20), nullable=False)
    telefone = db.Column(db.String(20))
    dataNascimento = db.Column(db.String(20))
    periodo = db.Column(db.String(20))
    dataInicio = db.Column(db.Date)
    dataFim = db.Column(db.Date)
    observacao = db.Column(db.Text)
    
    criador_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)  # quem cadastrou

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cpf': self.cpf,
            'lote': self.lote,
            'telefone': self.telefone,
            'dataNascimento': self.dataNascimento,
            'periodo': self.periodo,
            'dataInicio': self.dataInicio.isoformat() if self.dataInicio else None,
            'dataFim': self.dataFim.isoformat() if self.dataFim else None,
            'observacao': self.observacao,
            'criador_id': self.criador_id
        }