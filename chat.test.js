/**
 * @jest-environment jsdom
 */
const fs = require('fs');
const path = require('path');
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

describe('Chat XSS Vulnerability', () => {
    let originalHtml;

    beforeEach(() => {
        // Strip out scripts to prevent JSDOM issues as per guidelines
        originalHtml = html
            .replace(/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/, '')
            .replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/vanilla-tilt\/1.7.0\/vanilla-tilt.min.js"><\/script>/, '');

        document.documentElement.innerHTML = originalHtml;

        // Extract inner script content to run safely
        const scripts = document.querySelectorAll('script');
        let scriptContent = '';
        scripts.forEach(script => {
            if (!script.src) {
                scriptContent += script.innerHTML;
            }
        });

        // Remove tailwind object usage and infinite loops
        const safeScriptContent = scriptContent
            .replace(/setInterval\(nextSlide, 8000\);/g, '')
            .replace(/tailwind\.config\s*=\s*{[\s\S]*?};/, '');

        window.eval(safeScriptContent);
    });

    afterEach(() => {
        jest.resetModules();
    });

    test('addMsg should not execute injected script tags', () => {
        const maliciousString = '<img src=x onerror="window.XSS_EXECUTED=true">';
        window.XSS_EXECUTED = false;

        // The function is attached to window since we eval'd it there
        window.addMsg(maliciousString, 'user');

        const chatMessages = window.document.getElementById('chat-messages');
        const lastMsg = chatMessages.lastChild;

        // If innerHTML was used, the img tag would be parsed, creating child nodes.
        // If textContent was used, the innerHTML matches the text (encoded)
        expect(lastMsg.innerHTML).toBe('&lt;img src=x onerror="window.XSS_EXECUTED=true"&gt;');

        // textContent safely escapes tags
        expect(lastMsg.textContent).toBe(maliciousString);

        // The script should not have been executed
        expect(window.XSS_EXECUTED).toBe(false);
    });
});
