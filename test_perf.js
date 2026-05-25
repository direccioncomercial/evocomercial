const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

function measurePerformance() {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Simulate the current toggleMenu functionality
    function toggleMenuCurrent() {
        const menu = document.getElementById('side-menu');
        const backdrop = document.getElementById('backdrop');
        if (menu.classList.contains('drawer-open')) {
            menu.classList.remove('drawer-open');
            backdrop.classList.remove('opacity-100');
            // We're omitting setTimeout for benchmark speed, just class operations
        } else {
            backdrop.classList.remove('hidden');
            void backdrop.offsetWidth;
            backdrop.classList.add('opacity-100');
            menu.classList.add('drawer-open');
        }
    }

    // Measure current approach
    const startCurrent = performance.now();
    for (let i = 0; i < 100000; i++) {
        toggleMenuCurrent();
    }
    const endCurrent = performance.now();
    const timeCurrent = endCurrent - startCurrent;
    console.log(`Current toggleMenu execution time (100,000 iterations): ${timeCurrent.toFixed(2)} ms`);

    // Simulate the proposed optimized functionality
    const menuCached = document.getElementById('side-menu');
    const backdropCached = document.getElementById('backdrop');

    function toggleMenuOptimized() {
        if (menuCached.classList.contains('drawer-open')) {
            menuCached.classList.remove('drawer-open');
            backdropCached.classList.remove('opacity-100');
        } else {
            backdropCached.classList.remove('hidden');
            void backdropCached.offsetWidth;
            backdropCached.classList.add('opacity-100');
            menuCached.classList.add('drawer-open');
        }
    }

    // Measure optimized approach
    const startOptimized = performance.now();
    for (let i = 0; i < 100000; i++) {
        toggleMenuOptimized();
    }
    const endOptimized = performance.now();
    const timeOptimized = endOptimized - startOptimized;
    console.log(`Optimized toggleMenu execution time (100,000 iterations): ${timeOptimized.toFixed(2)} ms`);

    const improvement = ((timeCurrent - timeOptimized) / timeCurrent) * 100;
    console.log(`Performance Improvement: ${improvement.toFixed(2)}%`);
}

measurePerformance();
