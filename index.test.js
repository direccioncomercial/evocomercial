const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const util = require('util');

// Polyfill TextEncoder and TextDecoder as per memory instructions
Object.assign(global, { TextDecoder: util.TextDecoder, TextEncoder: util.TextEncoder });

describe('showInfo function tests', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        const htmlPath = path.resolve(__dirname, 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Strip external scripts to prevent hanging or unhandled errors (Tailwind, VanillaTilt)
        htmlContent = htmlContent.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '');
        htmlContent = htmlContent.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/1\.8\.0\/vanilla-tilt\.min\.js"><\/script>/g, '');

        // Strip long-running timers like setInterval (nextSlide)
        htmlContent = htmlContent.replace(/setInterval\(nextSlide, 8000\);/g, '');

        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", () => {
            // No-op to suppress internal JSDOM script parsing errors
        });

        // Initialize JSDOM
        dom = new JSDOM(htmlContent, {
            runScripts: "dangerously",
            virtualConsole,
            beforeParse(window) {
                // Mock dependencies as per memory instructions
                window.tailwind = { config: {} };
                window.scrollTo = jest.fn();
            }
        });

        window = dom.window;
        document = window.document;
    });

    test('showInfo populates #info-modal for known service "Vehículos" correctly', () => {
        const modalContainer = document.getElementById('info-modal');
        expect(modalContainer.innerHTML).toBe('');

        // Call the function
        window.showInfo('Vehículos');

        // Verify that the body overflow was changed
        expect(document.body.style.overflow).toBe('hidden');

        // Verify modal content for 'Vehículos'
        expect(modalContainer.innerHTML).toContain('Movilidad Segura Integral');
        expect(modalContainer.innerHTML).toContain('fa-car text-brandTeal');
    });

    test('showInfo falls back to "Seguros" for unknown service', () => {
        const modalContainer = document.getElementById('info-modal');
        expect(modalContainer.innerHTML).toBe('');

        // Call the function with an unknown service
        window.showInfo('UnknownService');

        // Verify that the body overflow was changed
        expect(document.body.style.overflow).toBe('hidden');

        // Verify modal content for fallback 'Seguros'
        expect(modalContainer.innerHTML).toContain('Seguros Integrales &amp; Activos');
        expect(modalContainer.innerHTML).toContain('fa-shield-alt text-brandGold');
    });
});
