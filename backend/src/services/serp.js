const axios = require('axios');

async function getRelatedQueries(query) {
 const res = await axios.get('https://serpapi.com/search.json', {
  timeout: 30000,

  params: {
    engine: 'google_trends',
    q: query,
    api_key: process.env.SERP_API_KEY,
  },
});
  return res.data.related_queries?.rising || [];
}

module.exports = { getRelatedQueries };