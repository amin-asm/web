/* ═══════════════════════════════════════════════════════════
   InfinitumTech As — animaciones de scroll

   El robot va fijo en pantalla y se desplaza de un lado a otro
   según el apartado en el que estés, "hablando" lo que toca en
   cada uno. Los apartados aparecen a su paso.

   Sin librerías: JavaScript propio, servido desde este dominio.
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var menosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var robot = document.getElementById("robotGuia");
  var bocadillo = document.getElementById("robotBocadillo");
  var textoBocadillo = bocadillo ? bocadillo.querySelector("span") : null;
  var portada = document.getElementById("inicio");
  var apartados = Array.prototype.slice.call(document.querySelectorAll("[data-dice]"));

  /* ─── 1. Aparición de los apartados al entrar en pantalla ─── */

  var aparecibles = document.querySelectorAll(
    ".seccion, .tarjeta-dolor, .servicio, .pasos li, .lienzo, .sobre-mi-caja"
  );

  if (!("IntersectionObserver" in window) || menosMovimiento) {
    // Sin soporte o con movimiento reducido: se enseña todo tal cual.
    Array.prototype.forEach.call(aparecibles, function (el) {
      el.classList.add("visible");
    });
  } else {
    Array.prototype.forEach.call(aparecibles, function (el, i) {
      el.classList.add("aparece");
      el.style.setProperty("--retraso", (i % 3) * 90 + "ms");
    });

    var vigia = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            vigia.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    Array.prototype.forEach.call(aparecibles, function (el) {
      vigia.observe(el);
    });
  }

  /* ─── 2. El robot guía ─── */

  if (!robot || menosMovimiento) return;

  var activo = null;      // apartado que el robot está "visitando"
  var tecleando = null;   // temporizador del efecto de escritura
  var pendiente = false;  // hay un recálculo encolado en el próximo fotograma

  // Escribe el texto letra a letra, como si el robot lo estuviera diciendo.
  function decir(frase) {
    if (!textoBocadillo) return;
    clearInterval(tecleando);
    textoBocadillo.textContent = "";
    bocadillo.classList.add("visible");

    var i = 0;
    tecleando = setInterval(function () {
      textoBocadillo.textContent = frase.slice(0, ++i);
      if (i >= frase.length) clearInterval(tecleando);
    }, 26);
  }

  function callar() {
    clearInterval(tecleando);
    bocadillo.classList.remove("visible");
  }

  var ANCHO_ROBOT = 165;                       // el que tiene en el CSS, sin escalar
  var muestra = document.querySelector(".seccion");

  // Coloca el robot en el carril libre que queda a los lados del contenido.
  function colocar(lado, cerca) {
    var ancho = window.innerWidth;
    var anchoContenido = muestra ? muestra.getBoundingClientRect().width : ancho;
    var carril = (ancho - anchoContenido) / 2;

    // Si no queda carril suficiente, el robot pasa a modo esquina
    var estrecho = ancho < 900 || carril < 105;
    var x, y, escala;

    if (estrecho) {
      // No hay márgenes libres: se queda de acompañante en la esquina de abajo
      x = (lado === "izquierda" ? -0.34 : 0.34) * ancho;
      y = window.innerHeight * 0.38;
      escala = 0.48;
    } else {
      // El robot se encoge hasta caber en ese carril, dejando 20px de respiro
      escala = Math.max(0.45, Math.min(cerca ? 1 : 0.85, (carril - 20) / ANCHO_ROBOT));

      // Y se centra dentro del carril
      var centroCarril = carril / 2;
      x = lado === "izquierda" ? centroCarril - ancho / 2 : ancho / 2 - centroCarril;
      if (lado === "centro") x = 0;
      y = 8;
    }

    // Se inclina hacia el contenido que está señalando
    var giro = lado === "izquierda" ? 8 : lado === "derecha" ? -8 : 0;

    // El bocadillo nunca puede ser más ancho que el carril del robot
    // Si cambia de lado, se da la vuelta por el camino
    if (robot.dataset.lado && robot.dataset.lado !== lado) {
      robot.classList.remove("girando");
      void robot.offsetWidth;            // reinicia la animación
      robot.classList.add("girando");
      setTimeout(function () { robot.classList.remove("girando"); }, 1000);
    }

    robot.style.setProperty("--ancho-bocadillo", Math.round(ANCHO_ROBOT * escala * 1.2) + "px");
    robot.style.transform =
      "translate(-50%, -50%) translate(" + Math.round(x) + "px, " + Math.round(y) + "px) scale(" + escala + ") rotate(" + giro + "deg)";
    robot.dataset.lado = lado;
  }

  function recalcular() {
    pendiente = false;

    var centroPantalla = window.innerHeight / 2;

    // ¿Seguimos en la portada? Ahí el robot va a su sitio de siempre, a la derecha.
    if (portada) {
      var p = portada.getBoundingClientRect();
      if (p.bottom > centroPantalla) {
        if (activo !== "portada") {
          activo = "portada";
          colocar("derecha", true);
          callar();
        }
        return;
      }
    }

    // Fuera de la portada: gana el apartado cuyo centro esté más cerca del de la pantalla
    var mejor = null;
    var mejorDistancia = Infinity;

    apartados.forEach(function (sec) {
      var r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var distancia = Math.abs(r.top + r.height / 2 - centroPantalla);
      if (distancia < mejorDistancia) {
        mejorDistancia = distancia;
        mejor = sec;
      }
    });

    if (!mejor) return;

    if (mejor !== activo) {
      activo = mejor;
      colocar(mejor.dataset.lado || "derecha", true);
      decir(mejor.dataset.dice || "");
    }
  }

  function alHacerScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(recalcular);
  }

  robot.classList.add("activo");
  colocar("derecha", true);

  window.addEventListener("scroll", alHacerScroll, { passive: true });
  window.addEventListener("resize", alHacerScroll, { passive: true });
  recalcular();
})();
