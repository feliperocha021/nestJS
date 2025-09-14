# syntax=docker/dockerfile:1

# =========================
# Etapa 1: Build
# =========================
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-alpine AS builder

WORKDIR /usr/src/app

# Copia apenas arquivos de dependências primeiro (melhora cache)
COPY package*.json ./

# Instala TODAS as dependências (incluindo dev) para poder compilar
RUN npm ci

# Copia o restante do código
COPY . .

# Compila o TypeScript para JavaScript
RUN npm run build

# =========================
# Etapa 2: Produção
# =========================
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copia apenas os arquivos necessários para rodar
COPY package*.json ./

# Instala apenas dependências de produção
RUN npm ci --omit=dev

# Copia a pasta dist compilada do estágio de build
COPY --from=builder /usr/src/app/dist ./dist

# (Opcional) Copiar outras pastas necessárias, como assets ou configs
# COPY --from=builder /usr/src/app/public ./public

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "run", "start:prod"]
