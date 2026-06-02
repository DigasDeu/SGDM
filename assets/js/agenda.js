const calendar =
document.getElementById("calendar");

const monthYear =
document.getElementById("monthYear");

const resumoResponsaveis =
document.getElementById("resumoResponsaveis");

let currentDate =
new Date();

let eventos =
JSON.parse(localStorage.getItem("eventos")) || [];

/* ==========================================
   LOCALSTORAGE
========================================== */

function buscarLista(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function salvarEventos() {
    localStorage.setItem("eventos", JSON.stringify(eventos));
}

/* ==========================================
   EQUIPE DE MÍDIA
========================================== */

function inicializarEquipeMidiaPadrao() {

    const funcionarios =
    buscarLista("funcionariosSistema");

    const equipePadrao = [
        "Diego",
        "Alicia",
        "Clarissa",
        "Kelson"
    ];

    let alterou = false;

    equipePadrao.forEach(nome => {

        const existe =
        funcionarios.some(funcionario =>
            funcionario.nome &&
            funcionario.nome.toLowerCase() === nome.toLowerCase() &&
            (
                funcionario.tipoAcesso === "Equipe de Mídia" ||
                funcionario.equipeMidia === true
            )
        );

        if (!existe) {

            funcionarios.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                codigoFuncionario: "",
                nome,
                email: "",
                telefone: "",
                cargos: ["Funcionário"],
                cargoPrincipal: "Funcionário",
                tipoAcesso: "Equipe de Mídia",
                statusFuncionario: "Ativo",
                equipeMidia: true,
                unidade: "Departamento de Mídia",
                tipoUnidade: "Setor Administrativo",
                cadastroFuncionarioCompleto: true,
                cadastroLocalCompleto: true,
                criadoEm: new Date().toLocaleString("pt-BR")
            });

            alterou = true;
        }
    });

    if (alterou) {
        salvarLista("funcionariosSistema", funcionarios);
    }
}

function buscarEquipeMidia() {

    const funcionarios =
    buscarLista("funcionariosSistema");

    return funcionarios.filter(funcionario =>
        (
            funcionario.tipoAcesso === "Equipe de Mídia" ||
            funcionario.equipeMidia === true
        ) &&
        funcionario.statusFuncionario !== "Inativo" &&
        funcionario.statusFuncionario !== "Bloqueado"
    );
}

function carregarResponsaveisMidia() {

    const selectResponsavel =
    document.getElementById("responsavel");

    if (!selectResponsavel) return;

    inicializarEquipeMidiaPadrao();

    const equipe =
    buscarEquipeMidia();

    selectResponsavel.innerHTML = `
        <option value="">Selecione o responsável pela cobertura</option>
    `;

    equipe.forEach(pessoa => {

        selectResponsavel.innerHTML += `
            <option
                value="${pessoa.id}"
                data-nome="${pessoa.nome || ""}"
                data-email="${pessoa.email || ""}">
                ${pessoa.nome}
            </option>
        `;
    });
}

function obterResponsavelSelecionado() {

    const selectResponsavel =
    document.getElementById("responsavel");

    if (!selectResponsavel) {
        return {
            id: "",
            nome: "",
            email: ""
        };
    }

    const option =
    selectResponsavel.options[selectResponsavel.selectedIndex];

    return {
        id: selectResponsavel.value || "",
        nome: option ? option.dataset.nome || "" : "",
        email: option ? option.dataset.email || "" : ""
    };
}

/* ==========================================
   RESUMO POR RESPONSÁVEL
========================================== */

function contarAgendamentosPorResponsavel() {

    const equipe =
    buscarEquipeMidia();

    return equipe.map(pessoa => {

        const totalAgendamentos =
        eventos.filter(evento =>
            String(evento.responsavelId || "") === String(pessoa.id || "") ||
            String(evento.responsavel || "").toLowerCase() === String(pessoa.nome || "").toLowerCase()
        ).length;

        const proximosAgendamentos =
        eventos.filter(evento => {

            const mesmoResponsavel =
            String(evento.responsavelId || "") === String(pessoa.id || "") ||
            String(evento.responsavel || "").toLowerCase() === String(pessoa.nome || "").toLowerCase();

            if (!mesmoResponsavel || !evento.data) return false;

            const hoje =
            new Date().toISOString().split("T")[0];

            return evento.data >= hoje;

        }).length;

        return {
            ...pessoa,
            totalAgendamentos,
            proximosAgendamentos
        };
    });
}

