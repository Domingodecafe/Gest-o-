const STORAGE_KEY = "lado-a-socios-v2";
const centers = ["Operação", "Terapeutas", "Marketing", "Oficinas", "Administrativo", "Estrutura", "Eventos"];

const seed = {
  plans: [
    { id: "basico", name: "Básico", monthly: 680 },
    { id: "completo", name: "Completo", monthly: 980 }
  ],
  students: [
    { id: "ana", name: "Ana Luiza", birthDate: "2012-08-14", guardian: "Mariana", phone: "(11) 99911-0001", planId: "completo", status: "Ativo", notes: "Prefere horário da manhã." },
    { id: "bruno", name: "Bruno Martins", birthDate: "2011-11-03", guardian: "Paulo", phone: "(11) 99922-0002", planId: "basico", status: "Ativo", notes: "" },
    { id: "clara", name: "Clara Rocha", birthDate: "2013-04-22", guardian: "Fernanda", phone: "(11) 99933-0003", planId: "completo", status: "Ativo", notes: "" },
    { id: "davi", name: "Davi Nunes", birthDate: "1998-02-09", guardian: "Silvia", phone: "(11) 99944-0004", planId: "basico", status: "Ativo", notes: "Aguardando vaga em turma adulta." },
    { id: "elisa", name: "Elisa Prado", birthDate: "1994-07-30", guardian: "Renato", phone: "(11) 99955-0005", planId: "completo", status: "Inativo", notes: "" }
  ],
  classes: [
    { id: "turma-adolescentes-a", name: "Adolescentes A", category: "Adolescentes", weekday: "Segunda", start: "09:00", end: "10:30", therapist: "Camila", room: "Sala 1", capacity: 4, status: "Ativa" },
    { id: "turma-adultos-b", name: "Adultos B", category: "Adultos", weekday: "Quarta", start: "14:00", end: "15:30", therapist: "Renata", room: "Sala 2", capacity: 5, status: "Ativa" },
    { id: "turma-formacao", name: "Adolescentes C", category: "Adolescentes", weekday: "Sexta", start: "16:00", end: "17:30", therapist: "Camila", room: "Sala 1", capacity: 6, status: "Em formação" }
  ],
  enrollments: [
    { id: "mat-1", studentId: "ana", classId: "turma-adolescentes-a", status: "Ativa", startDate: "2026-05-01" },
    { id: "mat-2", studentId: "bruno", classId: "turma-adolescentes-a", status: "Ativa", startDate: "2026-05-01" },
    { id: "mat-3", studentId: "clara", classId: "turma-adolescentes-a", status: "Ativa", startDate: "2026-05-02" },
    { id: "mat-4", studentId: "davi", classId: "turma-adultos-b", status: "Ativa", startDate: "2026-05-06" }
  ],
  waitlist: [
    { id: "esp-1", name: "Lucas Henrique", guardian: "Patricia", phone: "(11) 98888-1001", interest: "Plano Completo", status: "Aguardando", notes: "Prefere quarta ou sexta." },
    { id: "esp-2", name: "Sofia Mendes", guardian: "Andre", phone: "(11) 97777-1002", interest: "Oficina", status: "Aguardando", notes: "" },
    { id: "esp-3", name: "Rafael Lima", guardian: "Carla", phone: "(11) 96666-1003", interest: "Plano Básico", status: "Aguardando", notes: "Interessado em adolescentes." }
  ],
  workshops: [
    { id: "of-arte", name: "Oficina de Arte", type: "Avulsa", date: "2026-06-08", weekday: "", start: "11:00", end: "12:00", therapist: "Livia", capacity: 8, participants: 5, status: "Aberta" },
    { id: "of-social", name: "Habilidades Sociais", type: "Recorrente", date: "", weekday: "Sexta", start: "17:00", end: "18:00", therapist: "Renata", capacity: 10, participants: 4, status: "Planejada" }
  ],
  finance: [
    { id: "fin-1", type: "Mensalidade", description: "Ana Luiza", amount: 980, date: "2026-05-05", status: "Pago", center: "Operação", relatedType: "Aluno", relatedId: "ana" },
    { id: "fin-2", type: "Mensalidade", description: "Bruno Martins", amount: 680, date: "2026-05-05", status: "Atrasado", center: "Operação", relatedType: "Aluno", relatedId: "bruno" },
    { id: "fin-3", type: "Mensalidade", description: "Clara Rocha", amount: 980, date: "2026-05-05", status: "Pago", center: "Operação", relatedType: "Aluno", relatedId: "clara" },
    { id: "fin-4", type: "Receita", description: "Oficina de Arte", amount: 640, date: "2026-05-18", status: "Pago", center: "Oficinas", relatedType: "Oficina", relatedId: "of-arte" },
    { id: "fin-5", type: "Despesa", description: "Repasse Livia", amount: 2200, date: "2026-05-28", status: "Pago", center: "Terapeutas", relatedType: "Terapeuta", relatedId: "Livia" },
    { id: "fin-6", type: "Despesa", description: "Aluguel da unidade", amount: 1800, date: "2026-05-10", status: "Pago", center: "Estrutura", relatedType: "Geral", relatedId: "" }
  ]
};

let state = loadState();
syncMissingStudentTuitions();
let activeView = "painel";
let drawerContext = null;

const viewEl = document.querySelector("#view");
const titleEl = document.querySelector("#pageTitle");
const summaryEl = document.querySelector("#summary");
const toastEl = document.querySelector("#toast");
const drawerEl = document.querySelector("#drawer");
const drawerBackdrop = document.querySelector("#drawerBackdrop");

document.querySelectorAll(".nav-list button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

const resetDemoButton = document.querySelector("#resetDemo");
if (resetDemoButton) {
  resetDemoButton.addEventListener("click", () => {
    state = structuredClone(seed);
    saveState();
    closeDrawer();
    notify("Exemplo reiniciado.");
    render();
  });
}

drawerBackdrop.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

render();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return normalizeState(saved ? { ...structuredClone(seed), ...JSON.parse(saved) } : structuredClone(seed));
  } catch {
    return normalizeState(structuredClone(seed));
  }
}

function normalizeState(data) {
  const normalized = normalizeStrings(structuredClone(data));
  normalized.plans = normalized.plans.map((plan) => ({ ...plan, name: displayText(plan.name) }));
  normalized.classes = normalized.classes.map((item) => ({
    ...item,
    weekday: displayText(item.weekday),
    status: displayText(item.status)
  }));
  normalized.waitlist = normalized.waitlist.map((item) => ({
    ...item,
    interest: displayText(item.interest),
    status: displayText(item.status)
  }));
  normalized.workshops = normalized.workshops.map((item) => ({
    ...item,
    weekday: displayText(item.weekday),
    status: displayText(item.status)
  }));
  normalized.finance = normalized.finance.map((item) => ({
    ...item,
    description: cleanFinanceDescription(item.description),
    competence: item.type === "Mensalidade" ? (item.competence || monthKey(item.date || today())) : item.competence,
    center: displayText(item.center),
    status: displayText(item.status),
    ...normalizeFinanceRelation(item)
  }));
  return normalized;
}

function normalizeStrings(value) {
  if (Array.isArray(value)) return value.map(normalizeStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeStrings(item)]));
  }
  if (typeof value === "string") return repairText(value);
  return value;
}

