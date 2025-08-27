/*
+Responsavel pela comunicação externa
1-Conversar com a API
2-Conversar com o LOCALSTORAGE
(isolamos as funçoes impuras aqui)
*/ 
//Chave da API
const MINHA_CHAVE_API = '2f6956d5c561418d881197a4220dfbcc';

/*+Função PURA = Transforma um objeto de jogo vindo da API para o formato desejado
-jogoAPI é o objeto de jogo da API
*/ 
const STORAGE_KEY = 'meusJogosDoAcervo';
const adaptarJogo = (jogoAPI) => ({
    id: jogoAPI.id,
    titulo: jogoAPI.name,
    developer: jogoAPI.developers?.[0]?.name || 'Não informado',
    dataDeLancamento: jogoAPI.released,
    generos: jogoAPI.genres.map(g => g.name),
    plataformas: jogoAPI.platforms.map(p => p.platform.name),
    avaliacao: null,
    isInWishlist: false,
    imagemUrl: jogoAPI.background_image,
});

//Função IMPURA = Busca um jogo especifico na API pelo nome
export async function buscarJogoPorNomeAPI(termoBusca) {
    if (!MINHA_CHAVE_API || MINHA_CHAVE_API === 'SUA_CHAVE_API_VEM_AQUI') {
        console.error("Chave da API não fornecida.");
        return [];
    }
    const endpoint = `https://api.rawg.io/api/games?key=${MINHA_CHAVE_API}&search=${termoBusca}&page_size=1000`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Erro na busca da API: ${response.statusText}`);
        const data = await response.json();
        return data.results.map(adaptarJogo);
    } catch (error) {
        console.error("Falha ao buscar jogo por nome:", error);
        return [];
    }
}

//Função impura = busca a lista inicial de jogos, misturando classicos e recentes
export async function buscarJogosDaAPI() {
    if (!MINHA_CHAVE_API || MINHA_CHAVE_API === 'SUA_CHAVE_API_VEM_AQUI') {
        console.error("Chave da API não fornecida ou inválida. Verifique o arquivo acervo.js");
        return [];
    }
    const endpoint = `https://api.rawg.io/api/games?key=${MINHA_CHAVE_API}&page_size=1000&ordering=-metacritic`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results.map(adaptarJogo);

    } catch (error) {
        console.error("Falha ao buscar jogos da API:", error);
        return [];
    }
}

//Funções de Armazenamento Local (localStorage)

//Função impura/pura = le os jogos que estào salvos no localStorage
export const carregarJogosSalvos = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
//função impura/pura = Salva a lista de jogos atual no localStorage
export const salvarJogos = jogos => localStorage.setItem(STORAGE_KEY, JSON.stringify(jogos));
//função pura = recebe uma lista e retorna uma nova lista com um jogo atualizado
export const atualizarJogo = (jogos, id, atualizacoes) => jogos.map(jogo => (jogo.id === id ? { ...jogo, ...atualizacoes } : jogo));