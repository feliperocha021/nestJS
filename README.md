# Nest

- É uma progressão do node.js para construção de apicativos eficientes do lado servidor
utiliza typescript
- Estrutura MCSR (Modules, Controllers, Services, Routes)
- Utiliza **express ou fastify** para criação de servidores web e APIs. Sua função principal é gerenciar as requisições HTTP, definir rotas e facilitar o uso de middlewares para processar essas requisições e respostas e pode ser complementado com um ORM(manipula dados do database por meio de objetos e métodos) como o **prisma ou sequelize**

## Files

- **package.json**: contém metadados sobre o projeto, como nome, versão, dependências, etc.
- **tsconfig.json**: é um arquivo de coonfiguração do typescript. Nesse arquivo, especificamos as coonfigurações para o compilador.
- **gitignore**: especifica os arquivos e diretórios que devem ser ignorados no git push.
- **nest-cli.json**: contém opções de configuração para o nest cli.
- **test***: pasta que contém os teste de unidade e integração para o projeto.
- **dist**: coontém os arquivos js compilados
- **node_modules**: armazena todos os pacotes e dependências
- **src**: pasta onde a maior parte  do código desenvolvido está
- **src\app.module.ts**: immporta e exporta outros módulos, componentes, provedores, serviços, etc.
- **src\app.controller.ts**: define o controlador principal da aplicação. Manipula as solicitações de entrada e retorna respotas.
- **src\app.service.ts**: contém a lógica de negócios principal do seu aplicativo
- **src\main.ts**: É o ponto de entrada da aplicação é o primeiro arquivo a ser executado pós compilação.