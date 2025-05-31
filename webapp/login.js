document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  try {
    const resposta = await fetch("https://controle-acesso-vc.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.status === "ok") {
      alert(dados.mensagem);

      const respostaUsuario = await fetch("https://controle-acesso-vc.onrender.com/usuario_logado", {
        method: "GET",
        credentials: "include"
      });

      if (!respostaUsuario.ok) {
        throw new Error("Erro ao identificar o usuário logado.");
      }

      const usuario = await respostaUsuario.json();

      switch (usuario.tipo) {
        case "admin":
          window.location.href = "adm.html";
          break;
        case "funcionario":
          window.location.href = "funcionário.html";
          break;
        case "prestador":
          window.location.href = "cadastro.html";
          break;
        default:
          alert("Tipo de usuário desconhecido. Fale com o suporte.");
      }
    } else {
      alert(dados.mensagem || "Email ou senha inválidos.");
    }
  } catch (error) {
    console.error("Erro no login:", error);
    alert("Erro ao tentar fazer login. Tente novamente.");
  }
});