function carregarResumoResponsaveis() {

    if (!resumoResponsaveis) return;

    inicializarEquipeMidiaPadrao();

    const resumo =
    contarAgendamentosPorResponsavel();

    if (resumo.length === 0) {
        resumoResponsaveis.innerHTML =
        "<p>Nenhum responsável cadastrado.</p>";
        return;
    }

    resumoResponsaveis.innerHTML = "";

    resumo.forEach(pessoa => {

        resumoResponsaveis.innerHTML += `
            <div class="resumo-responsavel-card">

                <div class="resumo-avatar">
                    <i class="fas fa-user"></i>
                </div>

                <div class="resumo-info">
                    <strong>${pessoa.nome}</strong>

                    <span>
                        ${pessoa.totalAgendamentos} agendamento(s)
                    </span>

                    <small>
                        ${pessoa.proximosAgendamentos} próximo(s)
                    </small>
                </div>

            </div>
        `;
    });
}

/* ==========================================
   HISTÓRICO E NOTIFICAÇÕES
========================================== */

function adicionarHistoricoExclusao(item, origem) {

    const historico =
    JSON.parse(localStorage.getItem("historicoExclusoes")) || [];

    historico.unshift({
        id: Date.now(),
        origem,
        item,
        dataExclusao: new Date().toLocaleString("pt-BR")
    });

    localStorage.setItem(
        "historicoExclusoes",
        JSON.stringify(historico)
    );
}

function adicionarNotificacao(titulo, descricao) {

    const notificacoes =
    JSON.parse(localStorage.getItem("notificacoes")) || [];

    notificacoes.unshift({
        id: Date.now(),
        titulo,
        descricao,
        tipo: "Agenda",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    });

    localStorage.setItem(
        "notificacoes",
        JSON.stringify(notificacoes)
    );
}

/* ==========================================
   CALENDÁRIO
========================================== */

function renderCalendar() {

    if (!calendar || !monthYear) return;

    eventos =
    JSON.parse(localStorage.getItem("eventos")) || [];

    calendar.innerHTML = "";

    const year =
    currentDate.getFullYear();

    const month =
    currentDate.getMonth();

    const firstDay =
    new Date(year, month, 1).getDay();

    const lastDate =
    new Date(year, month + 1, 0).getDate();

    monthYear.textContent =
    currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    for (let i = 0; i < firstDay; i++) {

        const empty =
        document.createElement("div");

        calendar.appendChild(empty);
    }

    for (let day = 1; day <= lastDate; day++) {

        const cell =
        document.createElement("div");

        cell.classList.add("day");

        const dataCompleta =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const eventosDoDia =
        eventos.filter(evento => evento.data === dataCompleta);

        const possuiEvento =
        eventosDoDia.length > 0;

        cell.innerHTML = `
            <div class="day-number">${day}</div>

            ${
                possuiEvento
                ? `
                <div class="event-dot"></div>
                <small class="day-count">${eventosDoDia.length}</small>
                `
                : ""
            }
        `;

        cell.addEventListener("click", () => {
            mostrarEventos(dataCompleta);
        });

        calendar.appendChild(cell);
    }

    carregarResumoResponsaveis();
}

/* ==========================================
   EVENTOS DO DIA
========================================== */

function mostrarEventos(data) {

    const container =
    document.getElementById("eventosDia");

    if (!container) return;

    eventos =
    JSON.parse(localStorage.getItem("eventos")) || [];

    const lista =
    eventos.filter(evento => evento.data === data);

    if (lista.length === 0) {

        container.innerHTML =
        "<p>Nenhum evento nesta data.</p>";

        return;
    }

    container.innerHTML = "";

    lista.forEach(evento => {

        container.innerHTML += `
            <div class="event-card">

                <strong>${evento.titulo || "Evento sem título"}</strong>

                <p>
                    <strong>Horário:</strong>
                    ${evento.hora || "Não informado"}
                </p>

                <p>
                    <strong>Local:</strong>
                    ${evento.local || "Não informado"}
                </p>

                <p>
                    <strong>Tipo:</strong>
                    ${evento.tipo || "Evento"}
                </p>

                <p>
                    <strong>Responsável:</strong>
                    ${evento.responsavel || "Não definido"}
                </p>

                ${
                    evento.responsavelEmail
                    ? `
                    <p>
                        <strong>E-mail:</strong>
                        ${evento.responsavelEmail}
                    </p>
                    `
                    : ""
                }

                <p>
                    ${evento.descricao || "Sem descrição."}
                </p>

                <div class="card-actions">

                    <button class="delete-btn" onclick="excluirEvento(${evento.id})">
                        <i class="fas fa-trash"></i>
                        Excluir
                    </button>

                </div>

            </div>
        `;
    });
}

