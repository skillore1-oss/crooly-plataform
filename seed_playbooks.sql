-- Crooly Traction Method v1.0 — Playbook Library
-- Ejecutar en Supabase SQL Editor

INSERT INTO playbooks (title, description, category, content) VALUES

-- ── DIAGNÓSTICO ──────────────────────────────────────────────────────────────

(
  'Levantamiento de credenciales existentes',
  'Identificación, recopilación y organización de todos los activos que la empresa ya tiene y que son relevantes para el sector minero: proyectos ejecutados, certificaciones, profesionales con experiencia y vínculos previos con la industria.',
  'Diagnóstico',
  $pb01${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "En minería, la evaluación de proveedores no comienza en la propuesta técnica — comienza antes, en la precalificación. Si no presentas evidencia estructurada de lo que eres, no llegas a la etapa donde puedes demostrar lo que sabes hacer.\n\nLa mayoría de las empresas tiene más credenciales de las que cree. El problema es que están dispersas, no están documentadas en el formato que exige el sector, o están en la cabeza de las personas y no en documentos verificables."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Reúne a los directivos y jefaturas clave en una sesión de 2 horas. Objetivo: mapear todo lo que la empresa ha hecho con alguna relación con minería, energía en zona norte, proyectos de gran escala o clientes del sector.\n\n2. Levanta el inventario en cuatro categorías: (1) Proyectos ejecutados — cliente, tipo de servicio, año, valor aproximado, contacto de referencia. (2) Certificaciones vigentes — ISO, OHSAS, SICEP, Sernageomin, MOP, SERVIU y equivalentes. (3) Profesionales con experiencia minera — nombre, cargo, en qué faenas trabajó. (4) Vínculos con el sector — EPCMs, Owners, contratistas principales o gremios.\n\n3. Para cada ítem, identifica si existe documentación verificable: contrato, carta de recomendación, certificado, resolución. Si no existe, marca como 'brecha de documentación'.\n\n4. Prioriza según relevancia: (A) directamente minero, (B) sectores equivalentes como energía en norte o industrial pesado, (C) referencial pero no equivalente.\n\n5. Consolida en el formato de Inventario de Credenciales Crooly — documento base para los playbooks siguientes."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Inventario de Credenciales Crooly completado — mínimo 10 ítems documentados.\n• Lista de brechas de documentación identificadas: qué existe pero no está documentado.\n• Clasificación A/B/C de cada credencial según relevancia para minería.\n• Registro de la sesión con los directivos — acta o grabación de consenso."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• Al menos el 80% de los ítems identificados tiene documentación verificable o un plan para obtenerla.\n• El equipo directivo valida que el inventario representa fielmente lo que la empresa ha hecho.\n• Se identifican al menos 3 credenciales clasificadas A — directamente relevantes para minería."
      }
    ]
  }$pb01$::jsonb
),

(
  'Análisis de brechas vs. requisitos de homologación',
  'Comparación sistemática entre las credenciales existentes y los requisitos formales e informales que exigen los procesos de precalificación y homologación de los principales Owners y EPCMs. El resultado es una lista priorizada de brechas a cerrar.',
  'Diagnóstico',
  $pb02${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "Muchas empresas no llegan a ofertar en Codelco ni en EPCMs internacionales porque no cumplen los requisitos de precalificación — no por falta de capacidad técnica. Ese es el patrón más común: la empresa es competente, pero no puede demostrarlo en el formato y con la evidencia que exige el sector.\n\nSin este análisis, la empresa invierte recursos en las brechas equivocadas. Con este análisis, sabe exactamente qué necesita cerrar para pasar el primer filtro — y en qué orden."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Obtén las bases de licitación o documentos de precalificación de al menos dos procesos relevantes: idealmente de Codelco y de un EPCM internacional como Bechtel, Fluor o equivalente.\n\n2. Extrae los requisitos en tres categorías: (1) Requisitos eliminatorios — si no los cumples, quedas fuera sin revisión. (2) Requisitos ponderados — afectan tu puntaje pero no te eliminan. (3) Requisitos deseables — suman pero no son determinantes.\n\n3. Para cada requisito eliminatorio, contrasta con el Inventario de Credenciales del Playbook 01. Marca: Cumple / Cumple parcialmente / No cumple / No sabe.\n\n4. Para los requisitos que no se cumplen, evalúa el tiempo y costo de cerrar la brecha: corto plazo menos de 3 meses, mediano 3 a 9 meses, largo más de 9 meses.\n\n5. Construye la Matriz de Brechas Crooly: tabla con requisito, estado actual, brecha, tiempo estimado y responsable sugerido.\n\n6. Identifica el requisito más crítico — el que bloquea todo lo demás — y priorízalo como primer objetivo del roadmap."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Matriz de Brechas Crooly completada con todos los requisitos eliminatorios analizados.\n• Bases de licitación reales archivadas como referencia — mínimo dos fuentes.\n• Ranking de brechas por impacto y por velocidad de cierre.\n• Estimación de tiempo y costo para cerrar las tres brechas más críticas."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• La empresa puede responder con precisión: ¿qué nos falta para pasar la precalificación de Codelco hoy?\n• Al menos una brecha crítica tiene un plan de cierre definido con fecha y responsable.\n• El equipo directivo valida la Matriz de Brechas como representación real de su situación."
      }
    ]
  }$pb02$::jsonb
),

