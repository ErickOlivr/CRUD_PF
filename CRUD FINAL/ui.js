import { processarJogosParaView } from './lib.js';

//Elementos de HTML que serão manipulados.
export const appContent = document.getElementById('app-content')
export const modalOverlay = document.getElementById('modal-overlay')
export const modalTitle = document.getElementById('modal-title')
export const modalContent = document.getElementById('modal-content')
export const btnInicio = document.getElementById('btn-inicio')
export const btnMinhaLista = document.getElementById('btn-minha-lista')
export const btnDesejos = document.getElementById('btn-desejos')
export const searchInput = document.getElementById('search-input')
export const searchClearBtn = document.getElementById('search-clear-btn')
export const genreFilter = document.getElementById('genre-filter')
export const yearFilter = document.getElementById('year-filter')
export const platformFilter = document.getElementById('platform-filter')
export const sortFilter = document.getElementById('sort-filter')
export const btnLimparMinhaLista = document.getElementById('btn-limpar-minha-lista')
export const btnLimparDesejos = document.getElementById('btn-limpar-desejos')
export const paginationControls = document.getElementById('pagination-controls')

//fecha modal.
export function fecharModal() {
    modalOverlay.classList.add('hidden')
}
//Pop up para ver toda a avaliação.
export function abrirModalVerMais(jogo) {
    modalTitle.textContent = `Avaliação de "${jogo.titulo}"`
    modalContent.innerHTML = `<div class="avaliacao-completa"><p>${jogo.avaliacao.comentario}</p></div><div class="modal-actions"><button id="btn-fechar-modal" class="btn btn-secondary">Fechar</button></div>`
    document.getElementById('btn-fechar-modal').onclick = fecharModal
    modalOverlay.classList.remove('hidden')
}
//Pop up de avaliação.
export function abrirModalAvaliacao(jogo, onSave) {
    const modoEdicao = !!jogo.avaliacao
    const notaInicial = modoEdicao ? jogo.avaliacao.nota : 0
    const comentarioInicial = modoEdicao ? jogo.avaliacao.comentario : ''
    modalTitle.textContent = `Avaliação de ${jogo.titulo}`
    const estrelasHTML = Array.from({ length: 5 }, (_, i) => i + 1).map(i => `<span class="estrela ${i <= notaInicial ? 'ativo' : ''}" data-value="${i}">★</span>`).join('')
    
    modalContent.innerHTML = `<div class="form-group"><label>Comentário</label><textarea id="comentario-input" rows="4">${comentarioInicial}</textarea></div><div class="form-group"><label>Nota</label><div class="estrelas">${estrelasHTML}</div></div><div class="modal-actions"><button id="btn-cancelar" class="btn btn-secondary">Cancelar</button><button id="btn-salvar-modal" class="btn btn-primary">Salvar</button></div>`
    
    modalOverlay.classList.remove('hidden')
    const estrelas = modalContent.querySelectorAll('.estrela')
    let notaFinal = notaInicial
    estrelas.forEach(estrela => {
        estrela.addEventListener('click', function() {
            notaFinal = parseInt(this.dataset.value)
            estrelas.forEach((e, index) => e.classList.toggle('ativo', index < notaFinal))
        })
    })
    document.getElementById('btn-cancelar').onclick = fecharModal
    document.getElementById('btn-salvar-modal').onclick = () => {
        if (notaFinal > 0) {
            onSave({ nota: notaFinal, comentario: document.getElementById('comentario-input').value })
            fecharModal()
        } else {
            alert('Por favor, selecione uma nota.')
        }
    }
}
// Função para popular os filtros (gênero, ano, plataforma) com base nos jogos carregados.
export function popularFiltros(jogos) {
    genreFilter.innerHTML = '<option value="">Todos os Gêneros</option>' + [...new Set(jogos.flatMap(j => j.generos))].sort().map(g => `<option value="${g}">${g}</option>`).join('')
    const anoAtual = new Date().getFullYear()
    yearFilter.innerHTML = '<option value="">Todos os Anos</option>' + Array.from({ length: anoAtual - 1979 }, (_, i) => anoAtual - i).map(a => `<option value="${a}">${a}</option>`).join('')
    platformFilter.innerHTML = '<option value="">Todas as Plataformas</option>' + [...new Set(jogos.flatMap(j => j.plataformas))].sort().map(p => `<option value="${p}">${p}</option>`).join('')
}
// Função que renderiza os controles de paginação.
export function renderizarPaginacao(estado, listaCompleta) {
    // Calcula o número total de jogos na lista filtrada.
    const totalDeJogos = listaCompleta.length
    // Calcula o total de páginas necessárias
    const totalDePaginas = Math.ceil(totalDeJogos / estado.jogosPorPagina)
    paginationControls.innerHTML = ''
    if (totalDePaginas <= 1) return
    // Cria um array com os números de todas as páginas.
    const paginas = Array.from({ length: totalDePaginas }, (_, i) => i + 1)
    const botoesHTML = paginas.map(i => {
        const classe = (i === estado.paginaAtual) ? 'pagination-button active' : 'pagination-button'
        return `<button class="${classe}" data-page="${i}">${i}</button>`
    }).join('')
    paginationControls.innerHTML = botoesHTML
}
//Função que atualiza a tela com base no estado atual.
export function appEngine(estado) {
    // Atualiza o estado visual dos botões de navegação (Início, Minha Lista, Desejos).
    btnInicio.classList.toggle('active', estado.activeView === 'inicio')
    btnMinhaLista.classList.toggle('active', estado.activeView === 'minha-lista')
    btnDesejos.classList.toggle('active', estado.activeView === 'desejos')
    btnLimparMinhaLista.classList.toggle('hidden', estado.activeView !== 'minha-lista')
    btnLimparDesejos.classList.toggle('hidden', estado.activeView !== 'desejos')
    
    // Processa a lista de jogos.
    const listaProcessada = processarJogosParaView(estado)
    // Calcula o índice inicial dos jogos para a página atual.
    const inicio = (estado.paginaAtual - 1) * estado.jogosPorPagina
    //calcula o indice final
    const fim = inicio + estado.jogosPorPagina
    //Fatia a lista para obter os jogos de cada pagina.
    const listaParaRenderizar = listaProcessada.slice(inicio, fim)
    
    renderizarPaginacao(estado, listaProcessada)

    appContent.innerHTML = ''
    if (listaParaRenderizar.length === 0) {
        appContent.innerHTML = '<p class="empty-message">Nenhum jogo encontrado.</p>'
    } else {
        listaParaRenderizar.forEach(jogo => {
            const card = document.createElement('div')
            card.className = 'game-card'
            let botoesHTML = ''
            if (jogo.avaliacao) {
                if (estado.activeView !== 'desejos') botoesHTML = `<button class="btn btn-secondary" data-action="editar" data-id="${jogo.id}">Editar Avaliação</button>`
                if (estado.activeView === 'minha-lista') botoesHTML += `<button class="btn btn-danger" data-action="excluir" data-id="${jogo.id}">Excluir</button>`
            } else if (jogo.isInWishlist) {
                botoesHTML = `<button class="btn btn-primary" data-action="avaliar" data-id="${jogo.id}">Avaliar</button><button class="btn btn-danger" data-action="remover-desejo" data-id="${jogo.id}">Remover Desejo</button>`
            } else {
                botoesHTML = `<button class="btn btn-primary" data-action="avaliar" data-id="${jogo.id}">Avaliar</button><button class="btn btn-secondary" data-action="adicionar-desejo" data-id="${jogo.id}">+ Lista de Desejos</button>`
            }
            const dataFormatada = jogo.dataDeLancamento ? new Date(jogo.dataDeLancamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Data desconhecida'
            let avaliacaoDisplayHTML = ''
            if (jogo.avaliacao) {
                avaliacaoDisplayHTML += `<p><strong>Sua nota:</strong> <span class="nota-estrelas">${'★'.repeat(jogo.avaliacao.nota)}${'☆'.repeat(5 - jogo.avaliacao.nota)}</span></p>`
                if (estado.activeView !== 'inicio' && jogo.avaliacao.comentario) {
                    const comentario = jogo.avaliacao.comentario
                    const limite = 80
                    const comentarioCurto = comentario.length > limite ? comentario.substring(0, limite) + '...' : comentario
                    avaliacaoDisplayHTML += `<p class="comentario"><strong>Sua avaliação:</strong> "${comentarioCurto}" ${comentario.length > limite ? `<button class="btn-link" data-action="ver-mais" data-id="${jogo.id}">Ver Mais</button>` : ''}</p>`
                }
            }
            card.innerHTML = `<div class="game-card-image-container"><img src="${jogo.imagemUrl || ''}" alt="Capa do jogo ${jogo.titulo}" class="game-card-image"></div><div class="game-card-info"><h3>${jogo.titulo}</h3><p><strong>Lançamento:</strong> ${dataFormatada}</p><div class="game-card-details"><div class="details-title">GÊNEROS</div><div class="tags-container">${jogo.generos.map(g => `<span class="tag">${g}</span>`).join('')}</div></div><div class="game-card-details"><div class="details-title">PLATAFORMAS</div><div class="tags-container">${jogo.plataformas.map(p => `<span class="tag">${p}</span>`).join('')}</div></div>${avaliacaoDisplayHTML}</div><div class="game-card-actions">${botoesHTML}</div>`;
            appContent.appendChild(card)
        })
    }
}