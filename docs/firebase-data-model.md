# Modelo Firebase de Asesorías UAO

La aplicación se conecta directamente a Firebase Authentication y Cloud Firestore desde React/Ionic. No tiene servidor propio ni Cloud Functions.

## Colecciones

| Ruta | Contenido | Acceso |
| --- | --- | --- |
| `perfiles/{uid}` | UID, nombre, correo, rol y fecha de creación | El usuario lee su perfil. El alta pública solo puede crear estudiantes; los roles se asignan desde la consola. |
| `perfilesPublicos/{uid}` | UID, nombre y fecha de creación | Miembros UAO con correo verificado pueden leerlo. No incluye correo ni rol. |
| `perfiles/{uid}/asignaturas/{asignaturaId}` | Materias asignadas a un profesor | El profesor solo lee las propias. Se administran desde la consola. |
| `perfiles/{uid}/locks/horarios` | Intervalos de horarios futuros del profesor | El profesor lo lee y actualiza mediante las transacciones de la app. |
| `asignaturas/{asignaturaId}` | Nombre y estado activo | Miembros verificados leen asignaturas activas. Se administran desde la consola. |
| `horarios/{horarioId}` | Profesor, materia, intervalo, disponibilidad e historial | Miembros verificados leen; las reglas permiten a los profesores publicar/eliminar y a estudiantes reservar según el flujo. |
| `reservas/{reservaId}` | Horario, participantes, materia, fechas y estado | Solo los participantes leen; las escrituras válidas se hacen en transacciones del cliente. |

El registro exige correo institucional `@uao.edu.co` verificado. La app crea el perfil como estudiante. Para habilitar un profesor, verifica su cuenta, inicia sesión para crear sus perfiles y luego asigna `rol: "profesor"` en `perfiles/{uid}`; añade los documentos de materias en la subcolección `asignaturas`. La consola Firebase administra estos datos con privilegios del proyecto.

## Flujos

- El profesor publica y elimina horarios futuros desde su espacio docente.
- Un documento de calendario se actualiza en la misma transacción que la publicación o eliminación para serializar operaciones de la app y revisar cruces.
- Estudiantes solicitan una franja. La transacción crea la reserva pendiente y bloquea el horario en una sola operación.
- El profesor confirma, cancela o marca la reserva como realizada; el estudiante puede cancelar antes del inicio.
- Las reglas validan identidad verificada, rol, propiedad, campos permitidos y cambios de estado. Las consultas de reservas deben filtrar por el UID del participante.

La validación de cruces se ejecuta en el cliente y se protege con transacciones entre clientes cooperativos. Un cliente modificado podría alterar deliberadamente el calendario del propio profesor; validar esa condición contra clientes manipulados requeriría código confiable del lado servidor, que este proyecto académico no utiliza.

## Despliegue

Configura `apps/client/.env.local` (no se sube a Git), activa correo/contraseña en Authentication y publica reglas e índices:

```bash
npx -y firebase-tools@latest deploy --only firestore --project asesoriasuao
```
