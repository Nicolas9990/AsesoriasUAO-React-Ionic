# Documento final: alcance del sistema y tecnologías

**Proyecto:** Asesorías UAO  
**Repositorio:** [Nicolas9990/AsesoriasUAO-React-Ionic](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic)  
**Integrantes:** Nicolas Rodriguez, Juan Jose Corrales y David Alvarez

## 1. Propósito

Asesorías UAO es una aplicación web y móvil para facilitar el encuentro académico entre estudiantes y profesores de la Universidad Autónoma de Occidente. Permite descubrir opciones de asesoría, consultar disponibilidad y tramitar la comunicación y las reservas desde una experiencia común.

## 2. Alcance funcional

El sistema cubre:

- Inicio de sesión y autenticación por correo electrónico.
- Acceso y navegación diferenciados según el rol de estudiante o profesor.
- Consulta de asesores, asignaturas y horarios disponibles.
- Solicitud, visualización y gestión de reservas de asesorías.
- Perfil de usuario y foto de perfil.
- Comunicación entre usuarios mediante chat.
- Notificaciones locales relacionadas con la actividad de la aplicación.
- Uso de cámara y retroalimentación háptica cuando el dispositivo lo permite.
- Despliegue como aplicación web y preparación de aplicación móvil con Capacitor.

La información de profesores y asignaturas de prueba se administra en Firestore. El alcance documentado no contempla un panel de administración dedicado, un servidor propio ni Cloud Functions.

## 3. Tecnologías utilizadas

| Área | Tecnología |
|---|---|
| Interfaz web | React 19, Ionic React 9, Ionicons |
| Lenguaje | TypeScript 5 |
| Herramienta de desarrollo y compilación | Vite |
| Navegación | React Router |
| Aplicación móvil | Capacitor 8, Android y configuración para iOS |
| Capacidades nativas | Capacitor Camera, Haptics y Local Notifications |
| Autenticación y persistencia | Firebase Authentication y Cloud Firestore |
| Android | Android Studio y Gradle |

## 4. Backend y APIs consumidas

La aplicación utiliza Firebase desde el SDK oficial de JavaScript:

- **Firebase Authentication:** autenticación de usuarios mediante correo y contraseña y observación del estado de sesión.
- **Cloud Firestore:** lectura y escritura de perfiles, asesores, asignaturas, horarios, solicitudes/reservas y mensajes; también se emplean consultas en tiempo real donde corresponde.

No se encontró un backend REST propio ni funciones de servidor Cloud Functions. Por tanto, no hay una lista de rutas REST propias que reportar. La cámara, los hápticos y las notificaciones son plugins/capacidades del dispositivo y no APIs backend.

## 5. Repositorio y estado de integración

El código fuente se encuentra en [GitHub](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic). La rama principal es [main](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/tree/main).

- Los cambios de `Juan_Jose_Corrales` fueron integrados mediante [PR #1](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/pull/1).
- Los cambios de `Rama_David` fueron integrados mediante [PR #2](https://github.com/Nicolas9990/AsesoriasUAO-React-Ionic/pull/2).
- `Nicolas_Rodriguez` no tenía commits distintos de `main` al revisar las ramas.

## 6. Prototipo

El repositorio consultado no contiene un enlace de prototipo y no se suministró uno para esta entrega. El enlace compartible debe agregarse al README cuando el equipo lo tenga disponible.
