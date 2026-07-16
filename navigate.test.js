const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

const htmlModified = html
  .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/gi, '')
  .replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/.*"><\/script>/gi, '')
  .replace(/<script>/gi, '<script>window.tailwind = { config: {} };')
  .replace(/setInterval\(nextSlide, 8000\);/gi, ''); // remove setInterval to avoid jest hangups from tests not completing cleanly

describe('navigate() function', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        dom = new JSDOM(htmlModified, {
            runScripts: "dangerously",
            virtualConsole: new (require("jsdom").VirtualConsole)().on("error", (err) => {
                // Ignore jsdom console errors to make jest test output clean
            })
        });
        window = dom.window;
        document = window.document;

        // Mock window.scrollTo
        window.scrollTo = jest.fn();
    });

    afterEach(() => {
        // Clean up DOM to prevent memory leaks in Jest
        window.close();
    });

    test('should show home page and hide others when navigate("home") is called', () => {
        const home = document.getElementById('page-home');
        const soluciones = document.getElementById('page-soluciones');
        const nosotros = document.getElementById('page-nosotros');

        // Let's ensure another page is not hidden to test if it hides it correctly
        home.classList.add('hidden');
        soluciones.classList.remove('hidden');

        window.navigate('home');

        expect(home.classList.contains('hidden')).toBe(false);
        expect(home.classList.contains('animate-entrance')).toBe(true);

        expect(soluciones.classList.contains('hidden')).toBe(true);
        expect(soluciones.classList.contains('animate-entrance')).toBe(false);

        expect(nosotros.classList.contains('hidden')).toBe(true);
        expect(nosotros.classList.contains('animate-entrance')).toBe(false);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    test('should show soluciones page and hide others when navigate("soluciones") is called', () => {
        const home = document.getElementById('page-home');
        const soluciones = document.getElementById('page-soluciones');
        const nosotros = document.getElementById('page-nosotros');

        window.navigate('soluciones');

        expect(soluciones.classList.contains('hidden')).toBe(false);
        expect(soluciones.classList.contains('animate-entrance')).toBe(true);

        expect(home.classList.contains('hidden')).toBe(true);
        expect(home.classList.contains('animate-entrance')).toBe(false);

        expect(nosotros.classList.contains('hidden')).toBe(true);
        expect(nosotros.classList.contains('animate-entrance')).toBe(false);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    test('should show nosotros page and hide others when navigate("nosotros") is called', () => {
        const home = document.getElementById('page-home');
        const soluciones = document.getElementById('page-soluciones');
        const nosotros = document.getElementById('page-nosotros');

        window.navigate('nosotros');

        expect(nosotros.classList.contains('hidden')).toBe(false);
        expect(nosotros.classList.contains('animate-entrance')).toBe(true);

        expect(home.classList.contains('hidden')).toBe(true);
        expect(home.classList.contains('animate-entrance')).toBe(false);

        expect(soluciones.classList.contains('hidden')).toBe(true);
        expect(soluciones.classList.contains('animate-entrance')).toBe(false);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});
