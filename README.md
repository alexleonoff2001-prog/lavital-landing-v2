# Landing LAVITAL

## Destino de prospectos

Los envíos válidos de `/api/leads` se almacenan en la base D1 enlazada como `DB` en `.openai/hosting.json`. Sites crea y conecta el recurso durante la publicación. La tabla `leads` conserva nombre, teléfono, fecha de consentimiento, fecha de creación y origen. No se registra ningún dato personal en consola ni se envía a analítica.

## GitHub Pages

La rama `main` publica automáticamente una versión estática en `https://alexleonoff2001-prog.github.io/lavital-landing-v2/`. El formulario de esa versión envía los prospectos a la ruta segura del despliegue principal de Sites; el backend permite exclusivamente el origen de GitHub Pages, conserva la validación, el honeypot y la limitación de solicitudes.

La ruta inicializa las tablas de forma segura con sentencias preparadas; la migración equivalente queda en `migrations/0001_leads.sql`. Incluye validación de origen, tamaño y formato, campo trampa, tiempo mínimo de diligenciamiento y límite de cinco solicitudes por hora por identificador IP cifrado.

Configura `NEXT_PUBLIC_SITE_URL` con el dominio definitivo para que la tarjeta social use una URL absoluta correcta. Este valor no es secreto.

## Información pendiente antes de publicar comercialmente

- Responsable legal del tratamiento de datos, NIT, domicilio y canales para ejercer derechos.
- Política de privacidad y términos completos revisados para Colombia.
- Canal comercial, disponibilidad, precio, cobertura, entregas y devoluciones.
- Dosis e instrucciones exactas confirmadas contra la etiqueta vigente.
- Ingredientes, fabricante, registro o notificación sanitaria y demás datos regulatorios verificables.
- Alternativa concreta y evidencia si se desea publicar una comparación comercial.
- Testimonios reales con autorización expresa de nombre, imagen y experiencia.
