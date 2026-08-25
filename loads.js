// ===================== LOADS.JS =====================
// 1) Lista de invitados (ejemplo)
const guests = [
  { id: "1", name: "Familia Castillo", passes: 4 },
  { id: "2", name: "Sofia Ramirez", passes: 2 },
  { id: "3", name: "Daniel Morales", passes: 1 },
  { id: "4", name: "Valeria Soto", passes: 2 },
  { id: "5", name: "Familia Herrera", passes: 5 },
];

window.LocalGuestSeeds = {
  ...(window.LocalGuestSeeds || {}),
  vivianmaykol2026: guests.reduce((acc, guest) => {
    acc[String(guest.id)] = {
      id: String(guest.id),
      nombre: guest.name,
      pases: Number(guest.passes || 1),
      activo: true,
    };
    return acc;
  }, {}),
};

window.seedEventGuestsToFirebase = async function seedEventGuestsToFirebase(explicitEventId) {
  const eventId = explicitEventId || window.config?.event?.defaultEventId || "vivianmaykol2026";
  const rsvpDB = window.RSVPDatabase;

  if (!rsvpDB?.migrateLocalGuestsToFirebase) {
    console.warn("RSVPDatabase no está disponible. Revisa que database.js esté cargado.");
    return { ok: false, guests: 0 };
  }

  await rsvpDB.seedEventConfigToFirebase?.(eventId, { force: true });
  const result = await rsvpDB.migrateLocalGuestsToFirebase(eventId, { force: true });
  console.log(`Invitados creados en Firebase: ${result.total || guests.length}`);
  return { ok: true, guests: result.total || guests.length };
};

// Helper: leer parámetros ?id=1
function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

document.addEventListener("DOMContentLoaded", () => {
  const guestId = getQueryParam("id");

  // Si no hay id, no marcamos error: solo no hay invitado
  if (!guestId) {
    window.currentGuest = null;
    return;
  }

  const guest = guests.find((g) => String(g.id) === String(guestId));

  if (guest) {
    window.currentGuest = guest;

    // Si tienes estos elementos en alguna parte, los llena (opcional)
    const guestNameEl = document.getElementById("guest-name");
    const passesEl = document.getElementById("passes");

    if (guestNameEl) guestNameEl.textContent = guest.name;
    if (passesEl) {
      const p = Number(guest.passes || 1);
      passesEl.textContent = `${p} ${p === 1 ? "pase" : "pases"}`;
    }
  } else {
    window.currentGuest = null;

    const guestNameEl = document.getElementById("guest-name");
    if (guestNameEl) guestNameEl.textContent = "Invitado no encontrado";
  }
});
