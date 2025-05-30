document.getElementById("login-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  try {
    const resposta = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",  // ESSENCIAL PRA USAR SESSÃO
      body: JSON.stringify({ email, senha })
    });

    const dados = await resposta.json();

    if (resposta.ok && dados.status === "ok") {
      alert(dados.mensagem);

      // Após login bem-sucedido, buscar dados do usuário logado
      const respostaUsuario = await fetch("http://127.0.0.1:5000/usuario_logado", {
        method: "GET",
        credentials: "include"  // de novo, pra manter a sessão
      });

      const usuario = await respostaUsuario.json();

      if (respostaUsuario.ok) {
        // Redirecionar baseado no tipo de usuário retornado pela sessão
        if (usuario.tipo === "admin") {
          window.location.href = "adm.html";
        } else if (usuario.tipo === "funcionario") {
          window.location.href = "funcionário.html";
        } else if (usuario.tipo === "prestador") {
          window.location.href = "cadastro.html";
        } else {
          alert("Tipo de usuário desconhecido. Fale com o suporte.");
        }
      } else {
        alert("Erro ao identificar o usuário logado.");
      }
    } else {
      alert(dados.mensagem || "Erro no login.");
    }
  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao tentar logar. Tente novamente.');
  }
});