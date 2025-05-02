document.getElementById('presencaForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const nome_aluno = document.getElementById('nome_aluno').value;
    const turma = document.getElementById('turma').value;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const conteudo = document.getElementById('conteudo').value;
  
    try {
      const response = await fetch('http://localhost:3000/presencas/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome_aluno, turma, data, horario, conteudo }),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao registrar presença');
      }
  
      alert('Presença registrada com sucesso!');
      document.getElementById('presencaForm').reset();
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar presença');
    }
  });
  