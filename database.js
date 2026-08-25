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

function buildEventConfigSeedPayload(source = window.config) {
  if (!source) return null;
  return {
    eventId: resolveEventId(source?.event?.defaultEventId),
    bride: "Carolina López",
    groom: "Anthony de León López",
    date: "2026-12-26",
    time: "15:00",
    timezone: "America/Guatemala",
    venue: "Hacienda San Isidro",
    reception: "Hacienda San Isidro"
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
  saveWish,
  subscribeToWishes
};

window.seedEventConfigToFirebase = seedEventConfigToFirebase;
