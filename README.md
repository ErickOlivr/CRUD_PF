Documentação Explicativa do Projeto: Acervo de Jogos (CRUD)
Este documento detalha um gerenciador de acervo pessoal de jogos que permite ao usuário descobrir títulos, avaliar os que já jogou e manter uma lista de desejos.

O projeto foi modularizado em 5 arquivos principais para separar responsabilidades, seguindo boas práticas de desenvolvimento:

index.html: O esqueleto da página, contendo a estrutura semântica dos elementos.

style.css: A estilização visual, responsável pela identidade e layout da aplicação.

api.js: A camada de serviço, que lida exclusivamente com a comunicação com a API externa (RAWG) e com o armazenamento local (localStorage).

lib.js: O "coração" lógico da aplicação. Contém as funções puras para manipulação de dados e gerenciamento de estado.

ui.js: A camada de visualização, responsável por toda a manipulação do DOM, como renderizar os cards, controlar modais e popular filtros.

main.js: A camada controladora, que orquestra todo o fluxo, conectando os eventos do usuário (da ui.js) com a lógica de estado (da lib.js) и as fontes de dados (da api.js).

Fluxo de Dados Unidirecional e Imutável
O fluxo de dados da aplicação segue o padrão: Ação do Usuário -> dispatch -> update -> Renderização.

O estado atual da interface (UI) é mantido em um único objeto JavaScript.

Uma Ação do usuário (ex: um clique) é capturada em main.js e enviada para a função dispatch.

A função dispatch chama a função update (de lib.js), que recebe o estado atual e a ação, e retorna um novo objeto de estado, sem modificar o original (imutabilidade).

O dispatch então chama a função appEngine (de ui.js) que, baseada no novo estado, redesenha a interface para o usuário.

Funções principais:
Arquivo api.js:

buscarJogosIniciais(): Faz duas buscas na API (clássicos e recentes), junta os resultados, remove duplicatas e os adapta para o formato da aplicação.

buscarJogoPorNome(): Realiza uma busca específica pelo nome de um jogo na API.

carregarJogosSalvos(): Lê do localStorage a lista de jogos com avaliações e desejos do usuário.

salvarJogos(): Pega a lista de jogos atual e a salva no localStorage.

Arquivo lib.js:

update(): Função "reducer" pura que contém toda a lógica de transição de estados. Recebe o estado antigo e uma ação, e retorna o novo estado.

processarJogosParaView(): Filtra e ordena a lista de jogos com base na visualização ativa e nos filtros selecionados antes da renderização.

atualizarJogo(): Recebe o ID de um jogo e as atualizações, e retorna uma nova lista com o jogo correspondente alterado de forma imutável.

mesclarListas(): Combina a lista de jogos principal com resultados de busca, evitando duplicatas.

É importante citar que, embora funções como appEngine sejam impuras (pois manipulam o DOM), elas contêm "bolsões de pureza", como os trechos de código que filtram e ordenam os dados antes da renderização.

Arquivo ui.js:

appEngine(): Lê o objeto de estado e renderiza toda a representação visual no DOM, incluindo os cards e a paginação.

abrirModalAvaliacao() / abrirModalVerMais(): Funções que manipulam o DOM para exibir e controlar os modais da aplicação.

popularFiltros(): Preenche dinamicamente os menus de filtro com base nos dados dos jogos carregados.

Arquivo main.js:

iniciar(): Primeira função a ser executada. Coordena o carregamento inicial: busca dados da API e do localStorage, mescla as listas, popula os filtros, configura os eventos e chama a primeira renderização.

dispatch(): Orquestra o fluxo de dados, chamando update para obter o novo estado e appEngine para disparar a renderização.

configurarEventos(): Mapeia todas as interações do usuário (eventos de clique, digitação, etc.) para o dispatch de ações correspondentes.
Ações do CRUD
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
