(function () {
  const state = {
    eventId: "",
    invitados: [],
    confirmaciones: [],
  };

  function getEl(id) {
    return document.getElementById(id);
  }

  function getParams() {
    const params = new URLSearchParams(window.location.search || "");
    const keyParam = window.config?.admin?.keyParam || "key";
    const legacyParam = window.config?.admin?.legacyKeyParam || "admin";
    return {
      key: String(params.get(keyParam) || params.get(legacyParam) || "").trim(),
      eventId: String(params.get(window.config?.event?.eventIdParam || "eventId") || window.config?.event?.defaultEventId || "").trim(),
    };
  }

  function isValidKey(value) {
    return value && value === String(window.config?.admin?.adminKey || "").trim();
  }

  function setStatus(message, isError = false) {
    const el = getEl("admin-status");
    if (!el) return;
    el.textContent = message;
    el.style.color = isError ? "#8b1e1e" : "#6a6470";
  }

  function normalizeResponse(value) {
    const safe = String(value || "").trim().toLowerCase();
    if (safe === "si") return "Confirmado";
    if (safe === "no") return "No asiste";
    return "Pendiente";
  }

  function buildRows() {
    const confirmMap = new Map();
    state.confirmaciones.forEach((item) => {
      if (!item?.id) return;
      confirmMap.set(String(item.id), item);
    });

    return state.invitados
      .map((guest) => {
        const confirmation = confirmMap.get(String(guest.id));
        return {
          id: String(guest.id),
          nombre: String(guest.nombre || "Invitado").trim() || "Invitado",
          pases: Math.max(1, Number(guest.pases || 1) || 1),
          activo: guest.activo !== false,
          respuesta: normalizeResponse(confirmation?.respuesta),
        };
      })
      .sort((a, b) => Number(a.id) - Number(b.id));
  }

  function updateMetrics(rows) {
    const summary = rows.reduce((acc, row) => {
      if (row.activo) acc.total += 1;
      if (row.respuesta === "Confirmado") acc.yes += 1;
      else if (row.respuesta === "No asiste") acc.no += 1;
      else if (row.activo) acc.pending += 1;
      return acc;
    }, { total: 0, yes: 0, no: 0, pending: 0 });

    getEl("metric-total").textContent = String(summary.total);
    getEl("metric-yes").textContent = String(summary.yes);
    getEl("metric-no").textContent = String(summary.no);
    getEl("metric-pending").textContent = String(summary.pending);
  }

  function getInviteLink(id) {
    const params = new URLSearchParams();
    params.set(window.config?.event?.eventIdParam || "eventId", state.eventId);
    params.set("id", String(id));
    return `${window.location.origin}${window.location.pathname.replace(/admin\.html$/, "index.html")}?${params.toString()}`;
  }

  async function copyText(value) {
    await navigator.clipboard.writeText(value);
  }

  async function copyAllLinks() {
    try {
      const rows = buildRows().filter((row) => row.activo);
      const text = rows.map((row) => `${row.nombre} - ${getInviteLink(row.id)}`).join("\n");
      await copyText(text);
      setStatus("Links copiados correctamente.");
    } catch (error) {
      console.error(error);
      setStatus("No se pudieron copiar los links.", true);
    }
  }

  async function saveGuest(payload) {
    const db = window.RSVPDatabase;
    if (!db?.updateInvitado) {
      setStatus("RSVPDatabase no está disponible.", true);
      return;
    }

    const numericIds = state.invitados
      .map((item) => Number(item.id))
      .filter((value) => Number.isFinite(value));
    const nextId = String((numericIds.length ? Math.max(...numericIds) : 0) + 1);

    await db.updateInvitado(state.eventId, nextId, {
      id: nextId,
      nombre: payload.nombre,
      pases: payload.pases,
      activo: payload.activo,
    });
  }

  async function editGuest(row) {
    const nombre = window.prompt("Nombre del invitado", row.nombre);
    if (!nombre) return;

    const pasesRaw = window.prompt("Cantidad de pases", String(row.pases));
    if (!pasesRaw) return;

    const pases = Math.max(1, Number(pasesRaw) || row.pases || 1);

    try {
      await window.RSVPDatabase.updateInvitado(state.eventId, row.id, {
        id: row.id,
        nombre,
        pases,
        activo: row.activo,
      });
      setStatus("Invitado actualizado.");
    } catch (error) {
      console.error(error);
      setStatus("No se pudo actualizar el invitado.", true);
    }
  }

  async function toggleGuest(row) {
    try {
      await window.RSVPDatabase.updateInvitado(state.eventId, row.id, {
        id: row.id,
        nombre: row.nombre,
        pases: row.pases,
        activo: !row.activo,
      });
      setStatus(row.activo ? "Invitado desactivado." : "Invitado reactivado.");
    } catch (error) {
      console.error(error);
      setStatus("No se pudo actualizar el estado del invitado.", true);
    }
  }

  function renderRows() {
    const rows = buildRows();
    updateMetrics(rows);

    getEl("admin-rows").innerHTML = rows.map((row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.nombre}</td>
        <td>${row.pases}</td>
        <td>${row.respuesta}</td>
        <td>${row.activo ? "Sí" : "No"}</td>
        <td>
          <div class="actions">
            <button type="button" class="btn-mini" data-action="copy" data-id="${row.id}">Copiar link</button>
            <button type="button" class="btn-mini" data-action="edit" data-id="${row.id}">Editar</button>
            <button type="button" class="btn-mini btn-mini-danger" data-action="toggle" data-id="${row.id}">${row.activo ? "Desactivar" : "Activar"}</button>
          </div>
        </td>
      </tr>
    `).join("");

    Array.from(document.querySelectorAll("[data-action]")).forEach((button) => {
      button.addEventListener("click", async () => {
        const row = rows.find((item) => item.id === button.dataset.id);
        if (!row) return;

        if (button.dataset.action === "copy") {
          await copyText(getInviteLink(row.id));
          setStatus("Link copiado correctamente.");
          return;
        }

        if (button.dataset.action === "edit") {
          await editGuest(row);
          return;
        }

        if (button.dataset.action === "toggle") {
          await toggleGuest(row);
        }
      });
    });
  }

  async function createEvent() {
    try {
      setStatus("Creando evento en Firebase...");
      await window.seedEventConfigToFirebase?.(state.eventId, { force: true });
      await window.seedEventGuestsToFirebase?.(state.eventId);
      setStatus("Evento y lista base creados/actualizados en Firebase.");
    } catch (error) {
      console.error(error);
      setStatus("No se pudo crear el evento en Firebase.", true);
    }
  }

  function bindEvents() {
    getEl("btn-copy-links")?.addEventListener("click", copyAllLinks);
    getEl("btn-seed")?.addEventListener("click", createEvent);

    getEl("invite-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nombre = String(getEl("invite-name")?.value || "").trim();
      const pases = Math.max(1, Number(getEl("invite-pases")?.value || 1) || 1);
      const activo = Boolean(getEl("invite-active")?.checked);

      if (!nombre) {
        setStatus("Ingresa un nombre válido.", true);
        return;
      }

      try {
        await saveGuest({ nombre, pases, activo });
        event.currentTarget.reset();
        getEl("invite-pases").value = "1";
        getEl("invite-active").checked = true;
        setStatus("Invitado guardado correctamente.");
      } catch (error) {
        console.error(error);
        setStatus("No se pudo guardar el invitado.", true);
      }
    });
  }

  function initSubscriptions() {
    const db = window.RSVPDatabase;
    if (!db?.subscribeToInvitados || !db?.subscribeToConfirmations) {
      setStatus("RSVPDatabase no está disponible.", true);
      return;
    }

    db.subscribeToInvitados(state.eventId, (items) => {
      state.invitados = Array.isArray(items) ? items : [];
      renderRows();
    }, console.error);

    db.subscribeToConfirmations(state.eventId, (items) => {
      state.confirmaciones = Array.isArray(items) ? items : [];
      renderRows();
    }, console.error);
  }

  function init() {
    const params = getParams();
    if (!isValidKey(params.key)) {
      getEl("restricted")?.classList.remove("hidden");
      return;
    }

    state.eventId = params.eventId;
    getEl("admin-app")?.classList.remove("hidden");
    getEl("active-event-id").textContent = state.eventId;
    getEl("admin-couple").textContent = window.config?.pareja?.nombres || "Vivian & Maykol";

    bindEvents();
    initSubscriptions();
    setStatus("Panel listo.");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
