//
// ELEMENTOS
//

const notificationBtn =
document.getElementById(
"notificationBtn"
);

const notificationDropdown =
document.getElementById(
"notificationDropdown"
);

const notificationList =
document.getElementById(
"notificationList"
);

const notificationCount =
document.getElementById(
"notificationCount"
);

//
// ABRIR / FECHAR
//

notificationBtn.addEventListener(
"click",
()=>{

    notificationDropdown
    .classList
    .toggle("active");
});

//
// CARREGAR NOTIFICAÇÕES
//

function carregarNotificacoes(){

    const eventos =
    JSON.parse(
        localStorage.getItem(
        "eventos"
        )
    ) || [];

    const solicitacoes =
    JSON.parse(
        localStorage.getItem(
        "solicitacoes"
        )
    ) || [];

    let notificacoes = [];

    //
    // EVENTOS
    //

    eventos.forEach(evento=>{

        notificacoes.push({

            titulo:
            "Novo Evento Agendado",

            descricao:
            `${evento.titulo}
            - ${evento.data}`

        });
    });

    //
    // SOLICITAÇÕES
    //

    solicitacoes.forEach(item=>{

        if(item.status ===
        "Pendente"){

            notificacoes.push({

                titulo:
                "Solicitação Pendente",

                descricao:
                item.titulo
            });
        }
    });

    //
    // CONTADOR
    //

    notificationCount
    .textContent =
    notificacoes.length;

    //
    // SEM NOTIFICAÇÕES
    //

    if(notificacoes.length === 0){

        notificationList.innerHTML =

        `
        <p class="empty-notification">

        Nenhuma notificação.

        </p>
        `;

        return;
    }

    //
    // LISTAR
    //

    notificationList.innerHTML = "";

    notificacoes.reverse()
    .forEach(notificacao=>{

        notificationList.innerHTML +=

        `
        <div class="notification-item">

            <strong>
            ${notificacao.titulo}
            </strong>

            <p>
            ${notificacao.descricao}
            </p>

        </div>
        `;
    });
}

//
// FECHAR AO CLICAR FORA
//

document.addEventListener(
"click",
(event)=>{

    if(

    !notificationBtn.contains(
    event.target
    )

    &&

    !notificationDropdown.contains(
    event.target
    )

    ){

        notificationDropdown
        .classList
        .remove("active");
    }
});

//
// INICIAR
//

document.addEventListener(
"DOMContentLoaded",
carregarNotificacoes
);