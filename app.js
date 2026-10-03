"use strict";

const SIZES = ["P", "M", "G", "GG", "EXG", "G1", "G2", "G3", "G4", "G5", "G6"];
const COLORS = ["Marinho", "Verde hospitalar", "Bordô", "Branco", "Preto", "Royal", "Outra (descrever nas observações)"];
const MINIMUM = 300;
const GOALS = {
  "preco": "Preço competitivo",
  "conforto": "Conforto",
  "elegancia": "Elegância e apresentação",
  "durabilidade": "Durabilidade e cuidados",
  "equilibrio": "Equilíbrio entre os critérios",
  "outro": "Outro objetivo"
};
const GOAL_HELP = {
  "preco": "Vamos comparar o custo final do lote considerando o uso, o tecido e o acabamento.",
  "conforto": "Conte como a peça será usada: rotina, movimentos e tempo de uso ajudam a avaliar toque e flexibilidade.",
  "elegancia": "Caimento, estrutura e acabamento ajudam a definir a apresentação que sua marca ou equipe busca.",
  "durabilidade": "Informe a rotina de uso e lavagem para avaliar resistência, conservação da cor e facilidade de cuidados.",
  "equilibrio": "Explique quais critérios são essenciais e onde há flexibilidade para encontrar um equilíbrio.",
  "outro": "Descreva o requisito que precisa ser atendido e a dificuldade que você quer resolver."
};
const MODELS = {
  "gola-padre": {
    "name": "Modelo 01 · Gola padre",
    "shortName": "Gola padre",
    "category": "GOLA PADRE / JOGGER",
    "image": "assets/scrub-gola-padre.jpeg",
    "description": "Gola padre com abertura frontal e calça jogger. A referência ajuda a escolher a direção; o caimento e os detalhes são alinhados na peça piloto.",
    "specs": [
      [
        "Blusa",
        "Gola padre com abertura frontal."
      ],
      [
        "Calça",
        "Jogger com barra ajustada."
      ],
      [
        "Grade",
        "Regular e Plus size têm medidas próprias; confirme o caimento na peça piloto."
      ],
      [
        "Detalhes",
        "Cores, bolsos, cós, barra e etiquetas alinhados na proposta e na peça piloto."
      ],
      [
        "Produção",
        "Sob demanda, a partir de 300 peças por modelo."
      ]
    ]
  },
  "classico": {
    "name": "Modelo 02 · Decote V e calça reta",
    "shortName": "Decote V · calça reta",
    "category": "DECOTE V / CALÇA RETA",
    "image": "assets/scrub-navy-plus.webp",
    "description": "Decote V, mangas curtas e calça reta. Uma mesma direção de modelagem para avaliar sua grade Regular ou Plus size.",
    "specs": [
      [
        "Blusa",
        "Decote V e mangas curtas."
      ],
      [
        "Calça",
        "Silhueta reta, conforme a referência ilustrativa."
      ],
      [
        "Grade",
        "Regular e Plus size têm medidas próprias; confirme o caimento na peça piloto."
      ],
      [
        "Detalhes",
        "Cores, bolsos, cós, barra e etiquetas alinhados na proposta e na peça piloto."
      ],
      [
        "Produção",
        "Sob demanda, a partir de 300 peças por modelo."
      ]
    ]
  },
  "jogger": {
    "name": "Modelo 03 · Decote V e jogger",
    "shortName": "Decote V · jogger",
    "category": "DECOTE V / JOGGER",
    "image": "assets/scrub-jogger.webp",
    "description": "Decote V com calça jogger e barra ajustada. Caimento, cós e detalhes são confirmados na peça piloto.",
    "specs": [
      [
        "Blusa",
        "Decote V e mangas curtas."
      ],
      [
        "Calça",
        "Jogger com barra ajustada."
      ],
      [
        "Grade",
        "Regular e Plus size têm medidas próprias; confirme o caimento na peça piloto."
      ],
      [
        "Detalhes",
        "Cores, bolsos, cós, barra e etiquetas alinhados na proposta e na peça piloto."
      ],
      [
        "Produção",
        "Sob demanda, a partir de 300 peças por modelo."
      ]
    ]
  },
  "gola-redonda": {
    "name": "Modelo 04 · Gola redonda e cargo",
    "shortName": "Gola redonda · cargo",
    "category": "GOLA REDONDA / CARGO",
    "image": "assets/scrub-roundneck-cargo.webp",
    "description": "Gola redonda, manga japonesa e calça reta com bolso cargo. Uma proposta de modelagem para avaliar com a Marconi antes de definir a peça piloto.",
    "specs": [
      [
        "Blusa",
        "Gola redonda e manga japonesa integrada à blusa."
      ],
      [
        "Calça",
        "Silhueta reta com bolso cargo lateral."
      ],
      [
        "Grade",
        "Regular e Plus size têm medidas próprias; confirme o caimento na peça piloto."
      ],
      [
        "Referência",
        "Conceito ilustrativo; construção e viabilidade avaliadas com a Marconi."
      ],
      [
        "Produção",
        "Sob demanda, a partir de 300 peças por modelo."
      ]
    ]
  },
  "criar-meu-modelo": {
    "name": "Criar meu modelo",
    "shortName": "Criar meu modelo",
    "description": "Ideia de modelagem para avaliação da Marconi.",
    "specs": []
  }
};

