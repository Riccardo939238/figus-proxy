
const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/product', async (req, res) => {
  const productUrl = req.query.url;
  if (!productUrl) return res.status(400).json({ error: 'Missing product URL' });

  try {
    const response = await fetch(productUrl);
    const html = await response.text();
    const $ = cheerio.load(html);

    const name = $('h1.product_title').text().trim();
    const image = $('.woocommerce-product-gallery__image img').attr('src');
    const price = $('.price').text().trim();
    const description = $('.woocommerce-Tabs-panel--description').text().trim();
    const availability = $('p.stock').text().trim();

    res.json({ name, image, price, description, availability });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante lo scraping', details: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
