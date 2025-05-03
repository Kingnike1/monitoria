FROM php:8.1.16-apache

RUN docker-php-ext-install mysqli 

# Usar a imagem oficial do Node.js
FROM node:14

# Criar o diretório de trabalho no container
WORKDIR /app

# Copiar os arquivos do projeto para dentro do container
COPY . .

# Instalar as dependências do Node.js
RUN npm install

# Expôr a porta 3000
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "server.js"]
