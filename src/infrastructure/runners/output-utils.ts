/**
 * Normaliza texto eliminando espacios finales y caracteres de retorno de carro
 * @param text - Texto a normalizar
 * @returns Texto normalizado
 */
export function normalize(text: string | null | undefined): string {
  if (!text) return '';
  
  // Eliminar \r y trim general
  return text.replace(/\r/g, '').trim().replace(/\s+$/, '');
}

/**
 * Compara la salida del estudiante con la esperada
 * @param studentOutput - Salida generada por el código del estudiante
 * @param expectedOutput - Salida esperada del test case
 * @returns "OK" si coinciden, "WRONG_ANSWER" si no
 */
export function compareOutputs(
  studentOutput: string,
  expectedOutput: string,
): 'OK' | 'WRONG_ANSWER' {
  const student = normalize(studentOutput);
  const expected = normalize(expectedOutput);

  // Comparación exacta después de normalizar
  if (student === expected) {
    return 'OK';
  }

  // Comparación línea por línea (más robusta)
  const studentLines = student.split('\n').map((l) => l.trimEnd());
  const expectedLines = expected.split('\n').map((l) => l.trimEnd());

  // Diferente número de líneas
  if (studentLines.length !== expectedLines.length) {
    return 'WRONG_ANSWER';
  }

  // Comparar cada línea
  for (let i = 0; i < studentLines.length; i++) {
    if (studentLines[i] !== expectedLines[i]) {
      return 'WRONG_ANSWER';
    }
  }

  return 'OK';
}

/**
 * Trunca texto a un tamaño máximo para evitar sobrecargar la BD
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima (default: 10KB)
 * @returns Texto truncado
 */
export function truncateOutput(text: string | null | undefined, maxLength = 10240): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '\n... (output truncated)';
}
