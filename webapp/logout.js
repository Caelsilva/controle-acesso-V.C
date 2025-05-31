
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnLogout");
  if (btn) {
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch("https://controle-acesso-vc.onrender.com/logout", {
          method: "POST",
          credentials: "include"
        });
        if (res.ok) {
          window.location.href = "login.html";
        }
      } catch {
        alert("Erro ao sair. Tente novamente.");
      }
    });
  }
});
