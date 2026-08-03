const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const htmlPath = path.resolve(__dirname, '../index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Strip out external scripts and timers to prevent JSDOM hanging
htmlContent = htmlContent.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '');
htmlContent = htmlContent.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/[^"]+"><\/script>/, '');

describe('getAIResponse', () => {
    let getAIResponse;
    let dom;

    beforeAll((done) => {
        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", () => {
            // Suppress JSDOM parsing errors
        });

        dom = new JSDOM(htmlContent, {
            runScripts: "dangerously",
            virtualConsole,
            beforeParse(window) {
                window.tailwind = { config: {} };
                window.setTimeout = () => {};
                window.setInterval = () => {};
            }
        });

        // Wait briefly for scripts to parse
        setTimeout(() => {
            getAIResponse = dom.window.getAIResponse;
            done();
        }, 100);
    });

    it('should handle "hola" keyword', () => {
        const response = getAIResponse('hola amigo');
        expect(response).toBe('¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?');
    });

    it('should handle "auto" keyword', () => {
        const response = getAIResponse('necesito seguro para mi auto');
        expect(response).toBe('Ofrecemos seguros vehiculares con cobertura total. 🚗 ¿Le gustaría cotizar?');
    });

    it('should handle "internet" keyword', () => {
        const response = getAIResponse('quiero internet');
        expect(response).toBe('Contamos con planes de internet de alta velocidad corporativos. 📶 ¿En qué ciudad se encuentra?');
    });

    it('should handle "video" keyword', () => {
        const response = getAIResponse('un video por favor');
        expect(response).toBe('¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?');
    });

    it('should handle "marketing" keyword', () => {
        const response = getAIResponse('servicios de marketing');
        expect(response).toBe('¡Nuestro paquete Audiovisual 4K cuesta solo $80 USD. ¿Te gustaría agendar una grabación?');
    });

    it('should be case insensitive', () => {
        const response = getAIResponse('HOLA');
        expect(response).toBe('¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?');

        const response2 = getAIResponse('AuTo');
        expect(response2).toBe('Ofrecemos seguros vehiculares con cobertura total. 🚗 ¿Le gustaría cotizar?');
    });

    it('should handle unknown keywords with default response', () => {
        const response = getAIResponse('algo diferente');
        expect(response).toBe('Para una asesoría técnica profesional, le sugiero conversar directamente con nuestros directores vía WhatsApp.');
    });

    it('should handle multiple keywords (returns first match)', () => {
        // "hola" comes before "auto" in logic
        const response = getAIResponse('hola quiero un auto');
        expect(response).toBe('¡Hola! Bienvenido a EvoluSer. 🤖 ¿Desea conocer sobre nuestros seguros, conectividad o servicios de marketing audiovisual?');
    });
});
