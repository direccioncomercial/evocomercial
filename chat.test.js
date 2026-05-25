const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('handleChat', () => {
    let window, document;

    beforeEach(() => {
        const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

        // Clean out specific remote scripts that throw exceptions or cause loops in JSDOM,
        // to prevent false positives and unhandled errors in testing
        const safeHtml = html
            .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '')
            .replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/1\.8\.0\/vanilla-tilt\.min\.js"><\/script>/, '')
            .replace(/setInterval\(nextSlide, 8000\);/, '');

        // JSDOM uses virtual consoles that emit errors for unrecognized global objects like `tailwind`.
        // We use a custom VirtualConsole to ignore those specific runtime script errors and avoid polluting test output.
        const virtualConsole = new (require('jsdom').VirtualConsole)();
        virtualConsole.on("jsdomError", (error) => {
            if (error.message.includes('tailwind') || error.message.includes('VanillaTilt')) return;
            console.error(error);
        });

        const dom = new JSDOM(safeHtml, { runScripts: "dangerously", virtualConsole });
        window = dom.window;
        document = window.document;

        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('should exist', () => {
        expect(typeof window.handleChat).toBe('function');
    });

    test('should ignore empty input', () => {
        const input = document.getElementById('chat-input');
        input.value = '   ';

        window.handleChat();

        const messages = document.getElementById('chat-messages');
        expect(messages.children.length).toBe(1);
    });

    test('should add user message and trigger bot response', () => {
        const input = document.getElementById('chat-input');
        input.value = 'hola';

        window.handleChat();

        const messages = document.getElementById('chat-messages');
        expect(messages.children.length).toBe(2);
        expect(messages.children[1].innerHTML).toBe('hola');
        // Check for specific styling classes indicative of a user message
        expect(messages.children[1].className).toContain('bg-brandTeal');

        jest.advanceTimersByTime(700);

        expect(messages.children.length).toBe(3);
        expect(messages.children[2].innerHTML).toContain('¡Hola! Bienvenido a EvoluSer. 🤖');
        expect(messages.children[2].className).toContain('text-slate-700');
    });
});
