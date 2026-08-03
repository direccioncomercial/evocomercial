const { TextEncoder, TextDecoder } = require('util');
Object.assign(global, { TextEncoder, TextDecoder });

const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

describe('navigate function', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        const htmlPath = path.resolve(__dirname, '../index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        // Strip external scripts to prevent JSDOM errors/hanging
        html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/gi, '');
        html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/[^"]+"><\/script>/gi, '');

        // Strip long-running timers
        html = html.replace(/setInterval\(.*?\);/gi, '');

        const virtualConsole = new VirtualConsole();
        virtualConsole.on("error", () => {}); // Suppress internal JSDOM script errors

        dom = new JSDOM(html, {
            runScripts: 'dangerously',
            virtualConsole,
            beforeParse(win) {
                // Mock dependencies that throw reference errors
                win.tailwind = { config: {} };
                // Mock scrollTo natively not supported by JSDOM
                win.scrollTo = jest.fn();
            }
        });

        window = dom.window;
        document = window.document;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should show the target page (soluciones) and hide others', () => {
        // Trigger navigation
        window.navigate('soluciones');

        const pageHome = document.getElementById('page-home');
        const pageSoluciones = document.getElementById('page-soluciones');
        const pageNosotros = document.getElementById('page-nosotros');

        // Check target page (soluciones)
        expect(pageSoluciones.classList.contains('hidden')).toBe(false);
        expect(pageSoluciones.classList.contains('animate-entrance')).toBe(true);

        // Check other pages
        expect(pageHome.classList.contains('hidden')).toBe(true);
        expect(pageHome.classList.contains('animate-entrance')).toBe(false);

        expect(pageNosotros.classList.contains('hidden')).toBe(true);
        expect(pageNosotros.classList.contains('animate-entrance')).toBe(false);

        // Check scrollTo
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    test('should show the target page (nosotros) and hide others', () => {
        window.navigate('nosotros');

        const pageHome = document.getElementById('page-home');
        const pageSoluciones = document.getElementById('page-soluciones');
        const pageNosotros = document.getElementById('page-nosotros');

        expect(pageNosotros.classList.contains('hidden')).toBe(false);
        expect(pageNosotros.classList.contains('animate-entrance')).toBe(true);

        expect(pageHome.classList.contains('hidden')).toBe(true);
        expect(pageHome.classList.contains('animate-entrance')).toBe(false);

        expect(pageSoluciones.classList.contains('hidden')).toBe(true);
        expect(pageSoluciones.classList.contains('animate-entrance')).toBe(false);
    });
});