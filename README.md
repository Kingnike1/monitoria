# 📖 Documentação do Sistema de Registro de Presença na Monitoria

## 1. Visão Geral
Este sistema tem como objetivo registrar a presença dos alunos na monitoria, armazenando informações como nome, série/turma, horário e conteúdo ensinado. Além disso, permite que o monitor valide os registros e gere relatórios.

## 2. Funcionalidades

### 📌 Registro de Presença
Alunos preenchem um formulário com:
- Nome completo
- Ano/Período e Turma
- Confirmação de presença

### 📌 Painel do Monitor
- Monitor pode visualizar e validar registros.
- Adicionar o conteúdo ensinado.
- Gerar relatórios de presença.

### 📌 Banco de Dados
Armazena os seguintes dados:
- **ID** (chave primária)
- **Data da monitoria**
- **Horário da monitoria**
- **Nome dos participantes**
- **Ano/Período e Turma**
- **Conteúdo ensinado**

### 📌 Gerar Relatórios
- Exportação dos registros em formato **PDF** ou **Excel**.

### 📌 Autenticação (Opcional)
- Login para acesso ao painel do monitor.

## 3. Tecnologias Utilizadas
- **Frontend:** HTML, CSS, JavaScript (podemos adicionar Vue.js futuramente).
- **Backend:** Laravel (PHP) para gerenciar dados e lógica do sistema.
- **Banco de Dados:** MySQL ou SQLite.

## 4. Estrutura do Banco de Dados (Migrations Laravel)

### Tabela `monitoria_presencas`

| Campo           | Tipo       | Descrição                 |
|---------------|-----------|---------------------------|
| id            | INT (PK)  | Identificador único       |
| data_monitoria | DATE      | Data da monitoria         |
| horario       | TIME      | Horário da monitoria      |
| nome_aluno    | STRING    | Nome do aluno             |
| turma        | STRING    | Ano/Período e Turma       |
| conteudo      | TEXT      | Conteúdo ensinado         |

## 5. Fluxo do Sistema
1️⃣ **Aluno preenche o formulário** com seu nome, turma e confirma presença.
2️⃣ **Monitor acessa o painel** para validar os registros e adicionar o conteúdo ensinado.
3️⃣ **Monitor pode gerar relatórios** de presença e exportar em PDF ou Excel.

## 6. Próximos Passos
✅ Criar a estrutura do banco de dados (**migrations no Laravel**).
✅ Criar o formulário de **registro de presença**.
✅ Criar o **painel do monitor** para visualizar os registros.
✅ Implementar exportação para **PDF/Excel**.


<!-- Criar um painel de monitor para visualizar as presenças. -->

Adicionar autenticação, se necessário.

Implementar a exportação dos dados para PDF ou Excel.