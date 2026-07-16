const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

describe('getAIResponse', () => {
    let window;

    beforeAll(() => {
        // Use fake timers to not block the event loop
        jest.useFakeTimers();

        let html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
        // Strip out external scripts as per memory
        html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '');
        html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/1\.8\.0\/vanilla-tilt\.min\.js"><\/script>/g, '');

        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", () => {}); // No-op to suppress errors

        const dom = new JSDOM(html, {
            runScripts: "dangerously",
            virtualConsole,
            beforeParse(win) {
                win.tailwind = { config: {} };
                win.scrollTo = jest.fn();
            }
        });

        window = dom.window;
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('should return greeting for hola', () => {
        const response = window.getAIResponse('Hola');
        expect(response).toBe('¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?');
    });

    test('should return auto response for auto', () => {
        const response = window.getAIResponse('quiero un auto');
        expect(response).toBe('Ofrecemos seguros vehiculares con cobertura total. 🚗 ¿Le gustaría cotizar?');
    });

    test('should return internet response for internet', () => {
        const response = window.getAIResponse('info sobre internet');
        expect(response).toBe('Contamos con planes de internet de alta velocidad corporativos. 📶 ¿En qué ciudad se encuentra?');
    });

    test('should return video response for video', () => {
        const response = window.getAIResponse('necesito video');
        expect(response).toBe('¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?');
    });

    test('should return video response for marketing', () => {
        const response = window.getAIResponse('agencia de marketing');
        expect(response).toBe('¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?');
    });

    test('should return default response for unknown queries', () => {
        const response = window.getAIResponse('otra cosa');
        expect(response).toBe('Para una asesoría técnica profesional, le sugiero conversar directamente con nuestros directores vía WhatsApp.');
    });
});
