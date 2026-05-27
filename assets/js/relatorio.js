const eventos =
JSON.parse(
localStorage.getItem("eventos")
) || [];

if(eventos.length > 0){

    const evento =
    eventos[eventos.length - 1];

    document.getElementById(
        "relTitulo"
    ).textContent =
    evento.titulo;

    document.getElementById(
        "relData"
    ).textContent =
    evento.data;

    document.getElementById(
        "relHora"
    ).textContent =
    evento.hora;

    document.getElementById(
        "relLocal"
    ).textContent =
    evento.local;

    document.getElementById(
        "textoRelatorio"
    ).innerHTML =

    `
    No dia <strong>${evento.data}</strong>,
    às <strong>${evento.hora}</strong>,
    no local <strong>${evento.local}</strong>,
    foi realizada a cobertura institucional da atividade
    <strong>${evento.titulo}</strong>,
    promovida pela Secretaria Municipal de Saúde.

    A equipe do Departamento de Mídia acompanhou
    integralmente as ações desenvolvidas, efetuando
    registros fotográficos, audiovisuais e produção
    de conteúdo institucional para divulgação nos
    canais oficiais da Prefeitura e da Secretaria de Saúde.
    `;
}
else{

    document.getElementById(
        "textoRelatorio"
    ).innerHTML =

    "Nenhuma atividade cadastrada na agenda.";
}