# FNS Library — tu biblioteca personal

Aplicación web para organizar y leer libros (EPUB/PDF) en estanterías
personalizadas, con cuentas de usuario independientes, pensada para usarse
igual desde una laptop que desde un teléfono.

## 💸 Costos: $0
Todo el proyecto está armado para no costarte nada:
- **Supabase** (base de datos, login, archivos): gratis hasta 500 MB de base
  de datos y 1 GB de archivos — con muchos usuarios subiendo muchos libros,
  ese 1 GB se puede llenar; si pasa, Supabase avisa y tú decides si subes de
  plan o pides a la gente borrar libros viejos. Mientras tanto, cero costo.
- **Vercel** (donde se publica): gratis para este tipo de proyecto.
- **Project Gutenberg**: gratis siempre.
- **Audio**: usa la voz del navegador, gratis.
- **Traducción**: usa un servicio gratuito (MyMemory), sin tarjeta ni cuenta.

Nada de esto te pedirá pagar mientras el proyecto se mantenga en un uso
razonable (que es exactamente el caso de algo que estás regalando).

## Lo que ya está construido
- Registro e inicio de sesión (correo/contraseña y Google).
- Recuperación de contraseña por correo.
- Estanterías (carpetas) personalizadas, con color e ilimitadas.
- Subida de libros EPUB/PDF con extracción automática de título, autor y portada.
- Lector integrado con control de tamaño de letra y tema (claro/sepia/oscuro) para EPUB,
  y paginación para PDF.
- Progreso de lectura guardado automáticamente por libro y por usuario.
- Manual de uso, política de privacidad y términos (páginas dentro de la app).
- Diseño responsive (funciona en teléfono y escritorio).

## Lo que falta para que funcione de verdad (5-15 minutos)

### 1. Conectar tu proyecto de Supabase
1. Entra a tu proyecto en supabase.com.
2. Ve a **SQL Editor** → pega TODO el contenido de `supabase/schema.sql` de este
   proyecto → dale **Run**. Esto crea las tablas, la seguridad y el bucket de
   almacenamiento.
3. Ve a **Storage** y confirma que apareció un bucket llamado `library-files`
   (no público).
4. Ve a **Project Settings → API** y copia:
   - **Project URL**
   - **anon public key**
5. Crea un archivo `.env` en la raíz del proyecto (usa `.env.example` como
   plantilla) y pega ahí esos dos valores.

### 2. Activar el inicio de sesión con Google
1. En Supabase: **Authentication → Providers → Google** → actívalo.
2. Necesitas un Client ID y Client Secret de Google. Se generan gratis en
   Google Cloud Console (console.cloud.google.com/apis/credentials) →
   crear credenciales OAuth 2.0 → tipo "Aplicación web".
3. En "Authorized redirect URIs" pon la URL que Supabase te muestra en esa
   misma pantalla (termina en `/auth/v1/callback`).
4. Pega el Client ID y Secret de vuelta en Supabase y guarda.

### 3. Configurar el correo de recuperación de contraseña
En Supabase: **Authentication → URL Configuration** → agrega la URL de tu
dominio final (ej. `https://tudominio.com`) en "Site URL" y en "Redirect URLs".
Esto es lo que hace que el enlace de "olvidé mi contraseña" funcione una vez
publicada la app.

### 4. Probar localmente (opcional pero recomendado)
```bash
npm install
npm run dev
```
Abre la URL que te muestre (normalmente http://localhost:5173) y prueba crear
una cuenta, subir un libro y leerlo.

### 5. Publicar en Vercel con tu dominio
1. Sube este proyecto a un repositorio de GitHub.
2. En Vercel: **New Project** → importa ese repositorio.
3. En "Environment Variables" agrega las mismas dos variables de tu `.env`
   (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
4. Dale **Deploy**.
5. En **Settings → Domains**, conecta el dominio que ya tienes.
6. Regresa al paso 3 de Supabase y actualiza la Site URL con tu dominio real.

### 6. Activar el catálogo de libros gratis (Project Gutenberg)
Esta parte trae libros gratuitos y legales de dominio público directo dentro
de la app, sin salir a otra página. Necesita un paso extra porque la
descarga la hace el propio servidor de Supabase (no el navegador), para
evitar bloqueos de seguridad entre sitios.

1. Instala la CLI de Supabase si no la tienes:
   ```bash
   npm install -g supabase
   ```
2. Inicia sesión y vincula tu proyecto (te pedirá el "project ref", lo
   encuentras en la URL de tu proyecto en supabase.com):
   ```bash
   supabase login
   supabase link --project-ref TU_PROJECT_REF
   ```
3. Despliega la función:
   ```bash
   supabase functions deploy import-gutenberg-book
   ```
4. Listo. El botón "🔎 Libros gratis" dentro de la app ya podrá buscar y
   añadir libros directo a la biblioteca de cada usuario.

### 7. Activar la traducción de libros (opcional)
El botón 🌐 dentro del lector traduce la página o capítulo actual a otro
idioma. Usa un servicio de traducción **100% gratis, sin cuenta ni tarjeta
de crédito** (MyMemory). Solo hay que desplegar la función:
```bash
supabase functions deploy translate-text
```
Nota: al ser gratis, este servicio tiene un límite diario generoso pero no
infinito de palabras traducidas por día. Para un proyecto que estás
regalando, es más que suficiente; si algún día crece mucho, se puede
cambiar por un servicio de pago sin tocar el resto de la app.

La traducción del **menú de la app** (español/inglés/alemán/francés/portugués)
no depende de esto, ya funciona sola y siempre gratis.

### 8. Antes de compartirlo con otras personas
Edita `src/pages/Privacy.jsx` y `src/pages/Terms.jsx` y reemplaza los textos
entre corchetes (`[nombre de tu app]`, `[tu correo de contacto]`, etc.) con tus
datos reales.

También abre `index.html` y reemplaza las 3 apariciones de `tudominio.com`
por tu dominio real, para que la tarjeta de vista previa (la que aparece
cuando compartes el link por WhatsApp, redes, etc.) muestre la imagen y el
link correctos.

## Instalable como app (PWA)
La app ya se puede "instalar" desde el navegador, tanto en computadora como
en teléfono (aparece un ícono en el botón de instalar del navegador, o la
opción "Añadir a pantalla de inicio" en el teléfono) — usando tu propio
ícono de marca, no uno genérico. Esto ya viene funcionando solo, no requiere
configuración adicional de tu parte.

## Estructura del proyecto
```
src/
  pages/       Cada pantalla de la app (login, biblioteca, lector, etc.)
  components/  Piezas reutilizables (tarjeta de libro, barra lateral, modales)
  lib/         Funciones que hablan con Supabase (libros, carpetas, archivos)
  contexts/    Estado de sesión del usuario
supabase/
  schema.sql   Todo lo que hay que correr en Supabase para crear la base de datosf
```
