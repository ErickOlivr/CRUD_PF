// Importa as "ferramentas" da nossa biblioteca de lógica.
import { AcervoDeJogos } from './acervo.js';

// --- ELEMENTOS DO DOM ---
const appContent = document.getElementById('app-content');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const btnInicio = document.getElementById('btn-inicio');
const btnMinhaLista = document.getElementById('btn-minha-lista');

// --- LÓGICA DO POP-UP (MODAL) ---
function fecharModal() {
    modalOverlay.classList.add('hidden');
}

// --- NOVO: Modal específico para "Ver Mais" ---
function abrirModalVerMais(jogo) {
    modalTitle.textContent = `Avaliação de "${jogo.titulo}"`;
    modalContent.innerHTML = `
        <div class="avaliacao-completa">
            <p>${jogo.avaliacao.comentario}</p>
        </div>
        <div class="modal-actions">
            <button id="btn-fechar-modal" class="btn btn-secondary">Fechar</button>
        </div>
    `;
    document.getElementById('btn-fechar-modal').onclick = fecharModal;
    modalOverlay.classList.remove('hidden');
}

function abrirModalAvaliacao(estadoAtual, jogoId) {
    const jogo = estadoAtual.jogos.find(j => j.id === jogoId);
    const modoEdicao = !!jogo.avaliacao;
    const notaInicial = modoEdicao ? jogo.avaliacao.nota : 0;

    modalTitle.textContent = `Avaliação de ${jogo.titulo}`;
    
    const estrelasHTML = Array.from({ length: 5 }, (_, i) => i + 1)
        .map(i => `<span class="estrela ${i <= notaInicial ? 'ativo' : ''}" data-value="${i}">★</span>`)
        .join('');

    modalContent.innerHTML = `
        <div class="form-group">
            <label for="avaliacao-comentario">Comentário</label>
            <textarea id="avaliacao-comentario" rows="4" placeholder="Escreva sua avaliação...">${modoEdicao ? jogo.avaliacao.comentario : ''}</textarea>
        </div>
        <div class="form-group">
            <label>Sua Nota</label>
            <div class="estrelas">${estrelasHTML}</div>
        </div>
        <div class="modal-actions">
            <button id="btn-cancelar" class="btn btn-secondary">Cancelar</button>
            <button id="btn-salvar-modal" class="btn btn-primary" data-id="${jogo.id}">Salvar</button>
        </div>
    `;

    modalOverlay.classList.remove('hidden');

    const estrelas = modalContent.querySelectorAll('.estrela');
    let notaFinal = notaInicial;

    estrelas.forEach(estrela => {
        estrela.addEventListener('click', function() {
            notaFinal = parseInt(this.dataset.value);
            estrelas.forEach((e, index) => {
                e.classList.toggle('ativo', index < notaFinal);
            });
        });
    });

    document.getElementById('btn-cancelar').onclick = fecharModal;
    document.getElementById('btn-salvar-modal').onclick = () => {
        const comentario = document.getElementById('avaliacao-comentario').value;
        if (notaFinal > 0 && notaFinal <= 5) {
            const novaAvaliacao = { nota: notaFinal, comentario: comentario };
            const novosJogos = AcervoDeJogos.atualizarJogo(estadoAtual.jogos, jogoId, { avaliacao: novaAvaliacao });
            AcervoDeJogos.salvarJogos(novosJogos);
            
            appEngine({ ...estadoAtual, jogos: novosJogos });
            fecharModal();
        } else {
            alert('Por favor, selecione uma nota (pelo menos uma estrela).');
        }
    };
}

