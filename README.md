![CI](https://github.com/feliperocha021/nestJS/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-20.x-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Postgres](https://img.shields.io/badge/postgres-16-blue)
![Redis](https://img.shields.io/badge/redis-stack-red)
![Jest](https://img.shields.io/badge/tests-jest-yellow)

# 📌 Sobre o Projeto

API RESTful desenvolvida com NestJS, utilizando:

PostgreSQL para persistência de dados

TypeORM para ORM e migrations

Redis para cache e filas

Docker & Docker Compose para orquestração de serviços

Jest para testes unitários e de integração

GitHub Actions para CI

Este projeto foi construído para demonstrar boas práticas de arquitetura backend, testes automatizados e integração contínua.

# ⚙️ Como Rodar Localmente

## Pré-requisitos

Docker e Docker Compose instalados

## 📄 Configuração do Ambiente

Antes de subir os containers, crie um arquivo .env na raiz do projeto. Você pode usar o .env.example como base.

Edite o .env com suas credenciais (Postgres, Redis, JWT, etc.).

Este projeto utiliza a variável NODE_ENV para decidir qual arquivo .env será carregado. A validação aceita apenas os seguintes valores:

- development

- test

- production

- (ou vazio)

| NODE_ENV      | Arquivo carregado           |
|---------------|-----------------------------|
| (vazio)       | .env                        |
| development   | .env.development.local      |
| test          | .env.test.local             |
| production    | .env.production.local       |

## Passos

### Clone o repositório
```bash
git clone https://github.com/feliperocha021/nestJS.git
cd nestJS
```

### Suba os containers
```bash
docker compose --env-file .env up --build -d
```

### Você pode acompanhar a execução do app
```bash
docker logs nest-app -f
```

### A API estará disponível em:
```http://localhost:3000```

# 📜 Scripts Disponíveis

Acesse o container da aplicação para utilizar os scripts
```bash
docker exec -it nest-app sh
```

No `package.json` você encontra os seguintes scripts úteis:

- ```npm run start:dev``` → inicia a aplicação em modo desenvolvimento (hot reload)  
- ```npm run start:prod``` → inicia a aplicação em modo produção (buildado em `dist/`)  
- ```npm run test``` → executa todos os testes unitários  
- ```npm run test:cov``` → executa testes com relatório de cobertura  
- ```npm run test:e2e``` → executa testes end-to-end  
- ```npm run lint``` → roda ESLint e corrige problemas automaticamente  
- ```npm run migration:generate:inside``` → gera migrations a partir das entidades  
- ```npm run migration:run:inside``` → aplica migrations no banco configurado  
- ```npm run migration:revert:inside``` → reverte a última migration aplicada  
