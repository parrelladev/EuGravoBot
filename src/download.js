export function downloadBlob(blob, baseName = "EuGravoBot") {
  const now = new Date();

  // formata com dois dígitos
  const pad = (n) => String(n).padStart(2, "0");

  const dia   = pad(now.getDate());
  const mes   = pad(now.getMonth() + 1); // meses são 0-11
  const ano   = now.getFullYear();
  const hora  = pad(now.getHours());
  const min   = pad(now.getMinutes());

  const fileName = `${baseName} - ${dia}-${mes}-${ano} ${hora}h${min}m.webm`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
