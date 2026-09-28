// Motor de cálculo puro: sin DOM. Lo usan index.html y test.mjs.
(function (root) {
  const r10 = n => Math.ceil(n / 10) * 10;
  const f10 = n => Math.floor(n / 10) * 10;
  const r50 = n => Math.ceil(n / 50) * 50;
  const n = v => { const x = parseFloat(v); return isFinite(x) ? x : 0; };

  function valorFuga(f) {
    if (f.tipo === 'horas') return n(f.a) * n(f.b);
    if (f.tipo === 'ventas') return n(f.a) * n(f.b) * n(f.c) / 100 * Math.max(1, n(f.d) || 1);
    if (f.tipo === 'plantones') return n(f.a) * n(f.b) / 100 * n(f.c) / 100 * n(f.d) * n(f.e) / 100;
    if (f.tipo === 'gasto') return n(f.a);
    return 0;
  }

  // Coste de IA por conversación, en la moneda local: tokens × precio por millón (USD) × cambio.
  function costeConversacion(s) {
    return (n(s.tokIn) * n(s.iaPIn) + n(s.tokOut) * n(s.iaPOut)) / 1e6 * (n(s.cambio) || 1);
  }

  // Coste técnico mensual. Modo fijo: una cifra. Modo personalizado: canal + servidor + otros + IA + plantillas.
  function costeTecnico(s, factor = 1) {
    if (s.costeModo === 'fijo') {
      const t = n(s.costeFijo);
      return { modo: 'fijo', fijo: t, ia: 0, plantillas: 0, conv: 0, record: 0, total: t };
    }
    const recordAuto = (s.fugas || []).filter(f => f.tipo === 'plantones').reduce((t, f) => t + n(f.a), 0);
    const record = (s.recordMes === '' || s.recordMes === undefined || s.recordMes === null ? recordAuto : n(s.recordMes)) * factor;
    const conv = n(s.convMes) * factor;
    const fijo = n(s.canal) + n(s.servidor) + n(s.otros);
    const ia = conv * costeConversacion(s);
    const plantillas = record * n(s.costePlantilla);
    return { modo: 'personalizado', fijo, ia, plantillas, conv, record, total: fijo + ia + plantillas };
  }

  function comision(impl, s) {
    if (s.origen !== 'partner') return { pct: 0, importe: 0 };
    const pct = n(s.comPct), tope = n(s.comTope);
    const bruto = impl * pct / 100;
    return { pct, importe: tope > 0 ? Math.min(tope, bruto) : bruto, topado: tope > 0 && bruto > tope };
  }

  function zona(roi, roiMin = 5) { return roi < roiMin ? 'fuga' : roi < 5 ? 'justa' : roi <= 10 ? 'solida' : 'fan'; }

  const PLANES = {
    unico:  { nombre: 'Pago único', hitos: [['Pago único al firmar', 1]] },
    '5050': { nombre: '50 / 50', hitos: [['Al firmar, antes de empezar', .5], ['Al entregar, funcionando', .5]] },
    '503020': { nombre: '50 / 30 / 20', hitos: [['Al firmar, antes de empezar', .5], ['Al ponerlo en marcha', .3], ['A los 20 días funcionando', .2]] },
    tres:   { nombre: 'Tres plazos iguales', hitos: [['Al firmar', 1 / 3], ['A mitad del proyecto', 1 / 3], ['Al entregar', 1 / 3]] },
    doce:   { nombre: 'Implantación en 12 meses', hitos: [] }
  };

  function compute(s) {
    const pru = n(s.prudencia);
    const fugas = (s.fugas || []).map(f => ({ ...f, bruto: valorFuga(f) }));
    const orden = fugas.filter(f => f.bruto > 0).sort((a, b) => b.bruto - a.bruto);
    const roiMin = n(s.roiMin) || 5;
    const implMin = n(s.implMin);
    const m = Math.min(n(s.margen), 90) / 100;
    const hora = n(s.hora), mult = n(s.mult) || 1;
    const tec = costeTecnico(s), tec3 = costeTecnico(s, 3);

    const defs = {
      basico:   { fugas: orden.slice(0, 1), extraFugaH: 0, sopExtra: 0 },
      pro:      { fugas: orden, extraFugaH: Math.max(0, orden.length - 1) * n(s.hFuga), sopExtra: 0 },
      completo: { fugas: orden, extraFugaH: Math.max(0, orden.length - 1) * n(s.hFuga), sopExtra: n(s.hEvol) }
    };

    const paquetes = {};
    for (const k of Object.keys(defs)) {
      const d = defs[k];
      const bruto = d.fugas.reduce((t, f) => t + f.bruto, 0);
      const valor = bruto * pru;
      const horasImpl = (n(s.hDiag) + n(s.hCons) + d.extraFugaH) * mult;
      const costeImpl = horasImpl * hora * (1 + n(s.colchon) / 100);
      const hSopMes = n(s.hSop) + d.sopExtra;
      const costeMes = tec.total + hSopMes * hora;
      const sueloImpl = costeImpl / (1 - m);
      const sueloCuota = costeMes / (1 - m);
      const techoMes = valor / roiMin, techoAno = valor * 12 / roiMin;
      const T = valor * 12 / 7;
      const autoCuota = Math.max(r10(sueloCuota), Math.min(r10(T * 0.65 / 12), f10(techoMes)));
      const autoImpl = Math.max(r50(sueloImpl), r50(T - 12 * autoCuota), implMin);
      const man = (s.precios || {})[k] || {};
      const impl = man.impl !== undefined && man.impl !== '' ? n(man.impl) : autoImpl;
      const cuota = man.cuota !== undefined && man.cuota !== '' ? n(man.cuota) : autoCuota;
      paquetes[k] = { bruto, valor, horasImpl, costeImpl, hSopMes, costeMes, sueloImpl, sueloCuota,
        sueloAno: sueloImpl + 12 * sueloCuota, techoMes, techoAno, autoImpl, autoCuota, impl, cuota,
        manual: impl !== autoImpl || cuota !== autoCuota, nFugas: d.fugas.length, fugasIncl: d.fugas.map(f => f.nombre) };
    }

    const sel = paquetes[s.paquete] || paquetes.pro;
    const { valor, bruto, impl, cuota } = sel;

    // Impuestos y cobro
    const tax = n(s.impuesto) / 100;
    const irpf = s.irpf ? n(s.irpfPct) / 100 : 0;
    const plan = PLANES[s.plan] || PLANES['5050'];
    const desc = s.plan === 'unico' ? n(s.descUnico) / 100 : 0;
    const implCobrada = impl * (1 - desc);
    const diag = n(s.diagnostico);
    const feePct = n(s.feePct) / 100, feeFijo = n(s.feeFijo);
    const linea = (concepto, base, veces = 1) => {
      const imp = base * tax, ret = base * irpf, total = base + imp, cobrar = total - ret;
      const fee = base > 0 ? cobrar * feePct + feeFijo : 0;
      return { concepto, base, imp, total, ret, cobrar, fee, veces, bizums: Math.ceil(cobrar / 1000) };
    };
    const cobros = [];
    if (diag > 0) cobros.push(linea('Diagnóstico', diag));
    plan.hitos.forEach(([c, p]) => cobros.push(linea(c, implCobrada * p)));
    const cuotaMes = s.plan === 'doce' ? cuota + implCobrada / 12 : cuota;
    const cuotaLinea = linea(s.plan === 'doce' ? 'Cuota mensual (incluye la implantación repartida)' : 'Cuota mensual', cuotaMes, 12);

    const totalBase = diag + implCobrada + 12 * cuota;
    const totalImp = totalBase * tax;
    const totalConImp = totalBase + totalImp;
    const fees = cobros.reduce((t, l) => t + l.fee, 0) + 12 * cuotaLinea.fee;

    // Lo que te queda
    const com = comision(implCobrada, s);
    const costeAno = sel.costeImpl + 12 * sel.costeMes;
    const neto = totalBase - com.importe - fees;
    const benef = neto - costeAno;
    const margenReal = totalBase ? benef / totalBase : 0;
    const horasTot = sel.horasImpl + 12 * sel.hSopMes;
    const horaReal = horasTot ? (neto - 12 * tec.total) / horasTot : 0;
    const costeMes3 = tec3.total + sel.hSopMes * hora;

    // Cliente
    const roi = totalBase ? valor * 12 / totalBase : 0;
    const roiMalo = totalBase ? valor * 0.5 * 12 / totalBase : 0;
    const roiBueno = totalBase ? bruto * 12 / totalBase : 0;
    const payback = valor > cuota ? (diag + implCobrada) / (valor - cuota) : Infinity;
    const netoCliente = valor * 12 - totalBase;
    const horasPersona = 20 * 52 / 12;
    const mediaJornada = horasPersona * n(s.costeHoraRef);

    const mercado = n(s.mercado);
    const vsMercado = mercado ? (impl - mercado) / mercado : 0;

    const checks = {
      tu: [
        { id: 'coste', ok: neto >= sel.sueloAno - 0.5, d: { neto, suelo: sel.sueloAno, com: com.importe, fees } },
        { id: 'cuota', ok: cuota >= sel.sueloCuota - 0.5, d: { cuota, suelo: sel.sueloCuota } },
        { id: 'hora', ok: horaReal >= hora, warn: true, d: { horaReal, hora } },
        { id: 'volumen', ok: tec.modo === 'fijo' || cuota >= costeMes3, warn: true, d: { cuota, costeMes3, fijo: tec.modo === 'fijo' } }
      ],
      el: [
        { id: 'roi', ok: roi >= roiMin, d: { roi, roiMin } },
        { id: 'malo', ok: roiMalo >= 1, d: { roiMalo } },
        { id: 'techo', ok: cuota <= sel.techoMes + 0.5, d: { cuota, techo: sel.techoMes, roiMin } },
        { id: 'solida', ok: roi >= 5, warn: true, d: { roi } }
      ],
      mercado: [
        { id: 'mercado', ok: !mercado || Math.abs(vsMercado) <= 0.25, warn: true, d: { vsMercado, mercado } },
        { id: 'minimo', ok: impl >= implMin, warn: true, d: { impl, implMin } }
      ]
    };
    const failTu = checks.tu.filter(c => !c.ok && !c.warn).length;
    const failEl = checks.el.filter(c => !c.ok && !c.warn).length;
    let veredicto;
    if (valor <= 0) veredicto = { k: 'warn', t: 'Falta el valor: rellena al menos una fuga con datos.' };
    else if (sel.sueloAno > sel.techoAno) veredicto = { k: 'bad', t: 'Este proyecto no da: lo que te cuesta supera lo que le puede compensar. Recorta alcance o busca otra fuga.' };
    else if (failTu && failEl) veredicto = { k: 'bad', t: 'Perdéis los dos. Revisa precio y alcance.' };
    else if (failTu) veredicto = { k: 'bad', t: 'Pierdes tú: no llegas a tu coste más tu margen. Sube el precio o recorta lo que incluyes.' };
    else if (failEl) veredicto = { k: 'bad', t: 'Pierde él. Baja precio o (mejor) sube el valor.' };
    else veredicto = { k: 'ok', t: 'Nadie sale perdiendo. Precio listo para proponer.' };
    const faltan = fugas.filter(f => f.bruto <= 0).length;
    if (faltan && veredicto.k !== 'ok' && valor > 0)
      veredicto = { k: 'warn', t: `Faltan datos en ${faltan} fuga${faltan > 1 ? 's' : ''}: pregúntalos antes de decidir. Con lo que hay: ${veredicto.t}` };

    return { fugas, paquetes, sel, valor, bruto, impl, cuota, cuotaMes, implCobrada, desc, diag, cobros, cuotaLinea,
      plan: plan.nombre, tax, totalBase, totalImp, totalConImp, fees, com, costeAno, neto, benef, margenReal, horaReal,
      roi, roiMalo, roiBueno, zona: zona(roi, roiMin), payback, netoCliente, mediaJornada, horasPersona,
      mercado, vsMercado, checks, veredicto, garantia: roiMalo >= 2, roiMin, tec, tec3, costeMes3,
      costeConv: costeConversacion(s) };
  }

  const api = { compute, valorFuga, comision, zona, costeTecnico, costeConversacion, PLANES };
  if (typeof module !== 'undefined') module.exports = api; else root.Calc = api;
})(typeof window !== 'undefined' ? window : globalThis);
