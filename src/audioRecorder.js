import { downloadBlob } from "./download.js";

/**
 * startCapture() agora retorna { stop, stopped }:
 *  - stop(): pede para parar (equivale ao botão "Parar")
 *  - stopped: Promise que resolve quando a gravação terminou de verdade
 */
export async function startCapture() {
  const displayStream = await navigator.mediaDevices.getDisplayMedia({
    // precisa pedir vídeo, mas podemos limitar ao mínimo possível
    video: { frameRate: 1 }, 
    audio: true
  });
  
  // desabilita a trilha de vídeo imediatamente, para que não gere frames
  const videoTrack = displayStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = false;  // fica "mudo" em imagem, mas mantém o áudio
  }
  
  const sysTrack = displayStream.getAudioTracks()[0];
  if (!sysTrack) {
    displayStream.getTracks().forEach(t => t.stop());
    throw new Error("Sem áudio da tela/aba (marque 'Compartilhar áudio').");
  }

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

  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();

  const sysSource = ctx.createMediaStreamSource(new MediaStream([sysTrack]));
  const micSource = ctx.createMediaStreamSource(new MediaStream([micTrack]));

  const sysGain = ctx.createGain(); sysGain.gain.value = 1.0;
  const micGain = ctx.createGain(); micGain.gain.value = 1.0;

  // MONO
  const merger = ctx.createChannelMerger(1);
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
      // gera arquivo
      const blob = new Blob(chunks, { type: mime || "audio/webm" });
      if (blob.size) downloadBlob(blob, "EuGravoBot");
    } catch {}
    // limpeza de streams e contexto
    [displayStream, micStream].forEach(s => s.getTracks().forEach(t => t.stop()));
    ctx.close();
    resolveStopped?.(); // avisa o main.js que terminou
  };

  rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  rec.onstop = cleanupAndResolve;

  // Se o usuário parar pelo navegador, chamamos stop() uma vez
  const finalizeIfNeeded = () => {
    if (!stopping && rec.state !== "inactive") {
      stopping = true;
      rec.stop();
    }
  };
  sysTrack.addEventListener("ended", finalizeIfNeeded);
  sysTrack.addEventListener("inactive", finalizeIfNeeded);
  displayStream.getVideoTracks()[0]?.addEventListener("ended", finalizeIfNeeded);

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

// compat com código antigo (se ainda for usado em algum lugar)
export async function stopCapture(handle) {
  if (handle?.stop) return handle.stop();
}
