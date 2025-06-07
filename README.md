# medmasterai

<<<<<<< ours
## Variables de entorno

El proyecto requiere varias credenciales que se definen mediante variables de entorno.

### Firebase

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
FIREBASE_PRIVATE_KEY (con los saltos de línea escapados)
FIREBASE_STORAGE_BUCKET
```

### Google Vision / Document AI

```
VISION_SERVICE_ACCOUNT_BASE64   # JSON de la cuenta de servicio en base64
DOCUMENT_AI_PROCESSOR_ID        # Identificador del procesador de Document AI
DOCUMENT_AI_LOCATION            # Ubicación opcional (por defecto "us")
```

Guarda estas variables en un archivo `.env` o en el gestor de secretos que prefieras antes de ejecutar la aplicación o desplegar las funciones.
=======
## Configuraci\u00f3n de CORS para la funci\u00f3n de PDF

La funci\u00f3n ubicada en `functions-pdf/index.ts` usa el paquete `cors` para
habilitar solicitudes desde dominios permitidos. Estos dominios se especifican a
trav\u00e9s de la variable de entorno `ALLOWED_ORIGINS`, que debe contener una lista
de URLs separadas por comas. Por ejemplo:

```bash
ALLOWED_ORIGINS=https://ejemplo.com,https://otro.com
```

Al desplegar, aseg\u00farese de definir `ALLOWED_ORIGINS` con los dominios que
pueden invocar la funci\u00f3n PDF.
>>>>>>> theirs
