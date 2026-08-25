// ===================== SCRIPT.JS (MODELO EDITORIAL) =====================
// ⚠️ IMPORTANTE: NO usar "$" porque rsvp.js ya lo usa.
// Usamos "$$" para evitar conflicto.
const $$ = (s) => document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
  // 1) Pintar invitado en portada (desde loads.js)
  paintGuestCard();

  // 2) Botón abrir invitación
  const btnOpenInvite = $$("#btnOpenInvite");
  const btnOpenEnvelope = $$("#btnOpenEnvelope");
  if (btnOpenInvite) {
    btnOpenInvite.addEventListener("click", openInvitation);
  }
  if (btnOpenEnvelope) {
    btnOpenEnvelope.addEventListener("click", openInvitation);
    btnOpenEnvelope.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openInvitation();
      }
    });
  }

  // 3) Animaciones al hacer scroll
  initScrollReveal();

  initGoldReveal();

  // 4) Música
  initMusic();

  // 5) Contador
  initCountdown(2026, 11, 29, 16, 0, 0);

  // 6) Separadores rotativos
  initRotatingSep("rotatingSepImg", [
    "Images/F1.png",
    "Images/F2.png",
  ]);
  initRotatingSep("celebrationSepImg", [
    "Images/C1.png",
    "Images/C2.png",
    "Images/C3.png",
    "Images/C4.png",
    "Images/C5.png",
  ]);
  initRotatingSep("storySepImg", [
    "Images/S1.png",
    "Images/S2.png",
    "Images/S3.png",
    "Images/S4.png",
    "Images/S5.png",
  ]);
});

/* ===================== INVITADO EN PORTADA ===================== */
function paintGuestCard() {
  const nameEl = $$("#guestCardName");
  const seatsEl = $$("#guestCardSeats");
  const seatsTxtEl = $$("#guestCardSeatsTxt");

  // Si no existen (por si aún no pegaste el HTML), no rompe
  if (!nameEl || !seatsEl) return;

  const g = window.currentGuest;

  if (g && g.name) {
    nameEl.textContent = g.name;
    const p = Number(g.passes || 1);
    seatsEl.textContent = String(p);
    if (seatsTxtEl) seatsTxtEl.textContent = p === 1 ? "lugar" : "lugares";
  } else {
    // Si entraste sin ?id=
    nameEl.textContent = "Nombre del invitado";
    seatsEl.textContent = "x";
    if (seatsTxtEl) seatsTxtEl.textContent = "lugares";
  }
}

/* ===================== ABRIR INVITACIÓN ===================== */
function openInvitation() {
  const cover = $$("#cover");
  const main = $$("#invitation");

  if (!cover || !main) return;

  // Ocultar portada con animación
  cover.classList.add("is-hidden");

  setTimeout(async () => {
    cover.style.display = "none";

    // Mostrar invitación
    main.classList.add("is-open");
    main.setAttribute("aria-hidden", "false");
    document.body.classList.add("invitation-open");
    initCountdown(2026, 11, 29, 16, 0, 0);

    // ✅ Reproducir música automáticamente (por el click del usuario)
    await autoplayMusic();

    // Scroll suave al hero
    setTimeout(() => {
      $$("#hero")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

  }, 600);
}

/* ===================== REVEAL AL SCROLL ===================== */
function initScrollReveal() {
  const els = document.querySelectorAll(".fade-in-element");
  if (!els || els.length === 0) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => obs.observe(el));
}

/* ================= Animar True Love ================= */
function initGoldReveal() {
  const el = document.querySelector(".reveal-gold");
  if (!el) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.5 }
  );

  obs.observe(el);
}

/* ===================== MÚSICA ===================== */
/* ===================== MÚSICA ===================== */
function initMusic() {
  const btn = $$("#btnMusic");
  const audio = $$("#bgMusic");
  if (!btn || !audio) return;

  audio.loop = true;
  updateMusicButton(btn, false);

  btn.addEventListener("click", async () => {
    try {
      if (audio.paused) {
        await audio.play();
        updateMusicButton(btn, true);
      } else {
        audio.pause();
        updateMusicButton(btn, false);
      }
    } catch (e) {
      console.warn("No se pudo reproducir audio:", e);
    }
  });

  audio.addEventListener("play", () => updateMusicButton(btn, true));
  audio.addEventListener("pause", () => updateMusicButton(btn, false));
}

/* ===================== AUTO-PLAY AL ABRIR ===================== */
async function autoplayMusic() {
  const btn = $$("#btnMusic");
  const audio = $$("#bgMusic");
  if (!btn || !audio) return;

  try {
    audio.loop = true;
    await audio.play();
    updateMusicButton(btn, true);
  } catch (e) {
    console.warn("Auto-play bloqueado:", e);
    updateMusicButton(btn, false);
  }
}

function updateMusicButton(btn, isPlaying) {
  if (!btn) return;

  btn.innerHTML = isPlaying
    ? '<i class="fa-solid fa-pause" aria-hidden="true"></i>'
    : '<i class="fa-solid fa-play" aria-hidden="true"></i>';
  btn.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
}

