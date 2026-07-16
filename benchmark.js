const fs = require('fs');
const { JSDOM, VirtualConsole } = require('jsdom');

const html = fs.readFileSync('index.html', 'utf-8');

// Strip out external scripts and inline tailwind script
const htmlStripped = html
  .replace(/<script src="https:\/\/cdn.tailwindcss.com"><\/script>/g, '')
  .replace(/<script src="https:\/\/cdnjs.cloudflare.com\/ajax\/libs\/vanilla-tilt\/1.7.0\/vanilla-tilt.min.js"><\/script>/g, '')
  .replace(/<script>\s*tailwind\.config\s*=\s*{[\s\S]*?}\s*<\/script>/, '');


const virtualConsole = new VirtualConsole();
virtualConsole.on("error", () => {
  // No-op to skip console errors
});

const dom = new JSDOM(htmlStripped, { runScripts: "dangerously", virtualConsole });

// Let the DOM initialize
setTimeout(() => {
  const addMsg = dom.window.addMsg;

  // Measurement runs
  const WARMUP = 1000;
  for (let i = 0; i < WARMUP; i++) {
    addMsg('warmup', 'bot');
  }

  const ITERATIONS = 10000;
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    addMsg('test message', 'bot');
  }
  const end = performance.now();

  console.log(`Baseline time: ${end - start} ms`);
  process.exit(0);
}, 100);
