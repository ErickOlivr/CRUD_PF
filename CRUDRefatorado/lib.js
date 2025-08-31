export function processarJogosParaView(estado) {
    const { jogos, activeView, termoBusca, filtroGenero, filtroAno, filtroPlataforma, ordenacao } = estado;
    
    const listaBase = (() => {
        switch (activeView) {
            case 'minha-lista': return jogos.filter(j => j.avaliacao);
            case 'desejos': return jogos.filter(j => j.isInWishlist);
            default: return jogos;
        }
    })();

    const listaFiltrada = listaBase
        .filter(j => !termoBusca || j.titulo.toLowerCase().includes(termoBusca.toLowerCase()))
        .filter(j => !filtroGenero || j.generos.includes(filtroGenero))
        .filter(j => !filtroAno || (j.dataDeLancamento && new Date(j.dataDeLancamento).getFullYear() == filtroAno))
        .filter(j => !filtroPlataforma || j.plataformas.includes(filtroPlataforma));
    
    const listaOrdenada = [...listaFiltrada];
    if (ordenacao === 'recentes') {
        listaOrdenada.sort((a, b) => new Date(b.dataDeLancamento) - new Date(a.dataDeLancamento));
    } else if (ordenacao === 'antigos') {
        listaOrdenada.sort((a, b) => new Date(a.dataDeLancamento) - new Date(b.dataDeLancamento));
    } else if (ordenacao === 'alfabetica_az') {
        listaOrdenada.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (ordenacao === 'alfabetica_za') {
        listaOrdenada.sort((a, b) => b.titulo.localeCompare(a.titulo));
    }
    return listaOrdenada;
}

export const atualizarJogo = (jogos, id, atualizacoes) =>
  jogos.map(jogo => (jogo.id === id ? { ...jogo, ...atualizacoes } : jogo));

export const mesclarListas = (listaPrincipal, listaSecundaria) => {
    const idsNaPrincipal = new Set(listaPrincipal.map(j => j.id));
    const itensUnicosDaSecundaria = listaSecundaria.filter(j => !idsNaPrincipal.has(j.id));
    return [...listaPrincipal, ...itensUnicosDaSecundaria];
};

export const limparMinhaLista = (jogos) =>
    jogos.map(jogo => ({ ...jogo, avaliacao: null }));

export const limparListaDeDesejos = (jogos) =>
    jogos.map(jogo => ({ ...jogo, isInWishlist: false }));

export function update(currentState, action) {
    switch (action.type) {
        case 'SET_GAMES':
            return { ...currentState, jogos: action.payload };
        case 'CHANGE_VIEW':
            return { ...currentState, activeView: action.payload, termoBusca: '', paginaAtual: 1 };
        case 'SET_SEARCH_TERM':
            return { ...currentState, termoBusca: action.payload, paginaAtual: 1 };
        case 'SET_FILTER':
            return { ...currentState, ...action.payload, paginaAtual: 1 };
        case 'LIMPAR_MINHA_LISTA':
            return { ...currentState, jogos: limparMinhaLista(currentState.jogos) };
        case 'LIMPAR_DESEJOS':
            return { ...currentState, jogos: limparListaDeDesejos(currentState.jogos) };
        case 'GO_TO_PAGE':
            return { ...currentState, paginaAtual: action.payload };
        default:
            return currentState;
    }
}