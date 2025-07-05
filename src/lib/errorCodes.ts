export const ERROR_CODES = {
  PDF_PROCESS: 'ERR-PDF-001',
  VIDEO_PROCESS: 'ERR-VID-001',
  AUDIO_PROCESS: 'ERR-AUD-001',
  ANKI_PROCESS: 'ERR-ANKI-001',
  LOGIN: 'ERR-AUTH-001',
  SIGNUP: 'ERR-AUTH-002',
  RESET_PASSWORD: 'ERR-AUTH-003',
  PAYMENT: 'ERR-PAY-001',
  GENERIC: 'ERR-GEN-001',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export const errorMessages: Record<ErrorCode, string> = {
  [ERROR_CODES.PDF_PROCESS]: 'Ocurrió un error al procesar tu apunte.',
  [ERROR_CODES.VIDEO_PROCESS]: 'Ocurrió un error al procesar tu video.',
  [ERROR_CODES.AUDIO_PROCESS]: 'Ocurrió un error al procesar tu audio.',
  [ERROR_CODES.ANKI_PROCESS]: 'Ocurrió un error al generar el archivo.',
  [ERROR_CODES.LOGIN]: 'No se pudo iniciar sesión.',
  [ERROR_CODES.SIGNUP]: 'No se pudo crear la cuenta.',
  [ERROR_CODES.RESET_PASSWORD]: 'No se pudo enviar el correo de recuperación.',
  [ERROR_CODES.PAYMENT]: 'No se pudo iniciar el pago.',
  [ERROR_CODES.GENERIC]: 'Ocurrió un error inesperado.',
};

export function formatErrorMessage(code: ErrorCode): string {
  return `${errorMessages[code]} Código: ${code}`;
}
