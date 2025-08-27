/*
Arquivo principal
1-Gerencia o estado da aplicação de forma funcional
2-Configura e responde aos eventos
3-Manipula as funções de API e UI mantendo a tela sincronizada
 */
import { buscarJogosDaAPI, buscarJogoPorNomeAPI, carregarJogosSalvos, salvarJogos, atualizarJogo } from './acervo.js';

// --- ESTADO DA APLICAÇÃO ---
/*
Esse objeto descreve o estado atual da UI.
É declarado com let pois a referencia ao objeto inteiro será trocada a
cada atualização, garantindo imutabilidade
*/
let estado = {
    jogos: [],
    activeView: 'inicio',
    termoBusca: '',
    filtroGenero: '',
    filtroAno: '',
    filtroPlataforma: '',
    ordenacao: 'padrao'
};

// --- ELEMENTOS DO DOM ---
const appContent = document.getElementById('app-content');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const btnInicio = document.getElementById('btn-inicio');
const btnMinhaLista = document.getElementById('btn-minha-lista');
const btnDesejos = document.getElementById('btn-desejos');
const searchInput = document.getElementById('search-input');
const searchClearBtn = document.getElementById('search-clear-btn');
const genreFilter = document.getElementById('genre-filter');
const yearFilter = document.getElementById('year-filter');
const platformFilter = document.getElementById('platform-filter');
const sortFilter = document.getElementById('sort-filter');

// --- FUNÇÕES DE RENDERIZAÇÃO E UI ---

/*
Função impura: Fecha o modal.
Efeito colateral: manipula o DOM
*/
function fecharModal() {
    modalOverlay.classList.add('hidden');
}

/*
Função impura: Abre o modal para ver o comentario completo 
Efeito colateral: manipula o DOM
*/
function abrirModalVerMais(jogo) {
    modalTitle.textContent = `Avaliação de "${jogo.titulo}"`;
    modalContent.innerHTML = `<div class="avaliacao-completa"><p>${jogo.avaliacao.comentario}</p></div><div class="modal-actions"><button id="btn-fechar-modal" class="btn btn-secondary">Fechar</button></div>`;
    document.getElementById('btn-fechar-modal').onclick = fecharModal;
    modalOverlay.classList.remove('hidden');
}

/*
Função Impura: Abre o modal para avaliar ou editar uma avaliação
Efeito colateral: manipula o DOM
 */
function abrirModalAvaliacao(jogo, onSave) {
    const modoEdicao = !!jogo.avaliacao;
    const notaInicial = modoEdicao ? jogo.avaliacao.nota : 0;
    modalTitle.textContent = `Avaliação de ${jogo.titulo}`;
    const estrelasHTML = Array.from({ length: 5 }, (_, i) => i + 1).map(i => `<span class="estrela ${i <= notaInicial ? 'ativo' : ''}" data-value="${i}">★</span>`).join('');
    modalContent.innerHTML = `<div class="form-group"><label for="avaliacao-comentario">Comentário</label><textarea id="avaliacao-comentario" rows="4" placeholder="Escreva sua avaliação...">${modoEdicao ? jogo.avaliacao.comentario : ''}</textarea></div><div class="form-group"><label>Sua Nota</label><div class="estrelas">${estrelasHTML}</div></div><div class="modal-actions"><button id="btn-cancelar" class="btn btn-secondary">Cancelar</button><button id="btn-salvar-modal" class="btn btn-primary">Salvar</button></div>`;
    modalOverlay.classList.remove('hidden');
    const estrelas = modalContent.querySelectorAll('.estrela');
    let notaFinal = notaInicial;
    estrelas.forEach(estrela => {
        estrela.addEventListener('click', function() {
            notaFinal = parseInt(this.dataset.value);
            estrelas.forEach((e, index) => e.classList.toggle('ativo', index < notaFinal));
        });
    });
    document.getElementById('btn-cancelar').onclick = fecharModal;
    document.getElementById('btn-salvar-modal').onclick = () => {
        const comentario = document.getElementById('avaliacao-comentario').value;
        if (notaFinal > 0 && notaFinal <= 5) {
            const novaAvaliacao = { nota: notaFinal, comentario: comentario };
            onSave(novaAvaliacao);
            fecharModal();
        } else {
            alert('Por favor, selecione uma nota.');
        }
    };
}

