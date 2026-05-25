const fs = require('fs');
const test = require('node:test');
const assert = require('node:assert');

const htmlContent = fs.readFileSync('index.html', 'utf-8');

// Extract getAIResponse function
// Match 'function getAIResponse(query) {' and then everything until the closing brace that aligns with it,
// though for our simple function this works. A more robust regex uses lazy match up to the specific return.
const functionRegex = /function getAIResponse\(query\) \{[\s\S]*?return[^;]+;\s*\}/;
const match = htmlContent.match(functionRegex);

if (!match) {
    throw new Error('getAIResponse function not found in index.html');
}

// Evaluate the function
eval(match[0]);

test('getAIResponse tests', async (t) => {
    await t.test('should respond to hola', () => {
        assert.strictEqual(getAIResponse('Hola amigos'), '¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?');
    });

    await t.test('should respond to auto', () => {
        assert.strictEqual(getAIResponse('quiero un seguro de auto'), 'Ofrecemos seguros vehiculares con cobertura total. 🚗 ¿Le gustaría cotizar?');
    });

    await t.test('should respond to internet', () => {
        assert.strictEqual(getAIResponse('necesito internet'), 'Contamos con planes de internet de alta velocidad corporativos. 📶 ¿En qué ciudad se encuentra?');
    });

    await t.test('should respond to video or marketing', () => {
        assert.strictEqual(getAIResponse('un video por favor'), '¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?');
        assert.strictEqual(getAIResponse('hacen marketing?'), '¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?');
    });

    await t.test('should provide default response', () => {
        assert.strictEqual(getAIResponse('algo diferente'), 'Para una asesoría técnica profesional, le sugiero conversar directamente con nuestros directores vía WhatsApp.');
    });
});
