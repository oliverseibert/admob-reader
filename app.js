const { Cluster } = require('puppeteer-cluster');
// const { applyEvasions } = require('./applyEvasions');

const wait = ms => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 10,
    timeout: 60000,
    monitor: false,
    puppeteerOptions: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors'
        //'--proxy-server="direct://"',
        //'--proxy-bypass-list=*',
        //'--disable-dev-shm-usage'
        // '--dump-dom'
        // `--disable-extensions-except=${ext}`,
        // `--load-extension=${ext}`
      ]
    }
  });

  await cluster.task(async ({ page, data: url }) => {
    // await applyEvasions(page);
    // await page.setRequestInterception(true);
    /*page.on('request', request => {
      if (
        request.resourceType() === 'image' ||
        request.resourceType() === 'stylesheet' ||
        request.resourceType() === 'font'
      )
        request.abort();
      else request.continue();
    });*/

    try {
      await page.goto(url);
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log(`${url} opened`);
      await page.evaluate(() => {
        document.querySelector('input[type=email]').value = ''; // insert email of admob account
      });
      console.log(`inserted mail`);
      await wait(250);
      await page.keyboard.press('Enter');
      await wait(2000);
      await page.evaluate(() => {
        document.querySelector('input[type=password]').value = ''; // insert password of admob account
      });
      console.log(`inserted password`);
      await wait(250);
      await page.keyboard.press('Enter');
      // await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await wait(15000);
      console.log('page home loaded');
      const amountToday = await page.evaluate(() =>
        document
          .getElementsByClassName('scorecard')[0]
          .innerText.replace(/[^\d,]/g, '')
          .replace(',', '.')
      );
      const amountYesterday = await page.evaluate(() =>
        document
          .getElementsByClassName('scorecard')[1]
          .innerText.replace(/[^\d,]/g, '')
          .replace(',', '.')
      );
      const amountLastMonth = await page.evaluate(() =>
        document
          .getElementsByClassName('scorecard')[3]
          .innerText.replace(/[^\d,]/g, '')
          .replace(',', '.')
      );
      const amountCurrentMonth = await page.evaluate(() =>
        document
          .getElementsByClassName('scorecard')[2]
          .innerText.replace(/[^\d,]/g, '')
          .replace(',', '.')
      );
      console.log(`Yesterday: ${amountYesterday}`);
      console.log(`Today: ${amountToday}`);
      console.log(`Last Month: ${amountLastMonth}`);
      console.log(`Current Month: ${amountCurrentMonth}`);
    } catch (error) {
      console.log(error);
    }
  });

  await cluster.queue('https://apps.admob.com/v2/home');
  // many more pages

  await cluster.idle();
  await cluster.close();
})();