const $ = (id) => document.getElementById(id);
let rowCounter = 0;
let currentProduct = "classico";
let lastSummary = "";
let lastRows = [];
const ENDPOINT = "https://qnrjyaucryqfthagzuhc.supabase.co/functions/v1/receber-proposta";
const openedAt = Date.now();
let lastDialogTrigger = null;

function readGrade() {
  return Array.from($("grade-rows").children).map((row) => {
    const quantities = {};
    for (const size of SIZES) {
      const input = row.querySelector(`[data-size="${size}"]`);
      const n = Number(input.value);
      quantities[size] = Number.isSafeInteger(n) && n >= 0 && n <= 100000 ? n : 0;
    }
    return { color: row.querySelector("select").value, quantities };
  });
}

function gradeTotal(rows) {
  return rows.reduce((total, row) => total + Object.values(row.quantities).reduce((sum, q) => sum + q, 0), 0);
}

function updateGrade() {
  const rows = readGrade();
  rows.forEach((row, i) => {
    const element = $("grade-rows").children[i];
    const color = row.color;
    element.querySelector(".row-total").textContent = String(gradeTotal([row]));
    element.querySelectorAll("[data-size]").forEach((input) => input.setAttribute("aria-label", `${color}, tamanho ${input.dataset.size}, quantidade`));
    element.querySelector(".remove-row").setAttribute("aria-label", `Excluir cor ${color}`);
  });
  const total = gradeTotal(rows);
  $("total-units").replaceChildren(document.createTextNode(total.toLocaleString("pt-BR") + " "));
  const small = document.createElement("small"); small.textContent = "peças"; $("total-units").append(small);
  $("minimum-status").textContent = total >= MINIMUM ? "Grade pronta para avaliação. Preço e prazo serão confirmados." : `Faltam ${(MINIMUM - total).toLocaleString("pt-BR")} peças para o mínimo deste modelo.`;
  $("minimum-status").classList.toggle("valid", total >= MINIMUM);
  $("add-color").disabled = rows.length >= 8;
}

