const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const jsdom = require('jsdom');

// JSDOM requires TextEncoder/TextDecoder polyfills in Jest
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

describe('addMsg DOM element creation', () => {
    let dom;
    let window;
    let document;

    beforeEach(() => {
        // Read HTML content
        const htmlPath = path.join(__dirname, 'index.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf8');

        // Strip out external scripts to prevent jsdom hangs/errors
        htmlContent = htmlContent
            .replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/g, '')
            .replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/1\.8\.0\/vanilla-tilt\.min\.js"><\/script>/g, '')
            .replace(/setInterval\(nextSlide, 8000\);/g, ''); // Remove setInterval to prevent jest hanging

        // Suppress expected JSDOM internal script errors when runScripts is dangerously
        const virtualConsole = new jsdom.VirtualConsole();
        virtualConsole.on("error", () => {
            // No-op to suppress errors from parsing scripts without their dependencies
        });

        // Initialize JSDOM
        dom = new JSDOM(htmlContent, {
            runScripts: "dangerously",
            virtualConsole
        });
        window = dom.window;
        document = window.document;

        // Mock window properties required by scripts
        window.tailwind = { config: {} };
        window.scrollTo = jest.fn();
    });

    it('should create and append a user message with correct classes and text', () => {
        const text = "Hello from user!";
        window.addMsg(text, 'user');

        const msgs = document.getElementById('chat-messages');
        const latestMsg = msgs.lastElementChild;

        expect(latestMsg).toBeDefined();
        expect(latestMsg.textContent).toBe(text);
        expect(latestMsg.className).toContain('self-end bg-brandTeal text-white');
        expect(latestMsg.className).toContain('rounded-tr-none');
    });

    it('should create and append a bot message with correct classes and text', () => {
        const text = "Hello from bot!";
        window.addMsg(text, 'bot');

        const msgs = document.getElementById('chat-messages');
        const latestMsg = msgs.lastElementChild;

        expect(latestMsg).toBeDefined();
        expect(latestMsg.textContent).toBe(text);
        expect(latestMsg.className).toContain('self-start bg-white text-slate-700');
        expect(latestMsg.className).toContain('rounded-tl-none');
    });

    it('should properly escape HTML to prevent XSS (testing textContent behavior)', () => {
        const xssPayload = "<script>alert('xss')</script>";
        window.addMsg(xssPayload, 'user');

        const msgs = document.getElementById('chat-messages');
        const latestMsg = msgs.lastElementChild;

        // textContent sets the text directly, so innerHTML should have HTML entities escaped.
        // It should NOT render a <script> tag.
        expect(latestMsg.innerHTML).toContain('&lt;script&gt;');
        expect(latestMsg.textContent).toBe(xssPayload);
        // Ensure no new script tags were appended
        expect(latestMsg.querySelectorAll('script').length).toBe(0);
    });
});
