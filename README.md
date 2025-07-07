# medmasterai

## Instalación

Instala las dependencias del proyecto con:

```bash
npm install
```

## Servidor de desarrollo

Inicia el entorno de desarrollo con:

```bash
npm run dev
```

## Producción

Compila la aplicación e inicia el servidor en modo producción:

```bash
npm run build && npm start
```

## Transcripción de videos de YouTube

Para obtener rápidamente el texto de un video ya no es necesario ejecutar el
script `transcribe-youtube.js`. Con la aplicación en marcha visita la ruta
`/yt-transcript`, pega la URL del video y presiona **Obtener transcripción**. Si
el contenido cuenta con subtítulos disponibles se descargará un archivo `.txt`
con la transcripción.

## Funciones

Las funciones de Firebase se encuentran en la carpeta `functions`. Para
probarlas localmente utiliza:

```bash
npm run --prefix functions serve
```

Y para desplegarlas en tu proyecto ejecuta:

```bash
npm run --prefix functions deploy
```

El comando anterior utiliza los archivos `firebase.json` y `.firebaserc`
ubicados en la raíz del proyecto. `firebase.json` define la configuración
básica de *hosting* y funciones, mientras que `.firebaserc` indica el
proyecto de Firebase por defecto.

## Configuración del entorno y CORS

El proyecto utiliza varias credenciales que se definen como variables de entorno. Guárdalas en un archivo `.env` o en tu gestor de secretos antes de ejecutar la aplicación o desplegar las funciones.

### Firebase (cliente)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

### Firebase Admin
```
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY  # con los saltos de línea escapados

FIREBASE_STORAGE_BUCKET
```

Si prefieres no exponer estas variables, descarga la clave de servicio desde la
consola de Firebase (Apartado *Service accounts* -> *Generate new private key*)
y guárdala como `src/lib/frontedwebmedmaster-firebase-adminsdk-fbsvc-<id>.json`.
El archivo está ignorado por Git y `firebase-admin.ts` lo cargará
automáticamente si las variables anteriores no están definidas.

### Google Vision / Document AI
```
VISION_SERVICE_ACCOUNT_BASE64   # JSON de la cuenta de servicio en base64
DOCUMENT_AI_PROCESSOR_ID        # Identificador del procesador de Document AI
DOCUMENT_AI_LOCATION            # Ubicación opcional (por defecto "us")
```
El archivo JSON con las credenciales debe guardarse en `functions/src/credentials/vision-service-account.json` (o en `functions/lib/credentials` tras compilar). Estos archivos están ignorados en `.gitignore` y **no deben subirse al repositorio**.

### Google Generative AI
```
GOOGLE_API_KEY                  # Clave de la API de Gemini/Generative AI
GEMINI_API_KEY                 # API key para usar Gemini en las rutas del backend
MODEL_GEMINI                   # Modelo principal del asistente (p. ej. "gemini-pro")
MODEL_GEMINI_FALLBACK          # Modelo de respaldo opcional (por defecto "gemini-1.5-pro")
```

### CORS para la función PDF
La función ubicada en `functions-pdf/index.ts` emplea el paquete `cors`. Define los dominios permitidos mediante la variable `ALLOWED_ORIGINS`, una lista separada por comas:
```bash
ALLOWED_ORIGINS=https://ejemplo.com,https://otro.com
```
Al desplegar, establece `ALLOWED_ORIGINS` con los dominios autorizados a invocar la función PDF.
Si Puppeteer no encuentra Chrome, define también `CHROME_PATH` con la ruta al ejecutable.