// --- MOTOR DE RENDERIZAÇÃO ---
function appEngine(estadoAtual) {
    appContent.innerHTML = '';

    btnInicio.classList.toggle('active', estadoAtual.activeView === 'inicio');
    btnMinhaLista.classList.toggle('active', estadoAtual.activeView === 'minha-lista');

    const listaParaRenderizar = estadoAtual.activeView === 'inicio' 
        ? estadoAtual.jogos 
        : estadoAtual.jogos.filter(jogo => jogo.avaliacao !== null);
    
    if (listaParaRenderizar.length === 0) {
        appContent.innerHTML = '<p class="empty-message">Nenhum jogo para exibir nesta seção.</p>';
    } else {
        listaParaRenderizar.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            // --- ALTERADO: Lógica para exibir as novas informações ---
            const dataFormatada = new Date(jogo.dataDeLancamento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
            const generosHTML = jogo.generos.map(g => `<span class="tag">${g}</span>`).join('');
            const plataformasHTML = jogo.plataformas.map(p => `<span class="tag">${p}</span>`).join('');
            
            let botoesHTML = '';
            if (estadoAtual.activeView === 'inicio') {
                botoesHTML = `<button class="btn btn-primary" data-action="avaliar" data-id="${jogo.id}">${jogo.avaliacao ? 'Editar Avaliação' : 'Avaliar'}</button>`;
            } else {
                botoesHTML = `<button class="btn btn-secondary" data-action="editar" data-id="${jogo.id}">Editar</button>
                              <button class="btn btn-danger" data-action="excluir" data-id="${jogo.id}">Excluir Avaliação</button>`;
            }

            let avaliacaoDisplayHTML = '';
            if (jogo.avaliacao) {
                avaliacaoDisplayHTML += `<p><strong>Sua nota:</strong> <span class="nota-estrelas">${'★'.repeat(jogo.avaliacao.nota)}${'☆'.repeat(5 - jogo.avaliacao.nota)}</span></p>`;
                if (estadoAtual.activeView === 'minha-lista') {
                    const comentario = jogo.avaliacao.comentario;
                    const limite = 80;
                    const comentarioCurto = comentario.length > limite ? comentario.substring(0, limite) + '...' : comentario;
                    avaliacaoDisplayHTML += `<p class="comentario"><strong>Sua avaliação:</strong> "${comentarioCurto}" ${comentario.length > limite ? `<button class="btn-link" data-action="ver-mais" data-id="${jogo.id}">Ver Mais</button>` : ''}</p>`;
                }
            }
            
            // --- ALTERADO: Estrutura HTML do card para acomodar as novas informações e layout ---
            card.innerHTML = `
              <div class="game-card-image-container">
                  <img src="${jogo.imagemUrl}" alt="Capa do jogo ${jogo.titulo}" class="game-card-image">
              </div>
              <div class="game-card-info">
                  <h3>${jogo.titulo}</h3>
                  <p>${jogo.developer}</p>
                  <p><strong>Lançamento:</strong> ${dataFormatada}</p>
                  
                  <div class="game-card-details">
                      <div class="details-title">GÊNEROS</div>
                      <div class="tags-container">${generosHTML}</div>
                  </div>
                  <div class="game-card-details">
                      <div class="details-title">PLATAFORMAS</div>
                      <div class="tags-container">${plataformasHTML}</div>
                  </div>
                  ${avaliacaoDisplayHTML}
              </div>
              <div class="game-card-actions">
                  ${botoesHTML}
              </div>`;
            appContent.appendChild(card);
        });
    }

    // --- Configuração dos Eventos ---
    btnInicio.onclick = () => appEngine({ ...estadoAtual, activeView: 'inicio' });
    btnMinhaLista.onclick = () => appEngine({ ...estadoAtual, activeView: 'minha-lista' });

    appContent.onclick = (event) => {
        const action = event.target.dataset.action;
        const id = parseInt(event.target.dataset.id);
        if (!action) return;

        if (action === 'avaliar' || action === 'editar') {
            abrirModalAvaliacao(estadoAtual, id);
        }
        if (action === 'excluir') {
            if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
                const novosJogos = AcervoDeJogos.atualizarJogo(estadoAtual.jogos, id, { avaliacao: null });
                AcervoDeJogos.salvarJogos(novosJogos);
                appEngine({ ...estadoAtual, jogos: novosJogos });
            }
        }
        // --- ALTERADO: Chama a nova função de modal para 'ver-mais' ---
        if (action === 'ver-mais') {
            const jogo = estadoAtual.jogos.find(j => j.id === id);
            if (jogo) {
                abrirModalVerMais(jogo);
            }
        }
    };
}

// --- INICIALIZAÇÃO ---
function iniciar() {
    const jogosCarregados = AcervoDeJogos.carregarJogos();
    
    const estadoInicial = {
        jogos: jogosCarregados.length > 0 ? jogosCarregados : AcervoDeJogos.redefinirJogos(),
        activeView: 'inicio'
    };
    
    appEngine(estadoInicial);
}

iniciar();