-- Criação do banco com charset recomendado
CREATE DATABASE IF NOT EXISTS monitoria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco
USE monitoria;

-- Criação da tabela de monitores
CREATE TABLE IF NOT EXISTS monitores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

-- Criação da tabela de presenças com relacionamento
CREATE TABLE IF NOT EXISTS presencas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_aluno VARCHAR(255) NOT NULL,
    turma VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    conteudo TEXT,
    monitor_id INT, -- Referência ao monitor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitor_id) REFERENCES monitores (id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    monitor_id INT NOT NULL,
    hora_inicio DATETIME NOT NULL,
    hora_fim DATETIME,
    FOREIGN KEY (monitor_id) REFERENCES monitores(id)
);
