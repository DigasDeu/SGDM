import {
    adicionarDocumento,
    excluirDocumento,
    observarColecao
} from "./db.js";

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

let funcionariosOnline = [];

/* ==========================================
   LOCALSTORAGE
========================================== */

function buscarLista(chave) {
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function buscarUsuarioLogado() {
    return JSON.parse(localStorage.getItem("usuarioLogado")) || {};
}

function salvarEventos() {
    localStorage.setItem("eventos", JSON.stringify(eventos));
}

/* ==========================================
   FIRESTORE - TEMPO REAL
========================================== */

function iniciarEscutaEventosFirestore() {

    try {

        observarColecao("eventos", (dados) => {

            eventos = dados;

            salvarLista("eventos", dados);

            renderCalendar();

            const hoje =
            new Date().toISOString().split("T")[0];

            mostrarEventos(hoje);

            carregarResumoResponsaveis();
        });

    } catch (error) {

        console.log("Erro ao observar eventos no Firestore:", error);
    }
}

function iniciarEscutaFuncionariosFirestore() {

    try {

        observarColecao("funcionariosSistema", (dados) => {

            funcionariosOnline = dados;

            salvarLista("funcionariosSistema", dados);

            carregarResponsaveisMidia();

            carregarResumoResponsaveis();
        });

    } catch (error) {

        console.log("Erro ao observar funcionários no Firestore:", error);
    }
}

/* ==========================================
   EQUIPE DE MÍDIA - SOMENTE CADASTRADOS
========================================== */

function removerDuplicadosEquipe(equipe) {

    const equipeFinal = [];

    equipe.forEach(pessoa => {

        const emailPessoa =
        String(pessoa.email || "").toLowerCase();

        const codigoPessoa =
        String(pessoa.codigoFuncionario || "").toLowerCase();

        const nomePessoa =
        String(pessoa.nome || "").toLowerCase();

        const jaExiste =
        equipeFinal.some(item => {

            const emailItem =
            String(item.email || "").toLowerCase();

            const codigoItem =
            String(item.codigoFuncionario || "").toLowerCase();

            const nomeItem =
            String(item.nome || "").toLowerCase();

            return (
                (
                    emailPessoa &&
                    emailItem &&
                    emailPessoa === emailItem
                ) ||
                (
                    codigoPessoa &&
                    codigoItem &&
                    codigoPessoa === codigoItem
                ) ||
                (
                    nomePessoa &&
                    nomeItem &&
                    nomePessoa === nomeItem
                )
            );
        });

        if (!jaExiste) {
            equipeFinal.push(pessoa);
        }
    });

    return equipeFinal;
}

function buscarEquipeMidia() {

    const funcionarios =
    funcionariosOnline.length > 0
    ? funcionariosOnline
    : buscarLista("funcionariosSistema");

    const usuarioLogado =
    buscarUsuarioLogado();

    let equipe =
    funcionarios.filter(funcionario =>
        funcionario.cadastroFuncionarioCompleto === true &&
        (
            funcionario.tipoAcesso === "Equipe de Mídia" ||
            funcionario.equipeMidia === true
        ) &&
        funcionario.statusFuncionario !== "Inativo" &&
        funcionario.statusFuncionario !== "Bloqueado"
    );

    if (
        usuarioLogado &&
        usuarioLogado.cadastroFuncionarioCompleto === true &&
        (
            usuarioLogado.tipoAcesso === "Equipe de Mídia" ||
            usuarioLogado.equipeMidia === true
        )
    ) {
        const existeUsuario =
        equipe.some(pessoa =>
            pessoa.email &&
            usuarioLogado.email &&
            pessoa.email.toLowerCase() === usuarioLogado.email.toLowerCase()
        );

        if (!existeUsuario) {
            equipe.push({
                id: usuarioLogado.uid || Date.now(),
                uid: usuarioLogado.uid || "",
                codigoFuncionario: usuarioLogado.codigoFuncionario || "",
                nome: usuarioLogado.nome || "Usuário da Mídia",
                email: usuarioLogado.email || "",
                telefone: usuarioLogado.telefone || "",
                cargos: usuarioLogado.cargos || [],
                cargoPrincipal: usuarioLogado.cargoPrincipal || "",
                tipoAcesso: "Equipe de Mídia",
                statusFuncionario: usuarioLogado.statusFuncionario || "Ativo",
                equipeMidia: true,
                unidade: "Departamento de Mídia",
                tipoUnidade: "Setor Administrativo",
                cadastroFuncionarioCompleto: true,
                cadastroLocalCompleto: true
            });
        }
    }

    return removerDuplicadosEquipe(equipe);
}

function carregarResponsaveisMidia() {

    const selectResponsavel =
    document.getElementById("responsavel");

    if (!selectResponsavel) return;

    const equipe =
    buscarEquipeMidia();

    selectResponsavel.innerHTML = `
        <option value="">Selecione o responsável pela cobertura</option>
    `;

    if (equipe.length === 0) {
        selectResponsavel.innerHTML += `
            <option value="" disabled>
                Nenhuma pessoa da mídia cadastrada
            </option>
        `;
        return;
    }

    equipe.forEach(pessoa => {

        const idPessoa =
        pessoa.idFirebase ||
        pessoa.id ||
        pessoa.uid ||
        pessoa.email ||
        "";

        selectResponsavel.innerHTML += `
            <option
                value="${idPessoa}"
                data-nome="${pessoa.nome || ""}"
                data-email="${pessoa.email || ""}">
                ${pessoa.nome || "Sem nome"}
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

function mesmoResponsavel(evento, pessoa) {

    const pessoaId =
    String(
        pessoa.idFirebase ||
        pessoa.id ||
        pessoa.uid ||
        pessoa.email ||
        ""
    );

    const pessoaEmail =
    String(pessoa.email || "").toLowerCase();

    const pessoaNome =
    String(pessoa.nome || "").toLowerCase();

    const eventoResponsavelId =
    String(evento.responsavelId || "");

    const eventoResponsavelEmail =
    String(evento.responsavelEmail || "").toLowerCase();

    const eventoResponsavelNome =
    String(evento.responsavel || "").toLowerCase();

    return (
        (
            pessoaId &&
            eventoResponsavelId &&
            pessoaId === eventoResponsavelId
        ) ||
        (
            pessoaEmail &&
            eventoResponsavelEmail &&
            pessoaEmail === eventoResponsavelEmail
        ) ||
        (
            pessoaNome &&
            eventoResponsavelNome &&
            pessoaNome === eventoResponsavelNome
        )
    );
}

function contarAgendamentosPorResponsavel() {

    const equipe =
    buscarEquipeMidia();

    return equipe.map(pessoa => {

        const totalAgendamentos =
        eventos.filter(evento =>
            mesmoResponsavel(evento, pessoa)
        ).length;

        const hoje =
        new Date().toISOString().split("T")[0];

        const proximosAgendamentos =
        eventos.filter(evento =>
            mesmoResponsavel(evento, pessoa) &&
            evento.data &&
            evento.data >= hoje
        ).length;

        return {
            ...pessoa,
            totalAgendamentos,
            proximosAgendamentos
        };
    });
}

function carregarResumoResponsaveis() {

    if (!resumoResponsaveis) return;

    const resumo =
    contarAgendamentosPorResponsavel();

    if (resumo.length === 0) {
        resumoResponsaveis.innerHTML =
        "<p>Nenhuma pessoa da mídia cadastrada.</p>";
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
                    <strong>${pessoa.nome || "Sem nome"}</strong>

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
    buscarLista("historicoExclusoes");

    historico.unshift({
        id: Date.now(),
        origem,
        item,
        dataExclusao: new Date().toLocaleString("pt-BR")
    });

    salvarLista("historicoExclusoes", historico);
}

function adicionarNotificacao(titulo, descricao) {

    const notificacoes =
    buscarLista("notificacoes");

    const novaNotificacao = {
        id: Date.now(),
        titulo,
        descricao,
        tipo: "Agenda",
        data: new Date().toLocaleString("pt-BR"),
        lida: false
    };

    notificacoes.unshift(novaNotificacao);

    salvarLista("notificacoes", notificacoes);

    adicionarDocumento("notificacoes", novaNotificacao)
    .catch(error => {
        console.log("Erro ao salvar notificação no Firestore:", error);
    });
}

/* ==========================================
   CALENDÁRIO
========================================== */

function renderCalendar() {

    if (!calendar || !monthYear) return;

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

    const lista =
    eventos.filter(evento => evento.data === data);

    if (lista.length === 0) {

        container.innerHTML =
        "<p>Nenhum evento nesta data.</p>";

        return;
    }

    container.innerHTML = "";

    lista.forEach(evento => {

        const idAcao =
        evento.idFirebase || evento.id;

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

                    <button class="delete-btn" onclick="excluirEvento('${idAcao}')">
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

async function excluirEvento(id) {

    const confirmar =
    confirm("Tem certeza que deseja excluir este evento da agenda?");

    if (!confirmar) return;

    const itemExcluido =
    eventos.find(evento =>
        String(evento.id) === String(id) ||
        String(evento.idFirebase) === String(id)
    );

    if (!itemExcluido) {
        alert("Evento não encontrado.");
        return;
    }

    eventos =
    eventos.filter(evento =>
        String(evento.id) !== String(id) &&
        String(evento.idFirebase) !== String(id)
    );

    salvarEventos();

    if (itemExcluido.idFirebase) {
        try {
            await excluirDocumento(
                "eventos",
                itemExcluido.idFirebase
            );
        }
        catch (error) {
            console.log("Erro ao excluir evento no Firestore:", error);
        }
    }

    adicionarHistoricoExclusao(
        itemExcluido,
        "Agenda"
    );

    adicionarNotificacao(
        "Evento excluído",
        `${itemExcluido.titulo} foi removido da agenda.`
    );

    renderCalendar();

    const hoje =
    new Date().toISOString().split("T")[0];

    mostrarEventos(hoje);

    carregarResumoResponsaveis();
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

    eventoForm.addEventListener("submit", async function (event) {

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

        try {

            const idFirebase =
            await adicionarDocumento(
                "eventos",
                novoEvento
            );

            novoEvento.idFirebase =
            idFirebase;

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

            alert("Evento salvo no banco de dados com sucesso.");

        } catch (error) {

            console.log("Erro ao salvar evento no Firestore:", error);

            alert("Erro ao salvar evento no banco de dados. Verifique as regras do Firestore.");
        }
    });
}

/* ==========================================
   GLOBAIS E INICIALIZAÇÃO
========================================== */

window.excluirEvento =
excluirEvento;

document.addEventListener("DOMContentLoaded", () => {

    carregarResponsaveisMidia();

    renderCalendar();

    const hoje =
    new Date().toISOString().split("T")[0];

    mostrarEventos(hoje);

    carregarResumoResponsaveis();

    iniciarEscutaFuncionariosFirestore();

    iniciarEscutaEventosFirestore();
});