const modal =
document.getElementById(
"modalPublicacao"
);

const abrirModal =
document.getElementById(
"abrirModal"
);

const fecharModal =
document.getElementById(
"fecharModal"
);

const salvarPublicacao =
document.getElementById(
"salvarPublicacao"
);

const listaPublicacoes =
document.getElementById(
"listaPublicacoes"
);

const pesquisa =
document.getElementById(
"pesquisaPublicacao"
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

salvarPublicacao.onclick = ()=>{

    const titulo =
    document.getElementById(
    "titulo"
    ).value;

    const descricao =
    document.getElementById(
    "descricao"
    ).value;

    const tipo =
    document.getElementById(
    "tipo"
    ).value;

    const plataforma =
    document.getElementById(
    "plataforma"
    ).value;

    const data =
    document.getElementById(
    "data"
    ).value;

    const hora =
    document.getElementById(
    "hora"
    ).value;

    const status =
    document.getElementById(
    "status"
    ).value;

    if(!titulo){

        alert(
        "Preencha o título."
        );

        return;
    }

    const publicacoes =
    JSON.parse(
        localStorage.getItem(
        "publicacoes"
        )
    ) || [];

    publicacoes.push({

        titulo,
        descricao,
        tipo,
        plataforma,
        data,
        hora,
        status

    });

    localStorage.setItem(
    "publicacoes",
    JSON.stringify(
    publicacoes
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
        "Nova Publicação",

        descricao:
        `${titulo} • ${plataforma}`

    });

    localStorage.setItem(
    "notificacoes",
    JSON.stringify(
    notificacoes
    )
    );

    carregarPublicacoes();

    modal.style.display = "none";
};

//
// LISTAR
//

function carregarPublicacoes(){

    const publicacoes =
    JSON.parse(
        localStorage.getItem(
        "publicacoes"
        )
    ) || [];

    listaPublicacoes.innerHTML = "";

    let filtradas =
    publicacoes.filter(item=>{

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

        listaPublicacoes.innerHTML =

        `
        <p>
        Nenhuma publicação encontrada.
        </p>
        `;

        return;
    }

    filtradas.reverse()
    .forEach(item=>{

        let statusClass = "";

        if(item.status === "Agendado"){

            statusClass = "agendado";
        }

        if(item.status === "Publicado"){

            statusClass = "publicado";
        }

        if(item.status === "Rascunho"){

            statusClass = "rascunho";
        }

        listaPublicacoes.innerHTML +=

        `
        <div class="publicacao-card">

            <h3>
            ${item.titulo}
            </h3>

            <div class="publicacao-info">

                <p>

                <strong>Tipo:</strong>

                ${item.tipo}

                </p>

                <p>

                <strong>Plataforma:</strong>

                ${item.plataforma}

                </p>

                <p>

                <strong>Data:</strong>

                ${item.data}

                </p>

                <p>

                <strong>Hora:</strong>

                ${item.hora}

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
carregarPublicacoes
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

        carregarPublicacoes();
    });
});

//
// INICIAR
//

carregarPublicacoes();