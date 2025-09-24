import { downloadBlob } from "./download.js";

/**
 * startCapture() retorna { stop, stopped }:
 *  - stop(): pede para parar (equivale ao botão "Parar")
 *  - stopped: Promise que resolve quando a gravação terminou de verdade
 */
export async function startCapture() {
  // 🔎 Bloqueio explícito para Firefox (sem suporte a áudio do sistema via getDisplayMedia)
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");
  if (isFirefox) {
    alert("⚠️ Este navegador (Firefox) não é compatível com captura do áudio do sistema. Use Chrome ou Edge para gravar o áudio da tela/aba.");
    throw new Error("Navegador não compatível com áudio do sistema.");
  }

  // 1) Captura da tela/aba COM áudio do sistema (Chrome/Edge)
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    // precisa pedir vídeo para abrir o prompt; limitamos o custo
    video: { frameRate: 1 },
    audio: true
  });

  // economiza: desabilita vídeo (não usamos imagem)
  const videoTrack = displayStream.getVideoTracks()[0];
  if (videoTrack) videoTrack.enabled = false;

  const sysTrack = displayStream.getAudioTracks()[0];
  if (!sysTrack) {
    displayStream.getTracks().forEach(t => t.stop());
    throw new Error("Sem áudio da tela/aba (marque 'Compartilhar áudio').");
  }

  // 2) Microfone
  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: false
  });
  const micTrack = micStream.getAudioTracks()[0];
  if (!micTrack) {
    micStream.getTracks().forEach(t => t.stop());
    displayStream.getTracks().forEach(t => t.stop());
    throw new Error("Microfone não disponível.");
  }

  // --- MIX e downmix para MONO ---
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();

  const sysSource = ctx.createMediaStreamSource(new MediaStream([sysTrack]));
  const micSource = ctx.createMediaStreamSource(new MediaStream([micTrack]));

  const sysGain = ctx.createGain(); sysGain.gain.value = 1.0;
  const micGain = ctx.createGain(); micGain.gain.value = 1.0;

  const merger = ctx.createChannelMerger(1); // mono
  sysSource.connect(sysGain).connect(merger);
  micSource.connect(micGain).connect(merger);
  merger.connect(dest);

  const mixedStream = dest.stream;

  const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "");

  const rec = new MediaRecorder(mixedStream, mime ? { mimeType: mime } : undefined);
  const chunks = [];

  let resolveStopped;
  const stopped = new Promise(res => (resolveStopped = res));
  let stopping = false;

  const cleanupAndResolve = () => {
    try {
      const blob = new Blob(chunks, { type: mime || "audio/webm" });
      if (blob.size) downloadBlob(blob, "EuGravoBot");
    } catch {}
    try { displayStream.getTracks().forEach(t => t.stop()); } catch {}
    try { micStream.getTracks().forEach(t => t.stop()); } catch {}
    try { ctx.close(); } catch {}
    resolveStopped?.();
  };

  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = cleanupAndResolve;

  // Se o usuário parar pelo navegador, finalize também
  const finalizeIfNeeded = () => {
    if (!stopping && rec.state !== "inactive") {
      stopping = true;
      rec.stop();
    }
  };
  if (videoTrack) videoTrack.addEventListener("ended", finalizeIfNeeded);
  if (sysTrack) {
    sysTrack.addEventListener("ended", finalizeIfNeeded);
    sysTrack.addEventListener("inactive", finalizeIfNeeded);
  }

  rec.start(1000);

  // função pública para o botão "Parar"
  const stop = () => {
    if (!stopping && rec.state !== "inactive") {
      stopping = true;
      rec.stop();
    }
    return stopped; // permite await no chamador
  };

  return { stop, stopped };
}

// compat com código antigo (se ainda for usado)
export async function stopCapture(handle) {
  if (handle?.stop) return handle.stop();
}
