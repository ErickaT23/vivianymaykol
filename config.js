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
    defaultEventId: "anthonycarolina2026",
    databaseURL: firebaseConfig.databaseURL,
    eventIdParam: "eventId",
    legacyFallback: {
      read: false,
      write: false,
      subscribe: false
    }
  },
  seo: {
    titulo: "Anthony & Carolina | 26.12.2026",
    descripcion: "Boda de Anthony de León López y Carolina López - 26 de diciembre de 2026",
    autor: "Two Design"
  },
  pareja: {
    nombres: "Anthony & Carolina",
    fecha: "26-12-2026",
    fechaVisible: "26.12.2026"
  },
  musica: {
    titulo: "Nuestra Canción",
    archivo: "music.mp3"
  },
  evento: {
    ceremonia: {
      titulo: "Ceremonia",
      lugar: "Hacienda San Isidro",
      hora: "3:00 PM",
      direccion: "5ta avenida 7-20 zona 6 de Villa Nueva, Guatemala.",
      ubicacionUrl: "https://maps.app.goo.gl/PZ2Fnbd73NSX3LwZ8"
    },
    recepcion: {
      titulo: "Recepción",
      lugar: "Hacienda San Isidro",
      hora: "4:00 PM",
      direccion: "5ta avenida 7-20 zona 6 de Villa Nueva, Guatemala.",
      ubicacionUrl: "https://maps.app.goo.gl/PZ2Fnbd73NSX3LwZ8"
    }
  },
  textos: {
    mensajeInvitado: "Para nosotros será un privilegio compartir contigo un momento tan especial.",
    mensajePases: "Hemos reservado {pases} lugares en su honor"
  },
  footer: {
    hashtag: "#AnthonyYCarolina",
    instagramUrl: "https://www.instagram.com/thetwodesign",
    facebookUrl: "https://www.facebook.com/thetwodesign",
    marcaTexto: "Diseño",
    marcaNombre: "Two Design",
    marcaUrl: "https://twodesign.com"
  }
};

window.config = config;
window.firebaseConfig = firebaseConfig;
