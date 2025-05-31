document.addEventListener("DOMContentLoaded", async () => {
  const listaContainer = document.getElementById("listaPrestadores");
  const filtroLote = document.getElementById("filtroLote");
  const filtroNome = document.getElementById("filtroNome");
  const filtroCPF = document.getElementById("filtroCPF");
  const btnLogout = document.getElementById("btnLogout");

  let todosPrestadores = [];
  let tipoLogado = "";
  let emailLogado = "";

  // Verifica sessão e só então carrega os dados
  try {
    const resposta = await fetch("https://controle-acesso-vc.onrender.com/usuario_logado", {
      method: "GET",
      credentials: "include"
    });

    if (!resposta.ok) {
      throw new Error("Usuário não autenticado");
    }

    const usuario = await resposta.json();
    emailLogado = usuario.email;
    tipoLogado = usuario.tipo;

    await carregarTodosPrestadores();
  } catch (err) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "login.html";
    return;
  }

  async function carregarTodosPrestadores() {
    try {
      const response = await fetch("https://controle-acesso-vc.onrender.com/listar_funcionarios", {
        method: "GET",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Erro na requisição");
      }

      const dados = await response.json();

      if (dados && dados.length > 0) {
        todosPrestadores = dados;
        atualizarLotes();
        renderizarLista(todosPrestadores);
      } else {
        listaContainer.innerHTML = "<p>Nenhum prestador encontrado.</p>";
      }
    } catch (err) {
      console.error("Erro ao buscar funcionários:", err);
      listaContainer.innerHTML = "<p>Erro ao carregar os dados 😢</p>";
    }
  }

  function atualizarLotes() {
    const lotesUnicos = [...new Set(
      todosPrestadores
        .map(p => p.lote)
        .filter(l => l.trim() !== "")
    )];

    filtroLote.innerHTML = `<option value="">Todos</option>`;

    lotesUnicos.forEach(lote => {
      const option = document.createElement("option");
      option.value = lote;
      option.textContent = lote;
      filtroLote.appendChild(option);
    });
  }

  function formatarData(dataISO) {
    const data = new Date(dataISO);
    const opcoes = {
      day: "2-digit",
      month: "short",
      year: "numeric"
    };
    return data.toLocaleDateString("pt-BR", opcoes);
  }

  function renderizarLista(lista) {
    listaContainer.innerHTML = "";

    if (lista.length === 0) {
      listaContainer.innerHTML = "<p>Nenhum prestador encontrado 😶</p>";
      return;
    }

    lista.forEach(p => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <p><strong><i class="fas fa-user icone-preto"></i> Nome:</strong> ${p.nome}</p>
        <p><strong><i class="fas fa-id-card icone-preto"></i> CPF:</strong> ${p.cpf}</p>
        <p><strong><i class="fas fa-home icone-preto"></i> Lote:</strong> ${p.lote}</p>
        <p><strong><i class="fas fa-phone icone-preto"></i> Telefone:</strong> ${p.telefone}</p>
        <p><strong><i class="fas fa-birthday-cake icone-preto"></i> Nascimento:</strong> ${p.dataNascimento}</p>
        <p><strong><i class="fas fa-calendar-alt icone-preto"></i> Período:</strong> ${p.periodo} dias</p>
        <p><strong><i class="fas fa-thumbtack icone-preto"></i> Início:</strong> ${formatarData(p.dataInicio)} | <strong>Fim:</strong> ${formatarData(p.dataFim)}</strong></p>
        <p><strong><i class="fas fa-sticky-note icone-preto"></i> Observações:</strong> ${p.observacao || "Nenhuma"}</p>
        <p><strong><i class="fas fa-user-tag icone-preto"></i> Cadastrado por:</strong> ${p.usuario}</p>
      `;
      listaContainer.appendChild(card);
    });
  }

  function aplicarFiltros() {
    const lote = filtroLote.value.toLowerCase();
    const nome = filtroNome.value.toLowerCase();
    const cpf = filtroCPF.value.toLowerCase();

    const filtrados = todosPrestadores.filter(p => {
      return (
        (lote === "" || p.lote.toLowerCase() === lote) &&
        (nome === "" || p.nome.toLowerCase().includes(nome)) &&
        (cpf === "" || p.cpf.toLowerCase().includes(cpf))
      );
    });

    renderizarLista(filtrados);
  }

  filtroLote.addEventListener("change", aplicarFiltros);
  filtroNome.addEventListener("input", aplicarFiltros);
  filtroCPF.addEventListener("input", aplicarFiltros);

  btnLogout.addEventListener("click", async () => {
    try {
      await fetch("https://controle-acesso-vc.onrender.com/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.warn("Erro ao tentar deslogar.");
    }
    window.location.href = "login.html";
  });
});