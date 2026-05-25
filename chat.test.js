/**
 * @jest-environment jsdom
 */

// Define TextEncoder/TextDecoder before JSDOM tries to use it
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

const { addMsg } = require('./chat.js');

describe('addMsg', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="chat-messages"></div>';
    });

    it('should add a user message', () => {
        addMsg('Hello', 'user');
        const msgs = document.getElementById('chat-messages');
        expect(msgs.children.length).toBe(1);
        expect(msgs.children[0].innerHTML).toBe('Hello');
        expect(msgs.children[0].className).toContain('self-end');
    });

    it('should add a bot message', () => {
        addMsg('Hi there', 'bot');
        const msgs = document.getElementById('chat-messages');
        expect(msgs.children.length).toBe(1);
        expect(msgs.children[0].innerHTML).toBe('Hi there');
        expect(msgs.children[0].className).toContain('self-start');
    });

    it('should scroll to bottom when message is added', () => {
        const msgs = document.getElementById('chat-messages');
        // Mock scrollHeight
        Object.defineProperty(msgs, 'scrollHeight', { value: 1000, configurable: true });

        addMsg('Test scroll', 'user');

        expect(msgs.scrollTop).toBe(1000);
    });
});
