# Sync de correo -> tareas (Gmail + Outlook)

Esto agrega correos como tareas automáticamente. Yo (el asistente) ya escribí
todo el código: la base de datos, las Edge Functions y el botón en la app.
Lo que falta son pasos que solo vos podés hacer porque requieren tus propias
cuentas (Google Cloud, Azure, Supabase CLI).

## 0) Instalar la Supabase CLI (Windows)

Opción recomendada, con Scoop (un gestor de paquetes para Windows, similar a
un "instalador de línea de comandos"). En PowerShell:

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Si no tenés Scoop instalado, instalalo primero con:

```powershell
irm get.scoop.sh | iex
```

Alternativa sin instalar nada global (si ya tenés Node.js): parada dentro de
la carpeta del proyecto, `npm install supabase --save-dev`, y después corré
cada comando anteponiendo `npx`, por ejemplo `npx supabase login` en vez de
`supabase login`.

## 1) Aplicar la base de datos

En el SQL Editor de tu proyecto Supabase (https://app.supabase.com), pegá y
ejecutá, en este orden:
1. `supabase/migrations/20260730000000_email_task_sync.sql`
2. `supabase/migrations/20260730000001_email_sync_cron.sql` (¡reemplazá antes
   los placeholders `<TU_PROYECTO>` y `<CRON_SECRET>` dentro del archivo!)

## 2) Crear credenciales OAuth de Google (Gmail)

1. Andá a https://console.cloud.google.com/ -> creá un proyecto (o usá uno existente).
2. "APIs y servicios" -> "Biblioteca" -> activá **Gmail API**.
3. "APIs y servicios" -> "Pantalla de consentimiento OAuth":
   - Tipo de usuario: Externo.
   - Agregá el scope `.../auth/gmail.readonly`.
   - En "Usuarios de prueba" agregá tu propio correo (mientras la app esté en modo prueba, solo esas cuentas pueden autorizar).
4. "Credenciales" -> "Crear credenciales" -> "ID de cliente OAuth" -> tipo **Aplicación web**.
   - En "URI de redireccionamiento autorizados" agregá (SIN query params, tiene
     que ser idéntica carácter por carácter a la que usa el código):
     `https://okxejburvcnujhgpatbx.supabase.co/functions/v1/email-oauth-callback`
5. Guardá el **Client ID** y **Client Secret** que te da.

## 3) Crear credenciales OAuth de Microsoft (Outlook)

1. Andá a https://portal.azure.com/ -> "Microsoft Entra ID" -> "Registros de aplicaciones" -> "Nuevo registro".
2. Tipo de cuenta: "Cuentas en cualquier directorio organizacional y cuentas personales de Microsoft".
3. En "URI de redirección" (tipo Web) agregá (SIN query params):
   `https://okxejburvcnujhgpatbx.supabase.co/functions/v1/email-oauth-callback`
4. "Certificados y secretos" -> "Nuevo secreto de cliente" -> copiá el valor (solo se muestra una vez).
5. "Permisos de API" -> agregá `Mail.Read` y `offline_access` (delegados) de Microsoft Graph.
6. Guardá el **Application (client) ID** y el **Client secret**.

No hace falta el Tenant ID como variable de entorno: el código usa el
endpoint multi-tenant `/common/` de Microsoft, que es compatible con el tipo
de cuenta "cualquier usuario de Microsoft" que elegiste al registrar la app.

## 4) Configurar los secrets en Supabase

Instalá la CLI (ver sección de instalación más abajo), después:
`supabase login`, `supabase link --project-ref okxejburvcnujhgpatbx`.

```bash
supabase secrets set GROQ_API_KEY=tu_api_key_de_groq
supabase secrets set GOOGLE_CLIENT_ID=...
supabase secrets set GOOGLE_CLIENT_SECRET=...
supabase secrets set MS_CLIENT_ID=...
supabase secrets set MS_CLIENT_SECRET=...
supabase secrets set CRON_SECRET=algo-largo-y-random
```

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya los provee Supabase automáticamente
a las Edge Functions, no hace falta configurarlos.

## 5) Desplegar las Edge Functions

Usamos `--use-api` para que el bundling se haga en el servidor de Supabase y
no necesites tener Docker Desktop instalado en tu computadora.

```bash
supabase functions deploy email-task-sync --use-api
supabase functions deploy email-oauth-start --use-api --no-verify-jwt
supabase functions deploy email-oauth-callback --use-api --no-verify-jwt
```

`email-oauth-start` y `email-oauth-callback` necesitan `--no-verify-jwt`
porque las llama directamente el navegador/Google/Microsoft, no tu app (no
mandan un token de sesión de Supabase). `email-task-sync` sí puede llevar
verificación de JWT porque la protegemos con el header `x-cron-secret`.

## 6) Conectar tu cuenta

Abrí la app -> Configuración -> pestaña "Correo" -> "Conectar Gmail" /
"Conectar Outlook". Te va a pedir el consentimiento y, si todo salió bien,
vas a ver la cuenta listada como "Activa".

## 7) Probar manualmente antes de esperar al cron

Podés forzar una sincronización manual con:

```bash
curl -X POST https://<TU_PROYECTO>.supabase.co/functions/v1/email-task-sync \
  -H "x-cron-secret: <CRON_SECRET>"
```

Revisá la respuesta JSON (cuántos correos escaneó, cuántas tareas creó) y la
tabla `email_sync_logs` en Supabase si algo no cuadra.

## Notas importantes

- El detector de "¿esto es una tarea?" corre con Groq y puede equivocarse.
  Empezamos en modo "entra directo como tarea" (como pediste), así que
  conviene revisar la lista los primeros días y ajustar el prompt en
  `supabase/functions/_shared/groq.ts` si ves falsos positivos (boletines,
  confirmaciones automáticas, etc. marcados como tarea).
- Cada tarea creada desde correo queda etiquetada con `source = 'email'` y
  tags `['correo', 'gmail'|'outlook']`, y en la descripción se agrega de qué
  correo vino — así podés diferenciarlas de las que creás vos a mano.
- El scope pedido es de **solo lectura** (`gmail.readonly` / `Mail.Read`):
  la función puede leer tu correo pero no puede enviar, borrar ni modificar nada.
