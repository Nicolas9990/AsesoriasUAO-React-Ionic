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

- Node.js 20.19+ o 22.12+.
- npm.
- Proyecto Firebase con Authentication (correo y contraseña) y Cloud Firestore en Native mode.
- Android Studio para compilar Android; macOS y Xcode para compilar iOS.

