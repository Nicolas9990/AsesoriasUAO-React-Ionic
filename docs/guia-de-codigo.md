# Guía rápida para entender el código

La app no tiene un servidor propio. React muestra las pantallas y se conecta directamente a Firebase: Authentication gestiona las cuentas y Firestore guarda perfiles, asignaturas, horarios y reservas.

## Primero: cómo se organiza

- **Pages** (páginas): pantallas completas. Por ejemplo, `FindAdvisorPage` es la pantalla donde un estudiante busca asesorías.
- **Components** (componentes): piezas visuales reutilizables. `SlotCard` muestra un horario y `BookingCard` una reserva.
- **Context** (contexto): datos de sesión compartidos por muchas pantallas. Aquí están el usuario, su perfil, el inicio de sesión y el registro.
- **Hooks** (ganchos): funciones de React que reutilizan estado o consultas. `useAuth` lee la sesión; `useAdvisoryData` escucha datos de Firestore.
- **Routes** (rutas): decide qué pantalla mostrar y qué rol puede entrar a cada ruta.
- **Helpers** (ayudantes): funciones pequeñas que no dibujan pantallas, como fechas y mensajes de error.

### ¿Qué significan `advisory` y `shared`?

Son nombres de carpetas, no palabras especiales de React:

- `components/advisory` significa “componentes de asesorías”: tarjetas de horarios y reservas.
- `components/shared` significa “componentes compartidos”: marco de página y mensajes que se usan en varios espacios.

## Archivos de configuración

- `apps/client/.env.example`: ejemplo de los valores que se copian a `.env.local` para conectar Firebase.
- `firebase.json`: indica a Firebase CLI dónde están las reglas e índices de Firestore.
- `apps/client/firestore.rules`: define quién puede leer o cambiar cada colección.
- `apps/client/firestore.indexes.json`: índices que Firestore necesita para algunas búsquedas.
- `apps/client/package.json`: dependencias y comandos del frontend; Vite, React e Ionic se instalan con `npm ci` en `apps/client`.
- `apps/client/vite.config.ts`: activa Vite y el plugin de React durante desarrollo y compilación.
- `apps/client/capacitor.config.ts`: nombre e identificador que Capacitor usa para Android/iOS.

Los archivos JSON no admiten comentarios dentro del formato; por eso la explicación de sus campos está aquí.

## Recorrido de inicio de sesión

1. `main.tsx` inicia React y carga los estilos de Ionic.
2. `App.tsx` envuelve las rutas con `AuthProvider`.
3. `context/AuthContext.tsx` escucha los cambios de sesión de Firebase Authentication.
4. Cuando hay un usuario, el mismo archivo carga su perfil de Firestore.
5. `AppRoutes.tsx` muestra `AuthPage` si no ha iniciado sesión o dirige a la sección de su rol.
6. `useAuth()` permite que las páginas lean la sesión y llamen a funciones como `signIn`, `register` y `signOutUser`.

### Qué hace un hook

Un hook es una función que conecta una pantalla con estado o datos. Por ejemplo:

```tsx
const { user, profile } = useAuth();
```

En una página, esa línea obtiene el usuario y el perfil actuales. Si cambian, React vuelve a dibujar la página.

`useAdvisoryData.ts` también usa `onSnapshot`: Firestore envía una actualización cuando cambian los documentos. El hook devuelve la lista, un indicador `loading` y un mensaje `error`. La página solo decide cómo mostrarlos.

## Recorrido de una reserva

1. `FindAdvisorPage.tsx` prepara los filtros de fecha y asignatura.
2. Usa `useSubjects` y `useLiveList` para recibir asignaturas y horarios disponibles.
3. `SlotCard.tsx` presenta cada horario.
4. Al pulsar el botón, `reserve()` usa una transacción de Firestore para crear la reserva y marcar el horario como reservado.
5. `MyBookingsPage.tsx` consulta las reservas del estudiante y `BookingCard.tsx` las muestra.

Una transacción agrupa lecturas y escrituras que deben completarse juntas. Así, dos estudiantes no pueden reservar el mismo horario al mismo tiempo.

## Cómo estudiar el proyecto

Lee en este orden:

1. `src/main.tsx` — punto de entrada.
2. `src/App.tsx` — proveedor de autenticación y rutas.
3. `src/context/AuthContext.tsx` — sesión, registro e inicio de sesión.
4. `src/routes/AppRoutes.tsx` y `src/routes/UserRoutes.tsx` — navegación y permisos por rol.
5. `src/pages/student/FindAdvisorPage.tsx` — un flujo completo de pantalla.
6. `src/hooks/useAdvisoryData.ts` — consultas reactivas a Firestore.
7. `src/components/advisory/SlotCard.tsx` — componente visual reutilizable.

No necesitas entender todas las páginas a la vez. Sigue primero un solo recorrido, como inicio de sesión o solicitar una asesoría.

## Comandos

Desde la carpeta raíz, sigue las instrucciones de instalación y ejecución del [README](../README.md).
