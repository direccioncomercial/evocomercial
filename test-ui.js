const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Load the local index.html file
  await page.goto(`file://${__dirname}/index.html`);

  // Check if infoModalContainer exists globally
  const containerType = await page.evaluate(() => typeof infoModalContainer);
  console.log(`infoModalContainer type: ${containerType}`);

  // Try opening info
  await page.evaluate(() => showInfo('Vehículos'));

  // Verify modal is visible
  let modalHtml = await page.evaluate(() => document.getElementById('info-modal').innerHTML);
  console.log('Modal inner HTML length after showInfo:', modalHtml.length);

  // Try closing info
  await page.evaluate(() => closeInfo());

  modalHtml = await page.evaluate(() => document.getElementById('info-modal').innerHTML);
  console.log('Modal inner HTML length after closeInfo:', modalHtml.length);

  await browser.close();
})();
