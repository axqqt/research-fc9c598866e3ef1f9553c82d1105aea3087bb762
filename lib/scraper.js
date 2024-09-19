import fetch from "node-fetch";
import * as cheerio from "cheerio";

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

function parseCookies(setCookieHeader) {
  return setCookieHeader.split(",").reduce((cookies, cookie) => {
    const [cookiePair] = cookie.split(";");
    const [key, value] = cookiePair.split("=");
    cookies[key.trim()] = value;
    return cookies;
  }, {});
}

function stringifyCookies(cookieObj) {
  return Object.entries(cookieObj)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

async function fetchWithRedirects(url, maxRedirects = 20) {
  let response;
  let currentUrl = url;
  let redirectCount = 0;
  let cookieJar = {};
  const redirectChain = [url];

  while (redirectCount < maxRedirects) {
    // console.log(
    //   `Fetching URL (${redirectCount + 1}/${maxRedirects}):`,
    //   currentUrl
    // );

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      Referer:
        redirectCount > 0
          ? redirectChain[redirectCount - 1]
          : "https://www.aliexpress.us/",
      Cookie: stringifyCookies(cookieJar),
    };

    // console.log("Request headers:", headers);

    response = await fetch(currentUrl, {
      headers: headers,
      redirect: "manual",
    });

    // console.log(`Response status:`, response.status);
    // console.log("Response headers:", response.headers.raw());

    // Update cookies
    const newCookies = response.headers.raw()["set-cookie"];
    if (newCookies) {
      const parsedCookies = parseCookies(newCookies.join(","));
      cookieJar = { ...cookieJar, ...parsedCookies };
      // console.log("Updated cookie jar:", cookieJar);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      currentUrl = new URL(location, currentUrl).toString();
      redirectCount++;
      redirectChain.push(currentUrl);

      // console.log(`Redirecting to:`, currentUrl);
    } else {
      break;
    }
  }

  if (redirectCount === maxRedirects) {
    console.error(`Maximum redirect count (${maxRedirects}) reached`);
    console.error(`Redirect chain:`, redirectChain);
    throw new Error(`Maximum redirect count (${maxRedirects}) reached`);
  }

  if (response.status === 400) {
    console.error("Received 400 Bad Request");
    console.error("Final URL:", currentUrl);
    console.error("Response headers:", response.headers.raw());
    const responseText = await response.text();
    console.error("Response body:", responseText);
  }

  return response;
}

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

export async function scrapeAliExpress(searchTerm) {
  const randomPage = Math.floor(Math.random() * 5) + 1;
  const formattedSearchTerm = searchTerm.replace(/\s+/g, "-");
  const randomUrl = `https://www.aliexpress.us/w/wholesale-${formattedSearchTerm}.html?page=${randomPage}&g=y&SearchText=${searchTerm}`;
  // console.log(`Initial URL:`, randomUrl);

  try {
    const response = await fetchWithRedirects(randomUrl);

    if (response.status !== 200) {
      console.error(`Unexpected status code: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const exchangeRates = await getExchangeRates();

    const allProducts = $(".search-item-card-wrapper-gallery").toArray();

    if (allProducts.length === 0) {
      console.warn(
        `No products found. This might indicate a change in the page structure or a successful anti-scraping measure.`
      );
      // console.log(`Page content:`, html.slice(0, 1000) + "..."); // Log the first 1000 characters of the page
      return [];
    }

    // Shuffle products
    for (let i = allProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
    }

    const randomProductCount = Math.floor(Math.random() * 11) + 10;
    const selectedProducts = allProducts.slice(0, randomProductCount);

    const products = selectedProducts.map((el) => {
      const $el = $(el);
      const priceText =
        $el.find(".multi--price-sale--U-S0jtj").text() || "No price available";
      const price = parsePrice(priceText);
      const currency = getCurrency(priceText);

      return {
        name:
          $el.find(".multi--titleText--nXeOvyr").text().trim() ||
          "No name available",
        price: price,
        currency: currency,
        image: $el.find(".images--item--3XZa6xf").attr("src")
          ? `https:${$el.find(".images--item--3XZa6xf").attr("src")}`
          : defaultImageUrl,
        url: `${$el.find("a").attr("href")}` || "No URL available",
      };
    });

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
  } catch (error) {
    console.error("Error scraping AliExpress:", error);
    return [];
  }
}
