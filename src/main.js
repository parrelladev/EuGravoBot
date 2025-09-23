import { startCapture } from "./audioRecorder.js";

const btnStart = document.getElementById("btnStart");
const btnStop  = document.getElementById("btnStop");

let handle = null; // referência da sessão atual

btnStart.addEventListener("click", async () => {
  try {
    btnStart.disabled = true;
    btnStop.disabled  = true;

    handle = await startCapture();

    // habilita o botão de parar
    btnStop.disabled = false;

    // IMPORTANTÍSSIMO: quando a gravação parar por QUALQUER motivo
    // (botão ou usuário parou pelo navegador), atualizamos a UI aqui.
    handle.stopped.then(() => {
      // garante que estamos mexendo na sessão atual
      if (handle) {
        btnStart.disabled = false;
        btnStop.disabled  = true;
        handle = null;
      }
    });

  } catch (err) {
    console.error(err);
    alert("Não foi possível iniciar: " + (err.message || err));
    btnStart.disabled = false;
    btnStop.disabled  = true;
    handle = null;
  }
});

btnStop.addEventListener("click", async () => {
  // desabilita imediatamente para evitar clique duplo
  btnStop.disabled = true;
  try {
    if (handle?.stop) {
      await handle.stop(); // aguarda terminar de verdade (gera o arquivo)
    }
  } finally {
    // UI será ajustada no then() do handle.stopped,
    // mas deixamos um fallback defensivo:
    if (handle === null) {
      btnStart.disabled = false;
      btnStop.disabled  = true;
    }
  }
});
