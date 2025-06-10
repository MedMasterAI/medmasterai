# Checklist de Pruebas Manuales

Esta guía resume las verificaciones manuales básicas para las funciones principales de MedMasterAI.

## Login
- [ ] Ingresar a `/login` y verificar que se muestren los métodos disponibles.
- [ ] Autenticarse con una cuenta válida de Google o email y comprobar que redirige al dashboard.
- [ ] Intentar acceder con credenciales inválidas y confirmar que aparece un mensaje de error.

## Generación de apuntes
- [ ] En `/dashboard/apunty` subir un PDF válido y presionar **Enviar PDF**.
- [ ] Esperar la barra de progreso y verificar que, al finalizar, se ofrezca descargar el apunte.
- [ ] Probar con un PDF ilegible para confirmar que se muestra un mensaje de error adecuado.
- [ ] Revisar que el conteo de uso mensual se actualice correctamente.

## Visualización de archivos
- [ ] Ir a `/dashboard/mis-apuntes` y revisar que se listen los apuntes generados.
- [ ] Abrir un PDF desde **Ver PDF** para asegurar que se descarga o visualiza correctamente.
- [ ] Generar flashcards y comprobar que puedan desplegarse u ocultarse.

## Upgrade de plan
- [ ] Visitar `/upgrade` estando autenticado y revisar los planes disponibles.
- [ ] Completar el formulario de pago (sandbox) y confirmar que el plan pasa a estado activo.
- [ ] Verificar que las limitaciones de uso cambian según el nuevo plan.

## Otras comprobaciones
- [ ] Cerrar sesión y asegurar que las rutas privadas redirigen al login.
- [ ] Probar la navegación principal (dashboard, ayuda, términos y privacidad) sin errores.

