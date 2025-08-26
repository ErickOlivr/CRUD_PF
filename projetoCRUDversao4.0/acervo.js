// --- IMPORTANTE: COLE SUA CHAVE DA API DA RAWG AQUI ---
const MINHA_CHAVE_API = '2f6956d5c561418d881197a4220dfbcc';

const STORAGE_KEY = 'meusJogosDoAcervo';

// Função auxiliar para adaptar um jogo da API para o nosso formato
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

// Função de busca por nome específico (sem alterações)
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

// --- FUNÇÃO DE BUSCA SIMPLIFICADA PARA UMA ÚNICA CHAMADA ---
export async function buscarJogosDaAPI() {
    if (!MINHA_CHAVE_API || MINHA_CHAVE_API === 'SUA_CHAVE_API_VEM_AQUI') {
        console.error("Chave da API não fornecida ou inválida. Verifique o arquivo acervo.js");
        return [];
    }
    // Faz uma única busca pelos 40 jogos mais bem avaliados de todos os tempos
    const endpoint = `https://api.rawg.io/api/games?key=${MINHA_CHAVE_API}&page_size=1000&ordering=-metacritic`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.statusText}`);
        }
        const data = await response.json();
        return data.results.map(adaptarJogo); // Adapta os resultados e retorna

    } catch (error) {
        console.error("Falha ao buscar jogos da API:", error);
        return [];
    }
}

// Funções de Persistência e CRUD (sem alterações)
export const carregarJogosSalvos = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};
export const salvarJogos = jogos => localStorage.setItem(STORAGE_KEY, JSON.stringify(jogos));
export const atualizarJogo = (jogos, id, atualizacoes) => jogos.map(jogo => (jogo.id === id ? { ...jogo, ...atualizacoes } : jogo));