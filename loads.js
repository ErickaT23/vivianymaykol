// ===================== LOADS.JS =====================
// 1) Lista de invitados (ejemplo)
const guests = [
  { id: "1", name: "Raúl Mazariegos & Guadalupe M.", passes: 2 },
  { id: "2", name: "Luis Mazariegos & Ehel M.", passes: 2 },
  { id: "3", name: "Hugo Mazariegos & Argelia M.", passes: 3 },
  { id: "4", name: "Wilson Mazariegos & Brenda M.", passes: 1 },
  { id: "5", name: "Victoria Turcios & Catherine, Caroline.", passes: 3 },
  { id: "6", name: "Antonio López & Norma M.", passes: 2 },
  { id: "7", name: "Greis García.", passes: 1 },
  { id: "8", name: "Raúl A. Mazariegos & Laken J.", passes: 2 },
  { id: "9", name: "Emanuel López Ruiz & Meilin L.", passes: 2 },
  { id: "10", name: "Marvin Ralon López & Juana R.", passes: 2 },
  { id: "11", name: "Steven Mazariegos & Karla M.", passes: 2 },
  { id: "12", name: "Gretel Gálvez.", passes: 1 },
  { id: "13", name: "Rosaura Mazariegos & Marco G.", passes: 2 },
  { id: "14", name: "Luis Carlos Gálvez.", passes: 1 },
  { id: "15", name: "René Escobar & Adda G.", passes: 5 },
  { id: "16", name: "Marco Gálvez.", passes: 1 },
  { id: "17", name: "Libdari Rubio.", passes: 1 },
  { id: "18", name: "Issela Ramos & Aliyah.", passes: 2 },
  { id: "19", name: "Alejandro Caballero & Dairi C.", passes: 2 },
  { id: "20", name: "Luis Fuentes & Astrid R.", passes: 2 },
  { id: "21", name: "Yvonne Hernández.", passes: 1 },
  { id: "22", name: "Nish Kapadia & Poonam.", passes: 2 },
  { id: "23", name: "Juan Cruz & Crystal.", passes: 2 },
  { id: "24", name: "Amy Oliver & Kimberly.", passes: 2 },
  { id: "25", name: "María Roldán.", passes: 1 },
  { id: "26", name: "María Santisteban.", passes: 1 },
  { id: "27", name: "Pauly Méndez & Rolman.", passes: 1 },
  { id: "28", name: "José Ruiz & Raquel.", passes: 2 },
  { id: "29", name: "Edgar Escobar.", passes: 1 },
  { id: "30", name: "Alva Velasquez & José.", passes: 2 },
  { id: "31", name: "Pedro Orozco & Guisela.", passes: 2 },
  { id: "32", name: "Mario Castro & Karina.", passes: 2 },
  { id: "33", name: "Rocio De León.", passes: 1 },
  { id: "34", name: "Kelvin De León & Vilma.", passes: 2 },
  { id: "35", name: "Jhony De León & Sheyla.", passes: 2 },
  { id: "36", name: "Urias Roblero.", passes: 1 },
  { id: "37", name: "Eliud Roblero & Gabriela.", passes: 2 },
  { id: "38", name: "Aurelia Roblero.", passes: 1 },
  { id: "39", name: "Dina Roblero & Edison.", passes: 2 },
  { id: "40", name: "Guillermina Roblero & Selvin.", passes: 2 },
  { id: "41", name: "Duglas Roblero & Esposa.", passes: 2 },
  { id: "42", name: "Arnoldo Roblero.", passes: 1 },
  { id: "43", name: "Onésimo González & Esposa.", passes: 2 },
  { id: "44", name: "Eldai Bartolón & Esposa.", passes: 2 },
  { id: "45", name: "Enoher Bartolón & Esposa.", passes: 2 },
  { id: "46", name: "América Espinoza & Esposo .", passes: 2 },
  { id: "47", name: "Azucena Sandoval & David.", passes: 2 },
  { id: "48", name: "Dalila Rodríguez & Antonio.", passes: 2 },
  { id: "49", name: "Mario Fernández & Rebeca.", passes: 2 },
  { id: "50", name: "Eduardo Herrera & Elissa.", passes: 2 },
  { id: "51", name: "Julio Santizo & Dayana.", passes: 2 },
  { id: "52", name: "Daniel Mazariegos.", passes: 1 },
  { id: "53", name: "Linda Santizo.", passes: 1 },
  { id: "54", name: "Jessica Pernillo.", passes: 1 },
  { id: "55", name: "Cristian Miranda & Susan.", passes: 2 },
  { id: "56", name: "Armando Roblero & Joseph, Jostin, Sebastian.", passes: 4 },
  { id: "57", name: "Jefferson Roblero & Aleydis, Valentina.", passes: 3 },
  { id: "58", name: "Esdras Hernández & Esposa.", passes: 2 },
  { id: "59", name: "Marieta Velázques & Enmanuel.", passes: 2 },
  { id: "60", name: "Nilton Samayoa & Marisol.", passes: 2 },
  { id: "61", name: "Marco Pablo Sierra & Esposa.", passes: 2 },
  { id: "62", name: "Kenneth López.", passes: 1 },
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

function paintGuestCard(guest) {
  const nameEl = document.getElementById("guestCardName");
  const seatsEl = document.getElementById("guestCardSeats");
  const seatsTxtEl = document.getElementById("guestCardSeatsTxt");
  const passes = Math.max(1, Number(guest?.passes || 1));

  if (nameEl) nameEl.textContent = guest?.name || "Nombre del invitado";
  if (seatsEl) seatsEl.textContent = guest ? String(passes) : "x";
  if (seatsTxtEl) seatsTxtEl.textContent = passes === 1 ? "lugar" : "lugares";
}

function notifyGuestUpdated() {
  window.dispatchEvent(new CustomEvent("guest:updated", { detail: window.currentGuest || null }));
}

document.addEventListener("DOMContentLoaded", () => {
  const guestId = getQueryParam("id");

  // Si no hay id, no marcamos error: solo no hay invitado
  if (!guestId) {
    window.currentGuest = null;
    paintGuestCard(null);
    notifyGuestUpdated();
    return;
  }

  const guest = guests.find((g) => String(g.id) === String(guestId));

  if (guest) {
    window.currentGuest = guest;
    paintGuestCard(guest);
    notifyGuestUpdated();

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
    paintGuestCard(null);
    notifyGuestUpdated();

    const guestNameEl = document.getElementById("guest-name");
    if (guestNameEl) guestNameEl.textContent = "Invitado no encontrado";
  }
});
