// FIREBASE APP

import { initializeApp }

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

//
// FIREBASE AUTH
//

import {

getAuth

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

//
// CONFIG FIREBASE
//

const firebaseConfig = {

  apiKey: "COLE_AQUI",

  authDomain: "COLE_AQUI",

  projectId: "COLE_AQUI",

  storageBucket: "COLE_AQUI",

  messagingSenderId: "COLE_AQUI",

  appId: "COLE_AQUI"

};

//
// INICIAR FIREBASE
//

const app =
initializeApp(firebaseConfig);

//
// AUTH
//

const auth =
getAuth(app);

//
// EXPORTAR
//

export {

auth

};