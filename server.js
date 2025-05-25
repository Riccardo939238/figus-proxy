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
    // Fetch con forzatura cookie per mostrare i prezzi in €
    const response = await fetch(productUrl, {
      headers: {
        'cookie': 'woocommerce_multicurrency_forced_country=IT'
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Estrae i dati principali
    const name = $('h1.product_title').text().trim();
    const image = $('.woocommerce-product-gallery__image img').attr('src');
    const price = $('span.wcpbc-price span.woocommerce-Price-amount bdi').first().text().trim();

    // Estrae descrizione migliorata
    let description = $('.woocommerce-Tabs-panel--description').text().trim();
    if (!description) {
      description = $('.woocommerce-product-details__short-description').text().trim();
    }

    // Estrae disponibilità
    const availability = $('p.stock').text().trim();

    res.json({ name, image, price, description, availability });
  } catch (err) {
    res.status(500).json({ error: 'Errore durante lo scraping', details: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
