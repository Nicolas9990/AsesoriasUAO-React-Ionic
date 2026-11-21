export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la solicitud.';
}
