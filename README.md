comando para que o prettier reescreva o código com as regras `npx prettier src/users/users.controller.ts --write`

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

## Parâmetro de rota

- são os espaços reservados em uma rota que permitem capturar partes dinâmicas da URL.
- Sempre serão lidos e retornados como strings, você faz a conversão manual.
- GetUserById: GET https://localhost:3000/users/**101** - parte dinâmica
- Inserindo vários parâmetros obrigatórios e não obrigatórios de rota https://localhost:3000/users/**:id/:gender/:locate?**
- No Nest fica:
  URL: http://localhost:3000/users/1/jhon?gender=male
  @Get(':id/:name')
  getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Param('name') name: string,
    @Query('gender') gender?: string,
  ) {
    return { id, name, gender };
  }
  Ou crie duas rotas uma com e outra sem o gender

## Parâmetros de consulta
- são informações adicionais anexadas ao final da URL separadas por um ponto de interrogação
- possuem pares de valores-chaves onde cada chave é seguidaa por um sinal de = e seu valor
- GET https://localhost:3000/users?**gender=male&isMarried=false**

## Pipes

- são funções que validam ou transformam ou validam os dados que vêm com a solicitação antes que cheguem ao método contolador
- Validação: valida os dados para que eles atendam a requisitos especificos
- Transformação: transformar os dados em formatos ou estruturas diferentes
- higienização: remover conteúdo potencialmente prejudicial, como tags html e scripts maliciosos
-Ex:
  Incoming Request -> other layers -> pipes -> controller
- OBS: o prório pipe retorna um erro ao cliente quando uma transformação de tipo não é bem sucessida. Exemplo: http://localhost:3000/users/abc era pra ser um id númerico que seria convertido para número, mas mandaram 'abc' que não pode ser convertido para número.

## DTOs

- são objetos de transferência de dados e é uma classe simples que é usada para representar dados que estão sendo transferidos entre diferentes camadas

- app.useGlobalPipes(new ValidationPipe()); faz com que esse pipe de validação seja aplicado para cada solicitação de entrada, então será aplicado em cada método do controlador que irá manipular uma requisição

- Faz com que a solicitação ignore propiedades que não foram definidas no dto para o controller  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

- Faz com que a solicitação lançe um erro para propiedades que não foram definidas no dto para o controller  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

- Garante que os dados que estão sendo atribuidos á variavel definina na função do controler seja uma instância de uma dto  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

## Mappedd types

- permite que você herde um DTO específico e importe parcialmente algumas partes desse DTO específico

## Dependency Injection

- Quando criamos uma instância de uma classe explicitamente dentro de outra classe, fazemos com que a classe que possui a instância criada torne-se fortemente acoplada a outra classe

- Isso promove algumas desvantagens como:

  **Baixa flexibilidade**: Alterar a classe instanciada pode exigir mudanças em várias partes do código, dificultando a manutenção e evolução.

 **Dificuldade de testes**: Testes unitários ficam mais complexos porque não é fácil substituir a instância concreta por um mock ou stub.

 *** Viola o princípio de Inversão de Dependência (DIP)***: Esse princípio do SOLID defende que módulos de alto nível não devem depender de módulos de baixo nível diretamente, mas sim de abstrações.
s
- Por isso temos a injeção de dependência que envolve passar dependências para um objeto em vez de o próprio objeto criá-las, promovendo o acoplammento flexível, tornando o código mais modular, testável e sustentável.

## Types of Dependency
              |--> Intra-Modular
- Depedency---|--> Inter-Modular
              |--> Circular

### Intra-modular

- refere-se a uma dependência entre os commponentes dentro do mesmo módulo

- Exemplo: o módulo de usuário possui o user controller que é dependente do user service, então o Nest injeta uma instância de user service dentro de user controller

### Inter-Modular

- refere-se a uma dependência entre os commponentes de módulos distintos

- Exemplo: temos dois módulos o user e o comment e o comment service é dependente do user service

### Circular

- refere-se quando um ou mais módulos ou componentes têm uma relação de dependência direta ou indireta entre si formando um cilco

- Exemplo: temos o module user e o auth, em user service para autenticar um usuário precisamos de uma instância de auth service, por outro lado, no auth service para retornar detalhes do usuário é necessário uma instância de user service.

- OBS: É sempre bom evitar a dependência circular, pois acaba violando o princípio da responsabilidade única (SRP). Se dois serviços precisam tanto um do outro, talvez estejam fazendo mais do que deveriam.

## ORM - objeto relacional de mapiamento

- recebe a solicitação do service e executa a operação necessária no banco de dados
- escrevemos o código typescript que é convertido  pelo ORM em uma consulta SQL
- Também definimos, relações e tabelas
- **Desvantagem**: menos controle sobre as consultas SQl

## Explicação do uso do docker noo projeto

**Dockerfile**:

Define como a imagem da sua aplicação NestJS será construída.

Instala dependências, copia os arquivos, define WORKDIR, configura a porta, etc.

Quando o Compose executa o serviço nest-app, ele usa esse Dockerfile para gerar o contêiner.

**docker-compose.yml**:

Define todos os serviços envolvidos: NestJS, PostgreSQL, MongoDB.

Estabelece as dependências entre eles (depends_on), as portas, as variáveis de ambiente (via .env), o volume e a rede compartilhada.

