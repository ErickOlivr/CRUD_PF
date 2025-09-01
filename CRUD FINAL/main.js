import * as API from './api.js'
import * as Lib from './lib.js'
import * as UI from './ui.js'

let estado = {
    jogos: [],  //Lista de jogos.
    activeView: 'inicio', //Tela exibida.
    termoBusca: '', //Texto no busca.
    filtroGenero: '', //Gênero selecionado.
    filtroAno: '', //Ano selecionado.
    filtroPlataforma: '', //Ano selecionado.
    ordenacao: 'padrao', //Ordenação selecionada.
    paginaAtual: 1, //Pagina atual.
    jogosPorPagina: 10, //Jogos exibidos por página
}

// Função "dispatch", responsável por disparar ações que modificam o estado.
function dispatch(action) {
    estado = Lib.update(estado, action)
    // Se a ação foi para modificar a lista de jogos (adicionar, limpar), salva no localStorage.
    if (action.type === 'SET_GAMES' || action.type.startsWith('LIMPAR')) {
        API.salvarJogos(estado.jogos)
    }
    UI.appEngine(estado)
}
// Função que configura todos os eventos de interação do usuário.
function configurarEventos() {
    //Botões de navegação.
    UI.btnInicio.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'inicio' })
    UI.btnMinhaLista.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'minha-lista' })
    UI.btnDesejos.onclick = () => dispatch({ type: 'CHANGE_VIEW', payload: 'desejos' })
    
    //Filtros
    UI.genreFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { filtroGenero: e.target.value } })
    UI.yearFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { filtroAno: e.target.value } })
    UI.platformFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { filtroPlataforma: e.target.value } })
    UI.sortFilter.onchange = (e) => dispatch({ type: 'SET_FILTER', payload: { ordenacao: e.target.value } })

    //Limpar minha Lista.
    UI.btnLimparMinhaLista.onclick = () => {
        if (confirm('Tem certeza que deseja limpar TODAS as suas avaliações?')) {
            dispatch({ type: 'LIMPAR_MINHA_LISTA' })
        }
    }

    //Limpar desejos.
    UI.btnLimparDesejos.onclick = () => {
        if (confirm('Tem certeza que deseja limpar sua Lista de Desejos?')) {
            dispatch({ type: 'LIMPAR_DESEJOS' })
        }
    }
    //Busca.
    UI.searchInput.onkeyup = async (event) => {
        const termoBusca = UI.searchInput.value.trim()
        UI.searchClearBtn.classList.toggle('hidden', !termoBusca)
        if (event.key === 'Enter' && termoBusca) {
            UI.appContent.innerHTML = `<p class="empty-message">Buscando por "${termoBusca}"...</p>`
            const resultados = await API.buscarJogoPorNome(termoBusca)
            const listaCompleta = Lib.mesclarListas(estado.jogos, resultados)
            dispatch({ type: 'SET_GAMES', payload: listaCompleta })
            dispatch({ type: 'SET_SEARCH_TERM', payload: termoBusca })
            UI.popularFiltros(listaCompleta)
        } else if (termoBusca === '') {
            dispatch({ type: 'SET_SEARCH_TERM', payload: '' })
        }
    }
    //Limpa Busca.
    UI.searchClearBtn.onclick = () => {
        UI.searchInput.value = ''
        UI.searchClearBtn.classList.add('hidden')
        dispatch({ type: 'SET_SEARCH_TERM', payload: '' })
    }
    //Cards dos jogos.
    UI.appContent.onclick = (event) => {
        const target = event.target.closest('[data-action]')
        if (!target) return
        const { action, id } = target.dataset
        const jogoId = parseInt(id)
        const jogo = estado.jogos.find(j => j.id === jogoId)
        if (!jogo) return

        switch (action) {
            case 'avaliar':
            case 'editar':
                UI.abrirModalAvaliacao(jogo, (novaAvaliacao) => {
                    let atualizacoes = { avaliacao: novaAvaliacao }
                    if (jogo.isInWishlist) atualizacoes.isInWishlist = false
                    const novosJogos = Lib.atualizarJogo(estado.jogos, jogoId, atualizacoes)
                    dispatch({ type: 'SET_GAMES', payload: novosJogos })
                })
                break
            case 'excluir':
                if (confirm('Tem certeza?')) {
                    const novosJogos = Lib.atualizarJogo(estado.jogos, jogoId, { avaliacao: null })
                    dispatch({ type: 'SET_GAMES', payload: novosJogos })
                }
                break
            case 'adicionar-desejo':
                dispatch({ type: 'SET_GAMES', payload: Lib.atualizarJogo(estado.jogos, jogoId, { isInWishlist: true }) })
                break
            case 'remover-desejo':
                dispatch({ type: 'SET_GAMES', payload: Lib.atualizarJogo(estado.jogos, jogoId, { isInWishlist: false }) })
                break
            case 'ver-mais':
                UI.abrirModalVerMais(jogo)
                break
        }
    }
    
    UI.paginationControls.addEventListener('click', (event) => {
        const target = event.target.closest('.pagination-button')
        if (target) {
            const pagina = parseInt(target.dataset.page)
            dispatch({ type: 'GO_TO_PAGE', payload: pagina })
        }
    })
}
// Função que inicia a aplicação.
async function iniciar() {
    UI.appContent.innerHTML = '<p class="empty-message">Carregando jogos...</p>'
    //Busca jogos na API e LOCALSTORAGE
    const jogosDaAPI = await API.buscarJogosIniciais()
    const jogosSalvos = API.carregarJogosSalvos()
    
    //Map dos jogos salvos para acesso pelo ID.
    const mapaDeJogosSalvos = new Map(jogosSalvos.map(jogo => [jogo.id, jogo]))
    //Mapeia a lista de API salva.
    const jogosIniciais = jogosDaAPI.map(jogoAPI => {
        return mapaDeJogosSalvos.get(jogoAPI.id) || jogoAPI
    })
    //Adiciona a lista no inicio.
    jogosSalvos.forEach(jogoSalvo => {
        if (!jogosIniciais.some(j => j.id === jogoSalvo.id)) {
            jogosIniciais.push(jogoSalvo)
        }
    })
    
    dispatch({ type: 'SET_GAMES', payload: jogosIniciais })
    //Popula os filtros.
    UI.popularFiltros(estado.jogos)
    configurarEventos()
}
//Inicia.
iniciar()