### Notificaciones por correo (Resend)
Configura el envío de emails definiendo `RESEND_API_KEY` en tu `.env` y usando una dirección de remitente asociada a un dominio verificado en [Resend](https://resend.com). Las rutas `/api/send-support-email` y `/api/send-note-ready` utilizan esta clave para notificar a los usuarios.

### Pagos (Mercado Pago)
Define `MP_ACCESS_TOKEN` para autenticar las llamadas a la API de Mercado Pago.

### Reporte fiscal personal
Define `ADMIN_EMAIL` y `NEXT_PUBLIC_ADMIN_EMAIL` con el correo del administrador para restringir el módulo de reporte fiscal.

## Planes y sistema de créditos

El servicio utiliza un modelo basado en créditos para prevenir abusos. Cada video o PDF procesado descuenta un crédito del tipo correspondiente. Los planes disponibles son:

| Plan       | Precio ARS | Precio USD | Créditos video/mes | Créditos PDF/mes |
|-----------|-----------|-----------|-------------------|-----------------|
| Gratuito  | 0         | 0         | 1                 | 1               |
| Pro       | 5000      | 5         | 20                | 20              |
| Premium   | 9000      | 9         | 40                | 40              |

Los usuarios que agotan sus créditos pueden comprar packs adicionales (ejemplo: 5 videos extra por 1000 ARS).

Las cuentas guardan sus créditos en la colección `users` de Firestore mediante los campos `videoCredits` y `pdfCredits`.

### Simulación de ingresos y costos

Suponiendo un costo de procesamiento aproximado de 0,05 USD por cada video o PDF:

- **100 usuarios gratuitos** → sin ingresos y un gasto de ~10 USD al mes.
- **100 usuarios Pro** → ingreso 500 USD, gasto ~200 USD, margen ~300 USD.
- **100 usuarios Premium** → ingreso 900 USD, gasto ~400 USD, margen ~500 USD.

Mostrar siempre el saldo de créditos en la interfaz y ofrecer la compra de packs cuando se quedan en cero.

## License

This project is licensed under the MIT License.

## Procesamiento as\u00edncrono de jobs

El sistema soporta tareas pesadas (transcripci\u00f3n de video, generaci\u00f3n de PDFs, llamadas a IA) mediante un flujo basado en Pub/Sub.

1. **createJob** recibe la petici\u00f3n, valida l\u00edmites por usuario y encola el trabajo. Responde con `jobId`.
2. **worker** se activa por Pub/Sub y procesa cada mensaje usando Gemini como modelo principal y OpenAI como _fallback_. Guarda el resultado en Cloud Storage y actualiza el estado en Firestore.
3. **getJobStatus** permite consultar `queued`, `processing`, `completed` o `failed`.
4. **downloadJobResult** entrega una URL firmada del archivo resultante.

Variables relevantes:

```bash
JOB_TOPIC=jobs                # Nombre del topic de Pub/Sub
JOBS_PER_MINUTE=5             # L\u00edmite de trabajos por usuario
GEMINI_API_KEY=...            # API key de Gemini
OPENAI_API_KEY=...            # API key de OpenAI
```

Ejemplo para aumentar recursos de una funci\u00f3n:

```ts
export const worker = functions
  .runWith({ memory: '2GiB', timeoutSeconds: 540, cpu: 2 })
  .pubsub.topic(JOB_TOPIC)
  .onPublish(async msg => { /* ... */ });
```

Para desplegar las funciones ejecuta:

```bash
npm run --prefix functions deploy
```

Si necesitas procesar cargas a\u00fan mayores, puedes portar el `worker` a [Cloud Run](https://cloud.google.com/run) y ejecutarlo desde una suscripci\u00f3n de Pub/Sub para disponer de m\u00e1s CPU, memoria y tiempos de ejecuci\u00f3n sin l\u00edmites.

Este repositorio incluye un ejemplo b\u00e1sico en `jobs-run/` para desplegar el
_worker_ en Cloud Run. El servicio expone un endpoint HTTP que procesa los
mensajes de Pub/Sub y reutiliza la misma l\u00f3gica de `jobFunctions.ts` para
manejar cada `jobId`.

### Despliegue en Cloud Run

1. Instala las dependencias y compila dentro de `jobs-run/`:

```bash
cd jobs-run
npm install && npm run build
```

2. Establece las variables de entorno necesarias (`JOB_TOPIC`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, ...).

3. Ejecuta el despliegue con:

```bash
gcloud run deploy jobs-worker \
  --source=. \
  --region=us-central1 \
  --project=TU_PROYECTO \
  --allow-unauthenticated
```

El `Dockerfile` de `jobs-run/` ya ejecuta `npm run build` durante la creaci\u00f3n de la imagen.

## API de pagos

Se incluyen endpoints para integrar Mercado Pago:

- `/api/create-payment-link` genera enlaces de pago personalizados.
- `/api/payment-status` consulta el estado de un pago.
- `/api/refund` procesa reembolsos aplicando las políticas de la app.

Todas las acciones se registran en Firestore mediante `src/lib/logger.ts`.

