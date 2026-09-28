// Catálogos de la calculadora. Precios de septiembre de 2026: revisar cada pocos meses.
window.DATOS = {
  fecha: 'septiembre de 2026',

  // Precios de API en dólares por millón de tokens (entrada / salida).
  ia: [
    { grupo: 'OpenAI (ChatGPT)', modelos: [
      ['gpt-5.5', 'GPT-5.5', 5, 30], ['gpt-5', 'GPT-5', 1.25, 10], ['gpt-5-mini', 'GPT-5 mini', 0.25, 2],
      ['gpt-5-nano', 'GPT-5 nano', 0.05, 0.4], ['gpt-5.6-luna', 'GPT-5.6 Luna', 0.2, 1.2], ['gpt-4.1-mini', 'GPT-4.1 mini', 0.4, 1.6]] },
    { grupo: 'Anthropic (Claude)', modelos: [
      ['claude-opus-5-5', 'Claude Opus 5.5', 4, 20], ['claude-opus-5', 'Claude Opus 5', 5, 25],
      ['claude-sonnet-5', 'Claude Sonnet 5', 2, 10], ['claude-haiku-4-5', 'Claude Haiku 4.5', 1, 5]] },
    { grupo: 'Google (Gemini)', modelos: [
      ['gemini-3.1-pro', 'Gemini 3.1 Pro', 2, 12], ['gemini-2.5-pro', 'Gemini 2.5 Pro', 1.25, 10],
      ['gemini-2.5-flash', 'Gemini 2.5 Flash', 0.3, 2.5], ['gemini-2.5-flash-lite', 'Gemini 2.5 Flash-Lite (se retira el 16/10/2026)', 0.1, 0.4]] },
    { grupo: 'DeepSeek', modelos: [
      ['deepseek-v4.1-flash', 'DeepSeek V4.1 Flash (hora punta)', 0.3, 1.2], ['deepseek-v4-pro', 'DeepSeek V4 Pro (hora punta)', 1.32, 3.96]] },
    { grupo: 'Mistral', modelos: [
      ['mistral-small-4', 'Mistral Small 4', 0.15, 0.6], ['mistral-large-3', 'Mistral Large 3', 0.5, 1.5], ['mistral-medium-3.5', 'Mistral Medium 3.5', 1.5, 7.5]] }
  ],
  iaFuentes: [
    ['Claude — Anthropic', 'https://docs.anthropic.com/en/docs/about-claude/pricing'],
    ['OpenAI', 'https://developers.openai.com/api/docs/pricing'],
    ['Gemini', 'https://benchlm.ai/google/api-pricing'],
    ['DeepSeek', 'https://benchlm.ai/deepseek/api-pricing'],
    ['Mistral', 'https://benchlm.ai/mistral/api-pricing']
  ],
  // Tokens por conversación: [entrada, salida].
  tamanos: [
    ['corta', 'Corta — FAQ, 2-3 mensajes', 10000, 500],
    ['normal', 'Normal — reserva o cita completa', 30000, 1500],
    ['larga', 'Larga — agente con herramientas y memoria', 80000, 3000]
  ],

  paises: [
    ['es', 'España (IVA 21%)', 21, 'EUR', true],
    ['canarias', 'Canarias (IGIC 7%)', 7, 'EUR', true],
    ['mx', 'México (IVA 16%)', 16, 'MXN', false],
    ['co', 'Colombia (IVA 19%)', 19, 'COP', false],
    ['ar', 'Argentina (IVA 21%)', 21, 'ARS', false],
    ['cl', 'Chile (IVA 19%)', 19, 'CLP', false],
    ['pe', 'Perú (IGV 18%)', 18, 'PEN', false],
    ['us', 'Estados Unidos (sin impuesto)', 0, 'USD', false],
    ['sin', 'Sin impuesto', 0, 'EUR', false]
  ],

  // [id, nombre, % comisión, fijo, nota]
  medios: [
    ['transferencia', 'Transferencia bancaria', 0, 0, 'Sin comisión en la mayoría de bancos.'],
    ['bizum', 'Bizum', 0, 0, 'Sin comisión. Límite habitual: 1.000 € por envío (depende del banco).'],
    ['tarjeta', 'Tarjeta (Stripe)', 1.5, 0.25, 'Tarjetas europeas: 1,5% + 0,25 €.'],
    ['paypal', 'PayPal', 2.9, 0.35, 'Ventas nacionales: 2,9% + 0,35 €.'],
    ['domiciliacion', 'Domiciliación bancaria (SEPA)', 0, 0, 'Depende de tu banco o pasarela: pon su comisión.']
  ],
  mediosFuentes: [['Stripe en España (Quipu)', 'https://getquipu.com/blog/comisiones-stripe/'], ['PayPal en España (Rankia)', 'https://www.rankia.com/blog/cuentas-corrientes/3283914-paypal-comisiones']],

  planes: [['5050', '50 / 50 — mitad al firmar, mitad al entregar'], ['503020', '50 / 30 / 20 — proyectos grandes'],
    ['tres', 'Tres plazos iguales'], ['unico', 'Pago único con descuento'], ['doce', 'Sin entrada: implantación repartida en 12 meses']],

  // Nombres típicos de cada fuga. «Otra» deja escribir.
  catalogo: {
    horas: ['Contestar WhatsApp y llamadas', 'Coger y cambiar citas o reservas', 'Confirmar citas el día antes', 'Responder las mismas preguntas (horarios, precios)',
      'Pasar datos a mano (facturas, pedidos, fichas)', 'Hacer presupuestos', 'Seguimiento de clientes y contactos', 'Pedir reseñas'],
    ventas: ['Clientes que escriben fuera de horario y no vuelven', 'Contactos que nadie contesta a tiempo', 'Presupuestos enviados sin seguimiento',
      'Carritos abandonados', 'Clientes antiguos que no repiten', 'Llamadas perdidas sin devolver'],
    plantones: ['Citas o reservas que no se presentan', 'Cancelaciones de última hora sin cubrir el hueco'],
    gasto: ['Comisiones de plataformas (reservas, delivery)', 'Programa o aplicación que se deja de pagar', 'Horas extra o persona de refuerzo', 'Centralita o servicio de atención externo']
  },

  quien: ['Dueño o dueña', 'Encargado/a', 'Recepcionista', 'Administrativo/a', 'Comercial', 'Camarero/a o dependiente/a', 'Varios del equipo', 'Nadie: se queda sin hacer'],
  empleados: ['1 (autónomo)', '2–5', '6–10', '11–25', '26–50', 'Más de 50'],
  locales: ['1', '2', '3', '4', '5 o más'],
  origen: [['directo', 'Directo'], ['recomendacion', 'Recomendación de un cliente'], ['redes', 'Redes sociales'], ['web', 'Web o Google'], ['partner', 'Colaborador o partner (con comisión)']],
  respuesta: ['Sin medir', 'Menos de 5 minutos', 'Menos de 1 hora', 'Entre 1 y 4 horas', 'El mismo día', 'Al día siguiente', 'Más de un día', 'No contestó'],
  resenas: ['Sin mirar', 'Ninguna', '1–2', '3–5', '6–10', 'Más de 10']
};