function addRow(color, quantities = {}) {
  rowCounter += 1;
  const row = document.createElement("tr");
  const colorCell = document.createElement("td");
  const select = document.createElement("select");
  select.setAttribute("aria-label", `Cor da linha ${rowCounter}`);
  COLORS.forEach((c) => { const option = document.createElement("option"); option.value = c; option.textContent = c; select.append(option); });
  const used = readGrade().map((r) => r.color);
  select.value = color || COLORS.find((c) => !used.includes(c)) || COLORS.at(-1);
  colorCell.append(select); row.append(colorCell);
  SIZES.forEach((size) => {
    const cell = document.createElement("td"); const input = document.createElement("input");
    input.type = "number"; input.min = "0"; input.max = "100000"; input.step = "1"; input.inputMode = "numeric";
    input.dataset.size = size; input.value = String(quantities[size] || 0); input.setAttribute("aria-label", `${select.value}, tamanho ${size}, quantidade`);
    input.addEventListener("focus", () => input.select()); input.addEventListener("input", updateGrade);
    cell.append(input); row.append(cell);
  });
  const totalCell = document.createElement("td"); totalCell.className = "row-total"; totalCell.textContent = "0"; row.append(totalCell);
  const removeCell = document.createElement("td"); const remove = document.createElement("button");
  remove.type = "button"; remove.className = "remove-row"; remove.textContent = "×";
  remove.setAttribute("aria-label", `Excluir cor ${select.value}`);
  remove.addEventListener("click", () => {
    row.remove(); if (!$("grade-rows").children.length) addRow("Marinho"); updateGrade();
  });
  select.addEventListener("change", updateGrade);
  removeCell.append(remove); row.append(removeCell); $("grade-rows").append(row); updateGrade();
  return row;
}

function openDialog(id) {
  lastDialogTrigger = document.activeElement;
  $(id).showModal(); document.body.classList.add("modal-open");
}
function closeDialog(dialog) { dialog.close(); }
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector("[data-close-dialog]").addEventListener("click", () => closeDialog(dialog));
  dialog.addEventListener("close", () => {
    if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
    if (lastDialogTrigger?.isConnected) lastDialogTrigger.focus({ preventScroll: true });
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
  });
});

function openProduct(id) {
  const model = Object.hasOwn(MODELS, id) ? MODELS[id] : null; if (!model?.image) return;
  currentProduct = id;
  $("product-title").textContent = model.name; $("product-category").textContent = model.category;
  $("product-description").textContent = model.description; $("product-image").src = model.image;
  $("product-image").alt = `${id === "gola-padre" ? "Referência enviada" : "Imagem ilustrativa"}: ${model.name}`;
  $("product-image").width = id === "gola-padre" ? 1365 : 1024;
  $("product-image").height = id === "gola-padre" ? 2048 : 1536;
  $("product-image").nextElementSibling.textContent = id === "gola-padre" ? "Referência enviada" : "Imagem ilustrativa";
  $("product-specs").replaceChildren();
  model.specs.forEach(([term, detail]) => {
    const div = document.createElement("div"); const dt = document.createElement("dt"); const dd = document.createElement("dd");
    dt.textContent = term; dd.textContent = detail; div.append(dt, dd); $("product-specs").append(div);
  });
  $("product-measurements-link").hidden = false;
  $("product-measurements-link").href = "#medidas";
  openDialog("product-dialog");
}

function validateCommercialInterest(model, goal, need) {
  if (!Object.hasOwn(MODELS, model)) throw new Error("Escolha uma modelagem ou a opção Criar meu modelo.");
  if (!Object.hasOwn(GOALS, goal)) throw new Error("Informe o objetivo principal do produto.");
  if (typeof need !== "string" || !need.trim()) throw new Error("Conte sua expectativa e o que você quer resolver com este pedido.");
  if (need.length > 1500) throw new Error("Conte sua expectativa em até 1.500 caracteres.");
}

function updateModelSelection() {
  const model = $("quote-model").value;
  document.querySelectorAll("[data-model-card]").forEach((card) => card.classList.toggle("selected-model", card.dataset.modelCard === model));
  document.querySelectorAll("[data-select-product]").forEach((button) => {
    const active = button.dataset.selectProduct === model;
    button.setAttribute("aria-pressed", String(active));
    button.textContent = button.dataset.selectProduct === "criar-meu-modelo" ? (active ? "Minha ideia selecionada" : "Criar meu modelo") : (active ? "Modelagem selecionada" : "Escolher modelagem");
  });
  const custom = model === "criar-meu-modelo";
  $("model-help").textContent = custom ? "Descreva sua ideia no campo de expectativas. Vamos avaliar as possibilidades antes de definir o modelo e a peça piloto." : "As modelagens podem ser avaliadas em Regular e Plus size. A peça piloto confirma sua versão.";
  $("quote-need").placeholder = custom ? "Ex.: imagino uma gola diferente, mais bolsos e um caimento que acompanhe a rotina da equipe. Conte a ideia e o que ela precisa resolver." : "Ex.: quero melhorar a margem da loja, dar mais conforto à equipe ou ter uma apresentação mais elegante. O que precisa mudar em relação ao produto que você usa hoje?";
}

