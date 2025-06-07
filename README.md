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
```

### CORS para la función PDF
La función ubicada en `functions-pdf/index.ts` emplea el paquete `cors`. Define los dominios permitidos mediante la variable `ALLOWED_ORIGINS`, una lista separada por comas:
```bash
ALLOWED_ORIGINS=https://ejemplo.com,https://otro.com
```
Al desplegar, establece `ALLOWED_ORIGINS` con los dominios autorizados a invocar la función PDF.
Si Puppeteer no encuentra Chrome, define también `CHROME_PATH` con la ruta al ejecutable.

## License

This project is licensed under the MIT License.
