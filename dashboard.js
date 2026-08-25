(function () {
  const state = {
    eventId: "",
    invitados: [],
    confirmaciones: [],
    search: "",
    filter: "todos",
  };

  function getConfigEventId() {
    const params = new URLSearchParams(window.location.search || "");
    const paramName = window.config?.event?.eventIdParam || "eventId";
    return String(params.get(paramName) || window.config?.event?.defaultEventId || "").trim();
  }

  function getCoupleName() {
    return window.config?.pareja?.nombres || "Vivian & Maykol";
  }

  function getHeadingSubtitle() {
    const fecha = window.config?.pareja?.fechaVisible || "29.11.2026";
    return `Confirmaciones del evento ${fecha}`;
  }

  function normalizeResponse(value) {
    const safe = String(value || "").trim().toLowerCase();
    if (safe === "si") return "si";
    if (safe === "no") return "no";
    return "pendiente";
  }

  function formatDate(value) {
    if (!value) return "--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleString("es-GT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function buildRows() {
    const invitedMap = new Map();
    state.invitados.forEach((item) => {
      if (!item || item.activo === false) return;
      invitedMap.set(String(item.id), {
        id: String(item.id),
        nombre: String(item.nombre || "Invitado").trim() || "Invitado",
        pasesAsignados: Math.max(1, Number(item.pases || 1) || 1),
        respuesta: "pendiente",
        cantidadConfirmada: 0,
        fechaConfirmacion: null,
      });
    });

    state.confirmaciones.forEach((item) => {
      if (!item) return;
      const id = String(item.id || "").trim();
      if (!id) return;

      const base = invitedMap.get(id) || {
        id,
        nombre: String(item.nombre || "Invitado").trim() || "Invitado",
        pasesAsignados: Math.max(1, Number(item.pasesAsignados || 1) || 1),
      };

      invitedMap.set(id, {
        ...base,
        respuesta: normalizeResponse(item.respuesta),
        cantidadConfirmada: Math.max(0, Number(item.cantidadConfirmada) || 0),
        fechaConfirmacion: Number(item.fechaConfirmacion) || null,
      });
    });

    return Array.from(invitedMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }

  function getFilteredRows(rows) {
    return rows.filter((row) => {
      if (state.filter !== "todos" && row.respuesta !== state.filter) return false;
      if (!state.search) return true;
      return row.nombre.toLowerCase().includes(state.search);
    });
  }

  function updateSummary(rows) {
    const totals = rows.reduce((acc, row) => {
      acc.total += 1;
      if (row.respuesta === "si") {
        acc.yes += 1;
        acc.people += Math.max(0, Number(row.cantidadConfirmada) || 0);
      } else if (row.respuesta === "no") {
        acc.no += 1;
      } else {
        acc.pending += 1;
      }
      return acc;
    }, { total: 0, yes: 0, no: 0, pending: 0, people: 0 });

    document.getElementById("summary-total-guests").textContent = String(totals.total);
    document.getElementById("summary-yes").textContent = String(totals.yes);
    document.getElementById("summary-no").textContent = String(totals.no);
    document.getElementById("summary-pending").textContent = String(totals.pending);
    document.getElementById("summary-confirmed-people").textContent = String(totals.people);
  }

  function renderTable(rows) {
    const tbody = document.getElementById("confirmations-table-body");
    const mobileList = document.getElementById("confirmations-mobile-list");

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay resultados para mostrar.</td></tr>';
      mobileList.innerHTML = '<div class="empty-state">No hay resultados para mostrar.</div>';
      return;
    }

    tbody.innerHTML = rows.map((row) => `
      <tr>
        <td>${escapeHtml(row.id)}</td>
        <td>${escapeHtml(row.nombre)}</td>
        <td>${escapeHtml(row.pasesAsignados)}</td>
        <td><span class="status-badge status-${escapeHtml(row.respuesta)}">${escapeHtml(row.respuesta === "si" ? "Confirmado" : row.respuesta === "no" ? "No asiste" : "Pendiente")}</span></td>
        <td>${escapeHtml(row.cantidadConfirmada || 0)}</td>
        <td>${escapeHtml(formatDate(row.fechaConfirmacion))}</td>
      </tr>
    `).join("");

    mobileList.innerHTML = rows.map((row) => `
      <article class="mobile-card">
        <h3>${escapeHtml(row.nombre)}</h3>
        <div class="mobile-row"><span>ID</span><strong>${escapeHtml(row.id)}</strong></div>
        <div class="mobile-row"><span>Pases</span><strong>${escapeHtml(row.pasesAsignados)}</strong></div>
        <div class="mobile-row"><span>Respuesta</span><strong>${escapeHtml(row.respuesta === "si" ? "Confirmado" : row.respuesta === "no" ? "No asiste" : "Pendiente")}</strong></div>
        <div class="mobile-row"><span>Confirmados</span><strong>${escapeHtml(row.cantidadConfirmada || 0)}</strong></div>
        <div class="mobile-row"><span>Fecha</span><strong>${escapeHtml(formatDate(row.fechaConfirmacion))}</strong></div>
      </article>
    `).join("");
  }

  function exportCsv(rows) {
    const header = ["ID", "Nombre", "Pases asignados", "Respuesta", "Cantidad confirmada", "Fecha de confirmación"];
    const csvRows = rows.map((row) => [
      row.id,
      row.nombre,
      row.pasesAsignados,
      row.respuesta,
      row.cantidadConfirmada,
      formatDate(row.fechaConfirmacion),
    ]);

    const csv = [header, ...csvRows]
      .map((line) => line.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const safeEventId = state.eventId || "evento";
    link.href = URL.createObjectURL(blob);
    link.download = `confirmaciones-rsvp-${safeEventId}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function render() {
    const rows = buildRows();
    updateSummary(rows);
    renderTable(getFilteredRows(rows));
  }

  function bindEvents() {
    document.getElementById("dashboard-search")?.addEventListener("input", (event) => {
      state.search = String(event.target.value || "").trim().toLowerCase();
      render();
    });

    document.getElementById("dashboard-clear")?.addEventListener("click", () => {
      state.search = "";
      document.getElementById("dashboard-search").value = "";
      render();
    });

    document.getElementById("dashboard-export")?.addEventListener("click", () => {
      exportCsv(getFilteredRows(buildRows()));
    });

    document.querySelectorAll(".filter-chip").forEach((button) => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter || "todos";
        document.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("is-active"));
        button.classList.add("is-active");
        render();
      });
    });
  }

  function init() {
    state.eventId = getConfigEventId();
    document.getElementById("dashboard-heading").textContent = getCoupleName();
    document.getElementById("dashboard-subtitle").textContent = getHeadingSubtitle();
    document.getElementById("dashboard-event-current").textContent = `Evento activo: ${state.eventId}`;

    bindEvents();

    const db = window.RSVPDatabase;
    if (!db?.subscribeToInvitados || !db?.subscribeToConfirmations) {
      render();
      return;
    }

    db.subscribeToInvitados(state.eventId, (items) => {
      state.invitados = Array.isArray(items) ? items : [];
      render();
    }, console.error);

    db.subscribeToConfirmations(state.eventId, (items) => {
      state.confirmaciones = Array.isArray(items) ? items : [];
      render();
    }, console.error);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