(
  'Benchmark de competidores',
  'Análisis de cómo se posicionan las empresas competidoras en el sector minero: qué credenciales tienen, cómo presentan sus servicios, en qué clientes han trabajado y dónde están sus fortalezas y debilidades.',
  'Diagnóstico',
  $pb03${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "En un mercado donde los Owners y EPCMs prefieren proveedores conocidos, entrar de frente contra empresas consolidadas es perder. La estrategia correcta es identificar el segmento, cliente o tipo de proyecto donde la ventaja competitiva de los incumbentes es más débil.\n\nEl benchmark no es para copiar a los competidores — es para encontrar el flanco descubierto."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Identifica los competidores directos en el nicho de servicios que la empresa quiere ofrecer en minería.\n\n2. Para cada competidor, levanta información pública en 5 dimensiones: (1) Clientes mineros declarados en sitio web y LinkedIn. (2) Certificaciones y acreditaciones publicadas. (3) Tamaño del equipo y presencia geográfica. (4) Cómo describen sus servicios — lenguaje, diferenciadores declarados. (5) Actividad en LinkedIn — qué publican, con qué frecuencia.\n\n3. Construye la Matriz de Benchmark Crooly: tabla comparativa con las 5 dimensiones para cada competidor más la empresa propia.\n\n4. Identifica los patrones: ¿qué tienen todos que tú no tienes? ¿Hay algún segmento — pequeña minería, minería no metálica, energía asociada — donde ninguno tenga presencia fuerte?\n\n5. Define el posicionamiento diferencial: la afirmación específica de por qué un Owner o EPCM debería considerar a esta empresa sobre los incumbentes en al menos un escenario concreto."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Matriz de Benchmark Crooly con mínimo 4 competidores analizados en las 5 dimensiones.\n• Identificación del flanco: el segmento o tipo de proyecto donde la competencia es más débil.\n• Posicionamiento diferencial redactado en una oración — verificable y específico, no genérico."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• La empresa puede responder: ¿en qué escenario específico somos la mejor opción sobre la competencia?\n• El posicionamiento diferencial es validado por al menos un contacto externo con experiencia en minería.\n• Se identifica al menos un nicho de entrada concreto que no está dominado por los incumbentes."
      }
    ]
  }$pb03$::jsonb
),

