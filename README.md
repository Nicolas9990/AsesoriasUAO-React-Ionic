# Asesorías UAO

Aplicación móvil y web para conectar estudiantes y profesores de la Universidad Autónoma de Occidente. Está construida con React, Ionic, Capacitor y Firebase Authentication/Cloud Firestore. El proyecto no incluye servidor propio ni Cloud Functions.


## Estructura de la aplicación

```
apps/client/src/
├── components/
│   ├── advisory/       # tarjetas de horarios y reservas
│   └── shared/         # layout y estados compartidos
├── context/            # contexto y proveedor de autenticación
├── helpers/            # formato de fechas y errores
├── hooks/              # autenticación y consultas de Firestore
├── pages/
│   ├── auth/
│   ├── professor/
│   ├── student/
│   └── system/
├── routes/             # rutas y control de acceso por rol
├── theme/              # estilos globales Ionic y de la app
├── types/
├── App.tsx
├── firebase.ts
└── main.tsx
```

## Requisitos

- Node.js 20.19+ o 22.12+. npm se instala junto con Node.js.
- Git.
- Firebase Authentication con correo y contraseña y Cloud Firestore para ejecutar la aplicación.
- Android Studio para compilar Android.

Comprueba las versiones desde una terminal:

```bash
node --version
npm --version
git --version
```

## Instalación y ejecución

Las dependencias de React, Ionic, Vite, TypeScript, Capacitor y Firebase se declaran en `apps/client/package.json`. **No instales Vite, Ionic ni TypeScript globalmente.** Instálalas desde la carpeta del cliente:

```bash   Entra a la carpeta desde la terminal asi 
cd apps/client
npm ci
```

Configura Firebase copiando el ejemplo a un archivo local. En PowerShell:

```powershell
Copy-Item .env.example .env.local
```

En Símbolo del sistema (CMD):

```bat
copy .env.example .env.local
```

Revisa los valores de `.env.local` y reemplázalos por la configuración de tu app web de Firebase si corresponde. Ese archivo está excluido de Git; no lo subas al repositorio. (O mejor copien el .env.example y peguenlo y cambienle el nombre a .env.local y borren la informacion de .env.example)

Con la terminal aún en `apps/client`, inicia el servidor de desarrollo o compila:

```bash
npm run dev
npm run build
```

También puedes ejecutar ambos scripts desde la raíz del repositorio, después de instalar las dependencias:

```bash
npm run dev
npm run build
```

## Configuración de Firebase

En Firebase Console, habilita Authentication con correo y contraseña y crea Cloud Firestore. Para publicar las reglas e índices incluidos en el proyecto, autentícate con Firebase CLI y ejecuta desde la raíz:

```bash
npx -y firebase-tools@latest login
npx -y firebase-tools@latest deploy --only firestore --project asesoriasuao
```

Los profesores y las asignaturas de prueba se configuran en Firestore Console; la app no incluye panel de administración ni Cloud Functions.

## Aplicación móvil

Para preparar y abrir Android Studio, ejecuta desde la raíz:

```bash
npm run cap:sync
npm run cap:android
```
