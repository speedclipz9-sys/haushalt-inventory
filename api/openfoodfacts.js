const SEARCH_FIELDS = 'product_name,product_name_de,generic_name,generic_name_de,brands,quantity,code,image_front_small_url,image_front_thumb_url,nutriments,nutrition_data_per,serving_size';

module.exports = async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  const mode = request.query.mode || 'search';
  const value = (request.query.q || request.query.code || '').trim();
  if (!value) {
    response.status(400).json({ error: 'Missing search value' });
    return;
  }

  const headers = { 'User-Agent': 'HaushaltInventory/1.0' };
  let upstreamUrl;
  if (mode === 'barcode') {
    upstreamUrl = `https://de.openfoodfacts.org/api/v2/product/${encodeURIComponent(value)}?fields=${SEARCH_FIELDS}`;
  } else {
    const params = new URLSearchParams({
      search_terms: value,
      search_simple: '1',
      action: 'process',
      json: '1',
      page_size: '8',
      lc: 'de',
      fields: SEARCH_FIELDS,
    });
    upstreamUrl = `https://de.openfoodfacts.org/cgi/search.pl?${params}`;
  }

  try {
    let upstream = await fetch(upstreamUrl, { headers });
    let body = await upstream.text();

    if (!upstream.ok && mode !== 'barcode') {
      const fallbackParams = new URLSearchParams({
        search_terms: value,
        page_size: '8',
        lc: 'de',
        fields: SEARCH_FIELDS,
      });
      upstream = await fetch(`https://world.openfoodfacts.org/api/v2/search?${fallbackParams}`, { headers });
      body = await upstream.text();
    }

    response.status(upstream.status).setHeader('Content-Type', 'application/json; charset=utf-8').send(body);
  } catch (error) {
    response.status(502).json({ error: 'Open Food Facts is temporarily unavailable' });
  }
}