/* ==========================================
   EXCLUIR EVENTO
========================================== */

function excluirEvento(id) {

    const confirmar =
    confirm("Tem certeza que deseja excluir este evento da agenda?");

    if (!confirmar) return;

    const itemExcluido =
    eventos.find(evento => evento.id === id);

    eventos =
    eventos.filter(evento => evento.id !== id);

    salvarEventos();

    if (itemExcluido) {

        adicionarHistoricoExclusao(
            itemExcluido,
            "Agenda"
        );

        adicionarNotificacao(
            "Evento excluído",
            `${itemExcluido.titulo} foi removido da agenda.`
        );
    }

    renderCalendar();

    const hoje =
    new Date().toISOString().split("T")[0];

    mostrarEventos(hoje);
}

/* ==========================================
   BOTÕES DO CALENDÁRIO
========================================== */

const prevMonth =
document.getElementById("prevMonth");

const nextMonth =
document.getElementById("nextMonth");

if (prevMonth) {

    prevMonth.onclick = () => {

        currentDate.setMonth(
            currentDate.getMonth() - 1
        );

        renderCalendar();
    };
}

if (nextMonth) {

    nextMonth.onclick = () => {

        currentDate.setMonth(
            currentDate.getMonth() + 1
        );

        renderCalendar();
    };
}

/* ==========================================
   MODAL
========================================== */

const modal =
document.getElementById("modalEvento");

const novoEventoBtn =
document.getElementById("novoEventoBtn");

const cancelarBtn =
document.getElementById("cancelar");

if (novoEventoBtn) {

    novoEventoBtn.onclick = () => {

        carregarResponsaveisMidia();

        if (modal) {
            modal.style.display = "flex";
        }
    };
}

if (cancelarBtn) {

    cancelarBtn.onclick = () => {

        if (modal) {
            modal.style.display = "none";
        }
    };
}

if (modal) {

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
}

/* ==========================================
   SALVAR EVENTO MANUAL
========================================== */

const eventoForm =
document.getElementById("eventoForm");

if (eventoForm) {

    eventoForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const responsavelSelecionado =
        obterResponsavelSelecionado();

        if (!responsavelSelecionado.nome) {
            alert("Selecione o responsável pela cobertura.");
            return;
        }

        const novoEvento = {
            id: Date.now(),

            titulo:
            document.getElementById("titulo").value.trim(),

            tipo:
            document.getElementById("tipo").value,

            data:
            document.getElementById("data").value,

            hora:
            document.getElementById("hora").value,

            local:
            document.getElementById("local").value.trim(),

            responsavel:
            responsavelSelecionado.nome,

            responsavelId:
            responsavelSelecionado.id,

            responsavelEmail:
            responsavelSelecionado.email,

            descricao:
            document.getElementById("descricao").value.trim(),

            origem:
            "Agenda",

            status:
            "Pendente",

            criadoEm:
            new Date().toLocaleString("pt-BR")
        };

        if (
            !novoEvento.titulo ||
            !novoEvento.data ||
            !novoEvento.hora ||
            !novoEvento.local
        ) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        eventos.push(novoEvento);

        salvarEventos();

        adicionarNotificacao(
            "Novo evento agendado",
            `${novoEvento.titulo} em ${novoEvento.local}, no dia ${novoEvento.data} às ${novoEvento.hora}. Responsável: ${novoEvento.responsavel}.`
        );

        renderCalendar();

        mostrarEventos(novoEvento.data);

        carregarResumoResponsaveis();

        if (modal) {
            modal.style.display = "none";
        }

        this.reset();

        carregarResponsaveisMidia();
    });
}

/* ==========================================
   GLOBAIS E INICIALIZAÇÃO
========================================== */

window.excluirEvento =
excluirEvento;

document.addEventListener("DOMContentLoaded", () => {

    inicializarEquipeMidiaPadrao();

    carregarResponsaveisMidia();

    renderCalendar();

    const hoje =
    new Date().toISOString().split("T")[0];

    mostrarEventos(hoje);

    carregarResumoResponsaveis();
});