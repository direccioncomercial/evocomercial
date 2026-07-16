const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const htmlPath = path.resolve(__dirname, './index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Strip out external scripts
html = html.replace(/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/g, '');
html = html.replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/vanilla-tilt\/1.8.0\/vanilla-tilt.min.js"><\/script>/g, '');

// Strip out setInterval to prevent JSDOM from hanging
html = html.replace(/setInterval\(nextSlide, 8000\);/g, '');

const virtualConsole = new (require('jsdom').VirtualConsole)();
virtualConsole.on("error", () => { /* no-op */ });

let dom;
let window;

beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", virtualConsole });
    window = dom.window;
    window.tailwind = { config: {} };
    window.scrollTo = jest.fn();

    // Set up the dom environment
    global.document = window.document;
    global.window = window;
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
});

describe('handleChat', () => {
    test('does nothing when input is empty or just whitespace', () => {
        const input = document.getElementById('chat-input');
        input.value = '   ';

        window.addMsg = jest.fn();

        window.handleChat();

        expect(window.addMsg).not.toHaveBeenCalled();
        expect(input.value).toBe('   ');
    });

    test('adds user message, clears input, and sets timeout for bot response', () => {
        jest.useFakeTimers();

        const input = document.getElementById('chat-input');
        input.value = 'Hola';

        window.addMsg = jest.fn();
        window.getAIResponse = jest.fn().mockReturnValue('Mocked AI Response');

        window.handleChat();

        // Assert user message added and input cleared
        expect(window.addMsg).toHaveBeenCalledWith('Hola', 'user');
        expect(input.value).toBe('');

        // Assert bot message not added immediately
        expect(window.addMsg).toHaveBeenCalledTimes(1);
        expect(window.getAIResponse).not.toHaveBeenCalled();

        // Fast-forward time by 700ms
        jest.advanceTimersByTime(700);

        // Assert bot response added
        expect(window.getAIResponse).toHaveBeenCalledWith('Hola');
        expect(window.addMsg).toHaveBeenCalledWith('Mocked AI Response', 'bot');
        expect(window.addMsg).toHaveBeenCalledTimes(2);
    });
});
