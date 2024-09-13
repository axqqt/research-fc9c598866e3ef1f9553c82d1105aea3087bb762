import puppeteer from 'puppeteer';

const defaultImageUrl = "/default-image.avif"

const CURRENCY_CONVERSION_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

async function convertToUSD(price, fromCurrency) {
  try {
    const response = await fetch(CURRENCY_CONVERSION_API_URL);
    const data = await response.json();
    const rates = data.rates;
    const conversionRate = rates[fromCurrency];
    if (conversionRate) {
      return (price / conversionRate).toFixed(2);
    }
  } catch (error) {
    console.error('Currency conversion error:', error);
  }
  return price;
}

export async function scrapeAliExpress(searchTerm) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Randomize the page number to get different results each time
  const randomPage = Math.floor(Math.random() * 5) + 1; // Random page between 1 and 5
  await page.goto(`https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(searchTerm)}&page=${randomPage}`);

  const products = await page.evaluate(async (defaultImageUrl) => {
    const currency = 'USD';
    const exchangeRates = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(response => response.json())
      .then(data => data.rates);
    
    function parsePrice(priceText) {
      const priceMatch = priceText.match(/[\d.,]+/);
      if (priceMatch) {
        return parseFloat(priceMatch[0].replace(',', ''));
      }
      return null;
    }

    async function convertToUSD(price, fromCurrency) {
      const conversionRate = exchangeRates[fromCurrency];
      if (conversionRate) {
        return (price / conversionRate).toFixed(2);
      }
      return price;
    }

    const allProducts = Array.from(document.querySelectorAll('.search-item-card-wrapper-gallery'));
    
    // Shuffle the array of products
    for (let i = allProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
    }

    // Select a random number of products (between 10 and 20)
    const randomProductCount = Math.floor(Math.random() * 11) + 10;
    const selectedProducts = allProducts.slice(0, randomProductCount);

    return Promise.all(selectedProducts.map(async el => {
      const priceText = el.querySelector('.multi--price-sale--U-S0jtj')?.innerText || 'No price available';
      const localCurrency = 'CNY';
      const price = parsePrice(priceText);
      const priceInUSD = price ? await convertToUSD(price, localCurrency) : 'No price available';

      return {
        name: el.querySelector('.multi--titleText--nXeOvyr')?.innerText || 'No name available',
        price: priceInUSD,
        image: el.querySelector('.images--item--3XZa6xf')?.src || defaultImageUrl,
        url: el.querySelector('a')?.href || 'No URL available',
      };
    }));
  }, defaultImageUrl);

  await browser.close();
  
  return products;
}