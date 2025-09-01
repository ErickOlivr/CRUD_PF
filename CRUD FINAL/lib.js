// Função que processa a lista de jogos para exibição.
export function processarJogosParaView(estado) {
    // Extrai as propriedades relevantes do objeto de estado.
    const { jogos, activeView, termoBusca, filtroGenero, filtroAno, filtroPlataforma, ordenacao } = estado
    
    // Determina qual lista de jogos usar como base, dependendo da tela ativa.
    const listaBase = (() => {
        switch (activeView) {
            case 'minha-lista': return jogos.filter(j => j.avaliacao)//Apenas jogos avaliados
            case 'desejos': return jogos.filter(j => j.isInWishlist)//Apenas jogos desejados
            default: return jogos//Todos os jogos
        }
    })()

// Aplica os filtros selecionados pelo usuário à lista base.
    const listaFiltrada = listaBase
        //Por titulo
        .filter(j => !termoBusca || j.titulo.toLowerCase().includes(termoBusca.toLowerCase()))
        //Genero
        .filter(j => !filtroGenero || j.generos.includes(filtroGenero))
        //Ano
        .filter(j => !filtroAno || (j.dataDeLancamento && new Date(j.dataDeLancamento).getFullYear() == filtroAno))
        //Plataforma
        .filter(j => !filtroPlataforma || j.plataformas.includes(filtroPlataforma))

// Cria uma cópia da lista filtrada para poder ordenar sem modificar a original.
    const listaOrdenada = [...listaFiltrada]
    if (ordenacao === 'recentes') {
        listaOrdenada.sort((a, b) => new Date(b.dataDeLancamento) - new Date(a.dataDeLancamento))
    } else if (ordenacao === 'antigos') {
        listaOrdenada.sort((a, b) => new Date(a.dataDeLancamento) - new Date(b.dataDeLancamento))
    } else if (ordenacao === 'alfabetica_az') {
        listaOrdenada.sort((a, b) => a.titulo.localeCompare(b.titulo))
    } else if (ordenacao === 'alfabetica_za') {
        listaOrdenada.sort((a, b) => b.titulo.localeCompare(a.titulo))
    }
    // Retorna a lista final, filtrada e ordenada.
    return listaOrdenada
}

// Função para atualizar um único jogo na lista de jogos.
export const atualizarJogo = (jogos, id, atualizacoes) =>
  // Usa map para criar um novo array. Se o ID do jogo corresponder, retorna um novo objeto de jogo com as atualizações aplicadas.  
  jogos.map(jogo => (jogo.id === id ? { ...jogo, ...atualizacoes } : jogo))

// Função para mesclar duas listas de jogos, evitando duplicatas.
export const mesclarListas = (listaPrincipal, listaSecundaria) => {
    const idsNaPrincipal = new Set(listaPrincipal.map(j => j.id))
    const itensUnicosDaSecundaria = listaSecundaria.filter(j => !idsNaPrincipal.has(j.id))
    return [...listaPrincipal, ...itensUnicosDaSecundaria]
}
// Função para limpar as avaliações de todos os jogos (Minha Lista).
export const limparMinhaLista = (jogos) =>
    jogos.map(jogo => ({ ...jogo, avaliacao: null }))

// Função para remover todos os jogos da lista de desejos.
export const limparListaDeDesejos = (jogos) =>
    jogos.map(jogo => ({ ...jogo, isInWishlist: false }))

// Função reducer, central de modificações no estado da aplicação.
export function update(currentState, action) {
    switch (action.type) {
        //Define lista de jogos no inicial
        case 'SET_GAMES':
            return { ...currentState, jogos: action.payload }
        //Muda visualização
        case 'CHANGE_VIEW':
            return { ...currentState, activeView: action.payload, termoBusca: '', paginaAtual: 1 }
        //Atualiza a busca e reset na paginação
        case 'SET_SEARCH_TERM':
            return { ...currentState, termoBusca: action.payload, paginaAtual: 1 }
        //Define filtro
        case 'SET_FILTER':
            return { ...currentState, ...action.payload, paginaAtual: 1 }
        //Limpa minha lista
        case 'LIMPAR_MINHA_LISTA':
            return { ...currentState, jogos: limparMinhaLista(currentState.jogos) }
        //Limpa desejos
        case 'LIMPAR_DESEJOS':
            return { ...currentState, jogos: limparListaDeDesejos(currentState.jogos) }
        //Muda pagina
        case 'GO_TO_PAGE':
            return { ...currentState, paginaAtual: action.payload }
        //Retorna o estado atual
        default:
            return currentState
    }
}