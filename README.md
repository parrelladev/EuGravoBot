# 🎙️ EuGravoBot – Captura de Áudio do Sistema + Microfone

O **EuGravoBot** é uma aplicação web simples que permite **gravar o áudio do sistema (saída)** e o **microfone (entrada)** ao mesmo tempo, direto do navegador, sem precisar instalar nada.  
O áudio é mixado em tempo real com o **Web Audio API**, gravado pelo **MediaRecorder** e salvo em arquivo `.webm` (Opus) leve, em **mono** (1 canal).

---

## 🚀 Recursos

- ✅ Grava **áudio do sistema** (via compartilhamento de tela/aba com áudio).  
- ✅ Grava **microfone** simultaneamente.  
- ✅ Faz o **mix em mono** (1 canal).  
- ✅ Salva em arquivo leve (`.webm` Opus) com ótima qualidade.  
- ✅ Nomeia os arquivos no padrão:

  ```
  EuGravoBot - DD-MM-AAAA HHhMM.webm
  ```

- ✅ Funciona totalmente no navegador (Chrome, Edge, etc).  
- ✅ Não precisa instalar programas ou plugins adicionais.  

---

## 🖼️ Interface

- **Botão "Compartilhar + Gravar"** → inicia a captura (tela/aba + microfone).  
- **Botão "Parar & Baixar"** → encerra a gravação e baixa o arquivo.  
- Se o usuário parar o compartilhamento pelo navegador, a gravação também é encerrada e o arquivo baixado automaticamente.  

---

## 📂 Estrutura de Pastas

```
/eu-gravo-bot
  ├─ index.html          # Página principal
  ├─ styles.css          # Estilos da interface
  └─ src/
      ├─ main.js         # Lógica de UI (botões/start/stop)
      ├─ audioRecorder.js# Captura, mixagem e gravação do áudio
      └─ download.js     # Utilitário para salvar arquivos no disco
```

---

## ⚙️ Como Rodar

1. Clone ou baixe este repositório.  
2. Sirva os arquivos por **localhost** (HTTPS ou HTTP local). Exemplos:

   ### Python
   ```bash
   python -m http.server 5500
   ```
   Acesse: [http://localhost:5500](http://localhost:5500)

   ### Node.js (http-server)
   ```bash
   npx http-server -p 5500
   ```
   Acesse: [http://localhost:5500](http://localhost:5500)

   ### VS Code (Live Server)
   - Instale a extensão **Live Server**.  
   - Clique em **Go Live** no rodapé.  

3. Abra o navegador (Chrome/Edge recomendado).  
4. Clique em **Compartilhar + Gravar**, selecione uma aba/tela **com áudio** e marque *"Compartilhar áudio"*.  
5. Fale no microfone → ao parar, o arquivo será salvo automaticamente.  

---

## 📝 Notas Importantes

- 🔒 `getDisplayMedia` só funciona em **contexto seguro** (HTTPS ou `http://localhost`).  
- 📦 O arquivo final é salvo em **WebM Opus**. Para converter para MP3 ou M4A:  
  ```bash
  ffmpeg -i "EuGravoBot - 23-09-2025 17h44m.webm" -ac 1 -c:a libmp3lame -q:a 3 out.mp3
  ffmpeg -i "EuGravoBot - 23-09-2025 17h44m.webm" -ac 1 -c:a aac -b:a 128k out.m4a
  ```
- 🎧 Alguns conteúdos protegidos (ex.: Netflix, Spotify Web) podem bloquear a captura de áudio por DRM.  
- 🖥️ Testado no **Google Chrome** e **Microsoft Edge** (versões atuais).  

---

## 📜 Licença

Este projeto é distribuído sob a licença MIT.  
Você pode usar, modificar e distribuir livremente, desde que mantenha os créditos.