/*
Função impura: parte HTML, le o estado e modifica o DOM para refletir esse estado
*/
function appEngine(estado) {
    btnInicio.classList.toggle('active', estado.activeView === 'inicio');
    btnMinhaLista.classList.toggle('active', estado.activeView === 'minha-lista');
    btnDesejos.classList.toggle('active', estado.activeView === 'desejos');

    let listaParaFiltrar;
    switch (estado.activeView) {
        case 'minha-lista': listaParaFiltrar = estado.jogos.filter(j => j.avaliacao); break;
        case 'desejos': listaParaFiltrar = estado.jogos.filter(j => j.isInWishlist); break;
        default: listaParaFiltrar = estado.jogos; break;
    }

    if (estado.termoBusca) {
        listaParaFiltrar = listaParaFiltrar.filter(j => j.titulo.toLowerCase().includes(estado.termoBusca.toLowerCase()));
    }
    if (estado.filtroGenero) {
        listaParaFiltrar = listaParaFiltrar.filter(j => j.generos.includes(estado.filtroGenero));
    }
    if (estado.filtroAno) {
        listaParaFiltrar = listaParaFiltrar.filter(j => j.dataDeLancamento && new Date(j.dataDeLancamento).getFullYear() == estado.filtroAno);
    }
    if (estado.filtroPlataforma) {
        listaParaFiltrar = listaParaFiltrar.filter(j => j.plataformas.includes(estado.filtroPlataforma));
    }
    
    const listaOrdenada = [...listaParaFiltrar];
    if (estado.ordenacao === 'recentes') {
        listaOrdenada.sort((a, b) => new Date(b.dataDeLancamento) - new Date(a.dataDeLancamento));
    } else if (estado.ordenacao === 'antigos') {
        listaOrdenada.sort((a, b) => new Date(a.dataDeLancamento) - new Date(b.dataDeLancamento));
    }

    appContent.innerHTML = '';
    if (listaOrdenada.length === 0) {
        appContent.innerHTML = '<p class="empty-message">Nenhum jogo encontrado.</p>';
    } else {
        listaOrdenada.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            let botoesHTML = '';
            const estaNaMinhaLista = !!jogo.avaliacao;
            const estaNosDesejos = jogo.isInWishlist;
            if (estaNaMinhaLista) {
                if (estado.activeView !== 'desejos') botoesHTML = `<button class="btn btn-secondary" data-action="editar" data-id="${jogo.id}">Editar Avaliação</button>`;
                if (estado.activeView === 'minha-lista') botoesHTML += `<button class="btn btn-danger" data-action="excluir" data-id="${jogo.id}">Excluir</button>`;
            } else if (estaNosDesejos) {
                botoesHTML = `<button class="btn btn-primary" data-action="avaliar" data-id="${jogo.id}">Avaliar</button><button class="btn btn-danger" data-action="remover-desejo" data-id="${jogo.id}">Remover Desejo</button>`;
            } else {
                botoesHTML = `<button class="btn btn-primary" data-action="avaliar" data-id="${jogo.id}">Avaliar</button><button class="btn btn-secondary" data-action="adicionar-desejo" data-id="${jogo.id}">+ Lista de Desejos</button>`;
            }
            const dataFormatada = jogo.dataDeLancamento ? new Date(jogo.dataDeLancamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data desconhecida';
            let avaliacaoDisplayHTML = '';
            if (jogo.avaliacao) {
                avaliacaoDisplayHTML += `<p><strong>Sua nota:</strong> <span class="nota-estrelas">${'★'.repeat(jogo.avaliacao.nota)}${'☆'.repeat(5 - jogo.avaliacao.nota)}</span></p>`;
                if (estado.activeView !== 'inicio' && jogo.avaliacao.comentario) {
                    const comentario = jogo.avaliacao.comentario;
                    const limite = 80;
                    const comentarioCurto = comentario.length > limite ? comentario.substring(0, limite) + '...' : comentario;
                    avaliacaoDisplayHTML += `<p class="comentario"><strong>Sua avaliação:</strong> "${comentarioCurto}" ${comentario.length > limite ? `<button class="btn-link" data-action="ver-mais" data-id="${jogo.id}">Ver Mais</button>` : ''}</p>`;
                }
            }
            card.innerHTML = `<div class="game-card-image-container"><img src="${jogo.imagemUrl || ''}" alt="Capa do jogo ${jogo.titulo}" class="game-card-image"></div><div class="game-card-info"><h3>${jogo.titulo}</h3><p><strong>Lançamento:</strong> ${dataFormatada}</p><div class="game-card-details"><div class="details-title">GÊNEROS</div><div class="tags-container">${jogo.generos.map(g => `<span class="tag">${g}</span>`).join('')}</div></div><div class="game-card-details"><div class="details-title">PLATAFORMAS</div><div class="tags-container">${jogo.plataformas.map(p => `<span class="tag">${p}</span>`).join('')}</div></div>${avaliacaoDisplayHTML}</div><div class="game-card-actions">${botoesHTML}</div>`;
            appContent.appendChild(card);
        });
    }
}

