document
  .getElementById("presencaForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Obtenção dos dados do formulário
    const nomeAluno = document.getElementById("nome_aluno").value;
    const turma = document.getElementById("turma").value;
    const sessaoId = document.getElementById("sessao").value; // Obtém o ID da sessão
    const conteudo = document.getElementById("conteudo").value;

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
          body: JSON.stringify(dados), // Corpo com os dados do formulário
        }
      );

      const result = await response.json(); // Resposta do servidor

      // Mensagem de sucesso ou erro
      alert(result.message || "Presença registrada com sucesso!");
      document.getElementById("presencaForm").reset(); // Limpa o formulário após o envio
    } catch (error) {
      // Caso ocorra um erro
      console.error("Erro ao registrar presença:", error);
      alert("Erro ao registrar presença. Verifique o console.");
    }
  });
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
      option.textContent = `Sessão ${sessao.id} | ${sessao.monitor_nome} | ${horaInicio} às ${horaFim}`;
      sessaoSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar as sessões:", error);
  }
}

window.onload = carregarSessoes;
