const sidebar = document.getElementById("sidebar");
const resizer = document.getElementById("resizer");

let isResizing = false;

resizer.addEventListener("mousedown", (e) => {
  isResizing = true;
  sidebar.classList.add("resizing");
  document.body.style.cursor = "ew-resize";
});

document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const newWidth = e.clientX;
  if (newWidth > 60 && newWidth < 500) {
    // limites mínimos/máximos
    sidebar.style.width = `${newWidth}px`;
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  sidebar.classList.remove("resizing");
  document.body.style.cursor = "default";
});
document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const newWidth = e.clientX;
  if (newWidth > 60 && newWidth < 500) {
    sidebar.style.width = `${newWidth}px`;

    if (newWidth <= 200) {
      sidebar.classList.add("collapsed");
    } else {
      sidebar.classList.remove("collapsed");
    }
  }
});
// Variável global para verificar se os gráficos já foram carregados
let graficosCarregados = false;

// Função para alternar a visibilidade da seção de gráficos
function toggleGrafico() {
  const conteudoGrafico = document.getElementById("conteudo-graficos");

  // Alterna entre mostrar e esconder a div de gráficos
  if (conteudoGrafico.style.display === "none") {
    conteudoGrafico.style.display = "block";

    // Carrega os gráficos apenas uma vez
    if (!graficosCarregados) {
      carregarGraficoPresencas(); // Carregar os gráficos
      graficosCarregados = true; // Marcar que os gráficos foram carregados
    }
  } else {
    conteudoGrafico.style.display = "none";
  }
}

// Função para carregar os gráficos
function carregarGraficoPresencas() {
  // Fazer uma requisição para obter os dados de presenças
  fetch("http://localhost:3000/presencas/listar")
    .then((response) => response.json()) // Transformar a resposta em JSON
    .then((data) => {
      // Preparar os dados para o gráfico
      const datas = [];
      const qtdPorData = [];
      const turmas = [];
      const qtdPorTurma = [];

      // Organizar os dados por data e turma
      data.forEach((item) => {
        // Processar a data (convertendo para formato mais simples)
        const dataFormatada = new Date(item.data).toLocaleDateString();

        // Adiciona a data ao gráfico de presenças por dia
        if (!datas.includes(dataFormatada)) {
          datas.push(dataFormatada);
          qtdPorData.push(0); // Inicializa a quantidade de presenças
        }

        // Incrementa a quantidade de presenças para a data correspondente
        const indexData = datas.indexOf(dataFormatada);
        qtdPorData[indexData]++;

        // Adiciona a turma ao gráfico de presenças por turma
        if (!turmas.includes(item.turma)) {
          turmas.push(item.turma);
          qtdPorTurma.push(0); // Inicializa a quantidade de presenças por turma
        }

        // Incrementa a quantidade de presenças para a turma correspondente
        const indexTurma = turmas.indexOf(item.turma);
        qtdPorTurma[indexTurma]++;
      });

      // Gráfico de presenças por data (linha)
      const ctx1 = document
        .getElementById("graficoPresencasPorData")
        .getContext("2d");
      new Chart(ctx1, {
        type: "line",
        data: {
          labels: datas,
          datasets: [
            {
              label: "Presenças por Dia",
              data: qtdPorData,
              fill: false,
              borderColor: "rgba(75, 192, 192, 1)",
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Presenças por Dia",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      // Gráfico de presenças por turma (barras)
      const ctx2 = document
        .getElementById("graficoPresencasPorTurma")
        .getContext("2d");
      new Chart(ctx2, {
        type: "bar",
        data: {
          labels: turmas,
          datasets: [
            {
              label: "Presenças por Turma",
              data: qtdPorTurma,
              backgroundColor: "rgba(255, 99, 132, 0.6)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: "Presenças por Turma",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar os dados de presenças:", error);
    });
}

function togglePresencas() {
  const div = document.getElementById("conteudo-presencas");
  if (div.style.display === "none") {
    div.style.display = "block";
    carregarPresencas();
  } else {
    div.style.display = "none";
  }
}

// Carregar presenças na tabela
async function carregarPresencas() {
  try {
    document.getElementById("conteudo").innerHTML = "";
    const response = await fetch("/presencas/listar");
    const presencas = await response.json();

    const tbody = document.getElementById("tabela-presencas");
    tbody.innerHTML = "";
    presencas.forEach((p) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.data}</td>
        <td>${p.horario}</td>
        <td>${p.nome_aluno}</td>
        <td>${p.turma}</td>
        <td>${p.nome_monitor}</td>
        <td>${p.conteudo || "-"}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao carregar presenças:", error);
    document.getElementById(
      "conteudo"
    ).innerHTML = `<p>Erro ao carregar as presenças.</p>`;
  }
}

// Logout
function logout() {
  fetch("/logout", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => {
      if (response.ok) {
        window.location.href = "/";
      } else {
        alert("Erro ao fazer logout");
      }
    })
    .catch((error) => {
      console.error("Erro no logout:", error);
      alert("Erro no logout");
    });
}

// Gerar PDF
document.getElementById("gerar-pdf").addEventListener("click", () => {
  fetch("/gerar-relatorio/pdf")
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "relatorio.pdf";
      link.click();
    })
    .catch((error) => console.error("Erro ao gerar relatório PDF:", error));
});

// Gerar CSV
document.getElementById("gerar-csv").addEventListener("click", () => {
  fetch("/gerar-relatorio/csv")
    .then((response) => response.text())
    .then((csv) => {
      const link = document.createElement("a");
      link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      link.download = "relatorio.csv";
      link.click();
    })
    .catch((error) => console.error("Erro ao gerar relatório CSV:", error));
});