(
  'Identificación del nicho de entrada más viable',
  'Definición del punto de entrada al mercado minero con mayor probabilidad de éxito en el menor tiempo posible. No es el mercado total — es la cuña más pequeña y más viable para abrir la primera puerta.',
  'Diagnóstico',
  $pb04${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "El error más frecuente es querer entrar a todo el mercado minero al mismo tiempo. Eso dispersa recursos, diluye el mensaje y hace imposible construir referencias sectoriales. La primera entrada tiene que ser quirúrgica: un tipo de servicio específico, para un tipo de cliente específico, en un contexto específico.\n\nUna vez dentro con un primer contrato real, la expansión es exponencialmente más fácil. El primer contrato es el activo más valioso."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Con la Matriz de Brechas (Playbook 02) y el Benchmark (Playbook 03), filtra las opciones de entrada según: (1) Brechas de credenciales mínimas — dónde la empresa ya cumple o está cerca. (2) Competencia menos establecida — el flanco identificado. (3) Tiempo a primer contrato — qué nicho tiene el ciclo de venta más corto.\n\n2. Evalúa las tres rutas de entrada: (A) Entrada directa por Owner — licitación directa con una minera. Mayor potencial, mayor barrera. (B) Entrada por EPCM — subcontrato o colaboración. Más rápido, menor margen. (C) Entrada por contratista principal — ser proveedor de un proveedor ya homologado. El camino más rápido para construir track record.\n\n3. Define el nicho específico: tipo de servicio + tipo de cliente + contexto geográfico o de proyecto.\n\n4. Valida el nicho con al menos un contacto externo con experiencia en ese segmento.\n\n5. Documenta la decisión con su justificación en el Plan de Entrada Crooly."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Plan de Entrada Crooly con el nicho definido: tipo de servicio, tipo de cliente y contexto.\n• Justificación documentada de por qué ese nicho sobre las otras opciones.\n• Validación externa de al menos un profesional con experiencia en el segmento elegido.\n• Estimación preliminar del tiempo a primer contrato en ese nicho."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• El equipo directivo puede defender la elección del nicho con argumentos basados en datos, no en preferencias.\n• El nicho seleccionado es coherente con las credenciales existentes — no requiere cerrar todas las brechas antes de empezar.\n• Hay al menos un potencial cliente identificado por nombre en ese nicho."
      }
    ]
  }$pb04$::jsonb
),

-- ── PLANIFICACIÓN ─────────────────────────────────────────────────────────────

(
  'Definición del target list — Owners y EPCMs a priorizar',
  'Construcción de la lista específica de empresas y contactos que la empresa va a priorizar en su estrategia de entrada. No es una lista de sueños — es una lista trabajable, con nombres reales, roles reales y una lógica clara de priorización.',
  'Planificación',
  $pb05${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "Sin una lista definida, el esfuerzo comercial se dispersa. Se habla con quien aparece, no con quien decide. La diferencia entre un EPCM y un Owner como primer objetivo no es trivial: el EPCM tiene ciclos de compra más cortos y puede darte tu primer contrato en meses. El Owner directo puede darte el contrato más grande, pero el proceso tarda más. En la etapa de entrada, el EPCM suele ser el camino más inteligente."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Define el universo: basándote en el nicho del Playbook 04, lista todos los Owners y EPCMs que operan en ese segmento. Owners en Chile: Codelco, Anglo American, BHP, Antofagasta Minerals, Lundin Mining, Teck. EPCMs internacionales activos en Chile: Bechtel, Fluor, SNC-Lavalin, Wood, Hatch, Ausenco.\n\n2. Filtra por relevancia al nicho elegido: ¿cuáles están ejecutando proyectos activos del tipo que la empresa puede servir?\n\n3. Para cada empresa filtrada, identifica el contacto correcto: no el CEO — el Gerente de Contratos, Jefe de Abastecimiento o Project Manager del área relevante. LinkedIn es la herramienta principal.\n\n4. Clasifica en tres niveles: (A) Prioritario — decisor identificado, proyecto activo, brecha mínima. (B) Secundario — buena oportunidad pero requiere cierre de alguna brecha. (C) Futuro — objetivo de largo plazo.\n\n5. Para cada contacto Nivel A, define el vector de entrada: ¿hay algún vínculo existente que pueda hacer una presentación? La entrada en frío en minería tiene tasa de conversión muy baja.\n\n6. Documenta el target list en la plataforma con nombre, empresa, rol, nivel de prioridad y vector de entrada."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Target list documentado en plataforma con mínimo 15 contactos clasificados.\n• Al menos 5 contactos Nivel A con vector de entrada identificado.\n• Para cada Nivel A: nombre completo, empresa, cargo, LinkedIn y nota de contexto."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• El equipo puede nombrar los 5 contactos más importantes y explicar por qué cada uno está en esa posición.\n• Al menos 3 de los contactos Nivel A tienen un vector de entrada que no es en frío.\n• El target list está vivo — se actualiza cuando hay nuevos proyectos o cambios de contacto."
      }
    ]
  }$pb05$::jsonb
),