/*
Função impura: popula os menus de filtro com base na lista de jogos atual
 */
function popularFiltros(jogos) {
    const todosOsGeneros = jogos.flatMap(jogo => jogo.generos);
    const generosUnicos = [...new Set(todosOsGeneros)].sort();
    genreFilter.innerHTML = '<option value="">Todos os Gêneros</option>';
    generosUnicos.forEach(genero => {
        const option = document.createElement('option');
        option.value = genero;
        option.textContent = genero;
        genreFilter.appendChild(option);
    });
    
    const anoAtual = new Date().getFullYear();
    const anoInicial = 1980;
    const numeroDeAnos = anoAtual - anoInicial + 1;
    const todosOsAnos = Array.from({ length: numeroDeAnos }, (_, index) => anoAtual - index);
    const anosOptionsHTML = todosOsAnos.map(ano => `<option value="${ano}">${ano}</option>`).join('');
    yearFilter.innerHTML = '<option value="">Todos os Anos</option>' + anosOptionsHTML;

    const todasAsPlataformas = jogos.flatMap(jogo => jogo.plataformas);
    const plataformasUnicas = [...new Set(todasAsPlataformas)].sort();
    platformFilter.innerHTML = '<option value="">Todas as Plataformas</option>';
    plataformasUnicas.forEach(plataforma => {
        const option = document.createElement('option');
        option.value = plataforma;
        option.textContent = plataforma;
        platformFilter.appendChild(option);
    });
}

/*
Função PURA (reducer) = recebe o estado atual e uma ação e retorna um novo estado com a alteração
sem colateral
*/
function update(currentState, action) {
    switch (action.type) {
        case 'SET_GAMES':
            return { ...currentState, jogos: action.payload };
        case 'CHANGE_VIEW':
            return { ...currentState, activeView: action.payload, termoBusca: '' };
        case 'SET_SEARCH_TERM':
            return { ...currentState, termoBusca: action.payload };
        case 'SET_GENRE_FILTER':
            return { ...currentState, filtroGenero: action.payload };
        case 'SET_YEAR_FILTER':
            return { ...currentState, filtroAno: action.payload };
        case 'SET_PLATFORM_FILTER':
            return { ...currentState, filtroPlataforma: action.payload };
        case 'SET_SORTING':
            return { ...currentState, ordenacao: action.payload };
        default:
            return currentState;
    }
}

function dispatch(action) {
    const novoEstado = update(estado, action);
    estado = novoEstado;
    if (action.type === 'SET_GAMES') {
        salvarJogos(estado.jogos);
    }
    appEngine(estado);
}

