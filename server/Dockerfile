FROM node:18

WORKDIR /app

# Copia apenas os arquivos de dependência para instalar primeiro (mais eficiente com cache)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Instala o nodemon globalmente para hot-reload
RUN npm install -g nodemon

# Copia o restante do código
COPY . .

# Comando padrão (sobrescrito no docker-compose)
CMD ["nodemon", "server.js"]