function goToCommercialProposal() {
  $("orcamento").scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  $("quote-goal").focus({ preventScroll: true });
}

function selectModel(id) {
  if (!Object.hasOwn(MODELS, id)) return;
  $("quote-model").value = id;
  updateModelSelection();
  goToCommercialProposal();
}
document.querySelectorAll("[data-open-product]").forEach((button) => button.addEventListener("click", () => openProduct(button.dataset.openProduct)));
document.querySelectorAll("[data-select-product]").forEach((button) => button.addEventListener("click", () => selectModel(button.dataset.selectProduct)));
$("quote-model").addEventListener("change", updateModelSelection);
$("quote-goal").addEventListener("change", () => {
  $("goal-help").textContent = GOAL_HELP[$("quote-goal").value] || "Sua prioridade ajuda a encontrar o caimento, o acabamento e o custo que fazem sentido para o seu pedido.";
});
updateModelSelection();
$("dialog-select-model").addEventListener("click", () => { closeDialog($("product-dialog")); selectModel(currentProduct); });
$("open-measurements").addEventListener("click", () => openDialog("measurements-dialog"));
$("product-measurements-link").addEventListener("click", () => closeDialog($("product-dialog")));
$("measurements-tables-link").addEventListener("click", () => closeDialog($("measurements-dialog")));
$("measurements-quote").addEventListener("click", () => { closeDialog($("measurements-dialog")); $("orcamento").scrollIntoView({ behavior: "smooth" }); });
$("open-privacy").addEventListener("click", () => openDialog("privacy-dialog"));
$("add-color").addEventListener("click", () => { if ($("grade-rows").children.length < 8) { const row = addRow(); row.querySelector("select").focus(); } });

function setAudience(audience, focus = false) {
  if (!["lojista", "clinica", "hospital"].includes(audience)) throw new Error("Tipo de empresa inválido.");
  document.querySelectorAll("[data-audience]").forEach((tab) => {
    const active = tab.dataset.audience === audience;
    tab.setAttribute("aria-selected", String(active)); tab.tabIndex = active ? 0 : -1;
    $("panel-" + tab.dataset.audience).hidden = !active;
    if (active && focus) tab.focus();
  });
  $("quote-audience").value = audience;
}
const audienceTabs = Array.from(document.querySelectorAll("[data-audience]"));
audienceTabs.forEach((tab, i) => {
  tab.addEventListener("click", () => setAudience(tab.dataset.audience));
  tab.addEventListener("keydown", (event) => {
    let index;
    if (event.key === "ArrowRight") index = (i + 1) % audienceTabs.length;
    if (event.key === "ArrowLeft") index = (i + audienceTabs.length - 1) % audienceTabs.length;
    if (event.key === "Home") index = 0;
    if (event.key === "End") index = audienceTabs.length - 1;
    if (index !== undefined) { event.preventDefault(); setAudience(audienceTabs[index].dataset.audience, true); }
  });
});
$("quote-audience").addEventListener("change", (e) => setAudience(e.target.value));

function validateRows(rows) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 8) throw new Error("Informe de 1 a 8 linhas de cores.");
  const used = new Set();
  rows.forEach((row) => {
    if (!row || !COLORS.includes(row.color) || !row.quantities || typeof row.quantities !== "object") throw new Error("Cor ou grade inválida.");
    if (used.has(row.color) && row.color !== COLORS.at(-1)) throw new Error(`A cor ${row.color} aparece em mais de uma linha. Agrupe suas quantidades em uma única linha.`);
    used.add(row.color);
    Object.entries(row.quantities).forEach(([size, quantity]) => {
      if (!SIZES.includes(size) || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > 100000) throw new Error("Informe somente tamanhos disponíveis na grade e quantidades inteiras de 0 a 100.000.");
    });
  });
}

