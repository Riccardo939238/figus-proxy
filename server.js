
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

    // Prende solo il primo prezzo valido
const price = $('span.wcpbc-price span.woocommerce-Price-amount bdi').first().text().trim();





    // Migliora la descrizione: evita vuoti, controlla presenza in tab attivi o fallback
    let description = $('.woocommerce-Tabs-panel--description').text().trim();
    if (!description) {
      description = $('.woocommerce-product-details__short-description').text().trim();
    }

    // Prende solo la disponibilità visibile
    const availability = $('p.stock').text().trim();

    res.json({ name, image, price, description, availability });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante lo scraping', details: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
