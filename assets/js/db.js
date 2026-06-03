import { db } from "./firebase.js";

import {
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ==========================================
   SERVIÇO DO BANCO - FIRESTORE
   SGDM - Sistema de Gestão do Departamento de Mídia
========================================== */

async function adicionarDocumento(colecao, dados) {
    const referencia = await addDoc(
        collection(db, colecao),
        {
            ...dados,
            criadoEmServidor: serverTimestamp(),
            atualizadoEmServidor: serverTimestamp()
        }
    );

    return referencia.id;
}

async function salvarDocumentoComId(colecao, id, dados) {
    await setDoc(
        doc(db, colecao, String(id)),
        {
            ...dados,
            atualizadoEmServidor: serverTimestamp()
        },
        {
            merge: true
        }
    );
}

async function atualizarDocumento(colecao, id, dados) {
    await updateDoc(
        doc(db, colecao, String(id)),
        {
            ...dados,
            atualizadoEmServidor: serverTimestamp()
        }
    );
}

async function excluirDocumento(colecao, id) {
    await deleteDoc(
        doc(db, colecao, String(id))
    );
}

async function listarDocumentos(colecao) {
    const resultado = await getDocs(
        collection(db, colecao)
    );

    return resultado.docs.map(documento => ({
        idFirebase: documento.id,
        ...documento.data()
    }));
}

async function buscarDocumentoPorId(colecao, id) {
    const resultado = await getDoc(
        doc(db, colecao, String(id))
    );

    if (!resultado.exists()) {
        return null;
    }

    return {
        idFirebase: resultado.id,
        ...resultado.data()
    };
}

function observarColecao(colecao, callback) {
    const consulta = query(
        collection(db, colecao),
        orderBy("criadoEmServidor", "desc")
    );

    return onSnapshot(consulta, (snapshot) => {
        const dados = snapshot.docs.map(documento => ({
            idFirebase: documento.id,
            ...documento.data()
        }));

        callback(dados);
    });
}

export {
    adicionarDocumento,
    salvarDocumentoComId,
    atualizarDocumento,
    excluirDocumento,
    listarDocumentos,
    buscarDocumentoPorId,
    observarColecao
};