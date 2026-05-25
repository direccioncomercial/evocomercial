const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <body>
    <div id="info-modal"></div>
    <script>
      function closeInfoUncached() {
        document.body.style.overflow = 'auto';
        document.getElementById('info-modal').innerHTML = '';
      }

      const modalContainer = document.getElementById('info-modal');
      function closeInfoCached() {
        document.body.style.overflow = 'auto';
        modalContainer.innerHTML = '';
      }

      window.runBenchmark = () => {
        const ITERATIONS = 1000000;

        const startUncached = performance.now();
        for(let i = 0; i < ITERATIONS; i++) {
          closeInfoUncached();
        }
        const endUncached = performance.now();

        const startCached = performance.now();
        for(let i = 0; i < ITERATIONS; i++) {
          closeInfoCached();
        }
        const endCached = performance.now();

        return {
          uncached: endUncached - startUncached,
          cached: endCached - startCached
        };
      };
    </script>
    </body>
    </html>
  `);

  const results = await page.evaluate(() => window.runBenchmark());
  console.log('Uncached duration (ms):', results.uncached);
  console.log('Cached duration (ms):', results.cached);

  await browser.close();
})();
