const form = document.querySelector("#applicationForm");
const motivation = form.elements.motivacao;
const count = document.querySelector("#charCount");
const status = document.querySelector("#formStatus");

motivation.addEventListener("input", () => {
  count.textContent = motivation.value.length;
});

function valuesFromForm() {
  const data = new FormData(form);
  return {
    nome: String(data.get("nome") || "").trim(),
    whatsapp: String(data.get("whatsapp") || "").trim(),
    email: String(data.get("email") || "").trim(),
    localidade: String(data.get("localidade") || "").trim(),
    perfil: String(data.get("perfil") || "").trim(),
    experiencia: String(data.get("experiencia") || "").trim(),
    disponibilidade: String(data.get("disponibilidade") || "").trim(),
    motivacao: String(data.get("motivacao") || "").trim(),
    consentimento: data.get("consentimento") === "on"
  };
}

function validate(values) {
  form.querySelectorAll(".field").forEach((field) => field.classList.remove("invalid"));
  if (!form.checkValidity()) {
    form.querySelectorAll(":invalid").forEach((input) => input.closest(".field")?.classList.add("invalid"));
    form.reportValidity();
    throw new Error("Revise os campos obrigatórios antes de enviar.");
  }
  return values;
}

function createMailto(values) {
  const subject = `Candidatura SDR Freelancer — ${values.nome}`;
  const body = [
    "Olá, Hello Inova!",
    "",
    "Gostaria de me candidatar à vaga de SDR Freelancer.",
    "",
    `Nome: ${values.nome}`,
    `WhatsApp: ${values.whatsapp}`,
    `E-mail: ${values.email}`,
    `Cidade / Estado: ${values.localidade}`,
    `LinkedIn ou currículo: ${values.perfil}`,
    `Experiência com prospecção: ${values.experiencia}`,
    `Disponibilidade semanal: ${values.disponibilidade}`,
    "",
    "Motivação:",
    values.motivacao,
    "",
    "Autorizo o uso destes dados exclusivamente para este processo seletivo."
  ].join("\n");
  return `mailto:helloinovatecnologi@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function prepareApplication(rawValues) {
  const values = validate(rawValues);
  const mailto = createMailto(values);
  status.className = "form-status success";
  status.textContent = "Tudo certo! Abrimos seu aplicativo de e-mail. Revise a mensagem e confirme o envio.";
  return { mailto, candidate: values.nome, status: "ready_to_send" };
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  status.className = "form-status";
  try {
    const result = prepareApplication(valuesFromForm());
    window.location.href = result.mailto;
  } catch (error) {
    status.className = "form-status error";
    status.textContent = error.message;
  }
});

function registerWebMcpTool() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const schema = {
    type: "object",
    properties: {
      nome: { type: "string" },
      whatsapp: { type: "string" },
      email: { type: "string" },
      localidade: { type: "string" },
      perfil: { type: "string" },
      experiencia: { type: "string" },
      disponibilidade: { type: "string" },
      motivacao: { type: "string", maxLength: 700 },
      consentimento: { type: "boolean" }
    },
    required: ["nome", "whatsapp", "email", "localidade", "perfil", "experiencia", "disponibilidade", "motivacao", "consentimento"],
    additionalProperties: false
  };
  context.registerTool({
    name: "prepare_sdr_application",
    title: "Preparar candidatura para SDR",
    description: "Preenche e prepara a candidatura de SDR freelancer para envio por e-mail.",
    inputSchema: schema,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      Object.entries(input).forEach(([name, value]) => {
        const control = form.elements[name];
        if (!control) return;
        if (control.type === "checkbox") control.checked = Boolean(value);
        else control.value = String(value);
      });
      count.textContent = motivation.value.length;
      return prepareApplication(valuesFromForm());
    }
  });
}

registerWebMcpTool();
