
const API_KEY = '2f6956d5c561418d881197a4220dfbcc'
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

export async function buscarJogoPorNome(termoBusca) {
    if (!API_KEY || API_KEY === 'SUA_CHAVE_API_VEM_AQUI') return [];
    const endpoint = `https://api.rawg.io/api/games?key=${API_KEY}&search=${termoBusca}&page_size=10`;
    try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Erro na busca');
        const data = await response.json();
        return data.results.map(adaptarJogo);
    } catch (error) {
        console.error("Falha ao buscar jogo por nome:", error);
        return [];
    }
}

export async function buscarJogosIniciais() {
    if (!API_KEY || API_KEY === 'SUA_CHAVE_API_VEM_AQUI') {
        console.error("Chave da API não fornecida. Verifique o arquivo api.js");
        return [];
    }
    const endpointClassicos = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=50&ordering=-metacritic`;
    const hoje = new Date();
    const dataFim = hoje.toISOString().split('T')[0];
    const dataInicio = `${hoje.getFullYear() - 3}-01-01`;
    const endpointRecentes = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=50&dates=${dataInicio},${dataFim}&ordering=-metacritic`;
    try {
        const [resRecentes, resClassicos] = await Promise.all([fetch(endpointRecentes), fetch(endpointClassicos)]);
        if (!resRecentes.ok || !resClassicos.ok) throw new Error('Erro na API');
        const dadosRecentes = await resRecentes.json();
        const dadosClassicos = await resClassicos.json();
        const todosOsJogos = [...dadosRecentes.results, ...dadosClassicos.results];
        const mapaDeJogos = new Map();
        todosOsJogos.forEach(jogo => {
            if (jogo) {
                mapaDeJogos.set(jogo.id, jogo);
            }
        });
        const jogosUnicos = Array.from(mapaDeJogos.values());
        return jogosUnicos.map(adaptarJogo);
    } catch (error) {
        console.error("Falha ao buscar jogos iniciais:", error);
        return [];
    }
}

export const carregarJogosSalvos = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const salvarJogos = (jogos) => localStorage.setItem(STORAGE_KEY, JSON.stringify(jogos))