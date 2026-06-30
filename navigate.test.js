const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

describe('navigate function', () => {
    let dom;
    let document;
    let window;

    beforeEach(() => {
        // Read index.html content
        const htmlContent = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

        // Clean HTML to prevent JSDOM from hanging or throwing unhandled reference errors
        const cleanedHtml = htmlContent
            // Strip external scripts
            .replace(/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/g, '')
            .replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/vanilla-tilt\/1.7.0\/vanilla-tilt.min.js"><\/script>/g, '')
            // Strip out tailwind inline config entirely
            .replace(/<script>\s*tailwind\.config[\s\S]*?<\/script>/g, '')
            // Strip out infinite loops / interval blocks
            .replace(/setInterval\([\s\S]*?\);/g, '');

        // Use a virtual console to suppress JSDOM errors from remaining scripts if needed
        const virtualConsole = new jsdom.VirtualConsole();
        virtualConsole.on("error", () => { /* No-op to suppress JSDOM internal script errors */ });

        dom = new JSDOM(cleanedHtml, { runScripts: "dangerously", virtualConsole });
        document = dom.window.document;
        window = dom.window;

        // Mock window.scrollTo
        window.scrollTo = jest.fn();
    });

    it('should navigate to home correctly', () => {
        const homeEl = document.getElementById('page-home');
        const solucionesEl = document.getElementById('page-soluciones');
        const nosotrosEl = document.getElementById('page-nosotros');

        window.navigate('home');

        expect(homeEl.classList.contains('hidden')).toBe(false);
        expect(homeEl.classList.contains('animate-entrance')).toBe(true);

        expect(solucionesEl.classList.contains('hidden')).toBe(true);
        expect(solucionesEl.classList.contains('animate-entrance')).toBe(false);

        expect(nosotrosEl.classList.contains('hidden')).toBe(true);
        expect(nosotrosEl.classList.contains('animate-entrance')).toBe(false);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should navigate to soluciones correctly', () => {
        const homeEl = document.getElementById('page-home');
        const solucionesEl = document.getElementById('page-soluciones');
        const nosotrosEl = document.getElementById('page-nosotros');

        window.navigate('soluciones');

        expect(solucionesEl.classList.contains('hidden')).toBe(false);
        expect(solucionesEl.classList.contains('animate-entrance')).toBe(true);

        expect(homeEl.classList.contains('hidden')).toBe(true);
        expect(homeEl.classList.contains('animate-entrance')).toBe(false);

        expect(nosotrosEl.classList.contains('hidden')).toBe(true);
        expect(nosotrosEl.classList.contains('animate-entrance')).toBe(false);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should navigate to nosotros correctly', () => {
        const homeEl = document.getElementById('page-home');
        const solucionesEl = document.getElementById('page-soluciones');
        const nosotrosEl = document.getElementById('page-nosotros');

        window.navigate('nosotros');

        expect(nosotrosEl.classList.contains('hidden')).toBe(false);
        expect(nosotrosEl.classList.contains('animate-entrance')).toBe(true);

        expect(homeEl.classList.contains('hidden')).toBe(true);
        expect(homeEl.classList.contains('animate-entrance')).toBe(false);

        expect(solucionesEl.classList.contains('hidden')).toBe(true);
        expect(solucionesEl.classList.contains('animate-entrance')).toBe(false);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});