/* ===================== CONTADOR ===================== */
function initCountdown(year, month, day, hours = 0, minutes = 0, seconds = 0) {
  const dEl = $$("#cdDays");
  const hEl = $$("#cdHours");
  const mEl = $$("#cdMins");
  const sEl = $$("#cdSecs");
  if (!dEl || !hEl || !mEl) return;

  const target = new Date(year, month - 1, day, hours, minutes, seconds).getTime();
  if (Number.isNaN(target)) return;

  const pad2 = (n) => String(n).padStart(2, "0");

  if (window.__countdownTimer) {
    clearInterval(window.__countdownTimer);
  }

  const tick = () => {
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    dEl.textContent = pad2(days);
    hEl.textContent = pad2(hours);
    mEl.textContent = pad2(mins);
    if (sEl) sEl.textContent = pad2(secs);
  };

  tick();
  window.__countdownTimer = setInterval(tick, 1000);
}

/* ===================== SEPARADOR ROTATIVO ===================== */
function initRotatingSep(imageId, images){
  const imgEl = document.getElementById(imageId);
  if(!imgEl || !images || images.length === 0) return;

  let currentIndex = 0;

  function changeImage(){

    imgEl.style.opacity = 0;

    setTimeout(() => {

      currentIndex = (currentIndex + 1) % images.length;

      imgEl.src = images[currentIndex];

      imgEl.onload = () => {
        imgEl.style.opacity = 1;
      };

    }, 400);

  }

  setInterval(changeImage, 5000);
}

//contador
function initFlipCountdown(targetISO){
  const target = new Date(targetISO).getTime();
  const pad2 = (n) => String(n).padStart(2, "0");

  const setFlip = (flipEl, newValue) => {
    if (!flipEl) return;

    const top = flipEl.querySelector(".top .digit");
    const bottom = flipEl.querySelector(".bottom .digit");
    const topFlip = flipEl.querySelector(".top-flip .digit");
    const bottomFlip = flipEl.querySelector(".bottom-flip .digit");

    const current = top?.textContent ?? "00";
    if (current === newValue) return;

    topFlip.textContent = current;
    bottomFlip.textContent = newValue;

    bottom.textContent = newValue;

    flipEl.classList.add("is-flipping");

    setTimeout(() => { top.textContent = newValue; }, 650);
    setTimeout(() => { flipEl.classList.remove("is-flipping"); }, 1300);
  };

  const flipDays = document.getElementById("flipDays");
  const flipHours = document.getElementById("flipHours");
  const flipMins = document.getElementById("flipMins");
  const flipSecs = document.getElementById("flipSecs");

  if (!flipDays && !flipHours && !flipMins && !flipSecs) return;

  const initVal = (el, v) => {
    if (!el) return;
    el.querySelector(".top .digit").textContent = v;
    el.querySelector(".bottom .digit").textContent = v;
    el.querySelector(".top-flip .digit").textContent = v;
    el.querySelector(".bottom-flip .digit").textContent = v;
  };

  initVal(flipDays, "00");
  initVal(flipHours, "00");
  initVal(flipMins, "00");
  initVal(flipSecs, "00");

  const tick = () => {
    const now = Date.now();
    let diff = target - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / (1000*60*60*24));
    const hours = Math.floor((diff / (1000*60*60)) % 24);
    const mins = Math.floor((diff / (1000*60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    setFlip(flipDays, pad2(days));
    setFlip(flipHours, pad2(hours));
    setFlip(flipMins, pad2(mins));
    setFlip(flipSecs, pad2(secs));
  };

  tick();
  setInterval(tick, 1000);
}

//animaciones
// ================= ANIMACIONES POR SECCIÓN (AUTO) =================
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");

  // fallback por si el navegador no soporta IntersectionObserver
  if (!("IntersectionObserver" in window)) {
    sections.forEach(s => s.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target); // solo una vez
      }
    });
  }, { threshold: 0.18 });

  sections.forEach(s => io.observe(s));
});

// ================= TRANSFERENCIA MODAL =================
document.addEventListener("DOMContentLoaded", () => {
  const btnClose = document.getElementById("btnCloseTransfer");
  const backdrop = document.getElementById("transferBackdrop");

  const btnCopy = document.getElementById("btnCopyAccount");
  const toast = document.getElementById("copyToast");

  function closeModal(){
    if(!backdrop) return;
    backdrop.style.display = "none";
    backdrop.setAttribute("aria-hidden", "true");
  }

  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.style.display = "none";
    }, 1400);
  }

  if (btnClose) btnClose.addEventListener("click", closeModal);

  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener("click", async () => {
  
      const bank = document.getElementById("bankName")?.textContent.trim();
      const account = document.getElementById("accountNumber")?.textContent.trim();
      const type = document.getElementById("accountType")?.textContent.trim();
      const owner = document.getElementById("accountOwner")?.textContent.trim();
  
      const fullText = 
  `Datos de Transferencia:
  Medio: ${bank}
  Cuenta monetaria: ${account}
  Tipo: ${type}
  Nombre: ${owner}`;
  
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(fullText);
        } else {
          const ta = document.createElement("textarea");
          ta.value = fullText;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        }
  
        showToast("✅ Datos bancarios copiados");
  
      } catch (err) {
        showToast("⚠️ No se pudo copiar");
      }
  
    });
  }
});
