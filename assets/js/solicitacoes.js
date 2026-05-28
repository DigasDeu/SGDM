const modal =
document.getElementById(
"modalSolicitacao"
);

const abrirModal =
document.getElementById(
"abrirModal"
);

const fecharModal =
document.getElementById(
"fecharModal"
);

const salvarSolicitacao =
document.getElementById(
"salvarSolicitacao"
);

const listaSolicitacoes =
document.getElementById(
"listaSolicitacoes"
);

const pesquisa =
document.getElementById(
"pesquisaSolicitacao"
);

let filtroAtual = "Todos";

//
// ABRIR MODAL
//

abrirModal.onclick = ()=>{

    modal.style.display = "flex";
};

//
// FECHAR MODAL
//

fecharModal.onclick = ()=>{

    modal.style.display = "none";
};

//
// SALVAR
//

salvarSolicitacao.onclick = ()=>{

    const titulo =
    document.getElementById(
    "titulo"
    ).value;

    const solicitante =
    document.getElementById(
    "solicitante"
    ).value;

    const data =
    document.getElementById(
    "data"
    ).value;

    const hora =
    document.getElementById(
    "hora"
    ).value;

    const local =
    document.getElementById(
    "local"
    ).value;

    const status =
    document.getElementById(
    "status"
    ).value;

    const descricao =
    document.getElementById(
    "descricao"
    ).value;

    if(
        !titulo ||
        !solicitante
    ){

        alert(
        "Preencha os campos."
        );

        return;
    }

    const solicitacoes =
    JSON.parse(
        localStorage.getItem(
        "solicitacoes"
        )
    ) || [];

    solicitacoes.push({

        titulo,
        solicitante,
        data,
        hora,
        local,
        status,
        descricao

    });

    localStorage.setItem(
    "solicitacoes",
    JSON.stringify(
    solicitacoes
    )
    );

    //
    // NOTIFICAÇÃO
    //

    const notificacoes =
    JSON.parse(
        localStorage.getItem(
        "notificacoes"
        )
    ) || [];

    notificacoes.push({

        titulo:
        "Nova Solicitação",

        descricao:
        `${titulo} - ${data}`

    });

    localStorage.setItem(
    "notificacoes",
    JSON.stringify(
    notificacoes
    )
    );

    carregarSolicitacoes();

    modal.style.display = "none";
};

//
// LISTAR
//

function carregarSolicitacoes(){

    const solicitacoes =
    JSON.parse(
        localStorage.getItem(
        "solicitacoes"
        )
    ) || [];

    listaSolicitacoes.innerHTML = "";

    let filtradas =
    solicitacoes.filter(item=>{

        const matchPesquisa =
        item.titulo
        .toLowerCase()
        .includes(
        pesquisa.value.toLowerCase()
        );

        const matchFiltro =

        filtroAtual === "Todos"

        ||

        item.status === filtroAtual;

        return(
            matchPesquisa &&
            matchFiltro
        );
    });

    if(filtradas.length === 0){

        listaSolicitacoes.innerHTML =

        `
        <p>
        Nenhuma solicitação encontrada.
        </p>
        `;

        return;
    }

    filtradas.reverse()
    .forEach(item=>{

        let statusClass = "";

        if(item.status === "Pendente"){

            statusClass = "pendente";
        }

        if(item.status === "Andamento"){

            statusClass = "andamento";
        }

        if(item.status === "Concluído"){

            statusClass = "concluido";
        }

        listaSolicitacoes.innerHTML +=

        `
        <div class="solicitacao-card">

            <h3>
            ${item.titulo}
            </h3>

            <div class="solicitacao-info">

                <p>

                <strong>Solicitante:</strong>

                ${item.solicitante}

                </p>

                <p>

                <strong>Data:</strong>

                ${item.data}

                </p>

                <p>

                <strong>Hora:</strong>

                ${item.hora}

                </p>

                <p>

                <strong>Local:</strong>

                ${item.local}

                </p>

            </div>

            <p>

            ${item.descricao}

            </p>

            <span class="status ${statusClass}">

                ${item.status}

            </span>

        </div>
        `;
    });
}

//
// PESQUISA
//

pesquisa.addEventListener(
"input",
carregarSolicitacoes
);

//
// FILTROS
//

document.querySelectorAll(
".filtro-btn"
).forEach(btn=>{

    btn.addEventListener(
    "click",
    ()=>{

        document
        .querySelectorAll(
        ".filtro-btn"
        )
        .forEach(
        b=>b.classList.remove(
        "active"
        )
        );

        btn.classList.add(
        "active"
        );

        filtroAtual =
        btn.dataset.status;

        carregarSolicitacoes();
    });
});

//
// INICIAR
//

carregarSolicitacoes();