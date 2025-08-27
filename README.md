Documentação Explicativa do Projeto: Acervo de Jogos (CRUD)
Este documento detalha um gerenciador de acervo pessoal de jogos que permite ao usuário descobrir títulos, avaliar os que já jogou e manter uma lista de desejos.

Estrutura
O projeto foi dividido em 4 arquivos:

teste.html: O esqueleto da página.

test.css: A estilização visual.

acervo.js: A camada de serviço, que lida com a comunicação com a API externa e o armazenamento local (localStorage).

main.js: A camada de lógica, que orquestra o estado, os eventos e a renderização da interface.

Fluxo de Dados Unidirecional e Imutável
O fluxo de dados da aplicação segue o padrão: Ação -> Update -> Renderização.

O estado atual da interface (UI) é mantido em um único objeto.

Uma Ação do usuário (ex: um clique) é despachada (dispatch).

A função update recebe o estado atual e a ação, e retorna um novo estado, sem modificar o original (imutabilidade).

A função appEngine recebe o novo estado e redesenha a interface para o usuário.

Funções
Arquivo acervo.js:

buscarJogosDaAPI(): Faz duas buscas na API (clássicos e recentes), junta os resultados, remove duplicatas e traduz para o formato desejado.

buscarJogoPorNomeAPI(): Realiza uma busca específica do nome do jogo na API.

carregarJogosSalvos(): Lê a lista de jogos com avaliações e desejos do usuário que está salva no localStorage.

salvarJogos(): Pega a lista de jogos atual e a salva no localStorage.

atualizarJogo(): Recebe o ID de um jogo e as atualizações, e retorna uma nova lista com o jogo correspondente alterado.

Arquivo main.js:

iniciar(): Primeira função a ser executada. Coordena o carregamento inicial: busca dados da API, mescla com os jogos salvos, popula os filtros, configura os eventos e chama a renderização da interface.

update(): Contém toda a lógica de transição de estados de forma pura e imutável.

dispatch(): Orquestra o fluxo, aplicando o novo estado e disparando a renderização.

appEngine(): Lê o objeto de estado e renderiza a representação visual no DOM.

configurarEventos(): Mapeia as interações do usuário (eventos) para o dispatch de ações.

É importante citar que, embora funções como appEngine sejam impuras (pois manipulam o DOM), elas contêm "bolsões de pureza", como os trechos de código que filtram e ordenam os dados antes da renderização.

Resumo das Ações do CRUD
CREATE (Criar):

Avaliar um jogo pela primeira vez (cria um registro de avaliação).

Adicionar um jogo à Lista de Desejos.

READ (Ler):

Carregar a página (lê dados da API e do localStorage).

Buscar por um nome de jogo (lê dados da API).

Navegar entre as abas e aplicar filtros.

UPDATE (Atualizar):

Editar uma avaliação já existente.

DELETE (Apagar):

Excluir uma avaliação (remove o registro, definindo-o como null).

Excluir um item da Lista de Desejos.

Diferenciais
Arquitetura Funcional: A aplicação adota o modelo "Núcleo Puro, Casca Impura", onde a lógica de negócio é isolada em funções puras e imutáveis, tornando o código mais previsível e menos suscetível a bugs.

Fonte de Dados Híbrida (API e LocalStorage): O acervo não começa vazio. A aplicação busca uma lista curada de jogos da API e a mescla com os dados pessoais do usuário, combinando descoberta de conteúdo com personalização.

Busca Inteligente e Expansiva: A barra de pesquisa não apenas filtra a lista inicial, mas também busca o item desejado na própria API, permitindo que a coleção pessoal do usuário cresça de forma orgânica.
