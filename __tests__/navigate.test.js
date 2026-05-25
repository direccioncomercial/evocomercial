/**
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const jsdom = require('jsdom');

describe('navigate function', () => {
    let window;
    let document;

    beforeEach(() => {
        const virtualConsole = new jsdom.VirtualConsole();
        virtualConsole.on("error", () => {
          // No-op to suppress JSDOM errors like "tailwind is not defined" from external/inline scripts
        });

        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        // Extract the JS content from the inline script to execute it without parsing the whole DOM again and running into issues.
        const dom = new JSDOM(`
            <div id="page-home" class="hidden"></div>
            <div id="page-soluciones" class="hidden"></div>
            <div id="page-nosotros" class="hidden"></div>
        `, { runScripts: 'dangerously', virtualConsole });

        window = dom.window;
        document = window.document;

        // Mock window.scrollTo since JSDOM doesn't implement it
        window.scrollTo = jest.fn();

        // Extract the JS string of the navigate function from index.html
        const jsMatch = html.match(/function navigate\(page\) \{[\s\S]*?window\.scrollTo\(\{ top: 0, behavior: 'smooth' \}\);\s*\}/);
        if (jsMatch) {
             const scriptEl = document.createElement('script');
             scriptEl.textContent = jsMatch[0] + "\n window.navigate = navigate;";
             document.body.appendChild(scriptEl);
        } else {
            throw new Error("Could not find navigate function in index.html");
        }
    });

    it('should show home page and hide others', () => {
        window.navigate('home');

        expect(document.getElementById('page-home').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('page-home').classList.contains('animate-entrance')).toBe(true);

        expect(document.getElementById('page-soluciones').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('page-nosotros').classList.contains('hidden')).toBe(true);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('should show soluciones page and hide others', () => {
        window.navigate('soluciones');

        expect(document.getElementById('page-soluciones').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('page-soluciones').classList.contains('animate-entrance')).toBe(true);

        expect(document.getElementById('page-home').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('page-nosotros').classList.contains('hidden')).toBe(true);
    });

    it('should show nosotros page and hide others', () => {
        window.navigate('nosotros');

        expect(document.getElementById('page-nosotros').classList.contains('hidden')).toBe(false);
        expect(document.getElementById('page-nosotros').classList.contains('animate-entrance')).toBe(true);

        expect(document.getElementById('page-home').classList.contains('hidden')).toBe(true);
        expect(document.getElementById('page-soluciones').classList.contains('hidden')).toBe(true);
    });
});
