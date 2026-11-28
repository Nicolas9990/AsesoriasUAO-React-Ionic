# Asesorías UAO

Aplicación web y móvil para conectar estudiantes y profesores de la Universidad Autónoma de Occidente mediante asesorías académicas.

## Integrantes

- Nicolas Rodriguez
- Juan Jose Corrales
- David Alvarez

## Repositorio y ramas

- Repositorio: https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic
- Rama principal: [main](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/tree/main)
- [Rama Juan_Jose_Corrales](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/tree/Juan_Jose_Corrales) integrada en main mediante [PR #1](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/pull/1).
- [Rama Rama_David](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/tree/Rama_David) integrada en main mediante [PR #2](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/pull/2).
- [Rama Nicolas_Rodriguez](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/tree/Nicolas_Rodriguez) ya estaba sincronizada con main; no tenía commits exclusivos.

## Prototipo

El enlace al prototipo no está incluido en el repositorio ni fue suministrado para esta entrega. Añadir aquí el enlace compartible del prototipo cuando esté disponible.

## Alcance funcional

La aplicación contempla autenticación por correo, navegación según el rol de estudiante o profesor, consulta de asesores y horarios, solicitudes y gestión de reservas, perfil y comunicación por chat. Incluye notificaciones locales, cámara/foto de perfil y empaquetado móvil con Capacitor para Android/iOS. Los datos de profesores y asignaturas de prueba se configuran directamente en Firestore.

## Tecnologías

- React 19, TypeScript 5 y Vite.
- Ionic React e Ionicons para la interfaz.
- Capacitor 8 y plugins de Android/iOS: cámara, hápticos y notificaciones locales.
- Firebase Authentication y Cloud Firestore como servicios backend.
- Android Studio/Gradle para preparar la aplicación Android.

## APIs y servicios backend consumidos

No se identifica un backend REST propio ni Cloud Functions. La app consume servicios Firebase mediante el SDK oficial:

- **Firebase Authentication**: registro/inicio de sesión con correo y contraseña, y estado de autenticación.
- **Cloud Firestore**: consultas y actualizaciones en tiempo real para perfiles, asesores, asignaturas, horarios, solicitudes/reservas y mensajes del chat.

La configuración del proyecto Firebase se carga desde variables de entorno locales. No se publican aquí credenciales ni URLs de endpoints. Las notificaciones, cámara y hápticos son capacidades nativas del dispositivo mediante plugins de Capacitor, no APIs de backend.

## Requisitos y ejecución

- Node.js 20.19+ o 22.12+, npm y Git.
- Proyecto Firebase con Authentication (correo y contraseña) y Cloud Firestore habilitados.
- Android Studio para compilar/abrir el proyecto Android.

Desde la raíz:

```bash
cd apps/client
npm ci
```

Configura las variables Firebase copiando `.env.example` a `.env.local` y completando los valores de tu proyecto. Mantén `.env.local` fuera de Git. Luego, desde `apps/client`:

```bash
npm run dev
npm run build
```

Para sincronizar y abrir Android desde la raíz:

```bash
npm run cap:sync
npm run cap:android
```

Consulta [docs/alcance-y-tecnologias.md](docs/alcance-y-tecnologias.md) para el documento final de alcance.