// --- LÓGICA DE EVENTOS ---
/*
Função impura: Configura todos os event listeners da página
traduz eventos do usuario em ações
*/
function configurarEventos() {
    btnInicio.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'inicio' });
    btnMinhaLista.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'minha-lista' });
    btnDesejos.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'desejos' });
    
    genreFilter.onchange = (e) => dispatch({ type: 'SET_GENRE_FILTER', payload: e.target.value });
    yearFilter.onchange = (e) => dispatch({ type: 'SET_YEAR_FILTER', payload: e.target.value });
    platformFilter.onchange = (e) => dispatch({ type: 'SET_PLATFORM_FILTER', payload: e.target.value });
    sortFilter.onchange = (e) => dispatch({ type: 'SET_SORTING', payload: e.target.value });

    searchInput.onkeyup = async (event) => {
        const termoBusca = searchInput.value.trim();
        searchClearBtn.classList.toggle('hidden', !termoBusca);
        if (event.key === 'Enter' && termoBusca) {
            appContent.innerHTML = `<p class="empty-message">Buscando por "${termoBusca}"...</p>`;
            const resultados = await buscarJogoPorNomeAPI(termoBusca);
            const idsAtuais = new Set(estado.jogos.map(j => j.id));
            const novosJogos = resultados.filter(jogoNovo => !idsAtuais.has(jogoNovo.id));
            const listaCompleta = [...estado.jogos, ...novosJogos];
            dispatch({ type: 'SET_GAMES', payload: listaCompleta });
            dispatch({ type: 'SET_SEARCH_TERM', payload: termoBusca });
            popularFiltros(listaCompleta);
        } else if (termoBusca === '') {
            dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
        }
    };
    
    searchClearBtn.onclick = () => {
        searchInput.value = '';
        searchClearBtn.classList.add('hidden');
        dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    };

    appContent.onclick = (event) => {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const { action, id } = target.dataset;
        const jogoId = parseInt(id);
        const jogo = estado.jogos.find(j => j.id === jogoId);
        if (!jogo) return;

        switch (action) {
            case 'avaliar':
            case 'editar':
                abrirModalAvaliacao(jogo, (novaAvaliacao) => {
                    let atualizacoes = { avaliacao: novaAvaliacao };
                    if (jogo.isInWishlist) atualizacoes.isInWishlist = false;
                    const novosJogos = atualizarJogo(estado.jogos, jogoId, atualizacoes);
                    dispatch({ type: 'SET_GAMES', payload: novosJogos });
                });
                break;
            case 'excluir':
                if (confirm('Tem certeza?')) {
                    const novosJogos = atualizarJogo(estado.jogos, jogoId, { avaliacao: null });
                    dispatch({ type: 'SET_GAMES', payload: novosJogos });
                }
                break;
            case 'adicionar-desejo': {
                const novosJogos = atualizarJogo(estado.jogos, jogoId, { isInWishlist: true });
                dispatch({ type: 'SET_GAMES', payload: novosJogos });
                break;
            }
            case 'remover-desejo': {
                const novosJogos = atualizarJogo(estado.jogos, jogoId, { isInWishlist: false });
                dispatch({ type: 'SET_GAMES', payload: novosJogos });
                break;
            }
            case 'ver-mais':
                abrirModalVerMais(jogo);
                break;
        }
    };
}

// --- INICIALIZAÇÃO DA APLICAÇÃO ---
/*
Função impura: ponto de partida da aplicação
*/
async function iniciar() {
    appContent.innerHTML = '<p class="empty-message">Carregando jogos...</p>';
    const jogosDaAPI = await buscarJogosDaAPI();
    const jogosSalvos = carregarJogosSalvos();
    
    const jogosIniciais = jogosDaAPI.map(jogoAPI => {
        const jogoSalvo = jogosSalvos.find(salvo => salvo.id === jogoAPI.id);
        return jogoSalvo ? { ...jogoAPI, ...jogoSalvo } : jogoAPI;
    });
    jogosSalvos.forEach(jogoSalvo => {
        if (!jogosIniciais.some(j => j.id === jogoSalvo.id)) {
            jogosIniciais.push(jogoSalvo);
        }
    });

    dispatch({ type: 'SET_GAMES', payload: jogosIniciais });
    
    popularFiltros(estado.jogos);
    configurarEventos();
}
//inicia a aplicação
iniciar();