(
  'Construcción del perfil de empresa para el sector',
  'Desarrollo de los materiales con los que la empresa se presenta ante el mercado minero: presentación corporativa, ficha de empresa, resumen de credenciales y propuesta de valor diferencial. Todo ajustado al formato y lenguaje que exige el sector.',
  'Planificación',
  $pb06${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "El material con el que una empresa se presenta en minería es evaluado antes de que haya una reunión. Si el brochure o la ficha de empresa no está construida en el lenguaje del sector — si no menciona los estándares correctos, si no presenta la experiencia en el formato esperado — la probabilidad de llegar a una reunión cae dramáticamente.\n\nLa mayoría de las empresas usa su presentación corporativa genérica para todos los sectores. Eso es un error en minería: el sector tiene su propio idioma y sus propios criterios de evaluación."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Revisa todo el material de presentación actual — brochure, presentación PowerPoint, sitio web, perfil de LinkedIn corporativo. Evalúa cada pieza: ¿un Gerente de Contratos de Codelco entendería en 30 segundos por qué esta empresa es relevante para él?\n\n2. Redacta la propuesta de valor diferencial para minería: una o dos oraciones que expliquen qué hace la empresa, para quién, y por qué es la mejor opción en su nicho de entrada.\n\n3. Construye la ficha de empresa formato minería: una página con razón social, RUT, años de experiencia, dotación, certificaciones relevantes, proyectos de referencia clasificados A y B, y contacto comercial.\n\n4. Adapta o crea una presentación corporativa de máximo 12 slides enfocada en el nicho minero: quiénes son, qué hacen, credenciales verificables, casos de referencia y propuesta de valor.\n\n5. Actualiza el perfil de LinkedIn corporativo: descripción orientada a minería, servicios bien definidos, y al menos dos publicaciones recientes con contenido relevante para el sector.\n\n6. Valida todos los materiales con un contacto externo con experiencia en minería antes de usarlos."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Ficha de empresa formato minería — una página, lista para enviar.\n• Presentación corporativa adaptada al sector — máximo 12 slides.\n• Propuesta de valor diferencial redactada y validada externamente.\n• LinkedIn corporativo actualizado con foco en minería."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• Un profesional externo con experiencia en minería valida que los materiales comunican claramente la propuesta de valor.\n• La ficha de empresa cumple con el formato esperado por al menos dos Owners o EPCMs del target list.\n• El equipo directivo puede presentar la propuesta de valor en menos de 60 segundos de forma consistente."
      }
    ]
  }$pb06$::jsonb
),

(
  'Diseño del roadmap de 12 meses con hitos medibles',
  'Construcción del plan de acción mensual para los próximos 12 meses: qué se va a hacer, quién lo va a hacer, cuándo, y cómo se va a medir.',
  'Planificación',
  $pb07${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "Sin un roadmap con fechas e indicadores, la iniciativa de entrar a minería se convierte en una intención permanente que nunca se ejecuta. El roadmap convierte la estrategia en compromisos concretos. Y en empresas donde el equipo directivo tiene múltiples frentes, ese nivel de estructura es lo que hace la diferencia entre avanzar y estancarse."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Define los hitos críticos del año en tres horizontes: (1) Primeros 90 días — cierres de brechas prioritarias, primeros acercamientos a contactos Nivel A, materiales de presentación listos. (2) 90 a 180 días — primera propuesta técnica enviada, al menos una reunión con EPCM u Owner, al menos una participación en precalificación. (3) 180 a 365 días — primer contrato o subcontrato en minería, retroalimentación del mercado incorporada.\n\n2. Para cada hito, define: responsable interno, fecha comprometida, y el indicador que confirma que el hito se cumplió.\n\n3. Define los KPIs mensuales: contactos nuevos en el sector, reuniones con decisores, propuestas enviadas, propuestas en evaluación, feedback recibido.\n\n4. Identifica los tres riesgos principales y define el plan de contingencia para cada uno.\n\n5. Carga el roadmap completo en la plataforma Crooly. A partir de aquí, el check-in mensual se hace sobre el roadmap — no sobre impresiones generales."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Roadmap de 12 meses cargado en plataforma con hitos, responsables y fechas.\n• KPIs definidos y baseline establecido — el valor de cada indicador hoy, antes de empezar.\n• Plan de contingencia para los tres riesgos principales documentado.\n• Validación del equipo directivo: todos los responsables entienden y aceptan sus compromisos."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• El equipo puede reportar estado del roadmap en menos de 5 minutos en cualquier momento.\n• Al menos el 80% de los hitos de los primeros 30 días se cumplen en la fecha comprometida.\n• El roadmap es revisado y actualizado al menos una vez al mes en el check-in con Crooly."
      }
    ]
  }$pb07$::jsonb
),

