import { getApp, getApps, initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { get, getDatabase, onValue, push, ref, set } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = window.firebaseConfig;

if (!firebaseConfig || !firebaseConfig.databaseURL) {
  console.error("[Firebase] Configuración no disponible. Revisa config.js.");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, firebaseConfig.databaseURL);

window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseReady = true;

function sanitizeFirebaseKey(value) {
  const raw = String(value || "").trim() || "default-event";
  return raw.replace(/[.#$\[\]/]/g, "_");
}

function resolveEventId(explicitEventId) {
  return sanitizeFirebaseKey(
    explicitEventId
    || window.currentEventId
    || window.config?.event?.defaultEventId
    || "default-event"
  );
}

function getEventBasePath(eventId) {
  return `eventos/${resolveEventId(eventId)}`;
}

function getEventConfigPath(eventId) {
  return `${getEventBasePath(eventId)}/config`;
}

function getEventInvitadosPath(eventId) {
  return `${getEventBasePath(eventId)}/invitados`;
}

function getEventDeseosPath(eventId) {
  return `${getEventBasePath(eventId)}/deseos`;
}

function getEventRsvpPath(eventId) {
  return `${getEventBasePath(eventId)}/rsvp`;
}

function getEventRsvpRecordPath(eventId, guestId) {
  return `${getEventRsvpPath(eventId)}/${sanitizeFirebaseKey(guestId)}`;
}

function buildEventConfigSeedPayload(source = window.config) {
  if (!source) return null;
  return {
    eventId: resolveEventId(source?.event?.defaultEventId),
    bride: "Vivian Gálvez",
    groom: "Maykol Roblero",
    date: "2026-11-29",
    time: "16:00",
    timezone: "America/Guatemala",
    venue: source?.evento?.ceremonia?.lugar || "Conceptio",
    reception: source?.evento?.recepcion?.lugar || "Conceptio"
  };
}

async function seedEventConfigToFirebase(eventId, options = {}) {
  const safeEventId = resolveEventId(eventId);
  const configRef = ref(db, getEventConfigPath(safeEventId));

  if (!options.force) {
    const snapshot = await get(configRef);
    if (snapshot.exists()) {
      return { ok: true, skipped: true, eventId: safeEventId, payload: snapshot.val() };
    }
  }

  const payload = buildEventConfigSeedPayload();
  await set(configRef, payload);
  return { ok: true, skipped: false, eventId: safeEventId, payload };
}

async function migrateLocalGuestsToFirebase(eventId, options = {}) {
  const safeEventId = resolveEventId(eventId);
  const invitadosRef = ref(db, getEventInvitadosPath(safeEventId));

  if (!options.force) {
    const snapshot = await get(invitadosRef);
    if (snapshot.exists()) {
      return { ok: true, skipped: true, total: Object.keys(snapshot.val() || {}).length };
    }
  }

  const seeds = window.LocalGuestSeeds?.[safeEventId] || {};
  await set(invitadosRef, seeds);
  return { ok: true, skipped: false, total: Object.keys(seeds).length };
}

async function getInvitadoById(eventId, guestId) {
  const safeEventId = resolveEventId(eventId);
  const snapshot = await get(ref(db, `${getEventInvitadosPath(safeEventId)}/${sanitizeFirebaseKey(guestId)}`));
  return snapshot.exists() ? snapshot.val() : null;
}

async function getConfirmationByGuestId(eventId, guestId) {
  const snapshot = await get(ref(db, getEventRsvpRecordPath(resolveEventId(eventId), guestId)));
  return snapshot.exists() ? snapshot.val() : null;
}

async function saveConfirmation(eventId, confirmation) {
  const guestId = sanitizeFirebaseKey(confirmation?.id || confirmation?.guestId);
  const payload = {
    id: String(confirmation?.id || confirmation?.guestId || guestId),
    nombre: String(confirmation?.nombre || "Invitado").trim() || "Invitado",
    pasesAsignados: Math.max(0, Number(confirmation?.pasesAsignados) || 0),
    respuesta: String(confirmation?.respuesta || "pendiente").trim().toLowerCase() === "no" ? "no" : "si",
    cantidadConfirmada: String(confirmation?.respuesta || "").trim().toLowerCase() === "no"
      ? 0
      : Math.max(0, Number(confirmation?.cantidadConfirmada) || 0),
    fechaConfirmacion: Number(confirmation?.fechaConfirmacion) || Date.now(),
  };

  await set(ref(db, getEventRsvpRecordPath(resolveEventId(eventId), guestId)), payload);
  return payload;
}

function mapSnapshotToArray(snapshot) {
  const raw = snapshot?.val();
  if (!raw || typeof raw !== "object") return [];

  return Object.entries(raw)
    .filter(([, value]) => value && typeof value === "object")
    .map(([key, value]) => ({
      id: String(value.id || key),
      ...value,
    }));
}

function subscribeToConfirmations(eventId, callback, onError) {
  return onValue(
    ref(db, getEventRsvpPath(resolveEventId(eventId))),
    (snapshot) => callback(mapSnapshotToArray(snapshot)),
    onError
  );
}

function subscribeToInvitados(eventId, callback, onError) {
  return onValue(
    ref(db, getEventInvitadosPath(resolveEventId(eventId))),
    (snapshot) => callback(mapSnapshotToArray(snapshot).sort((a, b) => String(a?.nombre || "").localeCompare(String(b?.nombre || ""), "es"))),
    onError
  );
}

async function updateInvitado(eventId, guestId, payload) {
  const targetEventId = resolveEventId(eventId);
  const targetGuestId = sanitizeFirebaseKey(guestId);
  const current = await getInvitadoById(targetEventId, targetGuestId);
  const next = {
    id: String(payload?.id || current?.id || targetGuestId),
    nombre: String(payload?.nombre || current?.nombre || "Invitado").trim() || "Invitado",
    pases: Math.max(1, Number(payload?.pases ?? current?.pases ?? 1) || 1),
    activo: typeof payload?.activo === "boolean" ? payload.activo : (typeof current?.activo === "boolean" ? current.activo : true),
  };

  await set(ref(db, `${getEventInvitadosPath(targetEventId)}/${targetGuestId}`), next);
  return next;
}

async function deleteInvitado(eventId, guestId) {
  const current = await getInvitadoById(eventId, guestId);
  if (!current) return null;
  return updateInvitado(eventId, guestId, { ...current, activo: false });
}

async function saveWish(eventId, wish) {
  const wishesRef = ref(db, getEventDeseosPath(resolveEventId(eventId)));
  return push(wishesRef, wish);
}

function subscribeToWishes(eventId, callback, onError) {
  return onValue(
    ref(db, getEventDeseosPath(resolveEventId(eventId))),
    (snapshot) => {
      const raw = snapshot.val() || {};
      callback(Object.values(raw));
    },
    onError
  );
}

window.RSVPDatabase = {
  resolveEventId,
  getEventBasePath,
  getEventConfigPath,
  getEventInvitadosPath,
  getEventDeseosPath,
  getEventRsvpPath,
  seedEventConfigToFirebase,
  migrateLocalGuestsToFirebase,
  getInvitadoById,
  getConfirmationByGuestId,
  saveConfirmation,
  subscribeToConfirmations,
  subscribeToInvitados,
  updateInvitado,
  deleteInvitado,
  saveWish,
  subscribeToWishes
};

window.seedEventConfigToFirebase = seedEventConfigToFirebase;
