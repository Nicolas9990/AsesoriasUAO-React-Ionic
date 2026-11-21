// Convierte cualquier error en un texto que la interfaz pueda mostrar.
// Los errores de JavaScript tienen mensaje; otros valores usan un mensaje genérico.
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.';
}
