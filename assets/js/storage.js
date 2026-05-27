//
// STORAGE CENTRAL DO SISTEMA
//

//
// SALVAR DADOS
//

function salvarDados(chave, dados){

    localStorage.setItem(
        chave,
        JSON.stringify(dados)
    );
}

//
// BUSCAR DADOS
//

function buscarDados(chave){

    return JSON.parse(
        localStorage.getItem(chave)
    ) || [];
}

//
// ADICIONAR ITEM
//

function adicionarItem(chave, item){

    const dados =
    buscarDados(chave);

    dados.push(item);

    salvarDados(
        chave,
        dados
    );
}

//
// REMOVER ITEM
//

function removerItem(chave, index){

    const dados =
    buscarDados(chave);

    dados.splice(index,1);

    salvarDados(
        chave,
        dados
    );
}

//
// ATUALIZAR ITEM
//

function atualizarItem(
    chave,
    index,
    novoItem
){

    const dados =
    buscarDados(chave);

    dados[index] =
    novoItem;

    salvarDados(
        chave,
        dados
    );
}

//
// LIMPAR DADOS
//

function limparDados(chave){

    localStorage.removeItem(chave);
}

//
// GERAR ID
//

function gerarID(){

    return Date.now();
}