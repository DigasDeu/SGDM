import {

auth

}

from "./firebase.js";

import {

signInWithEmailAndPassword,

GoogleAuthProvider,

signInWithPopup

}

from

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

//
// LOGIN EMAIL
//

document
.getElementById(
"loginBtn"
)
.addEventListener(
"click",
()=>{

    const email =
    document
    .getElementById(
    "email"
    ).value;

    const senha =
    document
    .getElementById(
    "senha"
    ).value;

    signInWithEmailAndPassword(

        auth,

        email,

        senha

    )

    .then((userCredential)=>{

        const user =
        userCredential.user;

        //
        // SALVAR LOGIN
        //

        localStorage.setItem(

            "usuarioLogado",

            JSON.stringify({

                nome:user.displayName ||

                "Usuário",

                email:user.email,

                foto:user.photoURL ||

                "assets/img/user.png",

                login:true
            })
        );

        //
        // REDIRECIONAR
        //

        window.location.href =
        "../../dashboard.html";
    })

    .catch((error)=>{

        console.log(error);

        alert(
        "Erro no login."
        );
    });
});

//
// LOGIN GOOGLE
//

document
.getElementById(
"googleLogin"
)
.addEventListener(
"click",
()=>{

    const provider =
    new GoogleAuthProvider();

    signInWithPopup(

        auth,

        provider

    )

    .then((result)=>{

        const user =
        result.user;

        localStorage.setItem(

            "usuarioLogado",

            JSON.stringify({

                nome:user.displayName,

                email:user.email,

                foto:user.photoURL,

                login:true
            })
        );

        window.location.href =
        "../../dashboard.html";
    })

    .catch((error)=>{

        console.log(error);

        alert(
        "Erro no Google Login."
        );
    });
});