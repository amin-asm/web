// Sectores: fugas típicas, preguntas para la cita y datos públicos con fuente.
// Lo que no tiene fuente va a 0 y marcado para preguntar: nunca se inventa.
(function () {
  const SMI = 12.4;
  const SMI_NOTA = 'Suelo legal: SMI 2025 (1.184 €/mes × 14 pagas) × 1,32 de Seguridad Social ÷ 1.760 h ≈ 12,4 €/h. El coste real del puesto suele ser mayor: pregúntalo.';
  const P = 'Sin dato público: pregúntalo al cliente.';
  const h = (nombre, a, b, nota) => ({ tipo: 'horas', nombre, a, b, nota: nota || 'Horas al mes y coste/hora del puesto: pregúntalos.' });
  const v = (nombre, b, c, d, nota) => ({ tipo: 'ventas', nombre, a: 0, b, c, d: d || 1, nota: nota || 'Cuántas al mes, ticket y margen: pregúntalos.' });
  const p = (nombre, a, b, d, nota) => ({ tipo: 'plantones', nombre, a, b, c: 30, d, e: 80, nota: nota || P + ' «% que se evita»: con recordatorio automático suele bajar entre un 15% y un 35%.' });
  const g = (nombre, nota) => ({ tipo: 'gasto', nombre, a: 0, nota: nota || 'Solo si de verdad deja de pagarlo. Sácalo de su factura.' });
  const RECORD = ['Efecto de los recordatorios en la asistencia (Mundoctor)', 'https://www.mundoctor.com/blog/efectos-recordatorios-asistencia-pacientes'];

  window.SECTORES = {
    hosteleria: { nombre: 'Restaurante / bar', via: 'Reservas que se pierden fuera de horario y horas al teléfono.', costeHora: 15,
      costeHoraNota: 'Camarero en Sevilla ≈ 1.356 €/mes × 15 pagas = 20.340 €/año; × 1,32 ÷ 1.800 h ≈ 15 €/h (unos 11 €/h netos para el trabajador).',
      fugas: [h('Contestar WhatsApp y llamadas', 0, 15), v('Clientes que escriben fuera de horario y no vuelven', 75, 60, 1, 'Ticket de ejemplo: 3 comensales × 25 €. Margen: pregúntalo.'),
        p('Citas o reservas que no se presentan', 0, 0, 75, P), g('Comisiones de plataformas (reservas, delivery)')],
      preguntas: ['¿Cuántas reservas cogéis al mes y por dónde entran?', '¿Quién contesta el WhatsApp y el teléfono, y cuánto rato al día?', '¿Qué pasa con los mensajes de noche o en pleno servicio?', '¿Cuántas mesas se quedan vacías por gente que no viene?', '¿Cuánto se gasta de media una mesa?'],
      fuentes: [['Convenio hostelería Sevilla 2025-2028 (BOP)', 'https://bopsevilla.dipusevilla.es/publica/buscador-anuncios/anuncio/Convenio-Colectivo-del-sector-de-hosteleria-de-la-provincia-de-Sevilla-con-vigencia-del-1-de-enero-de-2025-al-31-de-diciembre-de-2028/'], ['Ticket medio restauración (CaixaBank)', 'https://caixabanklab-campus.com/cual-es-el-ticket-medio-restauracion-espana/']] },

    dental: { nombre: 'Clínica dental', via: 'Pacientes que no se presentan: la fuga más cara.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [p('Citas o reservas que no se presentan', 0, 15, 85, 'No-show en clínicas dentales privadas: 12–18% (25% en primeras visitas). Recordatorios: entre 15% y 35% menos ausencias. Citas/mes y ticket: pregúntalos.'),
        h('Confirmar citas el día antes', 0, SMI), v('Clientes que escriben fuera de horario y no vuelven', 85, 80, 1, 'Un paciente nuevo suele volver para tratamiento: pon la media en «Veces que vuelve».')],
      preguntas: ['¿Cuántas citas tenéis al mes?', '¿Cuántos pacientes no vienen sin avisar?', '¿Cómo recordáis las citas y quién lo hace?', '¿Cuánto vale de media una cita?', '¿Qué pasa con quien pide cita un sábado o de noche?'],
      fuentes: [['Tasas de inasistencia en clínicas (Hellomatik)', 'https://hellomatik.com/es/blog/que-dice-realmente-tu-tasa-de-inasistencias-sobre-tu-clinica'], ['No-shows en clínicas dentales (Bookniapp)', 'https://bookniapp.com/es/blog/reducir-no-shows-clinicas-dentales-guia-2026/'], RECORD] },

    estetica_med: { nombre: 'Clínica de medicina estética', via: 'Consultas que no se cierran por no hacer seguimiento, y plantones.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Presupuestos enviados sin seguimiento', 0, 0), p('Citas o reservas que no se presentan', 0, 0, 0), h('Contestar WhatsApp y llamadas', 0, SMI)],
      preguntas: ['¿Cuántas primeras consultas hacéis al mes y cuántas acaban en tratamiento?', '¿Quién hace el seguimiento de los presupuestos?', '¿Cuánto vale de media un tratamiento?', '¿Cuántas citas fallan sin avisar?'], fuentes: [RECORD] },

    fisio: { nombre: 'Fisioterapia', via: 'Sesiones que no vienen y horas cogiendo citas entre pacientes.', costeHora: SMI, costeHoraNota: SMI_NOTA + ' Si contesta el propio fisio, su hora vale lo que factura por sesión.',
      fugas: [p('Citas o reservas que no se presentan', 0, 0, 35, P + ' Sesión en Sevilla: 25–50 € según zona.'), h('Coger y cambiar citas o reservas', 0, SMI),
        v('Contactos que nadie contesta a tiempo', 35, 80, 1, 'Un paciente nuevo viene a varias sesiones: pon la media en «Veces que vuelve».')],
      preguntas: ['¿Cuántas sesiones hacéis al mes?', '¿Quién coge las citas mientras atendéis?', '¿Cuántas sesiones fallan sin avisar?', '¿A cuántas sesiones viene de media un paciente nuevo?'],
      fuentes: [['Precio sesión fisioterapia en Sevilla (FisioSevilla)', 'https://fisiosevilla.com/cuanto-cuesta-una-sesion-de-fisioterapia-en-sevilla-precios-2025/'], RECORD] },

    psicologia: { nombre: 'Psicología / terapia', via: 'Sesiones que fallan y pacientes nuevos que no reciben respuesta.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [p('Citas o reservas que no se presentan', 0, 0, 0), v('Contactos que nadie contesta a tiempo', 0, 80, 1, 'Un paciente nuevo viene a muchas sesiones: pon la media en «Veces que vuelve».'), h('Coger y cambiar citas o reservas', 0, SMI)],
      preguntas: ['¿Cuántas sesiones al mes?', '¿Cuántas fallan sin avisar?', '¿Cuántas personas escriben pidiendo primera cita y cuántas acaban viniendo?', '¿Precio de la sesión?'], fuentes: [RECORD] },

    veterinaria: { nombre: 'Clínica veterinaria', via: 'Recordatorios de vacunas y revisiones que nadie hace.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Clientes antiguos que no repiten', 0, 0, 1, 'Vacunas y revisiones que no se recuerdan: pregúntalo.'), p('Citas o reservas que no se presentan', 0, 0, 0), h('Contestar WhatsApp y llamadas', 0, SMI)],
      preguntas: ['¿Recordáis las vacunas y revisiones? ¿Cómo?', '¿Cuántas citas al mes?', '¿Cuánto vale de media una visita?', '¿Cuántas llamadas se quedan sin coger?'], fuentes: [] },

    peluqueria: { nombre: 'Peluquería / barbería', via: 'Horas cogiendo citas y clientes que no vienen.', costeHora: 13.7,
      costeHoraNota: 'Convenio estatal de peluquerías, grupo III: 18.200 €/año × 1,32 ÷ 1.760 h (jornada supuesta) ≈ 13,7 €/h.',
      fugas: [h('Coger y cambiar citas o reservas', 0, 13.7, 'Horas: pregúntalas. Suelen parar un trabajo para contestar.'), p('Citas o reservas que no se presentan', 0, 0, 45, P + ' Gasto medio por visita: 45 € (feb. 2025).'), v('Clientes que escriben fuera de horario y no vuelven', 45, 70)],
      preguntas: ['¿Cuántas citas al mes?', '¿Cuántas veces al día paráis para contestar el móvil?', '¿Cuántos clientes no vienen sin avisar en una semana normal?', '¿Cuánto se gasta de media un cliente?'],
      fuentes: [['Convenio estatal peluquerías (Convenios Sectoriales)', 'https://conveniossectoriales.es/servicios/peluquerias-estetica'], ['Gasto medio en peluquería (Beauty Market)', 'https://www.beautymarket.es/peluqueria/las-peluquerias-vuelven-a-crecer-con-mas-clientes-y-mayor-gasto-peluqueria-35247.php']] },

    centro_estetica: { nombre: 'Centro de estética / uñas', via: 'Citas por WhatsApp y clientas que no repiten.', costeHora: 13.7, costeHoraNota: 'Mismo convenio que peluquerías: ≈ 13,7 €/h.',
      fugas: [h('Coger y cambiar citas o reservas', 0, 13.7), p('Citas o reservas que no se presentan', 0, 0, 0), v('Clientes antiguos que no repiten', 0, 70)],
      preguntas: ['¿Cuántas citas al mes?', '¿Cuántas fallan sin avisar?', '¿Cada cuánto vuelve una clienta y cuántas dejan de venir?', '¿Ticket medio?'], fuentes: [['Convenio estatal peluquerías y estética', 'https://conveniossectoriales.es/servicios/peluquerias-estetica']] },

    gimnasio: { nombre: 'Gimnasio / pilates / yoga', via: 'Socios que se dan de baja sin que nadie los reactive, y consultas sin respuesta.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Clientes antiguos que no repiten', 0, 0, 1, 'Socios dados de baja que se podrían recuperar: cuota mensual × margen. Pregúntalo.'), v('Contactos que nadie contesta a tiempo', 0, 0, 6, 'Un socio nuevo paga varios meses: pon la media en «Veces que vuelve».'), h('Responder las mismas preguntas (horarios, precios)', 0, SMI)],
      preguntas: ['¿Cuántos socios activos y cuántas bajas al mes?', '¿Cuántas personas preguntan precios y no se apuntan?', '¿Cuota media y cuántos meses se queda un socio?', '¿Quién responde los mensajes?'], fuentes: [] },

    academia: { nombre: 'Academia / formación', via: 'Interesados que preguntan y nadie hace seguimiento.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Contactos que nadie contesta a tiempo', 0, 0, 1, 'Un alumno paga varios meses: pon la media en «Veces que vuelve».'), h('Responder las mismas preguntas (horarios, precios)', 0, SMI), h('Seguimiento de clientes y contactos', 0, SMI)],
      preguntas: ['¿Cuántas personas preguntan al mes y cuántas se matriculan?', '¿Cuánto paga un alumno y cuántos meses se queda?', '¿Quién contesta y en cuánto tiempo?'], fuentes: [] },

    inmobiliaria: { nombre: 'Inmobiliaria', via: 'Contactos de portales que se enfrían antes de que alguien conteste.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Contactos que nadie contesta a tiempo', 0, 0, 1, 'Operaciones extra al año ÷ 12, con la comisión media como ticket. Pregúntalo: es la fuga más cara del sector.'), h('Seguimiento de clientes y contactos', 0, SMI), h('Coger y cambiar citas o reservas', 0, SMI, 'Visitas a pisos: horas coordinándolas.')],
      preguntas: ['¿Cuántos contactos entran al mes por portales?', '¿En cuánto tiempo se contestan?', '¿Cuántas operaciones cerráis al año y comisión media?', '¿Quién organiza las visitas?'], fuentes: [] },

    asesoria: { nombre: 'Asesoría / gestoría', via: 'Horas pidiendo papeles a clientes y pasando datos a mano.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [h('Pasar datos a mano (facturas, pedidos, fichas)', 0, SMI), h('Responder las mismas preguntas (horarios, precios)', 0, SMI, 'Recordar a clientes que manden facturas y papeles.'), v('Contactos que nadie contesta a tiempo', 0, 0, 12, 'Un cliente paga cuota todo el año: pon 12 en «Veces que vuelve».')],
      preguntas: ['¿Cuántas horas al mes se van reclamando papeles?', '¿Cuántas facturas se meten a mano?', '¿Cuota media por cliente?', '¿Cuántos contactos nuevos se pierden por no contestar?'], fuentes: [] },

    abogados: { nombre: 'Despacho de abogados', via: 'Consultas que llegan y no se atienden a tiempo, y horas de agenda.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Contactos que nadie contesta a tiempo', 0, 0), h('Coger y cambiar citas o reservas', 0, SMI), h('Responder las mismas preguntas (horarios, precios)', 0, SMI)],
      preguntas: ['¿Cuántas consultas nuevas al mes y cuántas se convierten en caso?', '¿Honorario medio por caso?', '¿Quién filtra las consultas?'], fuentes: [] },

    taller: { nombre: 'Taller mecánico', via: 'Llamadas perdidas con las manos ocupadas y revisiones que nadie recuerda.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Llamadas perdidas sin devolver', 0, 0), v('Clientes antiguos que no repiten', 0, 0, 1, 'ITV, cambios de aceite y revisiones que no se recuerdan.'), h('Contestar WhatsApp y llamadas', 0, SMI)],
      preguntas: ['¿Cuántas llamadas se quedan sin coger al día?', '¿Recordáis las revisiones a los clientes?', '¿Factura media por coche?'], fuentes: [] },

    ecommerce: { nombre: 'Tienda online', via: 'Carritos abandonados y preguntas repetidas antes de comprar.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [v('Carritos abandonados', 0, 60, 1, 'De media, ~70% de los carritos se abandonan (75% en España, Baymard). Pon solo los que esperas recuperar al mes con un mensaje, no todos.'), h('Responder las mismas preguntas (horarios, precios)', 0, SMI, 'Envíos, tallas, devoluciones.'), v('Clientes antiguos que no repiten', 0, 0)],
      preguntas: ['¿Cuántos carritos abandonados al mes?', '¿Ticket medio y margen?', '¿Cuántos mensajes de dudas al día y quién los contesta?'],
      fuentes: [['Abandono de carrito (Drip, datos de Baymard)', 'https://www.drip.com/es/blog/estadisticas-abandono-de-carrito']] },

    hotel: { nombre: 'Hotel / apartamentos turísticos', via: 'Reservas directas que se van a Booking por no contestar, y comisiones.', costeHora: 15, costeHoraNota: 'Referencia de hostelería: ≈ 15 €/h de coste para la empresa.',
      fugas: [g('Comisiones de plataformas (reservas, delivery)', 'Comisión de Booking/Airbnb en las reservas que pasarían a ser directas. Sácalo de su factura.'), v('Clientes que escriben fuera de horario y no vuelven', 0, 70), h('Responder las mismas preguntas (horarios, precios)', 0, 15, 'Check-in, parking, wifi…')],
      preguntas: ['¿Cuántas reservas al mes y qué parte llega por plataformas?', '¿Comisión que pagáis?', '¿Precio medio por reserva?', '¿Quién contesta de noche?'], fuentes: [] },

    otro: { nombre: 'Otro negocio', via: 'La que más le duela: horas, ventas perdidas, plantones o gastos.', costeHora: SMI, costeHoraNota: SMI_NOTA,
      fugas: [h('Contestar WhatsApp y llamadas', 0, SMI)],
      preguntas: ['¿Qué tarea se repite todos los días y quién la hace?', '¿Cuánto tiempo le lleva?', '¿Qué clientes o ventas se os escapan y por qué?', '¿Cuánto vale de media un cliente?'], fuentes: [] }
  };
})();
