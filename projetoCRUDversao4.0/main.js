import { buscarJogosDaAPI, buscarJogoPorNomeAPI, carregarJogosSalvos, salvarJogos, atualizarJogo } from './acervo.js';

// --- ESTADO DA APLICAÇÃO ---
const estado = {
    jogos: [],
    activeView: 'inicio',
    termoBusca: '',
    filtroGenero: '',
    filtroAno: '',
    filtroPlataforma: '', // NOVO
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
const platformFilter = document.getElementById('platform-filter'); // NOVO
const sortFilter = document.getElementById('sort-filter');

// --- FUNÇÕES DE RENDERIZAÇÃO E UI ---
function fecharModal() {
    modalOverlay.classList.add('hidden');
}

function abrirModalVerMais(jogo) {
    modalTitle.textContent = `Avaliação de "${jogo.titulo}"`;
    modalContent.innerHTML = `<div class="avaliacao-completa"><p>${jogo.avaliacao.comentario}</p></div><div class="modal-actions"><button id="btn-fechar-modal" class="btn btn-secondary">Fechar</button></div>`;
    document.getElementById('btn-fechar-modal').onclick = fecharModal;
    modalOverlay.classList.remove('hidden');
}

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

function appEngine(estado) {
    btnInicio.classList.toggle('active', estado.activeView === 'inicio');
    btnMinhaLista.classList.toggle('active', estado.activeView === 'minha-lista');
    btnDesejos.classList.toggle('active', estado.activeView === 'desejos');

    let listaParaRenderizar;
    switch (estado.activeView) {
        case 'minha-lista': listaParaRenderizar = estado.jogos.filter(j => j.avaliacao); break;
        case 'desejos': listaParaRenderizar = estado.jogos.filter(j => j.isInWishlist); break;
        default: listaParaRenderizar = estado.jogos; break;
    }

    if (estado.termoBusca) {
        listaParaRenderizar = listaParaRenderizar.filter(j => j.titulo.toLowerCase().includes(estado.termoBusca.toLowerCase()));
    }
    if (estado.filtroGenero) {
        listaParaRenderizar = listaParaRenderizar.filter(j => j.generos.includes(estado.filtroGenero));
    }
    if (estado.filtroAno) {
        listaParaRenderizar = listaParaRenderizar.filter(j => j.dataDeLancamento && new Date(j.dataDeLancamento).getFullYear() == estado.filtroAno);
    }
    // NOVO: Lógica de filtro por plataforma
    if (estado.filtroPlataforma) {
        listaParaRenderizar = listaParaRenderizar.filter(j => j.plataformas.includes(estado.filtroPlataforma));
    }
    
    if (estado.ordenacao === 'recentes') {
        listaParaRenderizar.sort((a, b) => new Date(b.dataDeLancamento) - new Date(a.dataDeLancamento));
    } else if (estado.ordenacao === 'antigos') {
        listaParaRenderizar.sort((a, b) => new Date(a.dataDeLancamento) - new Date(b.dataDeLancamento));
    }

    appContent.innerHTML = '';
    if (listaParaRenderizar.length === 0) {
        appContent.innerHTML = '<p class="empty-message">Nenhum jogo encontrado.</p>';
    } else {
        listaParaRenderizar.forEach(jogo => {
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
    yearFilter.innerHTML = '<option value="">Todos os Anos</option>';
    for (let ano = anoAtual; ano >= anoInicial; ano--) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        yearFilter.appendChild(option);
    }

    // NOVO: Lógica para popular filtro de plataforma
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

// --- LÓGICA DE EVENTOS E INICIALIZAÇÃO ---
function configurarEventos() {
    const limparBusca = () => {
        searchInput.value = '';
        estado.termoBusca = '';
        searchClearBtn.classList.add('hidden');
        appEngine(estado);
    };

    btnInicio.onclick = () => { estado.activeView = 'inicio'; limparBusca(); };
    btnMinhaLista.onclick = () => { estado.activeView = 'minha-lista'; appEngine(estado); };
    btnDesejos.onclick = () => { estado.activeView = 'desejos'; appEngine(estado); };

    searchClearBtn.addEventListener('click', limparBusca);

    searchInput.addEventListener('keyup', async (event) => {
        const termoBusca = searchInput.value.trim();
        searchClearBtn.classList.toggle('hidden', !termoBusca);
        if (event.key === 'Enter' && termoBusca) {
            appContent.innerHTML = `<p class="empty-message">Buscando por "${termoBusca}"...</p>`;
            const resultados = await buscarJogoPorNomeAPI(termoBusca);
            const idsAtuais = new Set(estado.jogos.map(j => j.id));
            resultados.forEach(jogoNovo => {
                if (!idsAtuais.has(jogoNovo.id)) estado.jogos.push(jogoNovo);
            });
            estado.termoBusca = termoBusca;
            salvarJogos(estado.jogos);
            popularFiltros(estado.jogos);
            appEngine(estado);
        } else if (termoBusca === '') {
            limparBusca();
        }
    });

    genreFilter.addEventListener('change', (e) => { estado.filtroGenero = e.target.value; appEngine(estado); });
    yearFilter.addEventListener('change', (e) => { estado.filtroAno = e.target.value; appEngine(estado); });
    platformFilter.addEventListener('change', (e) => { estado.filtroPlataforma = e.target.value; appEngine(estado); });
    sortFilter.addEventListener('change', (e) => { estado.ordenacao = e.target.value; appEngine(estado); });

    appContent.addEventListener('click', (event) => {
        const target = event.target.closest('[data-action]');
        if (!target) return;
        const { action, id } = target.dataset;
        const jogoId = parseInt(id);

        const atualizarEstadoESalvar = (novasAtualizacoes) => {
            estado.jogos = atualizarJogo(estado.jogos, jogoId, novasAtualizacoes);
            salvarJogos(estado.jogos);
            appEngine(estado);
        };

        const jogo = estado.jogos.find(j => j.id === jogoId);
        if (!jogo) return;

        switch (action) {
            case 'avaliar':
            case 'editar':
                abrirModalAvaliacao(jogo, (novaAvaliacao) => {
                    let atualizacoes = { avaliacao: novaAvaliacao };
                    if (jogo.isInWishlist) atualizacoes.isInWishlist = false;
                    atualizarEstadoESalvar(atualizacoes);
                });
                break;
            case 'excluir':
                if (confirm('Tem certeza?')) atualizarEstadoESalvar({ avaliacao: null });
                break;
            case 'adicionar-desejo':
                atualizarEstadoESalvar({ isInWishlist: true });
                break;
            case 'remover-desejo':
                atualizarEstadoESalvar({ isInWishlist: false });
                break;
            case 'ver-mais':
                abrirModalVerMais(jogo);
                break;
        }
    });
}

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

    estado.jogos = jogosIniciais;
    
    popularFiltros(estado.jogos);
    configurarEventos();
    appEngine(estado);
}

iniciar();