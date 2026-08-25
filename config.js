const firebaseConfig = {
  apiKey: "AIzaSyAqOZQ5YFOdhL6dblHI5wIx10m6n4xt2Fg",
  authDomain: "buenosdeseos-twodesign.firebaseapp.com",
  databaseURL: "https://buenosdeseos-twodesign-default-rtdb.firebaseio.com",
  projectId: "buenosdeseos-twodesign",
  storageBucket: "buenosdeseos-twodesign.firebasestorage.app",
  messagingSenderId: "577908051871",
  appId: "1:577908051871:web:27fbd4e06b3d18da14b7aa"
};

const config = {
  event: {
    defaultEventId: "vivianmaykol2026",
    databaseURL: firebaseConfig.databaseURL,
    eventIdParam: "eventId",
    legacyFallback: {
      read: false,
      write: false,
      subscribe: false
    }
  },
  admin: {
    adminKey: "twodesign123",
    keyParam: "key",
    legacyKeyParam: "admin"
  },
  seo: {
    titulo: "Vivian & Maykol | 29.11.2026",
    descripcion: "Boda de Vivian Galvez y Maykol Roblero - 29 de noviembre de 2026",
    autor: "Two Design"
  },
  pareja: {
    nombres: "Vivian & Maykol",
    fecha: "29-11-2026",
    fechaVisible: "29.11.2026"
  },
  musica: {
    titulo: "Nuestra Canción",
    archivo: "music.mp3"
  },
  evento: {
    ceremonia: {
      titulo: "Ceremonia",
      lugar: "Conceptio",
      hora: "4:00 PM",
      direccion: "Antigua Guatemala",
      ubicacionUrl: "https://maps.app.goo.gl/Xsf621ZbtQx2e2rM8"
    },
    recepcion: {
      titulo: "Recepción",
      lugar: "Conceptio",
      hora: "6:00 PM",
      direccion: "Antigua Guatemala",
      ubicacionUrl: "https://maps.app.goo.gl/Xsf621ZbtQx2e2rM8"
    }
  },
  textos: {
    mensajeInvitado: "Para nosotros será un privilegio compartir contigo un momento tan especial.",
    mensajePases: "Hemos reservado {pases} lugares en su honor"
  },
  footer: {
    hashtag: "#VivianYMaykol",
    instagramUrl: "https://www.instagram.com/thetwodesign",
    facebookUrl: "https://www.facebook.com/thetwodesign",
    marcaTexto: "Diseño",
    marcaNombre: "Two Design",
    marcaUrl: "https://twodesign.com"
  }
};

window.config = config;
window.firebaseConfig = firebaseConfig;
