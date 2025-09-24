import { startCapture } from "./audioRecorder.js";

const btnStart = document.getElementById("btnStart");
const btnStop = document.getElementById("btnStop");
const compatBanner = document.getElementById("compatBanner");
const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

// Se for Firefox, mostra a faixa e desabilita o botão de gravar
if (isFirefox) {
  compatBanner?.removeAttribute("hidden");
  btnStart.disabled = true;
  btnStart.title = "Indisponível no Firefox. Use Chrome ou Edge para capturar o áudio do sistema.";
}

const startWrap = document.querySelector(".start-wrapper");


let handle = null;

function setRecordingUI(isOn) {
  startWrap?.classList.toggle("is-recording", !!isOn);
}

btnStart.addEventListener("click", async () => {
  try {
    btnStart.disabled = true;
    btnStop.disabled = true;

    handle = await startCapture();

    setRecordingUI(true);
    btnStop.disabled = false;

    handle.stopped.then(() => {
      if (handle) {
        setRecordingUI(false);
        btnStart.disabled = false;
        btnStop.disabled = true;
        handle = null;
      }
    });

  } catch (err) {
    console.error(err);
    alert("Não foi possível iniciar: " + (err.message || err));
    setRecordingUI(false);
    btnStart.disabled = false;
    btnStop.disabled = true;
    handle = null;
  }
});

btnStop.addEventListener("click", async () => {
  btnStop.disabled = true;
  try {
    if (handle?.stop) await handle.stop();
  } finally {
    if (handle === null) {
      setRecordingUI(false);
      btnStart.disabled = false;
      btnStop.disabled = true;
    }
  }
});
