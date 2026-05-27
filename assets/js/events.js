function carregarEventos(){

    const eventos =
    JSON.parse(
    localStorage.getItem("eventos")
    ) || [];

    const lista =
    document.getElementById(
    "listaEventos"
    );

    if(eventos.length === 0){

        return;
    }

    lista.innerHTML = "";

    eventos.slice(0,5).forEach(evento=>{

        lista.innerHTML +=

        `
        <div class="event-item">

            <strong>${evento.titulo}</strong>

            <span>
            ${evento.data} • ${evento.hora}
            </span>

            <p>${evento.local}</p>

        </div>
        `;
    });
}