-- ── IMPLEMENTACIÓN ────────────────────────────────────────────────────────────

(
  'Gestión de acercamientos a contactos clave',
  'Proceso estructurado para iniciar, mantener y avanzar relaciones con los contactos del target list. Cubre el primer contacto, el seguimiento y la gestión del pipeline de relaciones.',
  'Implementación',
  $pb08${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "En minería, las oportunidades se ganan antes de que exista una licitación. El proveedor que ya conoce al Gerente de Contratos cuando se abre el proceso tiene una ventaja que ninguna propuesta técnica puede compensar.\n\nEl error más frecuente es hacer el primer contacto y esperar que el otro tome la iniciativa. El seguimiento estructurado — sin ser invasivo — es lo que separa a los proveedores que entran de los que quedan en lista de espera permanente."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Para cada contacto Nivel A, define el mensaje de primer contacto. No es una presentación de ventas — es una razón genuina para conectar: un proyecto en común, un contacto en común, un evento del sector, o una perspectiva relevante sobre un tema de su interés.\n\n2. Ejecuta el primer contacto por el canal más apropiado: si hay un vínculo, úsalo. Si no, LinkedIn es el primer paso — solicitud de conexión con mensaje breve y específico, no genérico.\n\n3. Registra cada acercamiento en la plataforma Crooly inmediatamente: fecha, canal, mensaje enviado, respuesta recibida, y próxima acción.\n\n4. Define la cadencia de seguimiento: activo — respondió, seguimiento semanal. Tibio — abrió pero no respondió, seguimiento en 15 días con otro ángulo. Frío — sin respuesta, pausa de 30 días y reintento con otro canal.\n\n5. Busca activamente oportunidades de encuentro en contextos no comerciales: eventos de APRIMIN, Consejo Minero, seminarios técnicos. El contacto cara a cara acelera la relación de forma que ningún correo puede replicar.\n\n6. Una vez que hay conversación real, busca la reunión formal: propón 30 minutos para entender sus necesidades — no para vender, para aprender."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Registro actualizado en plataforma de cada contacto Nivel A: estado, historial y próxima acción.\n• Al menos 3 primeros contactos ejecutados por semana durante la fase activa.\n• Al menos una reunión formal agendada con un contacto Nivel A en los primeros 60 días."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• Al menos el 30% de los contactos Nivel A respondió al primer acercamiento.\n• Al menos una reunión formal ejecutada con un decisor en los primeros 90 días.\n• El equipo puede reportar el estado de cada contacto Nivel A sin consultar apuntes — está en la plataforma."
      }
    ]
  }$pb08$::jsonb
),

(
  'Preparación de propuestas técnicas para minería',
  'Proceso de construcción de una propuesta técnica orientada al sector minero: qué incluir, cómo estructurarla, qué lenguaje usar y cómo diferenciarse de los competidores dentro del documento.',
  'Implementación',
  $pb09${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "Una propuesta técnica en minería no es un documento de ventas — es un documento de evaluación. El área de contratos la revisa con criterios específicos, en un orden específico, buscando evidencia específica. Si no está estructurada en ese formato, se pierde puntaje antes de que lean el contenido.\n\nLa propuesta es el momento donde todas las credenciales, el posicionamiento y las relaciones construidas se convierten — o no — en una oportunidad real."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Antes de escribir una sola línea, responde: ¿Quién evalúa esta propuesta? ¿Cuáles son los criterios de evaluación y sus ponderaciones? ¿Qué es un requisito eliminatorio en esta propuesta específica?\n\n2. Estructura la propuesta en el orden que espera el evaluador. Orden típico en minería: resumen ejecutivo, entendimiento del alcance, metodología de trabajo, equipo propuesto con credenciales individuales, experiencia en proyectos equivalentes, plan de trabajo y cronograma, gestión de HSE, propuesta económica.\n\n3. El equipo propuesto es el diferenciador más evaluado en servicios. Para cada profesional: nombre, cargo, certificaciones relevantes, y experiencia específica en proyectos equivalentes — no un CV genérico.\n\n4. La experiencia en proyectos equivalentes debe presentarse en formato de ficha: nombre del cliente, alcance, año, valor, contacto de referencia verificable.\n\n5. El resumen ejecutivo debe responder en media página: qué vamos a hacer, por qué somos la mejor opción para este proyecto específico, y qué evidencia tenemos.\n\n6. Revisa la propuesta contra la lista de requisitos eliminatorios antes de enviar."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Checklist de preparación de propuesta completado — todos los requisitos eliminatorios verificados.\n• Ficha de proyecto para cada referencia incluida en la propuesta.\n• CV adaptado al proyecto para cada profesional propuesto — no CV genérico.\n• Resumen ejecutivo de media página que responde las tres preguntas clave."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• La propuesta pasa el filtro de requisitos eliminatorios antes de ser enviada.\n• Al menos un revisor externo con experiencia en evaluación de propuestas mineras valida el documento.\n• El tiempo de preparación de la segunda propuesta es al menos 30% menor que el de la primera — el proceso se está sistematizando."
      }
    ]
  }$pb09$::jsonb
),

