const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf-8');

const htmlStripped = html
  .replace(/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/g, '')
  .replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/vanilla-tilt\/1.7.0\/vanilla-tilt.min.js"><\/script>/g, '')
  .replace(/<script>\s*tailwind\.config\s*=\s*{[\s\S]*?}\s*<\/script>/, '');

const virtualConsole = new VirtualConsole();
virtualConsole.on("error", () => {
  // No-op to skip console errors
});

const dom = new JSDOM(htmlStripped, { runScripts: "dangerously", virtualConsole });

setTimeout(() => {
  const addMsg = dom.window.addMsg;
  const chatMessages = dom.window.document.getElementById('chat-messages');

  const initialCount = chatMessages.children.length;

  addMsg('Hello world', 'user');

  if (chatMessages.children.length !== initialCount + 1) {
    console.error('Test failed: Message was not appended to chat-messages');
    process.exit(1);
  }

  const lastMessage = chatMessages.lastElementChild;
  if (lastMessage.textContent !== 'Hello world') {
    console.error('Test failed: Message text is incorrect');
    process.exit(1);
  }

  addMsg('<script>alert("xss")</script>', 'bot');
  const secondMessage = chatMessages.lastElementChild;
  if (secondMessage.innerHTML === '<script>alert("xss")</script>') {
    console.error('Test failed: XSS vulnerability exists, innerHTML was used instead of textContent');
    process.exit(1);
  }

  if (secondMessage.textContent !== '<script>alert("xss")</script>') {
    console.error('Test failed: Message text is incorrect for the second message');
    process.exit(1);
  }

  console.log('All tests passed!');
  process.exit(0);
}, 100);
