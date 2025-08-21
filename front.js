import { adicionarAvaliacao, editarAvaliacao,excluirAvaliacao } from "../backend/funcoes.js";


const app = (estadoAtual, idEmEdicao = null) => {
    const rootElement = document.getElementById('app');
    rootElement.innerHTML = '<h1>Minha Lista de Jogos</h1>';

    estadoAtual.forEach(jogo => {
        const jogoDiv = document.createElement('div');
        jogoDiv.className = 'jogo';
        const estaEditando = jogo.id === idEmEdicao;

        if (estaEditando) {
            jogoDiv.innerHTML = `<div class='jogo-info form-edicao'>
                    <p><strong>${jogo.nome}</strong></p>
                    <input type='number' id='nota-input-${jogo.id}' value='${jogo.avaliacao.nota}' min='1' max='5'>
                    <textarea id='comentario-input-${jogo.id}'>${jogo.avaliacao.comentario}</textarea>
                </div>
                <div class='botoes'>
                    <button class='btn-salvar' data-id='${jogo.id}'>Salvar</button>
                </div>`;
        } else {
            const avaliacaoHTML = jogo.avaliacao
                ? `<p><small>Nota: ${jogo.avaliacao.nota} ★ - "${jogo.avaliacao.comentario}"</small></p>`
                : `<p><small>Não avaliado</small></p>`;
            
            const botoesHTML = jogo.avaliacao
                ? `<button class='btn-editar' data-id='${jogo.id}'>Editar</button>
                   <button class='btn-excluir' data-id='${jogo.id}'>Excluir</button>`
                : '';
            
            jogoDiv.innerHTML = `<div class='jogo-info'>
                    <p><strong>${jogo.nome}</strong></p>
                    ${avaliacaoHTML}
                </div>
                <div class='botoes'>${botoesHTML}</div>`;
        }
        rootElement.appendChild(jogoDiv);
    });
    
    const jogosNaoAvaliados = estadoAtual.filter(j => !j.avaliacao);
    if (jogosNaoAvaliados.length > 0) {
        const formAdicionar = document.createElement('div');
        formAdicionar.className = 'form-adicionar';
        formAdicionar.innerHTML = `<h2>Adicionar Nova Avaliação</h2>
            <select id='jogo-select'>
                ${jogosNaoAvaliados.map(j => `<option value='${j.id}'>${j.nome}</option>`).join('')}
            </select>
            <input type='number' id='nota-adicionar' placeholder='Nota (1-5)' min='1' max='5'>
            <textarea id='comentario-adicionar' placeholder='Seu comentário...'></textarea>
            <button class='btn-adicionar'>Adicionar</button>`;
        rootElement.appendChild(formAdicionar);
    }

    rootElement.onclick = (event) => {
        const target = event.target;
        const jogoId = parseInt(target.dataset.id);

        if (target.classList.contains('btn-editar')) {
            app(estadoAtual, jogoId);
        }

        if (target.classList.contains('btn-salvar')) {
            const atualizacao = {
                nota: parseInt(document.getElementById(`nota-input-${jogoId}`).value),
                comentario: document.getElementById(`comentario-input-${jogoId}`).value
            };
            // Corrigido: jogoId
            fetch(`http://localhost:3000/jogos/${jogoId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(atualizacao) })
                .then(res => res.ok && app(editarAvaliacao(estadoAtual, jogoId, atualizacao), null));
        }

        if (target.classList.contains('btn-excluir')) {
            fetch(`http://localhost:3000/jogos/${jogoId}/avaliacao`, { method: 'DELETE' })
                .then(res => res.ok && app(excluirAvaliacao(estadoAtual, jogoId)));
        }
        
        if (target.classList.contains('btn-adicionar')) {
            const idAdicionar = parseInt(document.getElementById('jogo-select').value);
            const novaAvaliacao = {
                nota: parseInt(document.getElementById('nota-adicionar').value) || 0,
                comentario: document.getElementById('comentario-adicionar').value
            };
            fetch(`http://localhost:3000/jogos/${idAdicionar}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novaAvaliacao) })
                .then(res => res.ok && app(adicionarAvaliacao(estadoAtual, idAdicionar, novaAvaliacao)));
        }
    };
}

async function iniciar() {
    try {
        const response = await fetch('http://localhost:3000/jogos');
        if (!response.ok) {
            throw new Error(`Erro de rede! Status: ${response.status}`);
        }
        const estadoInicial = await response.json();
        app(estadoInicial);
    } catch (error) {
        console.error("Erro ao carregar dados do backend:", error);
        document.getElementById('app').innerHTML = `<h1>Erro ao conectar com o servidor</h1><p>Verifique se o backend está rodando na porta 3000 e tente recarregar a página.</p>`;
    }
}

iniciar();