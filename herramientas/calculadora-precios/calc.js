(function(){
const $ = id => document.getElementById(id);
const D = window.DATOS, SEC = window.SECTORES;
const KEY='calc-precios-v3', SKEY='calc-precios-escenarios-v3', MKEY='calc-mis-valores', EKEY='calc-emisor', NKEY='calc-num';
const PK = {basico:'Básico', pro:'Profesional', completo:'Completo'};
const store = { get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };
const clone = o => JSON.parse(JSON.stringify(o));
const esc = t => String(t??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toast = t => { const el=$('toast'); el.textContent=t; el.classList.add('on'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('on'),1800); };

const DEF = {cliente:'',sector:'hosteleria',empleados:'6–10',locales:'1',quien:'Encargado/a',origen:'directo',comPct:'20',comTope:0,
  respuesta:'Sin medir',resenas:'Sin mirar',pais:'es',irpf:false,irpfPct:'15',prudencia:'0.8',
  hora:'0',mult:'1',hDiag:'4',hCons:'14',hFuga:'3',colchon:'25',hSop:'1',hEvol:'3',margen:'30',
  costeModo:'fijo',costeFijo:0,canal:0,servidor:0,otros:0,convMes:'500',iaModelo:'gpt-5-mini',tamano:'normal',iaPIn:0.25,iaPOut:2,tokIn:30000,tokOut:1500,cambio:0.88,recordMes:'',costePlantilla:0,
  mercado:0,implMin:'0',roiMin:'3',paquete:'pro',precios:{},plan:'5050',medio:'transferencia',feePct:0,feeFijo:0,descUnico:'5',diagnostico:'0',fugas:null,
  pr:{validez:'30',permanencia:'12',garantia:'90',soporte:'Lunes a viernes, respuesta en 24 h laborables',plazo:'',clienteNif:'',clienteContacto:'',numero:''}};
const MIOS = ['pais','irpf','irpfPct','hora','mult','hDiag','hCons','hFuga','colchon','hSop','hEvol','margen','costeModo','costeFijo','canal','servidor','otros','convMes','iaModelo','tamano','iaPIn','iaPOut','tokIn','tokOut','cambio','costePlantilla','mercado','implMin','roiMin','plan','medio','feePct','feeFijo','descUnico','diagnostico','comPct','comTope'];
const SIMPLE = ['cliente','sector','empleados','locales','quien','origen','comPct','comTope','respuesta','resenas','pais','irpfPct','prudencia','hora','mult','hDiag','hCons','hFuga','colchon','hSop','hEvol','margen','costeModo','costeFijo','canal','servidor','otros','convMes','iaModelo','tamano','iaPIn','iaPOut','tokIn','tokOut','cambio','recordMes','costePlantilla','mercado','implMin','roiMin','plan','medio','feePct','feeFijo','descUnico','diagnostico'];
const RESET_PRECIO = ['prudencia','hora','mult','hDiag','hCons','hFuga','colchon','hSop','hEvol','margen','costeModo','costeFijo','canal','servidor','otros','convMes','iaModelo','tamano','iaPIn','iaPOut','tokIn','tokOut','cambio','recordMes','costePlantilla','implMin','roiMin'];

// selects
const opts = (arr) => arr.map(o => Array.isArray(o) ? `<option value="${esc(o[0])}">${esc(o[1])}</option>` : `<option value="${esc(o)}">${esc(o)}</option>`).join('');
const nums = (arr, suf) => arr.map(v => [String(v), `${String(v).replace('.',',')}${suf}`]);
$('sector').innerHTML = opts(Object.entries(SEC).map(([k,v])=>[k,v.nombre]));
$('empleados').innerHTML = opts(D.empleados); $('locales').innerHTML = opts(D.locales); $('quien').innerHTML = opts(D.quien);
$('origen').innerHTML = opts(D.origen); $('comPct').innerHTML = opts(nums([5,10,15,20,25,30],'%'));
$('respuesta').innerHTML = opts(D.respuesta); $('resenas').innerHTML = opts(D.resenas);
$('pais').innerHTML = opts(D.paises.map(p=>[p[0],p[1]]));
$('hora').innerHTML = opts([['0','Sin especificar']].concat(nums([15,20,25,30,35,40,45,50,60,70,80,100],' €/h')));
$('hDiag').innerHTML = opts(nums([1,2,3,4,6,8,12,16],' h'));
$('hCons').innerHTML = opts(nums([4,6,8,10,12,14,16,20,24,30,40,60,80],' h'));
$('hFuga').innerHTML = opts(nums([0,1,2,3,4,6,8,12],' h'));
$('colchon').innerHTML = opts(nums([0,10,15,20,25,30,40],'%'));
$('hSop').innerHTML = opts(nums([0,0.5,1,2,3,4,6,8],' h/mes'));
$('hEvol').innerHTML = opts(nums([0,1,2,3,4,6,8],' h/mes'));
$('margen').innerHTML = opts(nums([10,15,20,25,30,35,40,50,60],'%'));
$('convMes').innerHTML = opts(nums([100,250,500,1000,2000,5000,10000,20000],' al mes'));
$('iaModelo').innerHTML = D.ia.map(g=>`<optgroup label="${esc(g.grupo)}">${g.modelos.map(m=>`<option value="${m[0]}">${esc(m[1])} — ${String(m[2]).replace('.',',')} / ${String(m[3]).replace('.',',')} $</option>`).join('')}</optgroup>`).join('') + '<option value="custom">Otro — escribo el precio</option>';
$('tamano').innerHTML = opts(D.tamanos.map(t=>[t[0],t[1]]).concat([['custom','Personalizado — escribo los tokens']]));
$('implMin').innerHTML = opts([['0','Sin mínimo']].concat(nums([300,500,800,1000,1200,1500,2000,3000],' €')));
$('plan').innerHTML = opts(D.planes); $('medio').innerHTML = opts(D.medios.map(m=>[m[0],m[1]]));
$('descUnico').innerHTML = opts(nums([0,3,5,8,10,15],'%'));
$('diagnostico').innerHTML = opts([['0','Gratis'],['100','100 €'],['150','150 €'],['200','200 €'],['300','300 €'],['500','500 €']]);
$('fFecha').textContent = D.fecha;
$('iaFuentes').innerHTML = `<b>Precios de IA (${D.fecha}):</b> ${D.iaFuentes.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ')}. Un token ≈ ¾ de palabra.`;
$('medioFuentes').innerHTML = `<b>Comisiones:</b> ${D.mediosFuentes.map(([t,u])=>`<a href="${u}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ')}. El impuesto no es tuyo: lo cobras y lo ingresas a Hacienda.`;

let S, cur = 'EUR';
const pais = () => D.paises.find(p=>p[0]===S.pais) || D.paises[0];
const money = (n, d=0) => { if(!isFinite(n)) return '—'; try { return new Intl.NumberFormat('es-ES',{style:'currency',currency:cur,currencyDisplay:'narrowSymbol',minimumFractionDigits:d,maximumFractionDigits:d,useGrouping:'always'}).format(n); } catch(e){ return n.toFixed(d)+' '+cur; } };
const money2 = n => money(n, Math.abs(n - Math.round(n)) > 0.004 ? 2 : 0);
const x1 = r => (isFinite(r)?r:0).toFixed(1).replace('.',',')+'x';
const pct = v => Math.round(v*100)+'%';
const months = m => !isFinite(m)||m<0 ? 'no recupera' : m<1 ? Math.max(1,Math.round(m*4.3))+' semana'+(Math.round(m*4.3)>1?'s':'') : (Math.round(m*10)/10).toLocaleString('es-ES')+' meses';
const ZN = {fuga:['Fuga','b-bad','bad'],justa:['Justa','b-warn','warn'],solida:['Sólida','b-ok','ok'],fan:['Fan','b-fan','fan']};
const badge = z => `<span class="badge ${ZN[z][1]}">${ZN[z][0]}</span>`;

const TIPOS = {
  horas: {n:'Horas de trabajo', f:[['a','Horas al mes','h'],['b','Coste/hora del puesto','/h']]},
  ventas: {n:'Ventas que se escapan', f:[['a','Cuántas al mes','/mes'],['b','Ticket medio',''],['c','Margen del negocio','%'],['d','Veces que vuelve','×']]},
  plantones: {n:'Plantones', f:[['a','Citas al mes','/mes'],['b','% que no viene','%'],['c','% que se evita','%'],['d','Ticket medio',''],['e','Margen del hueco','%']]},
  gasto: {n:'Gasto que desaparece', f:[['a','Lo que deja de pagar al mes','€/mes']]}
};
const NUEVA = t => ({horas:{nombre:D.catalogo.horas[0],a:0,b:0,nota:'Horas y coste/hora: pregúntalos.'},
  ventas:{nombre:D.catalogo.ventas[0],a:0,b:0,c:60,d:1,nota:'Cuántas, ticket y margen: pregúntalos.'},
  plantones:{nombre:D.catalogo.plantones[0],a:0,b:0,c:30,d:0,e:80,nota:'Citas al mes y % que falla: pregúntalos.'},
  gasto:{nombre:D.catalogo.gasto[0],a:0,nota:'Solo si de verdad deja de pagarlo. De su factura.'}})[t];

// Lo que es dinero arranca en 0: el que entra lo rellena con sus números. Los % se quedan.
const IMPORTE = {horas:['b'], ventas:['b'], plantones:['d'], gasto:['a']};
const sinImportes = fs => clone(fs).map(f => { (IMPORTE[f.tipo]||[]).forEach(k => f[k] = 0); return f; });
function loadState(s){
  const mis = store.get(MKEY) || {};
  S = {...clone(DEF), ...mis, ...s};
  S.pr = {...clone(DEF.pr), ...(s && s.pr || {})};
  if (!Array.isArray(S.fugas)) S.fugas = sinImportes(SEC[S.sector].fugas);
  if (!S.precios) S.precios = {};
  SIMPLE.forEach(k => { if($(k)) $(k).value = S[k] ?? ''; });
  $('irpf').checked = !!S.irpf;
  renderFugas();
}

function renderFugas(){
  const cli = document.body.dataset.view === 'cliente';
  $('fugas').innerHTML = S.fugas.map((f,i)=>{
    const t = TIPOS[f.tipo], cat = D.catalogo[f.tipo]||[];
    const enCat = cat.includes(f.nombre);
    return `<div class="fuga" data-i="${i}">
      <div class="head">
        ${cli ? `<b style="flex:1">${esc(f.nombre)}</b>` : `<select class="nm" data-k="nombreSel">${cat.map(c=>`<option ${c===f.nombre?'selected':''}>${esc(c)}</option>`).join('')}<option value="__otra" ${enCat?'':'selected'}>Otra (escribir)…</option></select>
        ${enCat?'':`<input class="nm" type="text" data-k="nombre" value="${esc(f.nombre)}" placeholder="Nombre de la fuga">`}
        <select data-k="tipo" style="min-width:0">${Object.entries(TIPOS).map(([k,v])=>`<option value="${k}" ${k===f.tipo?'selected':''}>${v.n}</option>`).join('')}</select>
        <button class="btn sm" data-del="${i}" title="Quitar">✕</button>`}
      </div>
      <div class="fields">${t.f.map(([k,l,u])=>`<div><label>${l}</label><div class="inp"><input type="number" min="0" step="any" data-k="${k}" value="${f[k]??0}"><span class="u">${u==='/h'?'<span class=mon>€</span>/h':u===''?'<span class=mon>€</span>':u==='€/mes'?'<span class=mon>€</span>/mes':u}</span></div></div>`).join('')}</div>
      <div class="foot"><span class="nota solo-mia"><span class="chip" data-chip>Falta dato</span> ${esc(f.nota||'')}</span><span class="val" data-val>—</span></div>
    </div>`;
  }).join('') || '<div class="hint">Sin fugas. Añade una abajo.</div>';
  $('fugas').querySelectorAll('.fuga').forEach(el => {
    const i = +el.dataset.i;
    el.querySelectorAll('[data-k]').forEach(inp => inp.addEventListener(inp.tagName==='SELECT'?'change':'input', () => {
      const k = inp.dataset.k;
      if (k==='nombreSel'){ S.fugas[i].nombre = inp.value==='__otra' ? '' : inp.value; renderFugas(); return calc(); }
      if (k==='tipo'){ const {nombre, ...d} = NUEVA(inp.value); S.fugas[i] = {...S.fugas[i], tipo:inp.value, a:0,b:0,c:0,d:0,e:0, ...d, nombre}; S.precios={}; renderFugas(); return calc(); }
      S.fugas[i][k] = inp.value;
      if (k!=='nombre' && document.body.dataset.view!=='cliente') S.precios = {};
      calc();
    }));
  });
  $('fugas').querySelectorAll('[data-del]').forEach(b => b.onclick = () => { S.fugas.splice(+b.dataset.del,1); S.precios={}; renderFugas(); calc(); });
}
document.querySelectorAll('[data-add]').forEach(b => b.onclick = () => { const t=b.dataset.add; S.fugas.push({tipo:t, ...NUEVA(t)}); renderFugas(); calc(); });

function contenido(k, r){
  const fs = r.fugas.filter(f=>f.bruto>0).sort((a,b)=>b.bruto-a.bruto);
  // Lo que se entrega, no el problema: cada fuga pasa a una tarea resuelta. Cada paquete se lee solo, sin «todo lo del…».
  const VERBO = {horas:'Automatizar', ventas:'Recuperar', plantones:'Reducir', gasto:'Sustituir'};
  const entrega = f => `${VERBO[f.tipo]||'Resolver'}: ${f.nombre}`;
  // El mantenimiento no va aquí: ya lo describe la línea de la cuota.
  const sel = k==='basico' ? fs.slice(0,1) : fs;
  const base = sel.length ? sel.map(entrega) : ['Automatización de la tarea que más cuesta hoy'];
  if (k==='basico') return base;
  if (k==='pro') return [...base, 'Aviso al equipo cuando hace falta una persona'];
  return [...base, 'Aviso al equipo cuando hace falta una persona', 'Horas de mejora cada mes', 'Revisión periódica: dónde más se puede ganar', 'Soporte prioritario'];
}

function calc(){
  SIMPLE.forEach(k => { if($(k)) S[k] = $(k).value; });
  S.irpf = $('irpf').checked;
  const P0 = pais(); cur = P0[3]; S.impuesto = P0[2];
  const sec = SEC[S.sector];
  S.costeHoraRef = (S.fugas.find(f=>f.tipo==='horas')||{}).b || sec.costeHora;
  // IA
  if (S.iaModelo !== 'custom'){ const m = D.ia.flatMap(g=>g.modelos).find(m=>m[0]===S.iaModelo); if(m){ S.iaPIn=m[2]; S.iaPOut=m[3]; $('iaPIn').value=m[2]; $('iaPOut').value=m[3]; } }
  if (S.tamano !== 'custom'){ const t = D.tamanos.find(t=>t[0]===S.tamano); if(t){ S.tokIn=t[2]; S.tokOut=t[3]; $('tokIn').value=t[2]; $('tokOut').value=t[3]; } }
  ['rowPIn','rowPOut'].forEach(id=>$(id).classList.toggle('hide', S.iaModelo!=='custom'));
  ['rowTokIn','rowTokOut'].forEach(id=>$(id).classList.toggle('hide', S.tamano!=='custom'));
  $('modoFijo').classList.toggle('hide', S.costeModo!=='fijo'); $('modoPers').classList.toggle('hide', S.costeModo==='fijo');
  $('rowCom').classList.toggle('hide', S.origen!=='partner'); $('rowTope').classList.toggle('hide', S.origen!=='partner');
  $('rowDesc').classList.toggle('hide', S.plan!=='unico');
  $('rowIrpf').classList.toggle('hide', !P0[4]);
  if (!P0[4]) { S.irpf = false; $('irpf').checked = false; }
  document.querySelectorAll('.irpfc').forEach(e=>e.classList.toggle('hide', !S.irpf));
  const med = D.medios.find(m=>m[0]===S.medio) || D.medios[0]; $('medioNota').textContent = med[4];
  document.querySelectorAll('.mon').forEach(e => e.textContent = money(0).replace(/[\d\s.,]/g,'') || cur);
  { const mm = P0[1].match(/\((\w+)/); $('thImp').textContent = mm && mm[1] !== 'sin' ? mm[1] : 'Impuesto'; }

  const r = Calc.compute(S), sel = r.sel, P = r.paquetes;
  const vista = document.body.dataset.view;

  // hero
  $('hCli').textContent = S.cliente.trim() || 'Tu negocio';
  $('hPierde').textContent = money(r.paquetes.pro.valor); $('hAno').textContent = money(r.paquetes.pro.valor*12); $('hPay').textContent = months(r.payback);

  // ficha
  $('sectorInfo').innerHTML = `<b>Fuga que suele doler más:</b> ${esc(sec.via)}<br><b>Coste/hora de referencia:</b> ${String(sec.costeHora).replace('.',',')} €/h — ${esc(sec.costeHoraNota)}`
    + (sec.fuentes.length ? `<br><b>Fuentes:</b><ul>${sec.fuentes.map(([t,u])=>`<li><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul>` : '');

  // fugas
  document.querySelectorAll('#fugas .fuga').forEach(el => {
    const f = r.fugas[+el.dataset.i]; if(!f) return;
    el.querySelector('[data-val]').textContent = money(vista==='cliente' ? f.bruto*(+S.prudencia) : f.bruto)+'/mes';
    el.classList.toggle('falta', f.bruto<=0);
    const ch = el.querySelector('[data-chip]'); if (ch) ch.classList.toggle('hide', f.bruto>0);
  });
  $('oBruto').textContent = money(P.pro.bruto)+'/mes'; $('oValor').textContent = money(P.pro.valor)+'/mes'; $('oNada').textContent = money(P.pro.valor*12);

  // coste
  const t = r.tec;
  $('oConv').textContent = money(r.costeConv, 4);
  $('fTec').textContent = t.modo==='fijo' ? '' : `fijos ${money(t.fijo)} + IA ${money(t.ia,2)} + ${Math.round(t.record)} recordatorios ${money(t.plantillas,2)}`;
  $('oTec').textContent = money(t.total,2)+'/mes'; $('oTec3').textContent = money(r.tec3.total,2)+'/mes';
  const ks = ['basico','pro','completo'];
  const fila = (tt, fn, big) => `<tr${big?' class="tot"':''}><td>${tt}</td>${ks.map(k=>`<td class="n">${fn(P[k])}</td>`).join('')}</tr>`;
  $('tSuelo').innerHTML = fila('Horas de implantación', p=>Math.round(p.horasImpl*10)/10+' h') + fila('Coste implantación', p=>money(p.costeImpl)) + fila('Coste mensual', p=>money(p.costeMes))
    + fila('Suelo implantación', p=>money(p.sueloImpl)) + fila('Suelo cuota', p=>money(p.sueloCuota)+'/mes') + fila('Suelo año 1', p=>money(p.sueloAno), true) + fila('Techo año 1 (cliente)', p=>money(p.techoAno));

  // paquetes
  $('pkgs').innerHTML = ks.map(k => { const p=P[k], tot=p.impl+12*p.cuota, roi = tot? p.valor*12/tot : 0, z=Calc.zona(roi, r.roiMin);
    if (vista==='cliente' && z==='fuga' && k!==S.paquete) return '';
    return `<div class="pkg ${k==='pro'?'rec':''} ${S.paquete===k?'sel':''}" data-k="${k}">
      <div class="t">${k==='completo'?'Mejora continua':k==='pro'?'Todo lo que se escapa':'Lo principal'}</div>
      <div class="nm">${PK[k]}</div>
      ${vista==='cliente' ? `<div class="price">${money(p.impl)} <small>+ ${money(p.cuota)}/mes</small></div>`
        : `<div class="pr"><div><label>Implantación</label><input type="number" min="0" step="50" data-p="impl" value="${p.impl}"></div><div><label>Cuota/mes</label><input type="number" min="0" step="10" data-p="cuota" value="${p.cuota}"></div></div>`}
      <ul>${contenido(k, r).map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
      <div class="meta"><span>Primer año: ${money(tot)}</span><span class="roi" style="color:var(--${ZN[z][2]})">${x1(roi)}</span></div>
      ${p.manual && vista!=='cliente' ?`<div class="meta"><span class="man">Precio manual</span><button class="btn sm" data-auto="${k}">Automático</button></div>`:''}
    </div>`; }).join('');
  $('pkgs').querySelectorAll('.pkg').forEach(el => {
    el.onclick = e => { if (e.target.closest('input,button')) return; S.paquete = el.dataset.k; calc(); };
    el.querySelectorAll('[data-p]').forEach(inp => inp.addEventListener('change', () => { const k = el.dataset.k; S.precios[k] = {...(S.precios[k]||{}), [inp.dataset.p]: inp.value}; S.paquete = k; calc(); }));
  });
  $('pkgs').querySelectorAll('[data-auto]').forEach(b => b.onclick = () => { delete S.precios[b.dataset.auto]; calc(); });

  // barra
  const total = r.totalBase, lo = Math.min(sel.sueloAno,sel.techoAno), hi = Math.max(sel.sueloAno,sel.techoAno);
  const maxV = Math.max(sel.techoAno, sel.sueloAno, total)*1.12 || 1, pc = v => Math.min(100,Math.max(0,v/maxV*100));
  const noDa = sel.sueloAno > sel.techoAno;
  $('barZone').style.left = pc(lo)+'%'; $('barZone').style.width = (pc(hi)-pc(lo))+'%';
  $('barZone').style.background = noDa?'var(--badBg)':''; $('barZone').style.borderColor = noDa?'var(--bad)':'';
  $('mkSuelo').style.left = pc(sel.sueloAno)+'%'; $('mkSuelo').textContent = 'Tu suelo '+money(sel.sueloAno);
  $('mkTecho').style.left = pc(sel.techoAno)+'%'; $('mkTecho').textContent = 'Su techo '+money(sel.techoAno);
  const close = Math.abs(pc(sel.techoAno)-pc(sel.sueloAno))<22;
  $('mkSuelo').style.transform = close && sel.sueloAno<sel.techoAno ? 'translateX(-100%)' : close ? 'translateX(0)' : '';
  $('mkTecho').style.transform = close && sel.sueloAno<sel.techoAno ? 'translateX(0)' : close ? 'translateX(-100%)' : '';
  $('barPin').style.left = pc(total)+'%'; $('mkTotal').style.left = pc(total)+'%'; $('mkTotal').textContent = PK[S.paquete]+' '+money(total);

  // pagos
  const lines = [...r.cobros, r.cuotaLinea];
  $('tCobro').innerHTML = lines.map(l => `<tr${l.veces>1?' style="color:var(--muted)"':''}>
    <td>${esc(l.concepto)}${l.veces>1?' <small>× 12</small>':''}</td><td class="n">${money2(l.base)}</td><td class="n">${money2(l.imp)}</td>
    <td class="n irpfc ${S.irpf?'':'hide'}">−${money2(l.ret)}</td><td class="n"><b>${money2(l.cobrar)}</b></td>
    <td class="solo-mia">${esc(med[1])}${S.medio==='bizum' && l.bizums>1 ? ` · ${l.bizums} envíos` : ''}${l.fee? ` · comisión ${money2(l.fee)}`:''}</td></tr>`).join('');
  $('oTotImp').textContent = money2(r.totalConImp);
  $('oTotBase').textContent = `${money(r.totalBase)} + ${money2(r.totalImp)} de impuestos · ${r.plan}${r.desc?` · ahorra ${money(r.impl*r.desc)}`:''}`;
  $('oCuotaCli').textContent = money2(r.cuotaLinea.cobrar)+'/mes';
  $('oNeto').textContent = money(r.neto);
  $('oNetoTxt').textContent = [r.com.importe?`− ${money2(r.com.importe)} de comisión (${r.com.pct}%${r.com.topado?', con tope':''})`:'', r.fees?`− ${money2(r.fees)} del medio de pago`:''].filter(Boolean).join(' · ') || 'Sin comisiones';
  $('fBenef').textContent = `lo que te queda − costes (${money(r.costeAno)})`;
  $('oBenef').textContent = money(r.benef); $('oBenef').style.color = r.benef<0?'var(--bad)':'';
  $('oHoraReal').textContent = money(r.horaReal,1)+'/h'; $('oHoraReal').style.color = r.horaReal<+S.hora?'var(--warn)':'';

  // gana
  $('oRoi').textContent = x1(r.roi); $('oZona').innerHTML = vista==='cliente' ? '' : badge(r.zona);
  const eBox = (id,v) => { $(id).textContent = x1(v); $(id).style.color = `var(--${v<1?'bad':v<5?'warn':'ok'})`; };
  eBox('eMalo', r.roiMalo); eBox('eNormal', r.roi); eBox('eBueno', r.roiBueno);
  $('oPayback').textContent = months(r.payback); $('oNetoCli').textContent = money(r.netoCliente);
  $('fMedia').textContent = `${Math.round(r.horasPersona)} h/mes`; $('oMedia').textContent = money(r.mediaJornada)+'/mes'; $('oCuotaCmp').textContent = money(r.cuota)+'/mes';
  $('hGarantia').innerHTML = r.garantia ? '<b>Puedes ofrecer garantía</b>: incluso en el escenario malo recupera el doble.' : '<b>No ofrezcas garantía de devolución</b> con estos números: en el escenario malo no recupera el doble.';
  $('hGarantia').className = 'hint solo-mia '+(r.garantia?'info':'warn');
  document.querySelectorAll('#zonas tr').forEach(tr => tr.classList.toggle('cur', tr.dataset.z===r.zona));
  $('zFuga').textContent = `0–${r.roiMin}x`; $('zJusta').textContent = `${r.roiMin}–5x`;
  $('zonas').querySelector('[data-z="justa"]').classList.toggle('hide', r.roiMin>=5);

  // checks
  const txt = {
    coste: c => ['Cubres tu coste con tu margen', `Te quedan ${money(c.d.neto)} y tu suelo es ${money(c.d.suelo)}${c.ok?'.':`: faltan ${money(c.d.suelo-c.d.neto)}.`}${c.d.com?` Ya descontada la comisión (${money(c.d.com)}).`:''}`],
    cuota: c => ['La cuota se paga sola', c.ok ? `${money(c.d.cuota)}/mes cubre herramientas y soporte (mín. ${money(c.d.suelo)}).` : `Por debajo de ${money(c.d.suelo)}/mes pierdes dinero cada mes.`],
    hora: c => ['Tu hora real llega a tu objetivo', `Sale a ${money(c.d.horaReal,1)}/h (objetivo ${money(+c.d.hora)}/h).`],
    volumen: c => ['Aguantas si el volumen se triplica', c.d.fijo ? 'Coste fijo: cambia a «Personalizado» para comprobarlo.' : c.ok ? `Con el triple, la cuota (${money(c.d.cuota)}) sigue cubriendo el coste (${money(c.d.costeMes3)}).` : `Con el triple te costaría ${money(c.d.costeMes3)}/mes y cobras ${money(c.d.cuota)}. Pon límite de uso en el contrato o sube la cuota.`],
    roi: c => [`Recupera al menos ${c.d.roiMin}x lo que paga`, c.ok ? `Recupera ${x1(c.d.roi)}.` : `Con ${x1(c.d.roi)} no le compensa lo suficiente.`],
    malo: c => ['No pierde ni en el escenario malo', c.ok ? `Aunque solo se note la mitad, recupera ${x1(c.d.roiMalo)}.` : `Si solo se nota la mitad, pierde dinero (${x1(c.d.roiMalo)}).`],
    techo: c => ['La cuota no se come lo que gana', c.ok ? `${money(c.d.cuota)} ≤ ${money(c.d.techo)} (lo que gana al mes ÷ ${c.d.roiMin}).` : `Paga ${money(c.d.cuota)}/mes y solo recupera ${money(c.d.techo*c.d.roiMin)}/mes.`],
    solida: c => ['Zona sólida (5x o más)', c.ok ? 'Renueva seguro.' : `Con ${x1(c.d.roi)} gana, pero enséñale cada mes lo que recupera.`],
    mercado: c => ['Cerca del precio de mercado', c.d.mercado ? `Implantación ${c.d.vsMercado>=0?'+':''}${Math.round(c.d.vsMercado*100)}% respecto a ${money(c.d.mercado)}.${c.ok?'':' Justifícalo con sus números.'}` : 'Sin precio de mercado.'],
    minimo: c => ['Implantación por encima de tu mínimo', c.ok ? `${money(c.d.impl)} ≥ ${money(c.d.implMin)}.` : `${money(c.d.impl)} está por debajo de tu mínimo de ${money(c.d.implMin)}.`]
  };
  const paint = (id, arr) => $(id).innerHTML = arr.map(c => { const [tt,d] = txt[c.id](c); return `<div class="check ${c.ok?'ok':c.warn?'warn':'bad'}"><span class="ic">${c.ok?'✓':c.warn?'!':'✕'}</span><div><b>${tt}</b><span>${d}</span></div></div>`; }).join('');
  paint('cTu', r.checks.tu); paint('cEl', r.checks.el); paint('cMer', r.checks.mercado);
  const v = r.veredicto;
  $('verdict').className = 'verdict '+v.k; $('verdict').innerHTML = `<span>${v.k==='ok'?'✓':v.k==='bad'?'✕':'!'}</span>${esc(v.t)}`;
  const tuOk = !r.checks.tu.some(c=>!c.ok&&!c.warn), elOk = !r.checks.el.some(c=>!c.ok&&!c.warn);
  $('sVerdict').innerHTML = `<div class="verdict ${v.k}" style="margin:0;font-size:14px">${esc(v.t)}</div>${r.valor>0?`<div class="sides"><div class="side ${tuOk?'ok':'bad'}">Tú ${tuOk?'no pierdes':'pierdes'}</div><div class="side ${elOk?'ok':'bad'}">Él ${elOk?'no pierde':'pierde'}</div></div>`:''}`;

  const st = {0:!!S.cliente, 1:r.valor>0, 2:sel.sueloAno>0, 3:!noDa&&r.valor>0, 4:r.totalBase>0, 5:r.roi>=r.roiMin&&r.roiMalo>=1, 6:v.k==='ok', 7:true, 8:(store.get(SKEY)||[]).length>0};
  document.querySelectorAll('.dot').forEach(d => { const k=+d.dataset.d; d.className='dot '+(st[k]?'ok':(k>=3&&k<=6&&r.valor>0?'bad':'')); d.textContent=st[k]?'✓':''; });

  // Sin datos todavía: nada en rojo, solo un guion.
  $('sRoi').textContent = r.valor>0 ? x1(r.roi) : '—'; $('sRoi').style.color = r.valor>0 ? `var(--${ZN[r.zona][2]})` : 'var(--dim)';
  $('sZona').innerHTML = vista==='cliente' || !(r.valor>0) ? '' : badge(r.zona); $('sNeedle').style.left = Math.min(100, r.roi/15*100)+'%';
  $('sPkg').textContent = PK[S.paquete];
  $('sValor').textContent = money(r.valor)+'/mes'; $('sImpl').textContent = money(r.implCobrada)+(r.desc?' (−'+pct(r.desc)+')':'');
  $('sCuota').textContent = money(r.cuota)+'/mes'; $('sTotal').textContent = money2(r.totalConImp);
  $('sPay').textContent = months(r.payback); $('sNetoCli').textContent = money(r.netoCliente); $('sNeto').textContent = money(r.neto);
  $('sMargen').textContent = pct(r.margenReal); $('sMargen').style.color = r.margenReal < (+S.margen/100) ? 'var(--warn)' : '';
  $('sMer').textContent = r.mercado ? (r.vsMercado>=0?'+':'')+Math.round(r.vsMercado*100)+'%' : '—';
  $('preguntas').innerHTML = sec.preguntas.map(p=>`<li>${esc(p)}</li>`).join('');

  calc.r = r;
  if (!$('docWrap').classList.contains('hide')) renderDoc();
  store.set(KEY, S);
}

// eventos
SIMPLE.forEach(k => { const el=$(k); if(!el) return; el.addEventListener(el.tagName==='SELECT'?'change':'input', () => {
  if (k==='sector'){ S.sector = el.value; S.fugas = sinImportes(SEC[el.value].fugas); S.precios = {}; renderFugas(); }
  if (k==='medio'){ const m = D.medios.find(m=>m[0]===el.value); $('feePct').value = m[2]; $('feeFijo').value = m[3]; }
  if (k==='pais'){ const p = D.paises.find(p=>p[0]===el.value); if (p[3]==='USD') $('cambio').value = 1; }
  if (RESET_PRECIO.includes(k)) S.precios = {};
  calc(); }); });
$('irpf').addEventListener('change', calc);
$('bReset').onclick = () => { if(!confirm('¿Empezar un cliente nuevo? Se mantienen tus valores guardados y los escenarios.')) return; loadState({}); calc(); };
const EJEMPLO = {cliente:'Restaurante ejemplo', sector:'hosteleria', empleados:'6–10', quien:'Encargado/a', hCons:'14', hFuga:'3', hora:'30', costeModo:'fijo', costeFijo:90,
  precios:{pro:{impl:1500,cuota:180}}, paquete:'pro',
  fugas:[{tipo:'horas',nombre:'Contestar WhatsApp y llamadas',a:26,b:11,nota:'1 h al día × 26 días. 11 €/h: lo que cobra un camarero en Sevilla.'},
    {tipo:'ventas',nombre:'Clientes que escriben fuera de horario y no vuelven',a:12,b:75,c:60,d:1,nota:'3 por semana; mesa de 3 × 25 €; 60% de margen.'},
    {tipo:'plantones',nombre:'Citas o reservas que no se presentan',a:350,b:5,c:50,d:75,e:60,nota:'350 reservas; 5% fallan (dato de ejemplo); el recordatorio evita la mitad.'}]};
const cargarEjemplo = () => { loadState({...(store.get(MKEY)||{}), ...clone(EJEMPLO)}); calc(); };
$('bEjemplo').onclick = () => { if (S.fugas.some(f=>Calc.valorFuga(f)>0) && !confirm('¿Cargar el ejemplo? Se sustituyen los datos del cliente actual.')) return; cargarEjemplo(); toast('Ejemplo cargado: restaurante medio'); };
// Todo lo que guarda la calculadora vive solo en este navegador; esto lo borra entero (ordenador compartido).
$('bBorrar').onclick = () => { if (!confirm('¿Borrar todo lo que la calculadora ha guardado en este navegador? Tus valores, tus datos del presupuesto y los escenarios.')) return;
  [KEY, SKEY, MKEY, EKEY, NKEY, 'calc-theme'].forEach(k => { try { localStorage.removeItem(k); } catch(e){} }); location.href = location.pathname; };
$('bMisValores').onclick = () => { const m = {}; MIOS.forEach(k => m[k] = S[k]); store.set(MKEY, m); toast('Guardados como tus valores'); };

// vistas
function setView(v){ document.body.dataset.view = v; $('vMia').classList.toggle('on', v==='mia'); $('vCli').classList.toggle('on', v==='cliente'); renderFugas(); calc(); try{sessionStorage.setItem('calc-vista',v)}catch(e){} }
$('vMia').onclick = () => setView('mia'); $('vCli').onclick = () => setView('cliente');

// escenarios
function renderScen(){
  const list = store.get(SKEY) || [];
  $('scenBody').innerHTML = list.length ? list.map((s,i) => `<tr>
    <td><b>${esc(s.name)}</b><br><small style="color:var(--dim)">${esc(s.date)}</small></td><td>${PK[s.r.paquete]||''}</td>
    <td class="n">${Math.round(s.r.valor)}</td><td class="n">${s.r.impl}</td><td class="n">${s.r.cuota}</td><td class="n">${s.r.total.toFixed(2)}</td>
    <td>${x1(s.r.roi)} ${badge(s.r.zona)}</td>
    <td><span class="badge b-${s.r.v==='ok'?'ok':s.r.v==='bad'?'bad':'warn'}">${s.r.v==='ok'?'Nadie pierde':s.r.v==='bad'?'Revisar':'Falta dato'}</span></td>
    <td style="white-space:nowrap"><button class="btn sm" data-l="${i}">Cargar</button> <button class="btn sm" data-x="${i}">✕</button></td></tr>`).join('')
    : `<tr><td colspan="9" style="color:var(--dim)">Aún no hay escenarios. Pulsa «Guardar» arriba.</td></tr>`;
  $('scenBody').querySelectorAll('[data-l]').forEach(b => b.onclick = () => { loadState(list[+b.dataset.l].s); calc(); scrollTo({top:0,behavior:'smooth'}); toast('Escenario cargado'); });
  $('scenBody').querySelectorAll('[data-x]').forEach(b => b.onclick = () => { if(!confirm(`¿Borrar «${list[+b.dataset.x].name}»?`)) return; list.splice(+b.dataset.x,1); store.set(SKEY,list); renderScen(); calc(); });
}
$('bSave').onclick = () => { const r = calc.r, list = store.get(SKEY)||[];
  list.push({name:S.cliente.trim()||`Escenario ${list.length+1}`, date:new Date().toLocaleString('es-ES',{dateStyle:'short',timeStyle:'short'}), s:clone(S),
    r:{paquete:S.paquete,valor:r.valor,impl:r.implCobrada,cuota:r.cuota,total:r.totalConImp,roi:r.roi,zona:r.zona,v:r.veredicto.k}});
  store.set(SKEY,list); renderScen(); calc(); toast('Escenario guardado'); };
$('bCsv').onclick = () => { const list = store.get(SKEY)||[]; if(!list.length) return toast('No hay escenarios');
  const q = v => `"${String(v).replace(/"/g,'""')}"`;
  const rows = [['Escenario','Fecha','Paquete','Pierde al mes','Implantación','Cuota','Año 1 con impuestos','ROI','Veredicto']].concat(list.map(s=>[s.name,s.date,PK[s.r.paquete],Math.round(s.r.valor),s.r.impl,s.r.cuota,s.r.total.toFixed(2),s.r.roi.toFixed(1),s.r.v]));
  const blob = new Blob(['﻿'+rows.map(r=>r.map(q).join(';')).join('\n')],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'escenarios-precios.csv'; a.click(); URL.revokeObjectURL(a.href); };

// presupuesto
const PIE_MARCA = 'Hecho con la calculadora gratis de InfinitumTech As · www.aminautomation.com/calcula'; // la versión pública pone «Hecho con la calculadora de InfinitumTech As»
const LOGO_DOC = false; // la versión pública lo pone a false: el presupuesto es del que lo usa
const LOGO_SVG = document.querySelector('.logo svg.marca').outerHTML;
const EM = () => store.get(EKEY) || {};
function numero(){ if (S.pr.numero) return S.pr.numero; const y = new Date().getFullYear(); const nn = (store.get(NKEY)||0)+1; return `P-${y}-${String(nn).padStart(3,'0')}`; }
function renderDoc(){
  const r = calc.r, em = EM(), pr = S.pr, P0 = pais();
  const hoy = new Date(), hasta = new Date(hoy.getTime() + (+pr.validez)*864e5);
  const f = d => d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'});
  const fs = r.fugas.filter(x=>x.bruto>0).sort((a,b)=>b.bruto-a.bruto);
  const impNom = $('thImp').textContent;
  const filas = [];
  if (r.diag>0) filas.push(['Diagnóstico inicial', 1, r.diag]);
  filas.push([`Implantación — paquete ${PK[S.paquete]}`, 1, r.impl]);
  if (r.desc) filas.push([`Descuento por pago único (${pct(r.desc)})`, 1, -r.impl*r.desc]);
  filas.push(['Cuota mensual: alojamiento, vigilancia, soporte y cambios pequeños', 12, r.cuota]);
  $('doc').innerHTML = `
  <div class="dh"><div class="em">${LOGO_DOC?LOGO_SVG:''}${em.nombre?`<b>${esc(em.nombre)}</b>`:`<b class="falta">Tus datos: rellénalos arriba</b>`}
    ${em.nif?`<div>NIF ${esc(em.nif)}</div>`:''}${em.email?`<div>${esc(em.email)}</div>`:''}${em.tel?`<div>${esc(em.tel)}</div>`:''}${em.web?`<div>${esc(em.web)}</div>`:''}</div>
    <div class="tt"><h2>PRESUPUESTO</h2><div>Nº <b>${esc(numero())}</b></div><div>Fecha: <b>${f(hoy)}</b></div><div>Válido hasta: <b>${f(hasta)}</b></div></div></div>
  <div class="cli"><div class="bx"><h4 style="margin:0 0 4px">Para</h4><b>${esc(S.cliente||'Cliente')}</b>${pr.clienteNif?`<div>NIF ${esc(pr.clienteNif)}</div>`:''}${pr.clienteContacto?`<div>${esc(pr.clienteContacto)}</div>`:''}</div>
    <div class="bx"><h4 style="margin:0 0 4px">Lo que se escapa hoy</h4><b style="font:800 20px ui-monospace,'Cascadia Mono','SF Mono',Menlo,Consolas,monospace">${money(r.valor)}/mes</b><div>${money(r.valor*12)} al año, calculado a la baja</div></div></div>
  ${fs.length?`<h4>De dónde sale</h4><ul>${fs.map(x=>`<li>${esc(x.nombre)}: ${money(x.bruto*(+S.prudencia))} al mes</li>`).join('')}</ul>`:''}
  <h4>Qué incluye — paquete ${PK[S.paquete]}</h4><ul>${contenido(S.paquete, r).map(c=>`<li>${esc(c)}</li>`).join('')}</ul>
  <h4>Importe</h4>
  <table><thead><tr><th>Concepto</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th></tr></thead><tbody>
    ${filas.map(([c,q,p])=>`<tr><td>${esc(c)}</td><td class="n">${q}</td><td class="n">${money2(p)}</td><td class="n">${money2(p*q)}</td></tr>`).join('')}
    <tr><td colspan="3">Base imponible</td><td class="n">${money2(r.totalBase)}</td></tr>
    <tr><td colspan="3">${esc(impNom)} (${P0[2]}%)</td><td class="n">${money2(r.totalImp)}</td></tr>
    ${S.irpf?`<tr><td colspan="3">Retención IRPF (${S.irpfPct}%)</td><td class="n">−${money2(r.totalBase*S.irpfPct/100)}</td></tr>`:''}
    <tr class="tot"><td colspan="3">Total primer año</td><td class="n">${money2(r.totalConImp - (S.irpf? r.totalBase*S.irpfPct/100 : 0))}</td></tr>
  </tbody></table>
  <h4>Cómo se paga — ${esc(r.plan)} · ${esc((D.medios.find(m=>m[0]===S.medio)||[])[1]||'')}${r.tax?` · ${esc(impNom)} incluido`:''}${S.irpf?', IRPF descontado':''}</h4>
  <table><tbody>${[...r.cobros, r.cuotaLinea].map(l=>`<tr><td>${esc(l.concepto)}${l.veces>1?' (12 meses)':''}</td><td class="n">${money2(l.cobrar)}${l.veces>1?' /mes':''}</td></tr>`).join('')}</tbody></table>
  ${em.iban?`<p class="iban">Cuenta para el pago: <b>${esc(em.iban)}</b></p>`:''}
  <h4>Retorno estimado</h4>
  <div class="hl"><div><small>Recupera la inversión</small><b>${months(r.payback)}</b></div><div><small>Le queda limpio el año 1</small><b>${money(Math.max(0,r.netoCliente))}</b></div><div><small>Por cada ${money(1)} invertido, vuelven</small><b>${money(r.roi,1)}</b></div></div>
  <h4>Condiciones</h4><ul>
    ${+pr.permanencia?`<li>Permanencia mínima de ${pr.permanencia} meses desde la entrega; después, mes a mes con 30 días de preaviso.</li>`:'<li>Sin permanencia: la cuota se puede cancelar con 30 días de preaviso.</li>'}
    ${+pr.garantia?`<li>Garantía de ${pr.garantia} días: si falla algo de lo entregado, se arregla sin coste.</li>`:''}
    <li>Soporte: ${esc(pr.soporte)}.</li>
    <li>La cuota no incluye funciones nuevas ni integraciones con otros programas: se presupuestan aparte.</li>
    <li>${pr.plazo?`Plazo de entrega: ${esc(pr.plazo)}, contados desde que el cliente entrega los datos y accesos necesarios.`:'El plazo de entrega empieza cuando el cliente entrega los datos y accesos necesarios.'}</li>
    <li>Estimación de retorno hecha a la baja con los datos facilitados por el cliente; no es una garantía de resultados.</li></ul>
  <div class="firmas"><div>Por ${esc(em.nombre||'la empresa')}</div><div>Aceptado por ${esc(S.cliente||'el cliente')} — fecha y firma</div></div>
  <div class="pie">Presupuesto ${esc(numero())} · ${f(hoy)}${PIE_MARCA?`<br>${PIE_MARCA}`:''}</div>`;
}
function openDoc(){
  const em = EM();
  document.querySelectorAll('[data-em]').forEach(i => i.value = em[i.dataset.em]||'');
  document.querySelectorAll('[data-pr]').forEach(i => i.value = i.dataset.pr==='numero' ? (S.pr.numero||'') : (S.pr[i.dataset.pr] ?? ''));
  document.querySelector('[data-pr="numero"]').placeholder = numero();
  if (innerWidth < 600) $('docEdit').open = false; // en el móvil, primero el documento
  $('docWrap').classList.remove('hide'); renderDoc();
}
document.querySelectorAll('[data-em]').forEach(i => i.addEventListener('input', () => { const em = EM(); em[i.dataset.em] = i.value; store.set(EKEY, em); renderDoc(); }));
document.querySelectorAll('[data-pr]').forEach(i => i.addEventListener(i.tagName==='SELECT'?'change':'input', () => { S.pr[i.dataset.pr] = i.value; store.set(KEY,S); renderDoc(); }));
$('bDoc').onclick = openDoc; $('bDocClose').onclick = () => $('docWrap').classList.add('hide');
$('bPrint').onclick = () => { renderDoc(); if (!EM().nombre) toast('Rellena tus datos arriba: el presupuesto sale sin nombre.'); window.print(); if (!S.pr.numero) store.set(NKEY, (store.get(NKEY)||0)+1); };

// tema y nav
$('bTheme').onclick = () => { const r=document.documentElement, c=r.dataset.theme||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'); r.dataset.theme = c==='light'?'dark':'light'; try{localStorage.setItem('calc-theme',r.dataset.theme)}catch(e){} };
try{ const t=localStorage.getItem('calc-theme'); if(t) document.documentElement.dataset.theme=t; }catch(e){}
const obs = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting) document.querySelectorAll('nav.steps a').forEach(a => a.classList.toggle('on', a.getAttribute('href')==='#'+e.target.id)); }), {rootMargin:'-40% 0px -55% 0px'});
document.querySelectorAll('section.card').forEach(s => obs.observe(s));

loadState(store.get(KEY) || {});
const qs = new URLSearchParams(location.search);
let v0 = qs.get('vista'); try{ v0 = v0 || sessionStorage.getItem('calc-vista'); }catch(e){}
document.body.dataset.view = v0==='cliente' ? 'cliente' : 'mia';
$('vMia').classList.toggle('on', document.body.dataset.view==='mia'); $('vCli').classList.toggle('on', document.body.dataset.view==='cliente');
renderFugas(); calc(); renderScen();
if (qs.get('ejemplo')) cargarEjemplo();
if (qs.get('presupuesto')) openDoc();
})();
