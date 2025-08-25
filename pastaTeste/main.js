// Importa as "ferramentas" da nossa biblioteca de lógica.
import { AcervoDeJogos } from './acervo.js';

// --- ELEMENTOS DO DOM ---
// Referências constantes para os elementos HTML que vamos manipular.
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

// A função do modal agora recebe o estado atual para poder gerar o próximo estado.
function abrirModal(estadoAtual, jogoId) {
    const jogo = estadoAtual.jogos.find(j => j.id === jogoId);
    const modoEdicao = !!jogo.avaliacao;
    const notaInicial = modoEdicao ? jogo.avaliacao.nota : 0;

    modalTitle.textContent = `Avaliação de ${jogo.titulo}`;
    
    // SUBSTITUIÇÃO DO 'for': Criamos um array [1, 2, 3, 4, 5],
    // mapeamos cada número para uma string HTML de estrela,
    // e juntamos tudo em uma única string.
    const estrelasHTML = Array.from({ length: 5 }, (_, i) => i + 1)
        .map(i => `<span class="estrela ${i <= notaInicial ? 'ativo' : ''}" data-value="${i}">★</span>`)
        .join('');

    modalContent.innerHTML = `
        <div class="form-group">
            <label for="avaliacao-comentario">Comentário</label>
            <textarea id="avaliacao-comentario" rows="4">${modoEdicao ? jogo.avaliacao.comentario : ''}</textarea>
        </div>
        <div class="form-group">
            <label>Sua Nota</label>
            <div class="estrelas">${estrelasHTML}</div>
            <div id="nota-selecionada">Você selecionou: ${notaInicial} estrelas</div>
        </div>
        <div class="modal-actions">
            <button id="btn-cancelar" class="btn btn-secondary">Cancelar</button>
            <button id="btn-salvar-modal" class="btn btn-primary" data-id="${jogo.id}">Salvar</button>
        </div>
    `;

    modalOverlay.classList.remove('hidden');

    const estrelas = modalContent.querySelectorAll('.estrela');
    const notaSelecionadaDiv = modalContent.querySelector('#nota-selecionada');
    
    // Nota sobre o 'let': Veja a explicação no final.
    let notaFinal = notaInicial;

    estrelas.forEach(estrela => {
        estrela.addEventListener('click', function() {
            const valor = parseInt(this.dataset.value);
            notaFinal = valor;
            notaSelecionadaDiv.textContent = `Você selecionou: ${notaFinal} estrelas`;
            
            estrelas.forEach((e, index) => {
                e.classList.toggle('ativo', index < valor);
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
            
            const proximoEstado = { ...estadoAtual, jogos: novosJogos };
            appEngine(proximoEstado); // Reinicia o motor com o novo estado
            fecharModal();
        } else {
            alert('Por favor, selecione uma nota (estrelas).');
        }
    };
}

// --- MOTOR DE RENDERIZAÇÃO ---
// Esta função é o coração do projeto. Ela é "pura" no sentido de que
// apenas desenha a tela com base no estado que recebe como parâmetro.
function appEngine(estadoAtual) {
    appContent.innerHTML = '';

    btnInicio.classList.toggle('active', estadoAtual.activeView === 'inicio');
    btnMinhaLista.classList.toggle('active', estadoAtual.activeView === 'minha-lista');

    const listaParaRenderizar = estadoAtual.activeView === 'inicio' 
        ? estadoAtual.jogos 
        : estadoAtual.jogos.filter(jogo => jogo.avaliacao !== null);
    
    // (O resto da lógica de renderização continua a mesma)
    if (listaParaRenderizar.length === 0) {
        appContent.innerHTML = '<p class="empty-message">Nenhum jogo para exibir nesta seção.</p>';
    } else {
        listaParaRenderizar.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'game-card';
            let botoesHTML = '';
            if (estadoAtual.activeView === 'inicio') {
                botoesHTML = `<button class="btn btn-primary" data-action="avaliar" data-id="${jogo.id}">${jogo.avaliacao ? 'Editar Avaliação' : 'Avaliar'}</button>`;
            } else {
                botoesHTML = `<button class="btn btn-secondary" data-action="editar" data-id="${jogo.id}">Editar</button>
                              <button class="btn btn-danger" data-action="excluir" data-id="${jogo.id}">Excluir Avaliação</button>`;
            }
            let avaliacaoDisplayHTML = '';
            if (jogo.avaliacao) {
                avaliacaoDisplayHTML += `<p><strong>Sua nota:</strong> ${'★'.repeat(jogo.avaliacao.nota)}</p>`;
                if (estadoAtual.activeView === 'minha-lista') {
                    const comentario = jogo.avaliacao.comentario;
                    const limite = 35;
                    if (comentario.length > limite) {
                        const comentarioCurto = comentario.substring(0, limite) + '...';
                        avaliacaoDisplayHTML += `<p><strong>Sua avaliação:</strong> "${comentarioCurto}" <button class="btn-link" data-action="ver-mais" data-id="${jogo.id}">Ver Mais</button></p>`;
                    } else {
                        avaliacaoDisplayHTML += `<p><strong>Sua avaliação:</strong> "${comentario}"</p>`;
                    }
                }
            }
            card.innerHTML = `...`; // (O innerHTML do card continua o mesmo)
            card.innerHTML = `<div class="game-card-image-container"><img src="${jogo.imagemUrl}" alt="Capa do jogo ${jogo.titulo}" class="game-card-image"></div>
                              <div class="game-card-info"><h3>${jogo.titulo}</h3><p>${jogo.developer} - ${jogo.dataDeLancamento}</p>${avaliacaoDisplayHTML}</div>
                              <div class="game-card-actions">${botoesHTML}</div>`;
            appContent.appendChild(card);
        });
    }

    // --- Configuração dos Eventos para o PRÓXIMO estado ---
    // A cada renderização, reconfiguramos os eventos para que eles sempre
    // saibam qual é o "estadoAtual" para poderem gerar o "proximoEstado".
    btnInicio.onclick = () => appEngine({ ...estadoAtual, activeView: 'inicio' });
    btnMinhaLista.onclick = () => appEngine({ ...estadoAtual, activeView: 'minha-lista' });

    appContent.onclick = (event) => {
        const action = event.target.dataset.action;
        const id = parseInt(event.target.dataset.id);
        if (!action) return;

        if (action === 'avaliar' || action === 'editar') {
            abrirModal(estadoAtual, id);
        }
        if (action === 'excluir') {
            if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
                const novosJogos = AcervoDeJogos.atualizarJogo(estadoAtual.jogos, id, { avaliacao: null });
                AcervoDeJogos.salvarJogos(novosJogos);
                appEngine({ ...estadoAtual, jogos: novosJogos });
            }
        }
        if (action === 'ver-mais') {
            const jogo = estadoAtual.jogos.find(j => j.id === id);
            if (jogo && jogo.avaliacao) {
                alert(`Avaliação completa de "${jogo.titulo}":\n\n${jogo.avaliacao.comentario}`);
            }
        }
    };
}

// --- INICIALIZAÇÃO ---
function iniciar() {
    const jogosCarregados = AcervoDeJogos.carregarJogos();
    
    // Usamos um ternário para evitar o 'let'
    const estadoInicial = {
        jogos: jogosCarregados.length > 0 ? jogosCarregados : AcervoDeJogos.redefinirJogos(),
        activeView: 'inicio'
    };
    
    appEngine(estadoInicial);
}

iniciar();
