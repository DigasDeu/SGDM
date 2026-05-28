import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "COLE_AQUI_A_API_KEY_REAL",
  authDomain: "sistema-midia-semsa.firebaseapp.com",
  projectId: "sistema-midia-semsa",
  storageBucket: "sistema-midia-semsa.appspot.com",
  messagingSenderId: "COLE_AQUI",
  appId: "COLE_AQUI"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };