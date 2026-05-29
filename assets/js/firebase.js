import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyB9qDW4ogSZB666z7659ZaCw-asZUoQDUI",
    authDomain: "sistema-midia-semsa.firebaseapp.com",
    projectId: "sistema-midia-semsa",
    storageBucket: "sistema-midia-semsa.firebasestorage.app",
    messagingSenderId: "645515573455",
    appId: "1:645515573455:web:02f149e36c19813b739fba"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };