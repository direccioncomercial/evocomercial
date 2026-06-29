const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for TextEncoder/TextDecoder
Object.assign(global, { TextDecoder, TextEncoder });

describe('getAIResponse', () => {
    let getAIResponse;

    beforeAll(() => {
        const htmlPath = path.resolve(__dirname, '../index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Extract the target function using regex
        const functionMatch = html.match(/function\s+getAIResponse\s*\([^)]*\)\s*\{[^}]+\}/);

        if (functionMatch) {
            // Evaluate the function in the current context
            getAIResponse = new Function(`return ${functionMatch[0]}`)();
        }
    });

    test('should exist as a function', () => {
        expect(typeof getAIResponse).toBe('function');
    });

    test('returns greeting for queries containing "hola"', () => {
        const expected = '¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?';
        expect(getAIResponse('Hola, ¿qué tal?')).toBe(expected);
        expect(getAIResponse('HOLA')).toBe(expected);
        expect(getAIResponse('hola!!')).toBe(expected);
    });

    test('returns auto insurance info for queries containing "auto"', () => {
        const expected = 'Ofrecemos seguros vehiculares con cobertura total. 🚗 ¿Le gustaría cotizar?';
        expect(getAIResponse('Busco seguro de auto')).toBe(expected);
        expect(getAIResponse('AUTO')).toBe(expected);
    });

    test('returns internet info for queries containing "internet"', () => {
        const expected = 'Contamos con planes de internet de alta velocidad corporativos. 📶 ¿En qué ciudad se encuentra?';
        expect(getAIResponse('Tienen internet?')).toBe(expected);
        expect(getAIResponse('INTERNET')).toBe(expected);
    });

    test('returns audiovisual info for queries containing "video" or "marketing"', () => {
        const expected = '¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?';
        expect(getAIResponse('hacen video?')).toBe(expected);
        expect(getAIResponse('agencia de marketing')).toBe(expected);
        expect(getAIResponse('VIDEO promocional')).toBe(expected);
        expect(getAIResponse('MARKETING digital')).toBe(expected);
    });

    test('returns default fallback message for unknown queries', () => {
        const expected = 'Para una asesoría técnica profesional, le sugiero conversar directamente con nuestros directores vía WhatsApp.';
        expect(getAIResponse('quiero saber el clima')).toBe(expected);
        expect(getAIResponse('comprar comida')).toBe(expected);
        expect(getAIResponse('unknown')).toBe(expected);
        expect(getAIResponse('')).toBe(expected);
    });

    test('is case insensitive', () => {
        const autoExpected = 'Ofrecemos seguros vehiculares con cobertura total. 🚗 ¿Le gustaría cotizar?';
        expect(getAIResponse('aUtO')).toBe(autoExpected);
        expect(getAIResponse('AuTo')).toBe(autoExpected);

        const holaExpected = '¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?';
        expect(getAIResponse('HoLa')).toBe(holaExpected);
    });
});