function repairText(value) {
  const replacements = [
    ["B\ufffdsico", "Básico"], ["B?sico", "Básico"], ["Plano B\ufffdsico", "Plano Básico"], ["Plano B?sico", "Plano Básico"],
    ["Opera\ufffd\ufffdo", "Operação"], ["Opera??o", "Operação"], ["forma\ufffd\ufffdo", "formação"], ["forma??o", "formação"],
    ["Gest\ufffdo", "Gestão"], ["s\ufffdcios", "sócios"], ["S\ufffdcio", "Sócio"], ["s\ufffdcio", "sócio"],
    ["Navega\ufffd\ufffdo", "Navegação"], ["n\ufffdo", "não"], ["N\ufffdo", "Não"],
    ["Ot\ufffdvio", "Otávio"], ["Ter\ufffda", "Terça"], ["hor\ufffdrio", "horário"], ["manh\ufffd", "manhã"],
    ["A\ufffd\ufffdo", "Ação"], ["A??o", "Ação"], ["a\ufffd\ufffdo", "ação"], ["a??o", "ação"],
    ["Valida\ufffd\ufffdo", "Validação"], ["Valida??o", "Validação"],
    ["contrata\ufffd\ufffdo", "contratação"], ["contrata??o", "contratação"],
    ["Observa\ufffd\ufffdes", "Observações"], ["Observa??es", "Observações"],
    ["\u00c3\u0192\u00c2\u00a7", "ç"], ["\u00c3\u0192\u00c2\u00a3", "ã"], ["\u00c3\u0192\u00c2\u00a1", "á"],
    ["\u00c3\u0192\u00c2\u00a9", "é"], ["\u00c3\u0192\u00c2\u00aa", "ê"], ["\u00c3\u0192\u00c2\u00ad", "í"],
    ["\u00c3\u0192\u00c2\u00b3", "ó"], ["\u00c3\u0192\u00c2\u00ba", "ú"], ["\u00c3\u0192\u00c2\u00a0", "à"],
    ["\u00c3\u00a7", "ç"], ["\u00c3\u00a3", "ã"], ["\u00c3\u00a1", "á"], ["\u00c3\u00a9", "é"],
    ["\u00c3\u00aa", "ê"], ["\u00c3\u00ad", "í"], ["\u00c3\u00b3", "ó"], ["\u00c3\u00ba", "ú"],
    ["\u00c3\u00a0", "à"], ["\u00c3\u00a2", "â"], ["\u00c3\u00b4", "ô"], ["\u00c3\u00b5", "õ"],
    ["\u00c2", ""]
  ];
  return replacements.reduce((text, [from, to]) => text.replaceAll(from, to), value);
}

function normalizeFinanceRelation(item) {
  if (displayText(item.center) === "Terapeutas" && item.type === "Despesa" && (!item.relatedId || item.relatedType === "Geral")) {
    return { relatedType: "Terapeuta", relatedId: "Livia", description: item.description === "Repasse terapeutas" ? "Repasse Livia" : item.description };
  }
  return {};
}

