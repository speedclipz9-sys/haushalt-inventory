const http = require('http');

const PORT = 8787;
const SEARCH_FIELDS = 'product_name,product_name_de,generic_name,generic_name_de,brands,quantity,code,image_front_small_url,image_front_thumb_url,nutriments,nutrition_data_per,serving_size';

const server = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  const requestUrl = new URL(request.url, `http://localhost:${PORT}`);
  if (requestUrl.pathname !== '/search' && requestUrl.pathname !== '/barcode') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const query = requestUrl.searchParams.get('q')?.trim();
  if (!query) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Missing search query' }));
    return;
  }

  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: '8',
    lc: 'de',
    fields: SEARCH_FIELDS,
  });

  try {
    const upstreamUrl = requestUrl.pathname === '/barcode'
      ? `https://de.openfoodfacts.org/api/v2/product/${encodeURIComponent(query)}?fields=${SEARCH_FIELDS}`
      : `https://de.openfoodfacts.org/cgi/search.pl?${params}`;
    let upstream = await fetch(upstreamUrl, {
      headers: { 'User-Agent': 'HaushaltInventory/1.0' },
    });
    let body = await upstream.text();
    if (!upstream.ok && requestUrl.pathname === '/search') {
      const fallbackParams = new URLSearchParams({
        search_terms: query,
        page_size: '8',
        lc: 'de',
        fields: SEARCH_FIELDS,
      });
      upstream = await fetch(`https://de.openfoodfacts.org/api/v2/search?${fallbackParams}`, {
        headers: { 'User-Agent': 'HaushaltInventory/1.0' },
      });
      body = await upstream.text();
      if (!upstream.ok) {
        upstream = await fetch(`https://world.openfoodfacts.org/api/v2/search?${fallbackParams}`, {
          headers: { 'User-Agent': 'HaushaltInventory/1.0' },
        });
        body = await upstream.text();
      }
    }
    response.writeHead(upstream.status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(body);
  } catch (error) {
    response.writeHead(502, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'Open Food Facts is temporarily unavailable' }));
  }
});

server.listen(PORT, () => {
  console.log(`Open Food Facts proxy listening on http://localhost:${PORT}`);
});