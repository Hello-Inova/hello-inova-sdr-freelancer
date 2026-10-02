const form = document.querySelector("#applicationForm");
const motivation = form.elements.motivacao;
const count = document.querySelector("#charCount");
const status = document.querySelector("#formStatus");
const submitButton = form.querySelector("button[type='submit']");
const API_BASE_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:3000"
  : "https://gestor-hello-inova.vercel.app";

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
    instagram: String(data.get("instagram") || "").trim(),
    experiencia: String(data.get("experiencia") || "").trim(),
    comissao: String(data.get("comissao") || "").trim(),
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

async function submitApplication(rawValues) {
  const values = validate(rawValues);
  const response = await fetch(`${API_BASE_URL}/api/candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: values.nome,
      whatsapp: values.whatsapp,
      email: values.email,
      location: values.localidade,
      instagram_url: values.instagram,
      prospecting_experience: values.experiencia,
      desired_commission: Number(values.comissao),
      motivation: values.motivacao,
      consent: values.consentimento
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Não foi possível enviar sua candidatura. Tente novamente.");
  }
  status.className = "form-status success";
  status.textContent = "Candidatura enviada com sucesso! Seus dados já estão com a equipe da Hello Inova.";
  form.reset();
  count.textContent = "0";
  return { candidate: values.nome, candidateId: result.candidate?.id, status: "submitted" };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  status.className = "form-status";
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Enviando...";
  try {
    await submitApplication(valuesFromForm());
  } catch (error) {
    status.className = "form-status error";
    status.textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Enviar candidatura";
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
      instagram: { type: "string" },
      experiencia: { type: "string" },
      comissao: { type: "string" },
      motivacao: { type: "string", maxLength: 700 },
      consentimento: { type: "boolean" }
    },
    required: ["nome", "whatsapp", "email", "localidade", "instagram", "experiencia", "comissao", "motivacao", "consentimento"],
    additionalProperties: false
  };
  context.registerTool({
    name: "submit_sdr_application",
    title: "Enviar candidatura para SDR",
    description: "Preenche e envia a candidatura de SDR freelancer para a Hello Inova.",
    inputSchema: schema,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    async execute(input) {
      Object.entries(input).forEach(([name, value]) => {
        const control = form.elements[name];
        if (!control) return;
        if (control.type === "checkbox") control.checked = Boolean(value);
        else control.value = String(value);
      });
      count.textContent = motivation.value.length;
      return submitApplication(valuesFromForm());
    }
  });
}

registerWebMcpTool();
