const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8');

// A much safer way to test this without running all of index.html's javascript which is causing issues
// is to extract the HTML structure needed and the specific JS function.
const extractHTML = () => {
  // Find side-menu and backdrop elements in the raw HTML string
  const sideMenuMatch = html.match(/<div id="side-menu"[^>]*>.*?<\/div>/s);
  const backdropMatch = html.match(/<div id="backdrop"[^>]*><\/div>/s);

  // Extract function string explicitly by finding its start and end
  const funcStart = html.indexOf('function toggleMenu() {');
  let funcEnd = -1;

  if (funcStart !== -1) {
    let openBraces = 0;
    for (let i = funcStart + 'function toggleMenu() {'.length - 1; i < html.length; i++) {
      if (html[i] === '{') openBraces++;
      if (html[i] === '}') {
        openBraces--;
        if (openBraces === 0) {
          funcEnd = i + 1;
          break;
        }
      }
    }
  }

  const funcStr = funcStart !== -1 && funcEnd !== -1 ? html.substring(funcStart, funcEnd) : '';

  return `
    <!DOCTYPE html>
    <html>
      <head></head>
      <body>
        ${sideMenuMatch ? sideMenuMatch[0] : '<div id="side-menu" class="flex flex-col"></div>'}
        ${backdropMatch ? backdropMatch[0] : '<div id="backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[900] hidden opacity-0 transition-opacity duration-300"></div>'}
        <script>
          ${funcStr}
        </script>
      </body>
    </html>
  `;
};

const safeHtml = extractHTML();

describe('toggleMenu', () => {
  let dom;
  let document;
  let window;

  beforeAll(() => {
     jest.useFakeTimers();
  });

  beforeEach(() => {
    dom = new JSDOM(safeHtml, { runScripts: "dangerously" });
    window = dom.window;
    document = window.document;
  });

  afterEach(() => {
    dom.window.close();
  });

  afterAll(() => {
      jest.useRealTimers();
  });

  it('should open the menu when it is closed', () => {
    const menu = document.getElementById('side-menu');
    const backdrop = document.getElementById('backdrop');

    expect(menu.classList.contains('drawer-open')).toBe(false);
    expect(backdrop.classList.contains('hidden')).toBe(true);

    window.toggleMenu();

    expect(menu.classList.contains('drawer-open')).toBe(true);
    expect(backdrop.classList.contains('hidden')).toBe(false);
    expect(backdrop.classList.contains('opacity-100')).toBe(true);
  });

  it('should close the menu when it is open', () => {
    const menu = document.getElementById('side-menu');
    const backdrop = document.getElementById('backdrop');

    window.toggleMenu();
    expect(menu.classList.contains('drawer-open')).toBe(true);

    window.toggleMenu();

    expect(menu.classList.contains('drawer-open')).toBe(false);
    expect(backdrop.classList.contains('opacity-100')).toBe(false);

    jest.advanceTimersByTime(300);
    expect(backdrop.classList.contains('hidden')).toBe(true);
  });
});
