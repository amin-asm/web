/* Generado a partir de proyectos/web/motion-demo/demo.html — no editar a mano
   sin actualizar también el demo. GSAP auto-alojado en lib/ (cumple la CSP
   script-src 'self': nada externo). Si falla la carga de GSAP, todo el resto
   de la web sigue funcionando igual — este script solo añade movimiento. */
(function(){
  if (typeof gsap === 'undefined') return;

  const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finoPointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if (reducido) return; // el CSS ya deja todo visible y quieto

  if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
  if (typeof MotionPathPlugin !== 'undefined') gsap.registerPlugin(MotionPathPlugin);

  /* ══════ Hero: entra sola al cargar ══════ */
  const heroSpans = document.querySelectorAll('#heroTitulo .linea-motion span');
  if (heroSpans.length){
    gsap.set(heroSpans, {opacity:0, y:50, filter:'blur(5px)'});
    gsap.set(heroSpans[2], {scale:.92});

    const tl = gsap.timeline({delay:.15});
    tl.to(heroSpans[0], {opacity:1, y:0, filter:'blur(0px)', duration:.85, ease:'power3.out'})
      .to(heroSpans[1], {opacity:1, y:0, filter:'blur(0px)', duration:.9, ease:'power3.out'}, '-=.5')
      .to(heroSpans[2], {opacity:1, y:0, scale:1.05, filter:'blur(0px)', duration:1.1, ease:'back.out(1.6)'}, '-=.4')
      .to(heroSpans[2], {scale:1, duration:.45}, '-=.15');

    if (typeof ScrollTrigger !== 'undefined'){
      gsap.to('#heroTitulo', {
        y:-30, opacity:.55, ease:'none',
        scrollTrigger:{trigger:'.portada', start:'top top', end:'+=60%', scrub:.6}
      });
    }
  }

  /* ══════ Botones magnéticos (WhatsApp) ══════ */
  if (finoPointer){
    document.querySelectorAll('.btn-wa').forEach(btn=>{
      btn.addEventListener('mousemove', e=>{
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2, y = e.clientY - r.top - r.height/2;
        gsap.to(btn, {x:x*0.3, y:y*0.45, duration:.3, ease:'power2.out'});
      });
      btn.addEventListener('mouseleave', ()=> gsap.to(btn, {x:0, y:0, duration:.4, ease:'elastic.out(1,0.4)'}));
    });
  }

  /* ══════ Tarjetas: tilt 3D ligero al cursor ══════ */
  if (finoPointer){
    document.querySelectorAll('.servicio, .tarjeta-dolor').forEach(card=>{
      card.addEventListener('mousemove', e=>{
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left)/r.width - .5, py = (e.clientY - r.top)/r.height - .5;
        gsap.to(card, {rotateX:-py*6, rotateY:px*8, y:-3, transformPerspective:700, duration:.35, ease:'power2.out'});
      });
      card.addEventListener('mouseleave', ()=> gsap.to(card, {rotateX:0, rotateY:0, y:0, duration:.5, ease:'power2.out'}));
    });
  }
  /* Nota: la aparición al hacer scroll de .servicio/.tarjeta-dolor/.pasos li
     ya la gestiona animaciones.js (su propio IntersectionObserver, con su
     propio respeto a "menos movimiento") — no se duplica aquí para no pelear
     por la misma opacidad. */

  /* ══════ Cursor propio ══════ */
  if (finoPointer){
    const punto = document.createElement('div'); punto.className = 'cursor-punto';
    const anillo = document.createElement('div'); anillo.className = 'cursor-anillo';
    document.body.append(punto, anillo);
    let px = innerWidth/2, py = innerHeight/2, ax = px, ay = py;
    window.addEventListener('mousemove', e=>{ px = e.clientX; py = e.clientY; punto.style.left = px+'px'; punto.style.top = py+'px'; });
    gsap.ticker.add(()=>{ ax += (px-ax)*0.16; ay += (py-ay)*0.16; anillo.style.left = ax+'px'; anillo.style.top = ay+'px'; });
    document.querySelectorAll('.btn-wa, .servicio, .tarjeta-dolor, .pasos li, .flujo .nodo').forEach(el=>{
      el.addEventListener('mouseenter', ()=> anillo.classList.add('activo'));
      el.addEventListener('mouseleave', ()=> anillo.classList.remove('activo'));
    });
  }

  /* ══════ Botón WhatsApp: feedback de ripple al clic ══════ */
  document.querySelectorAll('.btn-wa').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const r = btn.getBoundingClientRect();
      const rip = document.createElement('span'); rip.className = 'btn-ripple';
      const size = Math.max(r.width, r.height)*1.6;
      rip.style.width = rip.style.height = size+'px';
      rip.style.left = (e.clientX-r.left-size/2)+'px';
      rip.style.top = (e.clientY-r.top-size/2)+'px';
      btn.appendChild(rip);
      gsap.fromTo(rip, {scale:0, opacity:.55}, {scale:1, opacity:0, duration:.6, ease:'power2.out', onComplete:()=> rip.remove()});
    });
  });

  /* ══════ Línea conectora + paquete viajero, calculados desde el DOM real ══════
     Se usa en "El problema" (entre los 3 iconos de dolor) y en "Llave en mano"
     (entre los 3 números de paso). No inventa coordenadas: mide las posiciones
     reales de los nodos en cada sección. */
  function crearSistemaConectado(contenedorSel, nodosSel, colorA, colorB){
    const contenedor = document.querySelector(contenedorSel);
    if (!contenedor) return;
    const nodos = Array.from(contenedor.querySelectorAll(nodosSel));
    if (nodos.length < 2) return;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'linea-conexion-din');
    svg.style.position = 'absolute'; svg.style.inset = '0'; svg.style.width = '100%'; svg.style.height = '100%';
    svg.style.pointerEvents = 'none'; svg.style.zIndex = '0'; svg.style.overflow = 'visible';

    const gradId = 'gradDin' + Math.random().toString(36).slice(2,8);
    svg.innerHTML = `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colorA}"/><stop offset="100%" stop-color="${colorB}"/>
    </linearGradient></defs>
    <path id="${gradId}-p" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linecap="round"/>
    <g id="${gradId}-ticks" stroke="${colorA}" stroke-width="2" opacity=".55"></g>
    <circle id="${gradId}-c" r="5" fill="${colorB}" opacity="0" style="filter:drop-shadow(0 0 6px ${colorB})"/>`;

    if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';
    contenedor.prepend(svg);
    const path = svg.querySelector('path');
    const paquete = svg.querySelector('circle');
    const ticks = svg.querySelector('g');

    function trazar(){
      const cRect = contenedor.getBoundingClientRect();
      /* Ancla por ENCIMA de cada nodo, no en su centro: los nodos están dentro
         de tarjetas con fondo opaco, así que una línea a su altura queda tapada
         y solo se ve en los huecos entre tarjetas. Por encima, siempre visible.
         Una marca vertical corta (tick) baja de la línea hasta rozar cada
         tarjeta, para que se lea como "conectado a ella", no flotando suelto. */
      const puntos = nodos.map(n=>{
        const r = n.getBoundingClientRect();
        return { x:r.left - cRect.left + r.width/2, yLinea:r.top - cRect.top - 18, yTarjeta:r.top - cRect.top - 4 };
      });
      const d = puntos.map((p,i)=> (i===0?'M':'L') + p.x + ',' + p.yLinea).join(' ');
      path.setAttribute('d', d);
      ticks.innerHTML = puntos.map(p=> `<line x1="${p.x}" y1="${p.yLinea}" x2="${p.x}" y2="${p.yTarjeta}"/><circle cx="${p.x}" cy="${p.yLinea}" r="3" fill="${colorA}"/>`).join('');
      const largo = path.getTotalLength();
      path.style.strokeDasharray = largo;
      path.style.strokeDashoffset = largo;
      return { path, largo };
    }
    let { largo } = trazar();
    window.addEventListener('resize', ()=>{ ({ largo } = trazar()); });

    if (typeof ScrollTrigger === 'undefined') return;
    const tl = gsap.timeline({ scrollTrigger:{ trigger:contenedor, start:'top 68%', end:'bottom 55%', scrub:.7 } });
    tl.to(path, { strokeDashoffset:0, duration:3, ease:'none' }, 0)
      .to(paquete, { opacity:1, duration:.1 }, 0)
      .to(paquete, { duration:3, ease:'none', motionPath:{ path, align:path, alignOrigin:[.5,.5] } }, 0)
      .to(paquete, { opacity:0, duration:.15 }, 2.9);

    nodos.forEach((n,i)=>{
      const tarjeta = n.closest('.tarjeta-dolor, .pasos li') || n.parentElement;
      tl.call(()=> estallarNodo(n, tarjeta, colorB), null, i*0.9 + 0.05);
    });
  }

  /* ══════ Estallido al activarse un nodo: mucho más que un brillo suave ══════ */
  function estallarNodo(nodo, tarjeta, color){
    nodo.classList.add('nodo-encendido');
    gsap.fromTo(nodo,
      {scale:1, rotate:0},
      {scale:1.55, rotate:14, duration:.32, ease:'back.out(3)',
        onComplete:()=> gsap.to(nodo, {scale:1, rotate:0, duration:.55, ease:'elastic.out(1,0.4)'})});
    if (tarjeta){
      gsap.fromTo(tarjeta,
        {scale:1},
        {scale:1.045, duration:.28, ease:'power2.out',
          onComplete:()=> gsap.to(tarjeta, {scale:1, duration:.5, ease:'elastic.out(1,0.45)'})});
      tarjeta.classList.add('tarjeta-flash');
      setTimeout(()=> tarjeta.classList.remove('tarjeta-flash'), 700);
    }
    const anillo = document.createElement('span');
    anillo.className = 'anillo-estallido';
    anillo.style.borderColor = color;
    nodo.style.position = nodo.style.position || 'relative';
    nodo.appendChild(anillo);
    gsap.fromTo(anillo, {scale:.4, opacity:.9}, {scale:2.6, opacity:0, duration:.7, ease:'power2.out', onComplete:()=> anillo.remove()});
  }

  crearSistemaConectado('.problema-grid', '.dolor-icono', '#FFB84D', '#4CC9F0');
  crearSistemaConectado('.pasos', '.paso-num', '#4CC9F0', '#25D366');
})();
