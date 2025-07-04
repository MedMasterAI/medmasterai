function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
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
export async function generateWithFallback(main, backups = [], timeoutMs = 10000) {
    const models = [main, ...backups];
    for (let i = 0; i < models.length; i++) {
        try {
            const result = await withTimeout(models[i](), timeoutMs);
            return { status: 'success', message: '', data: result };
        }
        catch (err) {
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
//# sourceMappingURL=generateWithFallback.js.map