**Volumes nomeados (pgdata, mongodata)**:

São definidos automaticamente e persistem os dados dos bancos, mesmo se o contêiner for destruído.

Não precisam ser criados manualmente — Compose cuida disso ao subir os serviços.

**Rede personalizada (dev-net)**:

Do tipo bridge.

Permite que os serviços dentro dessa rede se comuniquem entre si, usando os nomes dos containers como host (ex: postgres ou mongo).

E sim, containers fora da dev-net não têm acesso direto — a não ser que estejam conectados manualmente à mesma rede.

**Comunicação com o host**:

Os serviços que têm ports: definidos (ex: 3000:3000) estão acessíveis via localhost no seu sistema.

Os bancos de dados também ficam acessíveis via suas portas se forem mapeadas.

- Os arquivos up.sh e down.sh iniciam e desligam os containers, mas pode usar o terminal se quiser

Alternativas mais avançadas:
Se quiser manter os dados no banco, use:


`docker compose down`
`docker compose up --build -d`
Isso derruba sem apagar volumes, útil se já tiver tabelas criadas e não quiser perder tudo.

Se você quiser realmente excluir tudo e reiniciar do zero:

`docker compose down -v`
`docker volume prune`
`docker image prune`

- se quiser ver em tempo real o que está acontecendo no container onde o Nest
`docker compose logs -f nest-app`

## Repository Pattern

- É um padrão design que atua como um intermediário entre sua lógica de negócios e os ORMs.
- Fornece uma camada de abstrção para acessar e manipular dados no banco de dados.

user.entity.ts ---> usersRepository.ts ---> users.service.ts ---> database

- para que o service faça seu trabalho para entrar em contato com o banco de dados e buscar e gravar dados no banco de dados é necessário um repository que é criado a parti de uma entity
- e uma entity é uma classe que define quais colunas deseja ter em uma tabela em seu database
- **não** use o nome em **plural** para umaa entity
- repository não é um arquivo físico,  então não precisa criar um arquivo para um repository, o ORM cuida disso, você apenas injeta o repositório em um serviço onde deseja usá-lo.

## Migrations

- são scripts que versionam mudanças na estrutura do banco de dados: criação de tabelas, colunas, tipos, relacionamentos etc. Elas permitem que o banco evolua junto com o código — e de forma controlada, rastreável e segura.

- Embora synchronize: true seja conveniente em desenvolvimento, ele:

⚠️ Não aplica renomeações, deleções ou alterações profundas

🧩 Não gera histórico nem permite rollback

❌ É arriscado em ambientes de produção (pode destruir dados sem aviso)

➡️ É ideal para testes rápidos, mas não para ambientes reais.

- **Vantagens**:
  - 💼 Controle de Versão: Rastreia cada mudança na estrutura do banco
  - 🔙 Reversibilidade: Permite desfazer alterações com migration:revert
  - 🌍 Consistência entre ambientes: Garante que dev, staging e produção usem a mesma estrutura
  - 🤝 Trabalho em equipe: Todos aplicam as mesmas mudanças com os mesmos scripts

- **Scripts importantes no package.json**:
  - **"migration:generate:inside": "docker exec -it nest-app npx typeorm migration:generate"**: Gera um novo arquivo de migration com base nas diferenças entre suas entidades e o estado atual do banco.

    - o docker exec -it nest-app é necessário, pois os containers estão em uma subrede definida no commpose.yaml

    - O nome da migration é passado depois com -- -n NomeDaMigration

    - O TypeORM analisa suas entidades e cria comandos SQL (up() e down())

    - Exemplo: `npm run migration:generate:inside -- src/db/migrations/CreateUsersTable -d dist/db/data-source.js`

    - 🛠 Quando usar:

      - Após alterar suas entidades (ex: adicionar campo, mudar tipo, renomear tabela etc)

      - Sempre que quiser criar um novo script que represente essas mudanças no banco


  - **"migration:run:inside": "docker exec -it nest-app npx typeorm migration:run -d dist/db/data-source.js"**: Aplica todas as migrations pendentes ao banco de dados.

    - Executa o método up() de cada migration

    - Atualiza a tabela migrations que registra quais já foram executadas

    - Ideal para: Colocar as mudanças no banco de forma segura e versionada.

    - 🛠 Quando usar:

      - Depois de criar a migration e quiser aplicá-la no banco

      - Após clonar um projeto com migrations e quiser rodar tudo
  
  - **"migration:revert:inside": "docker exec -it nest-app npx typeorm migration:revert -d dist/db/data-source.js"**: Desfaz a última migration aplicada.
    - Executa o método down() da migration

    - Remove o registro da tabela migrations

    - 🛠 Quando usar:

      - Se você aplicou uma migration e quer desfazer

      - Durante testes, ajustes ou rollback

## Eager Loading

- quando buscar uma entidade no banco de dados, suas entidades relacionadas serão carregadas juntamente com ela, sem termos que especificá-la explicitamente em nossa consulta

## Relação bidirecional
- realizamos a relação nas duas tabelas

- uma vai possuir a chave estrangeira com:
  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn()
  user: User;

- para criar a relação bidirecional com a outra tabela sem gerar outra chave estrangeira faça:
@OneToOne(() => Profile, (profile) => profile.user, {
    nullable: true,
  })
  profile?: Profile;