function makeSummary(rows) {
  const audienceNames = { lojista: "Lojista / marca / marketplace", clinica: "Clínica", hospital: "Hospital" };
  const lines = ["SOLICITAÇÃO DE PROPOSTA COMERCIAL — MARCONI SCRUBS", "", `Nome: ${$("contact-name").value.trim()}`, `Empresa: ${$("company-name").value.trim()}`, `Perfil: ${audienceNames[$("quote-audience").value]}`, `E-mail: ${$("contact-email").value.trim()}`, `Telefone: ${$("contact-phone").value.trim()}`];
  if ($("company-cnpj").value.trim()) lines.push(`CNPJ: ${$("company-cnpj").value.trim()}`);
  lines.push("", `Modelagem de interesse: ${MODELS[$("quote-model").value].name}`, `Objetivo principal: ${GOALS[$("quote-goal").value]}`, "", "EXPECTATIVAS, OBJETIVOS E DESAFIOS:", $("quote-need").value.trim(), "", "GRADE DESEJADA:");
  rows.filter((row) => gradeTotal([row]) > 0).forEach((row) => {
    const sizes = SIZES.filter((size) => row.quantities[size] > 0).map((size) => `${size}: ${row.quantities[size]}`).join(" | ");
    lines.push(`${row.color} — ${sizes} — Total: ${gradeTotal([row])}`);
  });
  lines.push("", `TOTAL DO MODELO: ${gradeTotal(rows).toLocaleString("pt-BR")} peças`, "", "CONDIÇÕES: sinal de 50% após formalizar o pedido; saldo de 50% na saída. O preço combinado é mantido até a entrega.", "", "Modelo, tamanhos, cores, medidas, preço e prazo serão confirmados na proposta. Esta solicitação não formaliza um pedido.");
  if ($("quote-model").value === "criar-meu-modelo") lines.push("", "Ideia de modelagem para avaliação da Marconi; a viabilidade será confirmada antes de definir o pedido.");
  if ($("quote-notes").value.trim()) lines.push("", "OBSERVAÇÕES:", $("quote-notes").value.trim());
  return lines.join("\n");
}

$("quote-form").addEventListener("submit", (event) => {
  event.preventDefault(); $("form-error").hidden = true;
  if (!$("quote-form").reportValidity()) return;
  const rows = readGrade();
  try {
    validateCommercialInterest($("quote-model").value, $("quote-goal").value, $("quote-need").value);
    validateRows(rows);
    if (gradeTotal(rows) < MINIMUM) throw new Error("O mínimo é de 300 peças por modelo. Ajuste sua grade antes de preparar a solicitação.");
    if (!$("contact-name").value.trim() || !$("company-name").value.trim() || !$("contact-phone").value.trim()) throw new Error("Preencha seu nome, a empresa e o telefone.");
    lastSummary = makeSummary(rows); lastRows = rows; $("quote-summary").textContent = lastSummary; $("copy-status").textContent = ""; $("send-status").textContent = ""; $("send-now").disabled = false; $("send-now").textContent = "Enviar proposta à Marconi";
    const subject = `Proposta comercial — ${MODELS[$("quote-model").value].name} — ${gradeTotal(rows)} peças`;
    $("send-email").href = `mailto:marconi.confeccao@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lastSummary)}`;
    openDialog("summary-dialog");
  } catch (error) {
    $("form-error").textContent = error.message; $("form-error").hidden = false;
    $("form-error").scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

$("send-now").addEventListener("click", async () => {
  const button = $("send-now"), status = $("send-status");
  const payload = {
    tipo: "scrubs",
    audience: $("quote-audience").value, model: $("quote-model").value, goal: $("quote-goal").value, need: $("quote-need").value.trim(),
    rows: lastRows.filter((row) => gradeTotal([row]) > 0).map((row) => ({ color: row.color, quantities: Object.fromEntries(Object.entries(row.quantities).filter(([, q]) => q > 0)) })),
    contact: $("contact-name").value.trim(), company: $("company-name").value.trim(), email: $("contact-email").value.trim(), phone: $("contact-phone").value.trim(),
    cnpj: $("company-cnpj").value.trim(), notes: $("quote-notes").value.trim(), website: $("quote-website").value, tempo: Date.now() - openedAt
  };
  button.disabled = true; button.textContent = "Enviando…"; status.textContent = "";
  try {
    const response = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data.ok) {
      status.textContent = `Proposta enviada! A equipe Marconi responde por e-mail (${payload.email}). Obrigado pelo interesse.`;
      button.textContent = "Proposta enviada";
      return;
    }
    throw new Error(data.erro || "");
  } catch (error) {
    const reason = error.message && !/fetch|network|load failed/i.test(error.message) ? error.message : "Não foi possível enviar agora.";
    status.textContent = `${reason} Use o botão de e-mail ou copie o resumo.`;
    button.disabled = false; button.textContent = "Enviar proposta à Marconi";
  }
});
$("copy-summary").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(lastSummary); $("copy-status").textContent = "Resumo copiado. Envie para marconi.confeccao@gmail.com."; }
  catch { const range = document.createRange(); range.selectNodeContents($("quote-summary")); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $("copy-status").textContent = "O resumo foi selecionado. Use Copiar no seu dispositivo."; }
});

