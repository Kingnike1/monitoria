const toggleCheckbox = document.getElementById("formToggle");
const modoTexto = document.getElementById("modo");

toggleCheckbox.addEventListener("change", () => {
  modoTexto.textContent = toggleCheckbox.checked ? "Login" : "Cadastro";
});

// Cadastro
document
  .getElementById("cadastro-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const nome = document.getElementById("cadastro-nome").value;
    const email = document.getElementById("cadastro-email").value;
    const senha = document.getElementById("cadastro-senha").value;

    const response = await fetch("/cadastrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha }),
    });

    const result = await response.json();
    const mensagemDiv = document.getElementById("mensagem");

    if (response.ok) {
      exibirModal("Monitor cadastrado com sucesso!", true);
      toggleCheckbox.checked = false;
      modoTexto.textContent = "Cadastro";
    } else {
      exibirModal(result.error || "Erro desconhecido. Tente novamente.", false);
    }
  });

// Login
document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const senha = document.getElementById("login-senha").value;

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    const result = await response.json();
    const mensagemDiv = document.getElementById("mensagem");

    if (response.ok) {
      exibirModal("Login bem-sucedido! Redirecionando...", true);
      setTimeout(() => {
        window.location.href = "/monitor";
      }, 1500);
    } else {
      exibirModal(
        result.error || "Erro ao fazer login. Tente novamente.",
        false
      );
    }
  });
// Mostrar/ocultar senha do login
document
  .getElementById("toggleSenhaLogin")
  .addEventListener("click", function (e) {
    e.stopPropagation(); // impede o flip do card
    const input = document.getElementById("login-senha");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });

// Mostrar/ocultar senha do cadastro
document
  .getElementById("toggleSenhaCadastro")
  .addEventListener("click", function (e) {
    e.stopPropagation(); // impede o flip do card
    const input = document.getElementById("cadastro-senha");
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
function mostrarMensagem(texto, tipo = "sucesso") {
  const icone = document.querySelector(".modal-icone i");
  const textoMensagem = document.getElementById("textoMensagem");
  const modal = document.getElementById("modalMensagem");

  textoMensagem.textContent = texto;

  if (tipo === "erro") {
    icone.className = "fas fa-times-circle";
    icone.style.color = "#e74c3c";
  } else if (tipo === "info") {
    icone.className = "fas fa-info-circle";
    icone.style.color = "#3498db";
  } else {
    icone.className = "fas fa-check-circle";
    icone.style.color = "#2ecc71";
  }

  modal.style.display = "flex";
}

function exibirModal(mensagem, sucesso = true) {
  const modal = document.getElementById("modalMensagem");
  const texto = document.getElementById("textoMensagem");
  texto.textContent = mensagem;
  texto.style.color = sucesso ? "green" : "red";
  modal.style.display = "block";
}

// Fechar modal manualmente
document.getElementById("fecharModal").onclick = function () {
  document.getElementById("modalMensagem").style.display = "none";
};

// Fechar modal clicando fora
window.onclick = function (event) {
  const modal = document.getElementById("modalMensagem");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};
