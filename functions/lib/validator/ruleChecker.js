/**
 * Comprueba que NO existan estilos inline ni etiquetas prohibidas.
 * Arroja error si detecta algo inválido.
 */
export function checkHtmlRules(html) {
    // Expresiones para buscar tags o atributos no permitidos
    const forbiddenPatterns = [
        /<style\b/i,
        /<script\b/i,
        /<html\b/i,
        /<head\b/i,
        /<body\b/i,
        /style=/i,
    ];
    const found = forbiddenPatterns.find(re => re.test(html));
    if (found) {
        throw new Error(`HTML no válido: detectado "${found}" — elimina estilos inline o etiquetas prohibidas`);
    }
}
//# sourceMappingURL=ruleChecker.js.map