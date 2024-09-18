
import puppeteer from "puppeteer-core";



"use server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";

chromium.setGraphicsMode = false;
chromium.setHeadlessMode = true;

const defaultImageUrl = "/default-image.avif";


const CURRENCY_CONVERSION_API_URL =
  "https://api.exchangerate-api.com/v4/latest/USD";

async function getExchangeRates() {
  try {
    const response = await fetch(CURRENCY_CONVERSION_API_URL);
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
}

async function convertToUSD(price, fromCurrency, exchangeRates) {
  if (!exchangeRates) return price;
  const conversionRate = exchangeRates[fromCurrency];
  if (conversionRate) {
    return (price / conversionRate).toFixed(2);
  }
  return price;
}

export async function scrapeAliExpress(searchTerm) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v127.0.0/chromium-v127.0.0-pack.tar"
    ),
    headless: chromium.headless,
  });
  const page = await browser.newPage();

  const randomPage = Math.floor(Math.random() * 5) + 1;
  await page.goto(
    `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
      searchTerm
    )}&page=${randomPage}`
  );

  const exchangeRates = await getExchangeRates();

  const products = await page.evaluate(
    async (defaultImageUrl, exchangeRates) => {
      function parsePrice(priceText) {
        const priceMatch = priceText.match(/[\d.,]+/);
        if (priceMatch) {
          return parseFloat(priceMatch[0].replace(",", ""));
        }
        return null;
      }

      function getCurrency(priceText) {
        const currencyMatch = priceText.match(/[A-Z]{3}/);
        return currencyMatch ? currencyMatch[0] : "USD";
      }

      const allProducts = Array.from(
        document.querySelectorAll(".search-item-card-wrapper-gallery")
      );

      for (let i = allProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
      }

      const randomProductCount = Math.floor(Math.random() * 11) + 10;
      const selectedProducts = allProducts.slice(0, randomProductCount);

      return selectedProducts.map((el) => {
        const priceText =
          el.querySelector(".multi--price-sale--U-S0jtj")?.innerText ||
          "No price available";
        const price = parsePrice(priceText);
        const currency = getCurrency(priceText);

        return {
          name:
            el.querySelector(".multi--titleText--nXeOvyr")?.innerText ||
            "No name available",
          price: price,
          currency: currency,
          image:
            el.querySelector(".images--item--3XZa6xf")?.src || defaultImageUrl,
          url: el.querySelector("a")?.href || "No URL available",
        };
      });
    },
    defaultImageUrl,
    exchangeRates
  );

  await browser.close();

  // Convert prices to USD
  const productsInUSD = await Promise.all(
    products.map(async (product) => {
      if (product.price && product.currency) {
        const priceInUSD = await convertToUSD(
          product.price,
          product.currency,
          exchangeRates
        );
        return { ...product, price: priceInUSD, currency: "USD" };
      }
      return product;
    })
  );

  return productsInUSD;
}