(
  'Acompañamiento en revisión de propuestas',
  'Proceso de revisión crítica de una propuesta antes de ser enviada, con foco en los criterios que pesan en la evaluación técnica minera — no en el estilo ni en la redacción, sino en el contenido y la evidencia.',
  'Implementación',
  $pb10${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "La diferencia entre una propuesta que pasa y una que no raramente está en la calidad del servicio que ofrece la empresa. Está en cómo se presenta la evidencia, si se cumplen los requisitos formales, y si el evaluador puede extraer rápidamente la información que necesita para asignar puntaje.\n\nUna revisión externa antes de enviar — por alguien que conoce el proceso de evaluación desde adentro — puede cambiar completamente el resultado."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Recibe la propuesta en versión borrador al menos 48 horas antes del plazo de entrega.\n\n2. Revisa primero los requisitos formales y eliminatorios: ¿está todo lo que piden las bases? ¿Los formatos son correctos? ¿Las firmas, certificados y documentos de respaldo están incluidos y vigentes?\n\n3. Revisa la sección de experiencia equivalente: ¿las fichas de proyecto son verificables? ¿La equivalencia con el proyecto licitado es explícita o el evaluador tiene que inferirla?\n\n4. Revisa el equipo propuesto: ¿las credenciales de cada profesional son relevantes para este proyecto específico? ¿Los cargos propuestos coinciden con lo que el cliente pidió?\n\n5. Revisa el resumen ejecutivo: ¿responde en 30 segundos por qué esta empresa es la mejor opción? ¿Está escrito desde la perspectiva del evaluador?\n\n6. Entrega retroalimentación estructurada: lista de cambios críticos que deben hacerse antes de enviar, y lista de mejoras deseables si hay tiempo."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Lista de cambios críticos entregada al menos 24 horas antes del plazo.\n• Checklist de requisitos formales completado y firmado.\n• Registro de la revisión en plataforma Crooly — qué se revisó, qué se cambió, qué quedó pendiente."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• La propuesta revisada cumple el 100% de los requisitos formales y eliminatorios.\n• El equipo incorpora el 100% de los cambios críticos identificados antes de enviar.\n• En procesos posteriores, el número de observaciones de la revisión disminuye — el equipo está aprendiendo el formato."
      }
    ]
  }$pb10$::jsonb
),

