import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getDatabase, onValue, push, ref } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqOZQ5YFOdhL6dblHI5wIx10m6n4xt2Fg",
  authDomain: "buenosdeseos-twodesign.firebaseapp.com",
  databaseURL: "https://buenosdeseos-twodesign-default-rtdb.firebaseio.com",
  projectId: "buenosdeseos-twodesign",
  storageBucket: "buenosdeseos-twodesign.firebasestorage.app",
  messagingSenderId: "577908051871",
  appId: "1:577908051871:web:27fbd4e06b3d18da14b7aa"
};

const EVENT_ID = "anthonycarolina2026";
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app, firebaseConfig.databaseURL);
const wishesRef = ref(db, `eventos/${EVENT_ID}/deseos`);

function togglePanel(panel, trigger) {
  if (!panel) return;
  const isOpen = panel.classList.toggle("is-open");
  panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (trigger) trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function renderWishes(snapshot) {
  const list = document.getElementById("wishes");
  if (!list) return;

  const value = snapshot.val();
  const items = value ? Object.values(value) : [];
  items.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));

  if (items.length === 0) {
    list.innerHTML = '<p class="wishes-empty">Aún no hay mensajes. Sé el primero en dejarnos uno.</p>';
    return;
  }

  list.innerHTML = "";
  items.slice(0, 40).forEach((wish) => {
    const card = document.createElement("article");
    card.className = "wish-card";

    const name = document.createElement("strong");
    name.textContent = wish.nombre || "Invitado";

    const message = document.createElement("p");
    message.textContent = wish.mensaje || "";

    card.append(name, message);
    list.appendChild(card);
  });
}

async function handleWishSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const name = document.getElementById("wish-name");
  const message = document.getElementById("wish-message");
  const status = document.getElementById("wish-status");
  const nombre = String(name?.value || "").trim();
  const mensaje = String(message?.value || "").trim();

  if (!nombre || !mensaje) {
    if (status) status.textContent = "Completa tu nombre y mensaje para continuar.";
    return;
  }

  try {
    await push(wishesRef, { nombre, mensaje, timestamp: Date.now() });
    form.reset();
    if (status) status.textContent = "Gracias por compartir tus buenos deseos.";
  } catch (error) {
    console.error("No se pudo guardar el mensaje:", error);
    if (status) status.textContent = "No se pudo enviar el mensaje. Intenta nuevamente.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnToggleWishForm = document.getElementById("btnToggleWishForm");
  const btnToggleWishes = document.getElementById("btnToggleWishes");
  const wishFormPanel = document.getElementById("wishFormPanel");
  const wishesPanel = document.getElementById("wishesPanel");
  const wishForm = document.getElementById("wish-form");

  btnToggleWishForm?.addEventListener("click", () => togglePanel(wishFormPanel, btnToggleWishForm));
  btnToggleWishes?.addEventListener("click", () => togglePanel(wishesPanel, btnToggleWishes));
  wishForm?.addEventListener("submit", handleWishSubmit);

  onValue(wishesRef, renderWishes, (error) => {
    console.error("No se pudieron cargar los buenos deseos:", error);
    const list = document.getElementById("wishes");
    if (list) list.innerHTML = '<p class="wishes-empty">No se pudieron cargar los mensajes por el momento.</p>';
  });
});
