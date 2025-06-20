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

## src\main.ts
- A inicialização começa com o main.ts especificando o nosso app para que o nest sabia sobre o módulo raiz (AppModule) e a parti desse módulo raiz o nest também está cient sobre o AppControler, AppService definidos dentro do AppModule no src\app.module.ts e outras configurações

- na função bootstrap podemos adicionar outras configurações como, definir o mecanismo de visualização, lidar com arquivos estáticos, etc.

                      -> inicia o servidor      |--> outros módulos
App Start -> main.ts  -> app.module.ts ---------|--> controllers
                      -> outras configurações   |--> providers


## src\app.module.ts
- Os módulos são fundamentais na construção de um applicação nest que encapsulam controladores, serviços, provedores e outros componentes.
- promovem a organização de código, a reutilização e a capacidade de teste
- Usado para dividir o aplicativo em unidades menores e independentes, facilitando o gerenciamento e manutenção do código.
- O Nest usa injeção de dependência para fornecer as módulos as dependências necessárias, promovendo o aclopamento flexível e facilidade de testes
- O módulos gerenciam controladores, serviços, provedores e outras classes além de importar ou exportar outros módulos dentro de outros módulos.
- Ex:
    user.modules.ts
        |-- users.controler.ts: gerencia e manipula as solicitações
        |-- users.service.ts: possui a lógica de negócios para as solicitações
        |-- users.controler.spec.ts (test file): teste do users.controler.ts
        |-- users.entity.ts: defini a entidade das estruturas do banco de dados

- Cria o arquivo do módulo -> cria a classe com @Module decorator -> importa no arquivo  module principal