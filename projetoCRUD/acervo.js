/// Adicionamos a constante que estava faltando para o localStorage
const STORAGE_KEY = 'meusJogosDoAcervo'

// ========================
// Persistência (salvar, carregar, limpar os dados)
// ========================

const carregarJogos = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

const salvarJogos = jogos =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jogos))

const limparJogos = () => {
  localStorage.removeItem(STORAGE_KEY)
  console.log("Acervo de jogos limpo.")
}

const redefinirJogos = () => {
  // --- ALTERADO: Adicionadas mais informações a cada jogo ---
  const jogos = [
    { id: 1, titulo: "The Witcher 3: Wild Hunt", developer: "CD Projekt Red", dataDeLancamento: "2015-05-19", generos: ["RPG de Ação", "Mundo Aberto"], plataformas: ["PC", "PS4", "Xbox One", "Switch"], avaliacao: null, imagemUrl: "https://image.api.playstation.com/vulcan/img/rnd/202010/2614/itbLH0KRMUQ3T12ufdI8zD5B.jpg" },
    { id: 2, titulo: "Hades", developer: "Supergiant Games", dataDeLancamento: "2020-09-17", generos: ["Roguelike", "RPG de Ação"], plataformas: ["PC", "Switch", "PS5", "Xbox Series X/S"], avaliacao: null, imagemUrl: "https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg" },
    { id: 3, titulo: "Stardew Valley", developer: "ConcernedApe", dataDeLancamento: "2016-02-26", generos: ["Simulação", "RPG"], plataformas: ["PC", "PS4", "Xbox One", "Switch", "iOS", "Android"], avaliacao: null, imagemUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Stardew_Valley_cover_art.jpg/220px-Stardew_Valley_cover_art.jpg" },
    { id: 5, titulo: "Hollow Knight", developer: "Team Cherry", dataDeLancamento: "2017-02-24", generos: ["Metroidvania", "Ação-Aventura"], plataformas: ["PC", "Switch", "PS4", "Xbox One"], avaliacao: null, imagemUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Hollow_Knight_cover_art.jpg/220px-Hollow_Knight_cover_art.jpg" },
    { id: 6, titulo: "Disco Elysium", developer: "ZA/UM", dataDeLancamento: "2019-10-15", generos: ["RPG", "Aventura"], plataformas: ["PC", "PS5", "Xbox Series X/S", "Switch"], avaliacao: null, imagemUrl: "https://upload.wikimedia.org/wikipedia/en/b/b4/Disco_Elysium_cover_art.jpg" },
    { id: 8, titulo: "Outer Wilds", developer: "Mobius Digital", dataDeLancamento: "2019-05-28", generos: ["Aventura", "Exploração Espacial"], plataformas: ["PC", "PS4", "Xbox One"], avaliacao: null, imagemUrl: "https://upload.wikimedia.org/wikipedia/en/3/3b/Outer_Wilds_cover_art.jpg" },
    { id: 9, titulo: "Dead Cells", developer: "Motion Twin", dataDeLancamento: "2018-08-07", generos: ["Roguelike", "Metroidvania"], plataformas: ["PC", "PS4", "Xbox One", "Switch", "Mobile"], avaliacao: null, imagemUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/1/18/Dead_Cells_cover_art.jpg/220px-Dead_Cells_cover_art.jpg" }
  ]
  salvarJogos(jogos)
  return jogos
}

// ========================
// CRUD funcional (Create, Read, Update, Delete)
// ========================

const adicionarJogo = (jogos, novoJogo) => [...jogos, novoJogo]
const atualizarJogo = (jogos, id, atualizacoes) =>
  jogos.map(jogo => (jogo.id === id ? { ...jogo, ...atualizacoes } : jogo))
const apagarJogo = (jogos, id) =>
  jogos.filter(jogo => jogo.id !== id)


// ========================
// Exporta todas as funções como um objeto AcervoDeJogos
// ========================

export const AcervoDeJogos = {
  // Persistência
  carregarJogos, salvarJogos, redefinirJogos, limparJogos,
  // CRUD
  adicionarJogo, atualizarJogo, apagarJogo,
}