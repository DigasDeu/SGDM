function carregarAtividades(){

    const container =
    document.getElementById(
    "atividadesRecentes"
    );

    container.innerHTML =

    `
    <div class="event-item">

        <strong>Painel carregado</strong>

        <p>
        Sistema iniciado com sucesso.
        </p>

    </div>
    `;
}

function carregarDemandasHoje(){

    const eventos =
    JSON.parse(
    localStorage.getItem("eventos")
    ) || [];

    const container =
    document.getElementById(
    "demandasHoje"
    );

    if(eventos.length === 0){

        return;
    }

    container.innerHTML = "";

    eventos.forEach(evento=>{

        container.innerHTML +=

        `
        <div class="event-item">

            <strong>${evento.titulo}</strong>

            <span>${evento.data}</span>

            <p>${evento.local}</p>

        </div>
        `;
    });
}