addRow("Marinho");

// These tools stage the same visible grade; they do not send data or create an order.
const modelContext = document.modelContext;
if (modelContext?.registerTool) {
  const lifecycle = new AbortController();
  const report = () => {};
  const register = (tool) => { try { Promise.resolve(modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(report); } catch { report(); } };
  register({
    name: "configure_scrub_quote", title: "Organizar proposta de scrubs",
    description: "Prepara a modelagem ou ideia, o objetivo, as expectativas e a grade visíveis para uma proposta comercial. Não envia dados nem cria pedido. A viabilidade será avaliada pela Marconi.",
    inputSchema: { type: "object", properties: { model: { type: "string", enum: Object.keys(MODELS) }, goal: { type: "string", enum: Object.keys(GOALS) }, need: { type: "string", maxLength: 1500 }, audience: { type: "string", enum: ["lojista", "clinica", "hospital"] }, rows: { type: "array", minItems: 1, maxItems: 8, items: { type: "object", properties: { color: { type: "string", enum: COLORS }, quantities: { type: "object", properties: Object.fromEntries(SIZES.map((size) => [size, { type: "integer", minimum: 0, maximum: 100000 }])), additionalProperties: false } }, required: ["color", "quantities"], additionalProperties: false } } }, required: ["model", "rows"], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || !Object.hasOwn(MODELS, input.model)) throw new Error("Modelo inválido.");
      if (input.audience && !["lojista", "clinica", "hospital"].includes(input.audience)) throw new Error("Perfil inválido.");
      if (input.goal !== undefined && !Object.hasOwn(GOALS, input.goal)) throw new Error("Objetivo inválido.");
      if (input.need !== undefined && (typeof input.need !== "string" || input.need.length > 1500)) throw new Error("Necessidade inválida.");
      validateRows(input.rows);
      if (input.goal !== undefined) { $("quote-goal").value = input.goal; $("goal-help").textContent = GOAL_HELP[input.goal]; }
      if (input.need !== undefined) $("quote-need").value = input.need;
      $("quote-model").value = input.model; if (input.audience) setAudience(input.audience);
      $("grade-rows").replaceChildren(); input.rows.forEach((row) => addRow(row.color, row.quantities)); updateGrade(); updateModelSelection();
      const total = gradeTotal(readGrade());
      return { model: MODELS[input.model].name, goal: GOALS[$("quote-goal").value] || null, total, minimum: MINIMUM, minimumMet: total >= MINIMUM, status: "grade_preparada_para_avaliacao", orderCreated: false };
    }
  });
  register({ name: "read_scrub_quote", title: "Consultar grade de scrubs", description: "Lê modelagem, objetivo e grade visíveis. Não retorna dados de contato nem o texto livre das expectativas e não envia a solicitação.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute() { const rows = readGrade(); return { model: $("quote-model").value, goal: $("quote-goal").value, needProvided: Boolean($("quote-need").value.trim()), rows, total: gradeTotal(rows), minimum: MINIMUM }; } });
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}
