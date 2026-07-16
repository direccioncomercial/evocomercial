const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');
const util = require('util');

// Polyfills required for JSDOM in Jest/Node environment
Object.defineProperty(global, 'TextEncoder', { value: util.TextEncoder });
Object.defineProperty(global, 'TextDecoder', { value: util.TextDecoder });

const virtualConsole = new VirtualConsole();
// Suppress internal JSDOM parser errors
virtualConsole.on("error", () => {});
virtualConsole.on("log", console.log);

// Read HTML and strip external scripts to prevent JSDOM from hanging
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>/, '');
html = html.replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/vanilla-tilt\/1\.8\.0\/vanilla-tilt\.min\.js"><\/script>/, '');

// Setup JSDOM
const dom = new JSDOM(html, {
    runScripts: "dangerously",
    virtualConsole,
    beforeParse(window) {
        // Mock external libraries
        window.tailwind = { config: {} };
        window.scrollTo = () => {};
    }
});

setTimeout(() => {
    const document = dom.window.document;
    const cards = document.querySelectorAll('.leadership-cards-container .bg-white.p-5');
    console.log(`Found ${cards.length} cards.`);
    if (cards.length === 6) {
        console.log('SUCCESS: Dynamic rendering worked correctly.');
        process.exit(0);
    } else {
        console.error('FAILURE: Expected 6 cards, found ' + cards.length);
        process.exit(1);
    }
}, 500); // Give it a short moment for DOMContentLoaded or synchronous scripts to finish
