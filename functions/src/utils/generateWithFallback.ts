export interface GenerationResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise
      .then(res => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(err => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function generateWithFallback<T>(
  main: () => Promise<T>,
  backups: Array<() => Promise<T>> = [],
  timeoutMs = 10000
): Promise<GenerationResponse<T>> {
  const models = [main, ...backups];
  for (let i = 0; i < models.length; i++) {
    try {
      const result = await withTimeout(models[i](), timeoutMs);
      return { status: 'success', message: '', data: result };
    } catch (err: unknown) {
      const which = i === 0 ? 'principal' : `backup ${i}`;
      console.error(`\u26a0\ufe0f Error en modelo ${which}:`, err);
    }
  }
  return {
    status: 'error',
    message: 'No se pudo procesar la solicitud. Intente nuevamente más tarde.',
    data: null,
  };
}
