import { AcervoDeJogos } from './acervo.js'

// --- 2. ESTADO DA APLICAÇÃO ---
let state = {
    jogos: [],
    activeView: 'inicio' // 'inicio' ou 'minha-lista'
};

const appContent = document.getElementById('app-content')


const render= () => {
    appContent.innerHTML = ''

    document.getElementById('btn-inicio').classList.toggle('active', state.activeView === 'inicio')
    document.getElementById('btn-minha-lista').classList.toggle('active', state.activeView === 'minha-lista')

    const listaParaRenderizar = state.activeView === 'inicio' 
        ? state.jogos 
        : state.jogos.filter(jogo => jogo.estaNaMyList === true)

    if(listaParaRenderizar.length===0){
        appContent.innerHTML= '<p>Nenhum jogo para exibir nesta seção.</p>'
        return
    }

    listaParaRenderizar.forEach(jogo=>{
        const card = document.createElement('div')
        card.className = 'game-card'

       const botoesHTML = jogo.estaNaMyList
            ? `<button class="btn btn-danger" data-action="remover-lista" data-id="${jogo.id}">Remover da Lista</button>`
            : `<button class="btn btn-primary" data-action="adicionar-lista" data-id="${jogo.id}">+ Minha Lista</button>`;

        card.innerHTML = `
            <div class="game-card-image-container">
                <img src="${jogo.imagemUrl}" alt="Capa do jogo ${jogo.titulo}" class="game-card-image">
            </div>
            <div class="game-card-info">
                <h3>${jogo.titulo}</h3>
                <p>${jogo.developer} - ${jogo.dataDeLancamento}</p>
            </div>
            <div class="game-card-actions">
                ${botoesHTML}
            </div>`;
            
        appContent.appendChild(card)
    })

}

function iniciar(){
    let jogosiniciais = AcervoDeJogos.carregarJogos()
    if (jogosiniciais.length=== 0){
        jogosiniciais = AcervoDeJogos.redefinirJogos()
    }
    state.jogos = jogosiniciais
    
    document.getElementById('btn-inicio').addEventListener('click',()=>{
        state.activeView = 'inicio'
        render()
    })

    document.getElementById('btn-minha-lista').addEventListener('click',()=>{
        state.activeView = 'minha-lista'
        render()
    })

    appContent.addEventListener('click',(event)=>{
        const action = event.target.dataset.action
        const id = parseInt(event.target.dataset.id)
        if(!action) return

        if(action=== 'adicionar-lista'){
            state.jogos = AcervoDeJogos.atualizarJogo(state.jogos, id, { estaNaMyList: true, estaNosDesejos: false })
        }

        if (action === 'remover-lista') {
            state.jogos = AcervoDeJogos.atualizarJogo(state.jogos, id, { estaNaMyList: false })
        }

        AcervoDeJogos.salvarJogos(state.jogos)
        render()
    })

    render()
}

iniciar()