document.getElementById('presencaForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nomeAluno = document.getElementById('nome_aluno').value;
  const turma = document.getElementById('turma').value;
  const monitoresSelecionados = getMonitoresSelecionados();
  const data = document.getElementById('data').value;
  const horario = document.getElementById('horario').value;
  const conteudo = document.getElementById('conteudo').value;

  const dados = {
    nomeAluno,
    turma,
    monitores: monitoresSelecionados,
    data,
    horario,
    conteudo
  };

  try {
    const response = await fetch('/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    const result = await response.json();
    alert(result.mensagem);
  } catch (error) {
    console.error('Erro ao registrar presença:', error);
  }
});

  async function carregarMonitores() {
    try {
      const response = await fetch('http://localhost:3000/presencas/listar/monitor');
      const monitores = await response.json();

      const container = document.getElementById('monitorContainer');

      monitores.forEach(monitor => {
        const label = document.createElement('label');
        label.style.display = 'block'; // Deixa um abaixo do outro

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'monitor';
        checkbox.value = monitor.nome;

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${monitor.nome}`));
        container.appendChild(label);
      });
    } catch (error) {
      console.error('Erro ao carregar os monitores:', error);
    }
  }

  // Coleta os valores selecionados nos checkboxes
  function getMonitoresSelecionados() {
    const checkboxes = document.querySelectorAll('input[name="monitor"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  window.onload = carregarMonitores;