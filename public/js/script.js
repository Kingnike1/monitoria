document.getElementById('presencaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nomeAluno = document.getElementById('nome_aluno').value;
  const turma = document.getElementById('turma').value;
  const monitorId = document.getElementById('monitor').value; // Pega o ID do monitor selecionado
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  const conteudo = document.getElementById('conteudo').value;

  const dados = {
    nome_aluno: nomeAluno,
    turma,
    monitor_id: monitorId, // Envia o ID do monitor
    data,
    horario,
    conteudo,
  };

  try {
    const response = await fetch('http://localhost:3000/presencas/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });

    const result = await response.json();

    alert(result.message || 'Presença registrada com sucesso!');

    // Limpa todos os campos do formulário
    document.getElementById('presencaForm').reset();
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
    alert('Erro ao registrar presença. Verifique o console.');
  }
});


  async function carregarMonitores() {
    try {
      const response = await fetch("http://localhost:3000/presencas/listar/monitor");
      const monitores = await response.json();
  
      const monitorSelect = document.getElementById("monitor");
  
      // Limpando opções anteriores
      monitorSelect.innerHTML = '<option value="" disabled selected>Selecione o Monitor</option>';
  
      // Adicionando cada monitor ao select
      monitores.forEach((monitor) => {
        const option = document.createElement("option");
        option.value = monitor.id; // Aqui, o valor será o id do monitor
        option.textContent = monitor.nome; // Exibe o nome do monitor
        monitorSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar os monitores:", error);
    }
  }
  

// Chama a função ao carregar a página
window.onload = carregarMonitores;
