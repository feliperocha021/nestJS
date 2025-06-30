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
- O Nest usa injeção de dependência para fornecer os módulos e as dependências necessárias, promovendo o aclopamento flexível e facilidade de testes
- O módulos gerenciam controladores, serviços, provedores e outras classes além de importar ou exportar outros módulos dentro de outros módulos.
- Ex:
    user.modules.ts
        |-- users.controler.ts: gerencia e manipula as solicitações
        |-- users.service.ts: possui a lógica de negócios para as solicitações
        |-- users.controler.spec.ts (test file): teste do users.controler.ts
        |-- users.entity.ts: defini a entidade das estruturas do banco de dados

- Cria o arquivo do módulo -> cria a classe com @Module decorator -> importa no arquivo module principal

- Comando no cli para criar um novo módulo: `nest g module nome-do-modulo`
- Comando no cli para criar os controladores e serviçõs de um módulo: `nest g controller nome-do-modulo`

## REST API

- REpresentation State Transfer (REST) API é um estilo de arquitetura de software que define como clientes (navegador web e apps mobiles) podem interagir com os servidores para recuperar e manipular dados

- Seis príncipios: Arquitetura Cliente-Servidor, sem estado, armazenável em cache, sistema em camadas, interface uniforme e suportar código sob demanda (opcional).

- **Arquitetura Cliente-Servidor**: O cliente envia uma sollicitação e o servidor processa e responde-o.

- **Sem estado**: Cada solicitação é tratada de forma independete, possui todas as informações necessárias e o servidor não mantém nenhum estado de sessão para o cliente, ou seja o cliente tem que enviar um token de autenticação junto á solicitação.

- **Armazenável em cache**: Na primeira solicitação do cliente, armazenamos a resposta no cache e ao fazer a mesma solicitação o cliente oobtém os dados do cache ao invés do servidor processa outra resposta. A informaçãoo pode ser  armazenada tanto em servidooress intermediários quanto no próprio cliente

- **Sistema em camadas**: Nem o cliente e o servidor podem dizer se a comunicação está acontecendo com um aplicativo específico ou com muitas árvores intermediárias (middleware, cache, database).

- **Interface Uniforme**: Conjunto padrão de métodos HTTP para executar operações

- **Código sob demanda**: permite que os clientes baixem e executem código dinamicamente no servidor.

## Controller

- são responsáveis por manipular solicitações HTTP e retornar respostas apropiadas

## Routes Decorators
- são usados para definir rotas às quais seu aplicativo responderá e eles fornecem uma maneira declarativa de mapear métodos HTTP

## Services
- são classes que encapsulam a lógica de negócios do seu aplicativo e são responsáveis por executar tarefas como acesso a dados, alguns cálculos complexos, etc. 
- são injetados em controladores ou outros serviços que promovem acoplamento fraco e testabilidade