(
  'Seguimiento de pipeline comercial',
  'Sistema de seguimiento estructurado de todas las oportunidades activas: desde el primer contacto hasta el contrato firmado o la pérdida formal del proceso.',
  'Implementación',
  $pb11${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "Sin un pipeline visible y actualizado, es imposible saber si el plan está funcionando o no. Y en minería, donde los ciclos de venta son largos y los procesos tienen muchas etapas, perder el rastro de una oportunidad puede significar meses de trabajo desperdiciado.\n\nEl pipeline también es la herramienta que le permite al directorio tomar decisiones: si no hay oportunidades en etapa avanzada, hay que acelerar los acercamientos. Si hay muchas oportunidades pero ninguna avanza, el problema está en la propuesta."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Define las etapas del pipeline para minería: (1) Contacto establecido. (2) Reunión ejecutada — al menos una reunión formal con un decisor. (3) Oportunidad identificada — hay un proyecto o necesidad concreta en el horizonte. (4) Propuesta en preparación. (5) Propuesta enviada — en evaluación. (6) En negociación. (7) Ganado o Perdido.\n\n2. Carga todas las oportunidades activas en la plataforma con: nombre del cliente, contacto, etapa actual, valor estimado, fecha esperada de cierre y próxima acción.\n\n3. Establece la cadencia: el pipeline se actualiza cada vez que hay una interacción con un cliente — no una vez a la semana como ejercicio administrativo.\n\n4. Define los indicadores de velocidad: tiempo promedio en cada etapa, tasa de conversión entre etapas, y valor total en cada etapa. Si una oportunidad lleva más de 30 días sin avanzar, es una señal de alerta.\n\n5. En el check-in mensual con Crooly, el pipeline es el documento central de la conversación."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Pipeline cargado en plataforma con todas las oportunidades activas.\n• Indicadores de velocidad calculados y visibles: tiempo promedio por etapa y tasa de conversión.\n• Registro de cada interacción con clientes actualizado dentro de las 24 horas de ocurrida."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• El equipo puede reportar el estado del pipeline completo en menos de 5 minutos.\n• Al menos una oportunidad por mes avanza de etapa — el pipeline tiene movimiento real.\n• Cuando se pierde una oportunidad, hay un registro de la razón — esa información alimenta los playbooks siguientes."
      }
    ]
  }$pb11$::jsonb
),

(
  'Iteración basada en feedback del mercado',
  'Proceso de captura, análisis y aplicación del feedback que entrega el mercado — a través de procesos perdidos, reuniones con clientes y conversaciones con actores del sector.',
  'Implementación',
  $pb12${
    "steps": [
      {
        "title": "Por qué importa en minería",
        "content": "La mayoría de las empresas no pierde licitaciones — pierde la oportunidad de aprender de las licitaciones perdidas. El feedback del mercado es el activo más valioso de la etapa de implementación: te dice exactamente qué tienes que cambiar para ganar la próxima.\n\nEn minería, donde los mismos actores se repiten en múltiples procesos, la empresa que aprende más rápido acumula una ventaja que los competidores no pueden replicar."
      },
      {
        "title": "Cómo se hace — paso a paso",
        "content": "1. Cada vez que se pierde un proceso formal, ejecuta el post-mortem: (1) ¿En qué etapa quedaron fuera? (2) ¿Hubo feedback oficial? Si no, ¿se puede solicitar? (3) ¿Qué empresa ganó y qué se sabe de su propuesta? (4) ¿Qué haríamos diferente si pudiéramos volver a presentar?\n\n2. Solicita activamente feedback cuando hay una relación establecida: no como queja, sino como aprendizaje. La pregunta correcta es: 'Para la próxima vez que tengamos una oportunidad similar, ¿qué debería tener nuestra empresa que hoy no tiene?'\n\n3. Captura feedback también de procesos donde no se participó formalmente: conversaciones en eventos del sector, comentarios de EPCMs o contratistas en reuniones informales.\n\n4. Analiza el feedback acumulado cada 90 días buscando patrones: ¿hay una brecha que aparece repetidamente? ¿Hay un tipo de proyecto donde siempre se pierde?\n\n5. Traduce los patrones en acciones concretas con responsable y fecha. Registra todas las iteraciones en la plataforma — ese historial es evidencia de que la empresa mejora sistemáticamente."
      },
      {
        "title": "Qué evidencia debes generar",
        "content": "• Post-mortem documentado para cada proceso perdido — en la plataforma dentro de los 7 días de conocido el resultado.\n• Registro de feedback informal capturado en eventos y reuniones.\n• Análisis trimestral de patrones con al menos 3 acciones concretas derivadas.\n• Historial de iteraciones actualizado en plataforma."
      },
      {
        "title": "Cómo sabes que funcionó",
        "content": "• La tasa de conversión de propuestas mejora de una ronda de licitaciones a la siguiente.\n• Al menos un playbook se actualiza por trimestre basado en feedback real del mercado.\n• El equipo puede identificar la razón específica de cada proceso perdido — no 'perdimos' sino 'perdimos porque X'."
      }
    ]
  }$pb12$::jsonb
);
