
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnLogout");
  if (btn) {
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/logout", {
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
