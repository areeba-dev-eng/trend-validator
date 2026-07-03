'use strict';

const axios = require('axios');
const env = require('../../config/env');

async function fetchGoogleTrendsSignal(query) {
  try {
    const { data } = await axios.get(
      'https://serpapi.com/search.json',
      {
        params: {
          engine: 'google_trends',
          q: query,
          api_key: env.SERPAPI_KEY,
        },
        timeout: 15000,
      }
    );

    return data;
  } catch (error) {
    console.log(
      'GOOGLE TRENDS ERROR:',
      error.response?.data || error.message
    );

    return {
      query,
      interest_over_time: [],
      related_queries: [],
      status: 'failed',
    };
  }
}

module.exports = {
  fetchGoogleTrendsSignal,
};