function cleanFinanceDescription(description) {
  return String(description || "").replace(/\s+-\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)$/i, "");
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setView(viewName) {
  activeView = viewName;
  document.querySelectorAll(".nav-list button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });
  render();
}

function render() {
  renderSummary();
  if (activeView === "painel") renderDashboard();
  if (activeView === "turmas") renderClasses();
  if (activeView === "alunos") renderStudents();
  if (activeView === "espera") renderWaitlist();
  if (activeView === "oficinas") renderWorkshops();
  if (activeView === "financeiro") renderFinance();
  bindActions();
}

function metrics() {
  const activeStudents = state.students.filter((student) => student.status === "Ativo");
  const activeClasses = state.classes.filter((item) => item.status === "Ativa");
  const activeEnrollments = state.enrollments.filter((item) => item.status === "Ativa" && activeClasses.some((group) => group.id === item.classId) && activeStudents.some((student) => student.id === item.studentId));
  const totalSlots = activeClasses.reduce((sum, item) => sum + Number(item.capacity || 0), 0);
  const occupiedSlots = activeEnrollments.length;
  const freeSlots = Math.max(totalSlots - occupiedSlots, 0);
  const occupancyRate = totalSlots ? (occupiedSlots / totalSlots) * 100 : 0;
  const waiting = state.waitlist.filter((item) => item.status === "Aguardando").length;
  const overdue = currentTuitionRows().filter((item) => ["Pendente", "Atrasado"].includes(item.status)).length;
  const revenue = state.finance.filter((item) => item.type !== "Despesa" && item.status === "Pago").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenses = state.finance.filter((item) => item.type === "Despesa" && item.status !== "Cancelado").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return { activeStudents: activeStudents.length, totalSlots, occupiedSlots, freeSlots, occupancyRate, waiting, overdue, revenue, expenses, profit: revenue - expenses };
}

function renderSummary() {
  const data = metrics();
  if (activeView === "oficinas") {
    renderWorkshopSummary(data);
    return;
  }
  const cards = [
    ["Alunos ativos", data.activeStudents, "alunos"],
    ["Vagas livres", data.freeSlots, "turmas"],
    ["Ocupação", `${data.occupancyRate.toFixed(0)}%`, "turmas"],
    ["Fila de espera", data.waiting, "espera"]
  ];
  summaryEl.innerHTML = cards.map(([label, value, target]) => `<button class="summary-card" data-go="${target}"><span>${label}</span><strong>${value}</strong></button>`).join("");
}

function renderWorkshopSummary(data) {
  const workshopCapacity = state.workshops
    .filter((item) => item.status !== "Cancelada")
    .reduce((sum, item) => sum + Number(item.capacity || 0), 0);
  const workshopParticipants = state.workshops
    .filter((item) => item.status !== "Cancelada")
    .reduce((sum, item) => sum + Number(item.participants || 0), 0);
  const workshopFreeSlots = Math.max(workshopCapacity - workshopParticipants, 0);
  const workshopOccupancy = workshopCapacity ? (workshopParticipants / workshopCapacity) * 100 : 0;
  const cards = [
    ["Inscritos em oficinas", workshopParticipants, "oficinas"],
    ["Vagas livres", workshopFreeSlots, "oficinas"],
    ["Ocupação", `${workshopOccupancy.toFixed(0)}%`, "oficinas"],
    ["Fila de espera", data.waiting, "espera"]
  ];
  summaryEl.innerHTML = cards.map(([label, value, target]) => `<button class="summary-card" data-go="${target}"><span>${label}</span><strong>${value}</strong></button>`).join("");
}

function renderDashboard() {
  titleEl.textContent = "Painel";
  viewEl.innerHTML = `
    <section class="panel">
        <div class="section-head">
          <div>
            <h2>Operação da unidade</h2>
            <p>Resumo para decisões dos sócios, sem rotina de recepção ou chamada.</p>
          </div>
          <button class="primary-button" data-open="class:new">Nova turma</button>
        </div>
        <div class="records-grid">
          ${decisionCards().join("")}
        </div>
      </section>
  `;
}

function decisionCards() {
  const rows = [];
  state.classes.filter((item) => item.status === "Ativa").forEach((group) => {
    const occupancy = classOccupancy(group);
    if (occupancy.free === 0) rows.push(["red", `${group.name} está cheia`, "Ver interessados da fila antes de abrir novas matrículas.", "turmas"]);
    if (occupancy.rate < 45) rows.push(["yellow", `${group.name} com baixa ocupação`, "Revisar lista de espera compatível ou divulgar a turma.", "turmas"]);
  });
  if (metrics().waiting > 0 && metrics().freeSlots > 0) rows.push(["green", "Há fila e vagas livres", "Cruzar interessados com turmas disponíveis.", "espera"]);
  if (metrics().overdue > 0) rows.push(["yellow", "Mensalidades pendentes", "Revisar financeiro antes do fechamento do mês.", "financeiro"]);
  if (!rows.length) rows.push(["green", "Operação sem alertas críticos", "Ocupação e financeiro estão organizados no exemplo atual.", "painel"]);
  return rows.map(([tone, title, text, target]) => `
    <article class="decision-card">
      <header>
        <div>
          <h3>${title}</h3>
          <p class="subtle">${text}</p>
        </div>
        <span class="tag ${tone}">${tone === "red" ? "Crítico" : tone === "yellow" ? "Atenção" : "Ok"}</span>
      </header>
      <button class="soft-button" data-go="${target}">Abrir área</button>
    </article>
  `);
}

function renderClasses() {
  titleEl.textContent = "Turmas e Vagas";
  viewEl.innerHTML = `
    <section class="panel">
      <div class="section-head">
        <div>
          <h2>Turmas semanais</h2>
          <p>Controle de capacidade, matrículas e vagas disponíveis.</p>
        </div>
        <button class="primary-button" data-open="class:new">Nova turma</button>
      </div>
      <div class="records-grid">
        ${state.classes.map(classCard).join("")}
      </div>
    </section>
  `;
}

function classCard(group) {
  const occupancy = classOccupancy(group);
  const students = enrollmentsForClass(group.id).map((item) => studentById(item.studentId)).filter(Boolean);
  const compatible = compatibleWaitlist(group).slice(0, 3);
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>${group.name}</h3>
          <p class="subtle">${group.category} | ${group.weekday}, ${group.start}-${group.end} | ${group.therapist} | ${group.room}</p>
        </div>
        ${statusPill(group.status)}
      </header>
      <div class="inline-list">
        <span class="tag ${occupancy.free > 0 ? "green" : "red"}">${occupancy.free} vagas</span>
        <span class="tag blue">${occupancy.occupied}/${group.capacity} alunos</span>
        <span class="tag">${occupancy.rate.toFixed(0)}% ocupada</span>
      </div>
      <ul class="mini-list">
        <li>Matriculados: ${students.map((student) => student.name).join(", ") || "Nenhum aluno"}</li>
        <li>Fila compatível: ${compatible.map((item) => item.name).join(", ") || "Sem interessados compatíveis"}</li>
      </ul>
      <div class="card-actions">
        <button class="soft-button" data-open="class:${group.id}">Ver/Editar</button>
        <button class="danger-button" data-delete-record="class:${group.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderStudents() {
  titleEl.textContent = "Alunos";
  viewEl.innerHTML = `
    <section class="panel">
      <div class="section-head">
        <div>
          <h2>Alunos e matrículas</h2>
          <p>Cadastro, plano, status financeiro e vinculos com turmas.</p>
        </div>
        <button class="primary-button" data-open="student:new">Novo aluno</button>
      </div>
      <div class="records-grid">
        ${state.students.map(studentCard).join("")}
      </div>
    </section>
  `;
}

function studentCard(student) {
  const plan = planById(student.planId);
  const studentEnrollments = state.enrollments.filter((item) => item.studentId === student.id && item.status === "Ativa");
  const classes = studentEnrollments.map((item) => classById(item.classId)).filter(Boolean);
  const tuition = latestTuitionFor(student.id);
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>${student.name}</h3>
          <p class="subtle">${student.guardian} | ${student.phone}</p>
        </div>
        ${statusPill(student.status)}
      </header>
      <div class="inline-list">
        <span class="tag blue">Plano ${plan.name}</span>
        ${financePill(tuition ? tuition.status : "Sem mensalidade")}
      </div>
      <ul class="mini-list">
        <li>Idade: ${ageLabel(student.birthDate)}</li>
        <li>Plano contratado: ${plan.name}</li>
        <li>Turmas: ${classes.map((item) => item.name).join(", ") || "Sem turma ativa"}</li>
        <li>Observações: ${student.notes || "Sem observações"}</li>
      </ul>
      <div class="card-actions">
        <button class="soft-button" data-open="student:${student.id}">Ver/Editar</button>
        <button class="danger-button" data-delete-record="student:${student.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderWaitlist() {
  titleEl.textContent = "Lista de Espera";
  viewEl.innerHTML = `
    <section class="panel">
      <div class="section-head">
        <div>
          <h2>Interessados</h2>
          <p>Fila usada pelos sócios para ocupar vagas disponíveis.</p>
        </div>
        <button class="primary-button" data-open="wait:new">Novo interessado</button>
      </div>
      <div class="records-grid">
        ${state.waitlist.map(waitCard).join("")}
      </div>
    </section>
  `;
}

function waitCard(item) {
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>${item.name}</h3>
          <p class="subtle">${item.guardian} | ${item.phone}</p>
        </div>
        ${statusPill(item.status)}
      </header>
      <ul class="mini-list">
        <li>Interesse: ${item.interest}</li>
        <li>Observações: ${item.notes || "Sem observações"}</li>
      </ul>
      <div class="card-actions">
        <button class="soft-button" data-open="wait:${item.id}">Ver/Editar</button>
        <button class="soft-button" data-convert="${item.id}" ${item.status !== "Aguardando" ? "disabled" : ""}>Converter em aluno</button>
        <button class="danger-button" data-delete-record="wait:${item.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderWorkshops() {
  titleEl.textContent = "Oficinas";
  viewEl.innerHTML = `
    <section class="panel">
      <div class="section-head">
        <div>
          <h2>Oficinas</h2>
          <p>Atividades recorrentes ou avulsas, separadas das turmas.</p>
        </div>
        <button class="primary-button" data-open="workshop:new">Nova oficina</button>
      </div>
      <div class="records-grid">
        ${state.workshops.map(workshopCard).join("")}
      </div>
    </section>
  `;
}

function workshopCard(item) {
  const free = Math.max(Number(item.capacity || 0) - Number(item.participants || 0), 0);
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>${item.name}</h3>
          <p class="subtle">${item.type} | ${item.weekday || item.date || "Sem data"} | ${item.start}-${item.end} | ${item.therapist}</p>
        </div>
        ${statusPill(item.status)}
      </header>
      <div class="inline-list">
        <span class="tag ${free > 0 ? "green" : "red"}">${free} vagas</span>
        <span class="tag blue">${item.participants}/${item.capacity} inscritos</span>
      </div>
      <div class="card-actions">
        <button class="soft-button" data-open="workshop:${item.id}">Ver/Editar</button>
        <button class="danger-button" data-delete-record="workshop:${item.id}">Excluir</button>
      </div>
    </article>
  `;
}

function renderFinance() {
  titleEl.textContent = "Financeiro";
  viewEl.innerHTML = `
    <div class="screen-grid">
      <section class="panel">
        <div class="section-head">
          <div>
            <h2>Financeiro por área</h2>
            <p>Mensalidades, repasses e custos separados para leitura rápida.</p>
          </div>
          <div class="row-actions">
            <button class="primary-button" data-open="student:new">Novo aluno</button>
          </div>
        </div>
        <div class="stack">
          ${financeGroup("Mensalidade dos alunos", `Recebimentos do mês ${currentCompetenceLabel()} vinculados aos alunos.`, currentTuitionRows())}
          ${therapistFinanceGroup()}
          ${costsFinanceGroup()}
        </div>
      </section>
      ${financeResultPanel()}
    </div>
  `;
}

function financeResultPanel() {
  const data = financeSummary();
  return `
    <aside class="panel finance-result-panel">
      <div class="section-head">
        <div>
          <h2>Resultado do mês</h2>
          <p>Entradas, custos e lucro organizados por competência.</p>
        </div>
        <span class="tag blue">${currentCompetenceLabel()}</span>
      </div>
      <div class="finance-result-grid">
        ${financeResultCard("Entradas recebidas", data.receivedRevenue)}
        ${financeResultCard("Entradas previstas", data.expectedRevenue)}
        ${financeResultCard("Custos fixos", data.fixedCosts)}
        ${financeResultCard("Custos variáveis", data.variableCosts)}
        ${financeResultCard("Repasses terapeutas", data.therapistCosts)}
        ${financeResultCard("Total de custos", data.totalCosts)}
      </div>
      <div class="finance-result-total ${data.realizedProfit < 0 ? "negative" : "positive"}">
        <span>Resultado com entradas recebidas</span>
        <strong>${currency(data.realizedProfit)}</strong>
      </div>
      <div class="finance-result-total secondary ${data.expectedProfit < 0 ? "negative" : "positive"}">
        <span>Resultado se tudo for recebido</span>
        <strong>${currency(data.expectedProfit)}</strong>
      </div>
      <div class="finance-result-note">
        <span>${data.openRevenueCount} entrada(s) pendente(s)</span>
        <span>Margem recebida: ${formatPercent(data.realizedMargin)}</span>
      </div>
    </aside>
  `;
}

function financeResultCard(label, value) {
  return `
    <article class="finance-result-card">
      <span>${label}</span>
      <strong>${currency(value)}</strong>
    </article>
  `;
}

function financeSummary() {
  const rows = financeRowsForCurrentMonth().filter((item) => item.status !== "Cancelado");
  const revenueRows = rows.filter((item) => item.type !== "Despesa" && item.status !== "Isento");
  const expenseRows = rows.filter((item) => item.type === "Despesa");
  const costRows = expenseRows.filter((item) => item.center !== "Terapeutas");
  const fixedRows = costRows.filter((item) => costKind(item) === "fixo");
  const variableRows = costRows.filter((item) => costKind(item) === "variavel");
  const receivedRevenue = sumAmounts(revenueRows.filter((item) => item.status === "Pago"));
  const expectedRevenue = sumAmounts(revenueRows);
  const fixedCosts = sumAmounts(fixedRows);
  const variableCosts = sumAmounts(variableRows);
  const therapistCosts = sumAmounts(expenseRows.filter((item) => item.center === "Terapeutas"));
  const totalCosts = fixedCosts + variableCosts + therapistCosts;
  const realizedProfit = receivedRevenue - totalCosts;
  const expectedProfit = expectedRevenue - totalCosts;
  return {
    receivedRevenue,
    expectedRevenue,
    fixedCosts,
    variableCosts,
    therapistCosts,
    totalCosts,
    realizedProfit,
    expectedProfit,
    realizedMargin: receivedRevenue ? (realizedProfit / receivedRevenue) * 100 : 0,
    openRevenueCount: revenueRows.filter((item) => ["Pendente", "Atrasado"].includes(item.status)).length
  };
}

function financeRowsForCurrentMonth() {
  const current = currentCompetence();
  return state.finance.filter((item) => {
    if (item.type === "Mensalidade") return item.competence === current;
    return monthKey(item.date || today()) === current;
  });
}

function sumAmounts(rows) {
  return rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}

function financeGroup(title, description, rows) {
  const total = rows
    .filter((item) => item.status !== "Cancelado")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>${title}</h3>
          <p class="subtle">${description}</p>
        </div>
        <span class="tag blue">${currency(total)}</span>
      </header>
      <div class="stack">
        ${rows.length ? rows.map(financeRow).join("") : `<p class="empty">Nenhum lançamento nesta caixa.</p>`}
      </div>
    </article>
  `;
}

function therapistFinanceGroup() {
  const therapists = therapistsFromWorkshops();
  const rows = financeRowsForCurrentMonth().filter((item) => item.type === "Despesa" && item.center === "Terapeutas" && item.status !== "Cancelado");
  const total = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>Repasse aos terapeutas</h3>
          <p class="subtle">Terapeutas cadastrados nas oficinas e horas contratadas.</p>
        </div>
        <div class="row-actions">
          <span class="tag blue">${currency(total)}</span>
          <button class="soft-button" data-open="therapist:new">Novo terapeuta</button>
        </div>
      </header>
      <div class="stack">
        ${therapists.length ? therapists.map(therapistRow).join("") : `<p class="empty">Nenhum terapeuta cadastrado nas oficinas.</p>`}
      </div>
    </article>
  `;
}

function costsFinanceGroup() {
  const rows = financeRowsForCurrentMonth().filter((item) => item.type === "Despesa" && item.center !== "Terapeutas");
  const fixedRows = rows.filter((item) => costKind(item) === "fixo");
  const variableRows = rows.filter((item) => costKind(item) === "variavel");
  const total = rows
    .filter((item) => item.status !== "Cancelado")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return `
    <article class="record-card">
      <header>
        <div>
          <h3>Custos fixos e variáveis</h3>
          <p class="subtle">Custos separados por tipo para leitura e controle.</p>
        </div>
        <div class="row-actions">
          <span class="tag blue">${currency(total)}</span>
          <button class="soft-button" data-open="cost:new">Adicionar custo</button>
        </div>
      </header>
      <div class="stack">
        ${costList("Custos fixos", fixedRows)}
        ${costList("Custos variáveis", variableRows)}
      </div>
    </article>
  `;
}

function costList(title, rows) {
  const total = rows
    .filter((item) => item.status !== "Cancelado")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return `
    <section class="cost-list">
      <div class="cost-list-head">
        <h4>${title}</h4>
        <span class="tag blue">${currency(total)}</span>
      </div>
      <div class="stack">
        ${rows.length ? rows.map(costRow).join("") : `<p class="empty">Nenhum lançamento nesta lista.</p>`}
      </div>
    </section>
  `;
}

function costKind(item) {
  if (item.costType === "Fixo") return "fixo";
  if (item.costType === "Variável") return "variavel";
  return ["Estrutura", "Administrativo"].includes(item.center) ? "fixo" : "variavel";
}

function costRow(item) {
  return `
    <div class="data-row">
      <div>
        <h3>${item.description}</h3>
        <p class="subtle">${financeDetail(item)}</p>
      </div>
      <div class="row-actions">
        ${financePill(item.status)}
        <button class="soft-button" data-open="cost:${item.id}">Ver/Editar</button>
        <button class="danger-button" data-delete-cost="${item.id}">Excluir</button>
      </div>
    </div>
  `;
}

function therapistRow(name) {
  const repasse = financeForTherapist(name);
  return `
    <div class="data-row">
      <div>
        <h3>${name}</h3>
        <p class="subtle">Horas contratadas: ${formatHours(workshopHoursForTherapist(name))} | Oficina assumida: ${workshopNamesForTherapist(name)} | ${currency(Number(repasse?.amount || 0))}</p>
      </div>
      <div class="row-actions">
        ${repasse ? financePill(repasse.status) : `<span class="pill neutral">Sem repasse</span>`}
        ${repasse ? `<button class="soft-button" data-open="finance:${repasse.id}">Ver/Editar</button><button class="danger-button" data-delete-finance="${repasse.id}">Excluir</button>` : `<button class="soft-button" data-open="therapist:${encodeURIComponent(name)}">Adicionar repasse</button>`}
      </div>
    </div>
  `;
}

function financeRow(item) {
  return `
    <div class="data-row">
      <div>
        <h3>${item.description}</h3>
        <p class="subtle">${financeDetail(item)}</p>
      </div>
      <div class="row-actions">
        ${financePill(item.status)}
        <button class="soft-button" data-open="finance:${item.id}">Ver/Editar</button>
        <button class="danger-button" data-delete-finance="${item.id}">Excluir</button>
      </div>
    </div>
  `;
}

function financeDetail(item) {
  if (item.type === "Mensalidade" && item.relatedType === "Aluno") {
    const student = studentById(item.relatedId);
    const plan = student ? planById(student.planId) : null;
    return `Competência: ${competenceLabel(item.competence)} | Vencimento: ${item.date || "Não informado"} | Pacote contratado: ${plan?.name || "Não informado"} | ${currency(Number(item.amount || 0))}`;
  }
  if (item.type === "Despesa" && item.center === "Terapeutas") {
    const therapist = therapistNameForFinance(item);
    const hours = workshopHoursForTherapist(therapist);
    return `Horas contratadas: ${formatHours(hours)} | Oficina assumida: ${workshopNamesForTherapist(therapist)} | ${currency(Number(item.amount || 0))}`;
  }
  return `${item.type} | ${item.date} | ${item.center || "Sem centro"} | ${currency(Number(item.amount || 0))}`;
}

function therapistNameForFinance(item) {
  if (item.relatedType === "Terapeuta" && item.relatedId) return item.relatedId;
  const inferred = String(item.description || "").replace(/^Repasse\s+/i, "").trim();
  return inferred && inferred.toLowerCase() !== "terapeutas" ? inferred : "";
}

function workshopHoursForTherapist(therapist) {
  return state.workshops
    .filter((item) => (!therapist || item.therapist === therapist) && item.status !== "Cancelada")
    .reduce((sum, item) => sum + durationHours(item.start, item.end), 0);
}

function workshopNamesForTherapist(therapist) {
  const names = state.workshops
    .filter((item) => (!therapist || item.therapist === therapist) && item.status !== "Cancelada")
    .map((item) => item.name);
  return names.length ? names.join(", ") : "Não informada";
}

function therapistsFromWorkshops() {
  return [...new Set(state.workshops
    .filter((item) => item.status !== "Cancelada" && item.therapist)
    .map((item) => item.therapist)
  )].sort((a, b) => a.localeCompare(b));
}

function financeForTherapist(name) {
  const rows = state.finance.filter((item) => item.type === "Despesa" && item.center === "Terapeutas" && item.status !== "Cancelado" && therapistNameForFinance(item) === name);
  return rows.find((item) => monthKey(item.date || today()) === currentCompetence()) || rows[0];
}

function durationHours(start, end) {
  if (!start || !end) return 0;
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  return Math.max((endTotal - startTotal) / 60, 0);
}

function formatHours(hours) {
  if (!hours) return "Não informada";
  return `${hours.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h`;
}

function bindActions() {
  document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.go)));
  document.querySelectorAll("[data-open]").forEach((button) => button.addEventListener("click", () => openByToken(button.dataset.open)));
  document.querySelectorAll("[data-archive]").forEach((button) => button.addEventListener("click", () => archiveByToken(button.dataset.archive)));
  document.querySelectorAll("[data-delete-record]").forEach((button) => button.addEventListener("click", () => deleteByToken(button.dataset.deleteRecord)));
  document.querySelectorAll("[data-delete-finance]").forEach((button) => button.addEventListener("click", () => deleteFinance(button.dataset.deleteFinance)));
  document.querySelectorAll("[data-delete-cost]").forEach((button) => button.addEventListener("click", () => deleteCost(button.dataset.deleteCost)));
  document.querySelectorAll("[data-convert]").forEach((button) => button.addEventListener("click", () => convertWaitlist(button.dataset.convert)));
}

function openByToken(token) {
  const [type, id] = token.split(":");
  if (type === "student") openDrawer("student", id === "new" ? null : id);
  if (type === "class") openDrawer("class", id === "new" ? null : id);
  if (type === "wait") openDrawer("wait", id === "new" ? null : id);
  if (type === "workshop") openDrawer("workshop", id === "new" ? null : id);
  if (type === "finance") openDrawer(id === "tuition" ? "tuition" : "finance", id === "new" || id === "tuition" ? null : id);
  if (type === "cost") openDrawer("cost", id === "new" ? null : id);
  if (type === "therapist") openDrawer("therapist", id === "new" ? null : decodeURIComponent(id));
  if (type === "enrollment") openEnrollmentDrawer({ classId: id });
  if (type === "studentEnrollment") openEnrollmentDrawer({ studentId: id });
}

function openDrawer(kind, id) {
  drawerContext = { kind, id };
  const record = kind === "therapist" ? defaultsForTherapist(id) : id ? collectionFor(kind).find((item) => item.id === id) : defaultsFor(kind);
  drawerEl.innerHTML = drawerTemplate(kind, record, Boolean(id));
  drawerEl.classList.add("open");
  drawerEl.setAttribute("aria-hidden", "false");
  drawerBackdrop.hidden = false;
  bindDrawerForm(kind, id);
}

function drawerTemplate(kind, record, isEdit) {
  const title = drawerTitle(kind, isEdit);
  return `
    <div class="drawer-head">
      <div>
        <p class="eyebrow">Ficha lateral</p>
        <h2>${title}</h2>
      </div>
      <button class="ghost-button" type="button" data-close>Fechar</button>
    </div>
    <form id="drawerForm">
      ${fieldsFor(kind, record)}
      <div class="drawer-actions">
        <button class="primary-button" type="submit">Salvar alterações</button>
        <button class="ghost-button" type="button" data-close>Cancelar</button>
        ${isEdit && kind !== "tuition" ? `<button class="danger-button" type="button" data-drawer-delete>Excluir</button>` : ""}
      </div>
    </form>
  `;
}

function bindDrawerForm(kind, id) {
  drawerEl.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeDrawer));
  const deleteButton = drawerEl.querySelector("[data-drawer-delete]");
  if (deleteButton) deleteButton.addEventListener("click", () => deleteRecord(kind, id));
  if (kind === "student") {
    const birthDateInput = drawerEl.querySelector('input[name="birthDate"]');
    const ageInput = drawerEl.querySelector('input[name="age"]');
    if (birthDateInput && ageInput) {
      birthDateInput.addEventListener("input", () => {
        ageInput.value = ageLabel(birthDateInput.value);
      });
    }
  }
  drawerEl.querySelector("#drawerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    const ok = saveRecord(kind, id, values);
    if (ok) {
      closeDrawer();
      render();
    }
  });
}

function openEnrollmentDrawer(prefill = {}) {
  drawerContext = { kind: "enrollment" };
  drawerEl.innerHTML = `
    <div class="drawer-head">
      <div>
        <p class="eyebrow">Matricula</p>
        <h2>Matricular aluno em turma</h2>
      </div>
      <button class="ghost-button" type="button" data-close>Fechar</button>
    </div>
    <form id="drawerForm">
      ${selectField("studentId", "Aluno", state.students.filter((item) => item.status === "Ativo").map((item) => [item.id, item.name]), prefill.studentId || "")}
      ${selectField("classId", "Turma com vaga", state.classes.filter((item) => item.status === "Ativa").map((item) => [item.id, `${item.name} (${classOccupancy(item).free} vagas)`]), prefill.classId || "")}
      ${inputField("startDate", "Data de entrada", today(), "date")}
      <div class="drawer-actions">
        <button class="primary-button" type="submit">Salvar matricula</button>
        <button class="ghost-button" type="button" data-close>Cancelar</button>
      </div>
    </form>
  `;
  drawerEl.classList.add("open");
  drawerEl.setAttribute("aria-hidden", "false");
  drawerBackdrop.hidden = false;
  drawerEl.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeDrawer));
  drawerEl.querySelector("#drawerForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.target).entries());
    if (createEnrollment(values)) {
      closeDrawer();
      render();
    }
  });
}

function closeDrawer() {
  drawerContext = null;
  drawerEl.classList.remove("open");
  drawerEl.setAttribute("aria-hidden", "true");
  drawerBackdrop.hidden = true;
}

function saveRecord(kind, id, values) {
  if (kind === "finance" && values.type === "Despesa" && !values.center) {
    notify("Despesa precisa de centro de custo.");
    return false;
  }
  if (kind === "cost" && !values.center) {
    notify("Custo precisa de centro de custo.");
    return false;
  }
  if (kind === "tuition") return createTuition(values);
  if (kind === "therapist") return saveTherapist(values);

  const collection = collectionFor(kind);
  const prepared = prepareRecord(kind, id, values);
  if (kind === "student") {
    const previousPlanId = id ? studentById(id)?.planId : "";
    const studentId = id || makeId(kind);
    if (id) {
      const index = collection.findIndex((item) => item.id === id);
      collection[index] = { ...collection[index], ...prepared };
      syncTuitionForStudent(studentId, { forcePlanAmount: previousPlanId !== prepared.planId });
      notify("Alterações salvas.");
    } else {
      collection.unshift({ ...prepared, id: studentId, createdAt: today() });
      syncTuitionForStudent(studentId, { forcePlanAmount: true });
      notify("Aluno criado e mensalidade adicionada ao financeiro.");
    }
    saveState();
    return true;
  }
  if (id) {
    const index = collection.findIndex((item) => item.id === id);
    collection[index] = { ...collection[index], ...prepared };
    notify("Alterações salvas.");
  } else {
    collection.unshift({ ...prepared, id: makeId(kind) });
    notify("Registro criado.");
  }
  saveState();
  return true;
}

function createEnrollment(values) {
  const group = classById(values.classId);
  if (!group || !values.studentId) {
    notify("Selecione aluno e turma.");
    return false;
  }
  if (classOccupancy(group).free <= 0) {
    notify("Turma sem vaga disponível.");
    return false;
  }
  const exists = state.enrollments.some((item) => item.studentId === values.studentId && item.classId === values.classId && item.status === "Ativa");
  if (exists) {
    notify("Aluno já está matriculado nessa turma.");
    return false;
  }
  state.enrollments.unshift({ id: makeId("enrollment"), studentId: values.studentId, classId: values.classId, status: "Ativa", startDate: values.startDate || today() });
  saveState();
  notify("Matrícula criada.");
  return true;
}

function createTuition(values) {
  const student = studentById(values.studentId);
  if (!student) {
    notify("Selecione um aluno.");
    return false;
  }
  const plan = planById(student.planId);
  const competence = values.competence || monthKey(values.date || today());
  const existing = tuitionForStudentByCompetence(student.id, competence);
  if (existing) {
    existing.description = student.name;
    existing.amount = Number(values.amount || plan.monthly);
    existing.date = values.date || billingDateForStudent(student, competence);
    existing.status = values.status || "Pendente";
    existing.competence = competence;
    saveState();
    notify("Mensalidade atualizada.");
    return true;
  }
  state.finance.unshift({
    id: makeId("finance"),
    type: "Mensalidade",
    description: student.name,
    amount: Number(values.amount || plan.monthly),
    date: values.date || billingDateForStudent(student, competence),
    status: values.status || "Pendente",
    center: "Operação",
    relatedType: "Aluno",
    relatedId: student.id,
    competence
  });
  saveState();
  notify("Mensalidade gerada.");
  return true;
}

function saveTherapist(values) {
  const name = String(values.name || "").trim();
  if (!name || !values.workshopId) {
    notify("Informe o terapeuta e a oficina.");
    return false;
  }
  const workshop = state.workshops.find((item) => item.id === values.workshopId);
  if (!workshop) {
    notify("Oficina não encontrada.");
    return false;
  }
  workshop.therapist = name;
  const amount = Number(values.amount || 0);
  const existing = financeForTherapist(name);
  if (amount > 0 && existing) {
    existing.amount = amount;
    existing.description = `Repasse ${name}`;
    existing.relatedType = "Terapeuta";
    existing.relatedId = name;
    existing.center = "Terapeutas";
  } else if (amount > 0) {
    state.finance.unshift({
      id: makeId("finance"),
      type: "Despesa",
      description: `Repasse ${name}`,
      amount,
      date: today(),
      status: "Pendente",
      center: "Terapeutas",
      relatedType: "Terapeuta",
      relatedId: name
    });
  }
  saveState();
  notify("Terapeuta vinculado à oficina.");
  return true;
}

function archiveByToken(token) {
  const [kind, id] = token.split(":");
  archiveRecord(kind, id);
}

function deleteByToken(token) {
  const [kind, id] = token.split(":");
  deleteRecord(kind, id);
}

function archiveRecord(kind, id) {
  if (!id) return;
  if (kind === "student") {
    updateById(state.students, id, { status: "Cancelado" });
    state.enrollments = state.enrollments.map((item) => item.studentId === id ? { ...item, status: "Encerrada" } : item);
  }
  if (kind === "class") {
    updateById(state.classes, id, { status: "Encerrada" });
    state.enrollments = state.enrollments.map((item) => item.classId === id ? { ...item, status: "Encerrada" } : item);
  }
  if (kind === "wait") updateById(state.waitlist, id, { status: "Desistiu" });
  if (kind === "workshop") updateById(state.workshops, id, { status: "Cancelada" });
  if (kind === "finance") updateById(state.finance, id, { status: "Cancelado" });
  if (kind === "cost") updateById(state.finance, id, { status: "Cancelado" });
  saveState();
  notify("Registro arquivado/cancelado.");
  closeDrawer();
  render();
}

function deleteRecord(kind, id) {
  if (!id) return;
  if (kind === "student") {
    const student = state.students.find((item) => item.id === id);
    if (!student) return notify("Aluno não encontrado.");
    state.students = state.students.filter((item) => item.id !== id);
    state.enrollments = state.enrollments.filter((item) => item.studentId !== id);
    state.finance = state.finance.filter((item) => !(item.relatedType === "Aluno" && item.relatedId === id));
    notify("Aluno excluído.");
  } else if (kind === "class") {
    const group = state.classes.find((item) => item.id === id);
    if (!group) return notify("Turma não encontrada.");
    state.classes = state.classes.filter((item) => item.id !== id);
    state.enrollments = state.enrollments.filter((item) => item.classId !== id);
    state.finance = state.finance.filter((item) => !(item.relatedType === "Turma" && item.relatedId === id));
    notify("Turma excluída.");
  } else if (kind === "wait") {
    const lead = state.waitlist.find((item) => item.id === id);
    if (!lead) return notify("Interessado não encontrado.");
    state.waitlist = state.waitlist.filter((item) => item.id !== id);
    notify("Interessado excluído.");
  } else if (kind === "workshop") {
    const workshop = state.workshops.find((item) => item.id === id);
    if (!workshop) return notify("Oficina não encontrada.");
    state.workshops = state.workshops.filter((item) => item.id !== id);
    state.finance = state.finance.filter((item) => !(item.relatedType === "Oficina" && item.relatedId === id));
    notify("Oficina excluída.");
  } else if (kind === "therapist") {
    const before = state.finance.length;
    state.finance = state.finance.filter((item) => !(item.relatedType === "Terapeuta" && item.relatedId === id));
    if (state.finance.length === before) return notify("Repasse não encontrado.");
    notify("Repasse excluído.");
  } else if (kind === "finance" || kind === "cost") {
    deleteFinance(id);
    return;
  }
  saveState();
  closeDrawer();
  render();
}

function deleteCost(id) {
  const item = state.finance.find((entry) => entry.id === id && entry.type === "Despesa" && entry.center !== "Terapeutas");
  if (!item) {
    notify("Custo não encontrado.");
    return;
  }
  state.finance = state.finance.filter((entry) => entry.id !== id);
  saveState();
  notify("Custo excluído.");
  render();
}

function deleteFinance(id) {
  const item = state.finance.find((entry) => entry.id === id);
  if (!item) {
    notify("Lançamento não encontrado.");
    return;
  }
  state.finance = state.finance.filter((entry) => entry.id !== id);
  saveState();
  notify("Lançamento excluído.");
  render();
}

function convertWaitlist(id) {
  const lead = state.waitlist.find((item) => item.id === id);
  if (!lead) return;
  const planId = lead.interest === "Plano Completo" ? "completo" : "basico";
  const studentId = makeId("student");
  state.students.unshift({ id: studentId, name: lead.name, birthDate: "", guardian: lead.guardian, phone: lead.phone, planId, status: "Ativo", notes: lead.notes || "", createdAt: today() });
  syncTuitionForStudent(studentId, { forcePlanAmount: true });
  updateById(state.waitlist, id, { status: "Convertido" });
  saveState();
  notify("Interessado convertido em aluno.");
  setView("alunos");
}

function fieldsFor(kind, record) {
  if (kind === "student") {
    return `
      ${inputField("name", "Nome", record.name)}
      <div class="field-grid">
        ${inputField("birthDate", "Data de nascimento", record.birthDate, "date")}
        ${inputField("age", "Idade", ageLabel(record.birthDate), "text", "readonly")}
      </div>
      ${inputField("guardian", "Responsável", record.guardian)}
      ${inputField("phone", "Telefone", record.phone)}
      <div class="field-grid">
        ${selectField("planId", "Plano", state.plans.map((item) => [item.id, item.name]), record.planId)}
        ${selectField("status", "Status", ["Ativo", "Inativo", "Cancelado"], record.status)}
      </div>
      ${textField("notes", "Observações", record.notes)}
    `;
  }
  if (kind === "class") {
    return `
      ${inputField("name", "Nome da turma", record.name)}
      <div class="field-grid">
        ${selectField("category", "Categoria", ["Adolescentes", "Adultos"], record.category)}
        ${selectField("weekday", "Dia da semana", ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], record.weekday)}
      </div>
      <div class="field-grid">
        ${inputField("start", "Horário início", record.start, "time")}
        ${inputField("end", "Horário fim", record.end, "time")}
      </div>
      ${inputField("therapist", "Terapeuta", record.therapist)}
      <div class="field-grid">
        ${inputField("room", "Sala", record.room)}
        ${inputField("capacity", "Capacidade", record.capacity, "number")}
      </div>
      ${selectField("status", "Status", ["Ativa", "Em formação", "Encerrada"], record.status)}
    `;
  }
  if (kind === "wait") {
    return `
      ${inputField("name", "Nome", record.name)}
      ${inputField("guardian", "Responsável", record.guardian)}
      ${inputField("phone", "Telefone", record.phone)}
      <div class="field-grid">
        ${selectField("interest", "Interesse", ["Plano Básico", "Plano Completo", "Oficina", "Serviço Avulso"], record.interest)}
        ${selectField("status", "Status", ["Aguardando", "Convertido", "Desistiu"], record.status)}
      </div>
      ${textField("notes", "Observações", record.notes)}
    `;
  }
  if (kind === "workshop") {
    return `
      ${inputField("name", "Nome da oficina", record.name)}
      <div class="field-grid">
        ${selectField("type", "Tipo", ["Recorrente", "Avulsa"], record.type)}
        ${selectField("status", "Status", ["Planejada", "Aberta", "Encerrada", "Cancelada"], record.status)}
      </div>
      <div class="field-grid">
        ${selectField("weekday", "Dia recorrente", ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], record.weekday)}
        ${inputField("date", "Data avulsa", record.date, "date")}
      </div>
      <div class="field-grid">
        ${inputField("start", "Horário início", record.start, "time")}
        ${inputField("end", "Horário fim", record.end, "time")}
      </div>
      ${inputField("therapist", "Terapeuta", record.therapist)}
      <div class="field-grid">
        ${inputField("capacity", "Capacidade", record.capacity, "number")}
        ${inputField("participants", "Participantes", record.participants, "number")}
      </div>
    `;
  }
  if (kind === "finance") {
    if (record.type === "Mensalidade" && record.relatedType === "Aluno") {
      return tuitionFinanceFields(record);
    }
    return `
      <div class="field-grid">
        ${selectField("type", "Tipo", ["Mensalidade", "Receita", "Despesa"], record.type)}
        ${selectField("status", "Status", ["Pago", "Pendente", "Atrasado", "Isento", "Cancelado"], record.status)}
      </div>
      ${inputField("description", "Descrição", record.description)}
      <div class="field-grid">
        ${inputField("amount", "Valor", record.amount, "number")}
        ${inputField("date", "Data", record.date, "date")}
      </div>
      ${selectField("center", "Centro de custo", centers, record.center)}
      <div class="field-grid">
        ${selectField("relatedType", "Relacionado a", ["Geral", "Aluno", "Turma", "Oficina"], record.relatedType)}
        ${inputField("relatedId", "ID relacionado", record.relatedId)}
      </div>
    `;
  }
  if (kind === "cost") {
    return `
      ${hiddenInput("type", "Despesa")}
      ${hiddenInput("relatedType", "Geral")}
      ${hiddenInput("relatedId", "")}
      ${inputField("description", "Nome do custo", record.description)}
      <div class="field-grid">
        ${selectField("costType", "Tipo de custo", ["Fixo", "Variável"], record.costType || (costKind(record) === "fixo" ? "Fixo" : "Variável"))}
        ${selectField("status", "Status", ["Pago", "Pendente", "Atrasado", "Cancelado"], record.status)}
      </div>
      <div class="field-grid">
        ${inputField("amount", "Valor", record.amount, "number")}
        ${inputField("date", "Data", record.date, "date")}
      </div>
      ${selectField("center", "Centro de custo", centers.filter((item) => item !== "Terapeutas"), record.center)}
    `;
  }
  if (kind === "tuition") {
    return `
      ${selectField("studentId", "Aluno", state.students.filter((item) => item.status === "Ativo").map((item) => [item.id, `${item.name} - ${planById(item.planId).name}`]), "")}
      <div class="field-grid">
        ${inputField("competence", "Competência", currentCompetence())}
        ${inputField("date", "Vencimento/data", today(), "date")}
      </div>
      <div class="field-grid">
        ${inputField("amount", "Valor manual opcional", "", "number")}
        ${selectField("status", "Status", ["Pendente", "Pago", "Atrasado", "Isento"], "Pendente")}
      </div>
    `;
  }
  if (kind === "therapist") {
    return `
      ${inputField("name", "Nome do terapeuta", record.name)}
      ${selectField("workshopId", "Oficina assumida", state.workshops.map((item) => [item.id, `${item.name} - ${item.start}/${item.end}`]), record.workshopId)}
      ${inputField("amount", "Valor do repasse", record.amount, "number")}
    `;
  }
  return "";
}

function defaultsFor(kind) {
  if (kind === "student") return { name: "", birthDate: "", guardian: "", phone: "", planId: "basico", status: "Ativo", notes: "" };
  if (kind === "class") return { name: "", category: "Adolescentes", weekday: "Segunda", start: "09:00", end: "10:30", therapist: "", room: "", capacity: 6, status: "Ativa" };
  if (kind === "wait") return { name: "", guardian: "", phone: "", interest: "Plano Básico", status: "Aguardando", notes: "" };
  if (kind === "workshop") return { name: "", type: "Avulsa", date: today(), weekday: "", start: "10:00", end: "11:00", therapist: "", capacity: 10, participants: 0, status: "Planejada" };
  if (kind === "finance") return { type: "Receita", description: "", amount: 0, date: today(), status: "Pago", center: "Operação", relatedType: "Geral", relatedId: "" };
  if (kind === "cost") return { type: "Despesa", description: "", costType: "Fixo", amount: 0, date: today(), status: "Pago", center: "Estrutura", relatedType: "Geral", relatedId: "" };
  return {};
}

function tuitionFinanceFields(record) {
  const student = studentById(record.relatedId);
  const plan = student ? planById(student.planId) : null;
  const contractDate = student ? contractDateForStudent(student.id) : "";
  return `
    ${hiddenInput("type", "Mensalidade")}
    ${hiddenInput("description", student?.name || record.description)}
    ${hiddenInput("center", "Operação")}
    ${hiddenInput("relatedType", "Aluno")}
    ${hiddenInput("relatedId", record.relatedId)}
    <section class="drawer-section">
      <h3>Dados cadastrais</h3>
      ${readonlyField("Nome do aluno", student?.name || record.description)}
      <div class="field-grid">
        ${readonlyField("Responsável", student?.guardian || "Não informado")}
        ${readonlyField("Telefone", student?.phone || "Não informado")}
      </div>
      <div class="field-grid">
        ${readonlyField("Data de nascimento", student?.birthDate || "Não informada")}
        ${readonlyField("Idade", ageLabel(student?.birthDate))}
      </div>
    </section>
    <section class="drawer-section">
      <h3>Pacote contratado</h3>
      <div class="field-grid">
        ${readonlyField("Plano", plan?.name || "Não informado")}
        ${readonlyField("Valor do plano", currency(Number(plan?.monthly || record.amount || 0)))}
      </div>
      <div class="field-grid">
        ${readonlyField("Data de contratação", contractDate || "Não informada")}
        ${inputField("competence", "Competência", record.competence || currentCompetence(), "month")}
      </div>
      <div class="field-grid">
        ${inputField("date", "Vencimento do mês", record.date || billingDateForStudent(student, record.competence || currentCompetence()), "date")}
        ${inputField("amount", "Valor da mensalidade", record.amount, "number", "readonly")}
      </div>
      ${selectField("status", "Status deste mês", ["Pendente", "Pago", "Atrasado", "Isento", "Cancelado"], record.status)}
      <p class="drawer-note">A cada nova competência mensal, o app cria uma mensalidade pendente. O sócio altera manualmente o status deste mês.</p>
    </section>
  `;
}

function defaultsForTherapist(name = "") {
  const existingWorkshop = state.workshops.find((item) => item.therapist === name);
  const repasse = name ? financeForTherapist(name) : null;
  return {
    name,
    workshopId: existingWorkshop?.id || state.workshops[0]?.id || "",
    amount: repasse?.amount || 0
  };
}

function prepareRecord(kind, id, values) {
  const numericFields = ["capacity", "participants", "amount"];
  const prepared = { ...values };
  delete prepared.age;
  if (kind === "cost") {
    prepared.type = "Despesa";
    prepared.relatedType = "Geral";
    prepared.relatedId = "";
  }
  numericFields.forEach((field) => {
    if (field in prepared) prepared[field] = Number(prepared[field] || 0);
  });
  return prepared;
}

function collectionFor(kind) {
  if (kind === "student") return state.students;
  if (kind === "class") return state.classes;
  if (kind === "wait") return state.waitlist;
  if (kind === "workshop") return state.workshops;
  if (kind === "finance") return state.finance;
  if (kind === "cost") return state.finance;
  return [];
}

function drawerTitle(kind, isEdit) {
  const names = { student: "aluno", class: "turma", wait: "interessado", workshop: "oficina", finance: "lançamento", cost: "custo", tuition: "mensalidade", therapist: "terapeuta" };
  return `${isEdit ? "Editar" : "Criar"} ${names[kind] || "registro"}`;
}

function inputField(name, label, value = "", type = "text", extra = "") {
  return `<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(value)}" ${extra}></label>`;
}

