document.addEventListener('DOMContentLoaded', async () => {
  console.log("📦 cadastro.js carregado");

  const form = document.getElementById('formPrestador');
  const listaContainer = document.getElementById('listaPrestadores');

  if (!form) {
    console.error("❌ Formulário não encontrado na página!");
    return;
  }

  // Verifica sessão
  try {
    const resposta = await fetch("https://controle-acesso-frontend.onrender.com/usuario_logado", {
      method: "GET",
      credentials: "include"
    });

    if (!resposta.ok) {
      throw new Error("Usuário não autenticado");
    }

    await resposta.json();
  } catch (err) {
    alert("Usuário não autenticado! Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  function formatarDataBR(dataISO) {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function carregarPrestadores() {
    fetch(`https://controle-acesso-frontend.onrender.com/listar_funcionarios?apenas_meus=true`, {
      method: "GET",
      credentials: "include"
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Erro ao buscar prestadores do banco");
        }
        return response.json();
      })
      .then(lista => {
        listaContainer.innerHTML = "<h2>Prestadores cadastrados:</h2>";

        lista.forEach((p) => {
          const inicioBR = formatarDataBR(p.dataInicio);
          const fimBR = formatarDataBR(p.dataFim);

          listaContainer.innerHTML += `
            <div style="border: 1px solid #ccc; box-shadow: 0 0 15px rgb(0, 0, 0); padding: 12px; margin-bottom: 10px; border-radius: 8px; background: #f9f9f9;">
              <p><strong><i class="fas fa-user icone-preto"></i> Nome:</strong> ${p.nome}</p>
              <p><strong><i class="fas fa-id-card icone-preto"></i> CPF:</strong> ${p.cpf}</p>
              <p><strong><i class="fas fa-phone icone-preto"></i> Telefone:</strong> ${p.telefone}</p>
              <p><strong><i class="fas fa-home icone-preto"></i> Lote:</strong> ${p.lote}</p>
              <p><strong><i class="fas fa-birthday-cake icone-preto"></i> Data de Nascimento:</strong> ${p.dataNascimento}</p>
              <p><strong><i class="fas fa-calendar-alt icone-preto"></i> Período:</strong> ${p.periodo} dias</p>
              <p><strong><i class="fas fa-thumbtack icone-preto"></i> Início:</strong> ${inicioBR} | <strong><i class="fas fa-thumbtack icone-preto"></i> Fim:</strong> ${fimBR}</p>
              <p><strong><i class="fas fa-sticky-note icone-preto"></i> Observações:</strong> ${p.observacao || "Nenhuma"}</p>
            </div>
          `;
        });
      })
      .catch(error => {
        console.error("Erro ao carregar prestadores:", error);
        listaContainer.innerHTML = "<p>Erro ao carregar prestadores.</p>";
      });
  }

  carregarPrestadores();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    console.log("📤 Submetendo formulário...");

    const periodo = parseInt(document.getElementById('periodo').value);
    if (periodo > 90) {
      alert("Período máximo é de 90 dias!");
      return;
    }

    const dataCadastro = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataCadastro.getDate() + periodo);

    const prestador = {
      nome: document.getElementById('nome').value,
      cpf: document.getElementById('cpf').value,
      telefone: document.getElementById('telefone').value,
      lote: document.getElementById('lote').value,
      dataNascimento: document.getElementById('dataNascimento').value,
      periodo: periodo,
      observacao: document.getElementById('observacao').value,
      dataInicio: dataCadastro.toISOString().split('T')[0],
      dataFim: dataFim.toISOString().split('T')[0]
    };

    console.log("📨 Enviando para o backend:", prestador);

    fetch('https://controle-acesso-frontend.onrender.com/cadastrar_funcionario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: "include",
      body: JSON.stringify(prestador)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.erro || "Erro ao cadastrar prestador.");
          });
        }
        return response.json();
      })
      .then(data => {
        alert("Prestador cadastrado com sucesso!");
        form.reset();
        carregarPrestadores();
      })
      .catch(error => {
        console.error("❌ Erro ao enviar para o backend:", error);
        alert(error.message);
      });
  });
});

// Botão de logout
const logoutBtn = document.getElementById("btnLogout");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("https://controle-acesso-frontend.onrender.com/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.warn("Erro ao tentar deslogar, mas tudo bem.");
    }

    window.location.href = "login.html";
  });
}