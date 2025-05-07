document.getElementById("presencaForm").addEventListener("dblclick", (e) => {
  e.preventDefault(); // Evita que o formulário seja enviado imediatamente

  // Obter os dados do formulário
  const nomeAluno = document.getElementById("nome_aluno").value;
  const turma = document.getElementById("turma").value;
  const sessao = document.getElementById("sessao").value;
  const conteudo = document.getElementById("conteudo").value;

  // Validar se todos os campos estão preenchidos
  if (!nomeAluno || !turma || !sessao || !conteudo) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  // Preencher a modal com os dados
  document.getElementById("confirmNome").textContent = nomeAluno;
  document.getElementById("confirmTurma").textContent = turma;
  document.getElementById("confirmSessao").textContent = sessao;
  document.getElementById("confirmConteudo").textContent = conteudo;

  // Exibir a modal de confirmação
  document.getElementById("modalConfirmacao").style.display = "flex";
});

document
  .getElementById("confirmarBtn")
  .addEventListener("click", async function (e) {
    e.preventDefault(); // Previne que o evento de clique no botão "Confirmar" seja propagado ou cause outro comportamento inesperado

    // Obtenção dos dados da modal (confirmados pelo usuário)
    const nomeAluno = document.getElementById("confirmNome").textContent;
    const turma = document.getElementById("confirmTurma").textContent;
    const sessaoId = document.getElementById("confirmSessao").textContent;
    const conteudo = document.getElementById("confirmConteudo").textContent;

    // Criação do objeto com os dados a serem enviados
    const dados = {
      nome_aluno: nomeAluno,
      turma,
      sessao_id: sessaoId,
      conteudo,
    };

    try {
      // Envio dos dados para o backend via POST
      const response = await fetch(
        "http://localhost:3000/presencas/registrar",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        }
      );

      const result = await response.json(); // Resposta do servidor

      // Mensagem de sucesso ou erro
      alert(result.message || "Presença registrada com sucesso!");
      document.getElementById("presencaForm").reset(); // Limpa o formulário após o envio
      document.getElementById("modalConfirmacao").style.display = "none"; // Fecha o modal
    } catch (error) {
      // Caso ocorra um erro
      console.error("Erro ao registrar presença:", error);
      alert("Erro ao registrar presença. Verifique o console.");
    }
  });

// Evento de cancelamento da modal
document.getElementById("cancelarBtn").addEventListener("click", function () {
  document.getElementById("modalConfirmacao").style.display = "none"; // Fecha o modal
});

// Função para carregar as sessões
async function carregarSessoes() {
  try {
    const response = await fetch("http://localhost:3000/sessoes/ativas");
    const sessoes = await response.json();

    const sessaoSelect = document.getElementById("sessao");
    sessaoSelect.innerHTML =
      '<option value="" disabled selected>Selecione uma Sessão</option>';

    // Formata a data para um formato legível (ex: 07/05/2025 14:00)
    const formatarDataHora = (dataISO) => {
      const data = new Date(dataISO);
      return data.toLocaleString("pt-BR"); // Remove o timeZone fixo
    };

    sessoes.forEach((sessao) => {
      const horaInicio = formatarDataHora(sessao.hora_inicio);
      const horaFim = sessao.hora_fim
        ? formatarDataHora(sessao.hora_fim)
        : "Ainda em andamento";

      const option = document.createElement("option");
      option.value = sessao.id;
      option.textContent = `${sessao.monitor_nome} | ${horaInicio} às ${horaFim}`;
      sessaoSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar as sessões:", error);
  }
}

window.onload = carregarSessoes;