function readonlyField(label, value = "", type = "text") {
  return `<label>${label}<input type="${type}" value="${escapeHtml(value)}" readonly></label>`;
}

function hiddenInput(name, value = "") {
  return `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
}

function textField(name, label, value = "") {
  return `<label>${label}<textarea name="${name}">${escapeHtml(value)}</textarea></label>`;
}

function selectField(name, label, options, value = "") {
  return `<label>${label}<select name="${name}">${options.map((option) => {
    const optionValue = Array.isArray(option) ? option[0] : option;
    const optionLabel = Array.isArray(option) ? option[1] : option;
    return `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === String(value) ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`;
  }).join("")}</select></label>`;
}

function classOccupancy(group) {
  const active = enrollmentsForClass(group.id).length;
  const capacity = Number(group.capacity || 0);
  return { occupied: active, free: Math.max(capacity - active, 0), rate: capacity ? (active / capacity) * 100 : 0 };
}

function enrollmentsForClass(classId) {
  return state.enrollments.filter((item) => item.classId === classId && item.status === "Ativa" && studentById(item.studentId)?.status === "Ativo");
}

function compatibleWaitlist(group) {
  return state.waitlist.filter((item) => {
    if (item.status !== "Aguardando") return false;
    if (["Oficina", "Serviço Avulso", "Servico Avulso"].includes(item.interest)) return false;
    if (group.category === "Adolescentes") return item.notes.toLowerCase().includes("adolesc") || item.interest.includes("Plano");
    return item.interest.includes("Plano");
  });
}

function currentTuitionRows() {
  const current = currentCompetence();
  return state.finance.filter((item) => item.type === "Mensalidade" && item.competence === current && item.status !== "Cancelado" && studentById(item.relatedId)?.status === "Ativo");
}

function latestTuitionFor(studentId) {
  return tuitionForStudentByCompetence(studentId, currentCompetence())
    || state.finance.find((item) => item.type === "Mensalidade" && item.relatedId === studentId && item.status !== "Cancelado");
}

function tuitionForStudentByCompetence(studentId, competence) {
  return state.finance.find((item) => item.type === "Mensalidade" && item.relatedId === studentId && item.competence === competence && item.status !== "Cancelado");
}

function syncMissingStudentTuitions() {
  let changed = false;
  const current = currentCompetence();
  state.students.forEach((student) => {
    if (student.status === "Ativo" && !tuitionForStudentByCompetence(student.id, current)) {
      createStudentTuition(student, current);
      changed = true;
    }
  });
  if (changed) saveState();
}

function syncTuitionForStudent(studentId, options = {}) {
  const student = studentById(studentId);
  if (!student || student.status !== "Ativo") return false;

  const plan = planById(student.planId);
  const current = currentCompetence();
  const tuition = tuitionForStudentByCompetence(student.id, current);
  if (!tuition) {
    createStudentTuition(student, current);
    return true;
  }

  tuition.description = student.name;
  tuition.type = "Mensalidade";
  tuition.center = "Operação";
  tuition.relatedType = "Aluno";
  tuition.relatedId = student.id;
  if (options.forcePlanAmount) tuition.amount = Number(plan?.monthly || 0);
  tuition.competence = current;
  tuition.date = billingDateForStudent(student, current);
  return true;
}

function createStudentTuition(student, competence = currentCompetence()) {
  const plan = planById(student.planId);
  state.finance.unshift({
    id: makeId("finance"),
    type: "Mensalidade",
    description: student.name,
    amount: Number(plan?.monthly || 0),
    date: billingDateForStudent(student, competence),
    status: "Pendente",
    center: "Operação",
    relatedType: "Aluno",
    relatedId: student.id,
    competence
  });
}

function planById(id) {
  return state.plans.find((item) => item.id === id) || state.plans[0];
}

function studentById(id) {
  return state.students.find((item) => item.id === id);
}

function classById(id) {
  return state.classes.find((item) => item.id === id);
}

function firstActiveEnrollmentForStudent(studentId) {
  return state.enrollments.find((item) => item.studentId === studentId && item.status === "Ativa");
}

function updateById(collection, id, patch) {
  const index = collection.findIndex((item) => item.id === id);
  if (index >= 0) collection[index] = { ...collection[index], ...patch };
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentCompetence() {
  return monthKey(today());
}

function currentCompetenceLabel() {
  return competenceLabel(currentCompetence());
}

function monthKey(dateValue) {
  return String(dateValue || today()).slice(0, 7);
}

function competenceLabel(competence) {
  if (!competence) return "Não informada";
  const [year, month] = String(competence).split("-");
  const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const monthIndex = Number(month) - 1;
  return monthNames[monthIndex] ? `${monthNames[monthIndex]}/${year}` : competence;
}

function contractDateForStudent(studentId) {
  const enrollment = firstActiveEnrollmentForStudent(studentId);
  return enrollment?.startDate || studentById(studentId)?.createdAt || "";
}

function billingDateForStudent(student, competence = currentCompetence()) {
  const contractDate = student ? contractDateForStudent(student.id) : "";
  const day = Number((contractDate || today()).slice(8, 10)) || 1;
  const [year, month] = competence.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${competence}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
}

function ageLabel(dateValue) {
  const age = calculateAge(dateValue);
  return age === null ? "Não informada" : `${age} anos`;
}

function calculateAge(dateValue) {
  if (!dateValue) return null;
  const birth = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return Math.max(age, 0);
}

function currency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(0)}%`;
}

function statusPill(status) {
  const normalized = displayText(status);
  const color = ["Ativo", "Ativa", "Aberta", "Aguardando", "Pago"].includes(normalized) ? "paid" : ["Pendente", "Atrasado", "Em formação", "Planejada"].includes(normalized) ? "pending" : "neutral";
  return `<span class="pill ${color}">${normalized}</span>`;
}

function financePill(status) {
  const normalized = displayText(status);
  const color = normalized === "Pago" ? "paid" : ["Pendente", "Atrasado"].includes(normalized) ? "pending" : normalized === "Cancelado" ? "late" : "neutral";
  return `<span class="pill ${color}">${normalized}</span>`;
}

function displayText(value) {
  const normalized = repairText(value || "");
  const map = {
    Basico: "Básico",
    "Plano Basico": "Plano Básico",
    "Servico Avulso": "Serviço Avulso",
    Operacao: "Operação",
    "Em formacao": "Em formação",
    Terca: "Terça",
    Sabado: "Sábado",
    "Nao informada": "Não informada"
  };
  return map[normalized] || normalized;
}

function notify(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => {
    toastEl.hidden = true;
  }, 2600);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (match) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[match]);
}
