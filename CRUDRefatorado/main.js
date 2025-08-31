import * as API from './api.js';
import * as Lib from './lib.js';
import * as UI from './ui.js';

let estado = {
    jogos: [],
    activeView: 'inicio',
    termoBusca: '',
    filtroGenero: '',
    filtroAno: '',
    filtroPlataforma: '',
    ordenacao: 'padrao',
    paginaAtual: 1,
    jogosPorPagina: 10,
};

function dispatch(action) {
    estado = Lib.update(estado, action);
    if (action.type === 'SET_GAMES' || action.type.startsWith('LIMPAR')) {
        API.salvarJogos(estado.jogos);
    }
    UI.appEngine(estado);
}

function configurarEventos() {
    UI.btnInicio.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'inicio' });
    UI.btnMinhaLista.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'minha-lista' });
    UI.btnDesejos.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'desejos' });
    
    UI.genreFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { filtroGenero: e.target.value } });
    UI.yearFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { filtroAno: e.target.value } });
    UI.platformFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { filtroPlataforma: e.target.value } });
    UI.sortFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { ordenacao: e.target.value } });

    UI.btnLimparMinhaLista.onclick = () => {
        if (confirm('Tem certeza que deseja limpar TODAS as suas avaliações?')) {
            dispatch({ type: 'LIMPAR_MINHA_LISTA' });
        }
    };

    UI.btnLimparDesejos.onclick = () => {
        if (confirm('Tem certeza que deseja limpar sua Lista de Desejos?')) {
            dispatch({ type: 'LIMPAR_DESEJOS' });
        }
    };

    UI.searchInput.onkeyup = async (event) => {
        const termoBusca = UI.searchInput.value.trim();
        UI.searchClearBtn.classList.toggle('hidden', !termoBusca);
        if (event.key === 'Enter' && termoBusca) {
            UI.appContent.innerHTML = `<p class="empty-message">Buscando por "${termoBusca}"...</p>`;
            const resultados = await API.buscarJogoPorNome(termoBusca);
            const listaCompleta = Lib.mesclarListas(estado.jogos, resultados);
            dispatch({ type: 'SET_GAMES', payload: listaCompleta });
            dispatch({ type: 'SET_SEARCH_TERM', payload: termoBusca });
            UI.popularFiltros(listaCompleta);
        } else if (termoBusca === '') {
            dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
        }
    };
    
    UI.searchClearBtn.onclick = () => {
        UI.searchInput.value = '';
        UI.searchClearBtn.classList.add('hidden');
        dispatch({ type: 'SET_SEARCH_TERM', payload: '' });
    };

    UI.appContent.onclick = (event) => {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const { action, id } = target.dataset;
        const jogoId = parseInt(id);
        const jogo = estado.jogos.find(j => j.id === jogoId);
        if (!jogo) return;

        switch (action) {
            case 'avaliar':
            case 'editar':
                UI.abrirModalAvaliacao(jogo, (novaAvaliacao) => {
                    let atualizacoes = { avaliacao: novaAvaliacao };
                    if (jogo.isInWishlist) atualizacoes.isInWishlist = false;
                    const novosJogos = Lib.atualizarJogo(estado.jogos, jogoId, atualizacoes);
                    dispatch({ type: 'SET_GAMES', payload: novosJogos });
                });
                break;
            case 'excluir':
                if (confirm('Tem certeza?')) {
                    const novosJogos = Lib.atualizarJogo(estado.jogos, jogoId, { avaliacao: null });
                    dispatch({ type: 'SET_GAMES', payload: novosJogos });
                }
                break;
            case 'adicionar-desejo':
                dispatch({ type: 'SET_GAMES', payload: Lib.atualizarJogo(estado.jogos, jogoId, { isInWishlist: true }) });
                break;
            case 'remover-desejo':
                dispatch({ type: 'SET_GAMES', payload: Lib.atualizarJogo(estado.jogos, jogoId, { isInWishlist: false }) });
                break;
            case 'ver-mais':
                UI.abrirModalVerMais(jogo);
                break;
        }
    };
    
    UI.paginationControls.addEventListener('click', (event) => {
        const target = event.target.closest('.pagination-button');
        if (target) {
            const pagina = parseInt(target.dataset.page);
            dispatch({ type: 'GO_TO_PAGE', payload: pagina });
        }
    });
}

async function iniciar() {
    UI.appContent.innerHTML = '<p class="empty-message">Carregando jogos...</p>';
    const jogosDaAPI = await API.buscarJogosIniciais();
    const jogosSalvos = API.carregarJogosSalvos();
    const jogosIniciais = Lib.mesclarListas(jogosDaAPI, jogosSalvos);
    
    dispatch({ type: 'SET_GAMES', payload: jogosIniciais });
    
    UI.popularFiltros(estado.jogos);
    configurarEventos();
}

iniciar();