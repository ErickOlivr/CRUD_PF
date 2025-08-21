//==============FUNCOES================
export const adicionarAvaliacao = (lista, jogoId, novaAvaliacao) =>{
    return lista.map(jogo => {
        if(jogo.id === jogoId && jogo.avaliacao === null){
            return {...jogo, avaliacao: novaAvaliacao};
        }
        return jogo;
    });
};

export const editarAvaliacao = (lista, jogoId, novaAtualizacao) => {
   return lista.map(jogo => {
    if(jogo.id === jogoId && jogo.avaliacao === null){
        return {...jogo, avaliacao : novaAtualizacao};
    }
    return jogo;
   });
};

export const excluirAvaliacao = (lista, jogoId) => {
    return lista.map(jogo => {
        if(jogo.Id === jogoId){
            return {...jogo, avaliacao: null};
        }
        return jogo;
    });
};
