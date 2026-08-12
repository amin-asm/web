/* ═══════════════════════════════════════════════════════════
   InfinitumTech As — panel de publicación en TikTok

   El panel no habla con TikTok directamente: todo pasa por el
   sistema de automatización, que es quien guarda el token y
   llama a la Content Posting API. Aquí solo hay interfaz.

   Sin librerías: JavaScript propio, servido desde este dominio.
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var BASE = "https://n8n.aminautomation.com/webhook/tiktok";

  var estado        = document.getElementById("estadoCuenta");
  var textoEstado   = document.getElementById("textoEstado");
  var btnConectar   = document.getElementById("botonConectar");
  var btnDesconecta = document.getElementById("botonDesconectar");
  var btnPublicar   = document.getElementById("botonPublicar");
  var selVideo      = document.getElementById("video");
  var txtTitulo     = document.getElementById("titulo");
  var contador      = document.getElementById("contador");
  var selPrivacidad = document.getElementById("privacidad");
  var tarjetaRes    = document.getElementById("tarjetaResultado");
  var resultado     = document.getElementById("resultado");

  var conectado = false;

  /* ─── Utilidades ─── */

  function pintarEstado(clase, texto) {
    estado.className = "estado " + clase;
    textoEstado.textContent = texto;
  }

  function mostrar(clase, texto, detalle) {
    tarjetaRes.hidden = false;
    resultado.className = "resultado " + clase;
    resultado.textContent = texto;
    if (detalle) {
      var code = document.createElement("code");
      code.textContent = detalle;
      resultado.appendChild(code);
    }
  }

  function pedir(ruta, opciones) {
    return fetch(BASE + ruta, Object.assign({ credentials: "include" }, opciones || {}))
      .then(function (r) {
        if (!r.ok) throw new Error("El sistema respondió " + r.status);
        return r.json();
      });
  }

  function revisarSiPuedePublicar() {
    btnPublicar.disabled = !(conectado && selVideo.value && txtTitulo.value.trim());
  }

  /* ─── 1. ¿Está la cuenta conectada? ─── */

  function comprobarCuenta() {
    pedir("/estado")
      .then(function (d) {
        conectado = !!d.conectado;
        if (conectado) {
          pintarEstado("conectado", "Conectado como " + (d.cuenta || "tu cuenta de TikTok"));
          btnConectar.classList.add("oculto");
          btnDesconecta.classList.remove("oculto");
        } else {
          pintarEstado("desconectado", "Sin conectar");
          btnConectar.classList.remove("oculto");
          btnDesconecta.classList.add("oculto");
        }
        revisarSiPuedePublicar();
      })
      .catch(function (e) {
        pintarEstado("desconectado", "No se pudo comprobar la conexión: " + e.message);
      });
  }

  /* ─── 2. La cola de vídeos pendientes ─── */

  function cargarVideos() {
    pedir("/videos")
      .then(function (d) {
        var lista = d.videos || [];
        selVideo.innerHTML = "";

        if (!lista.length) {
          selVideo.appendChild(new Option("No hay vídeos en la cola", ""));
          return;
        }

        selVideo.appendChild(new Option("Elige un vídeo…", ""));
        lista.forEach(function (v) {
          selVideo.appendChild(new Option(v.nombre, v.id));
        });
      })
      .catch(function () {
        selVideo.innerHTML = "";
        selVideo.appendChild(new Option("No se pudo cargar la cola", ""));
      })
      .then(revisarSiPuedePublicar);
  }

  /* ─── 3. Publicar ─── */

  function publicar() {
    btnPublicar.disabled = true;
    mostrar("esperando", "Subiendo el vídeo a TikTok…");

    pedir("/publicar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoId:     selVideo.value,
        titulo:      txtTitulo.value.trim(),
        privacidad:  selPrivacidad.value,
        comentarios: document.getElementById("comentarios").checked,
        duetos:      document.getElementById("duetos").checked,
        mezclas:     document.getElementById("mezclas").checked
      })
    })
      .then(function (d) {
        if (d.ok) {
          mostrar("ok", "Publicado. TikTok lo está procesando.", "publish_id: " + (d.publishId || "—"));
        } else {
          mostrar("error", "TikTok rechazó la publicación.", d.error || "");
        }
      })
      .catch(function (e) {
        mostrar("error", "No se pudo publicar.", e.message);
      })
      .then(function () {
        revisarSiPuedePublicar();
      });
  }

  function desconectar() {
    pedir("/desconectar", { method: "POST" })
      .then(comprobarCuenta)
      .catch(function (e) {
        pintarEstado("desconectado", "No se pudo desconectar: " + e.message);
      });
  }

  /* ─── Arranque ─── */

  txtTitulo.addEventListener("input", function () {
    contador.textContent = txtTitulo.value.length;
    revisarSiPuedePublicar();
  });
  selVideo.addEventListener("change", revisarSiPuedePublicar);
  btnPublicar.addEventListener("click", publicar);
  btnDesconecta.addEventListener("click", desconectar);

  // Al volver de TikTok tras autorizar, la URL trae ?conectado=1
  if (window.location.search.indexOf("conectado=1") !== -1) {
    mostrar("ok", "Cuenta autorizada correctamente.");
    history.replaceState({}, "", window.location.pathname);
  }

  comprobarCuenta();
  cargarVideos();
})();
