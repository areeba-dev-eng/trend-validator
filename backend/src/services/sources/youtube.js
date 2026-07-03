'use strict';

const axios = require('axios');
const env = require('../../config/env');
const logger = require('../../config/logger');
const TTLCache = require('../../utils/cache');

const cache = new TTLCache({ max: 200 });

function calculateVelocity(videos) {
  if (!videos.length) {
    return {
      velocityScore: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };
  }

  const totalViews = videos.reduce(
    (sum, video) => sum + video.views,
    0
  );

  const totalLikes = videos.reduce(
    (sum, video) => sum + video.likes,
    0
  );

  const totalComments = videos.reduce(
    (sum, video) => sum + video.comments,
    0
  );

  const avgViews =
    totalViews / videos.length;

  const recentVideos = videos.filter((video) => {
    const published =
      new Date(video.publishedAt).getTime();

    const days =
      (Date.now() - published) /
      (1000 * 60 * 60 * 24);

    return days <= 14;
  });

  const recentViews = recentVideos.reduce(
    (sum, video) => sum + video.views,
    0
  );

  const recentLikes = recentVideos.reduce(
    (sum, video) => sum + video.likes,
    0
  );

  const recentComments = recentVideos.reduce(
    (sum, video) => sum + video.comments,
    0
  );

  const recencyBoost =
    avgViews > 0
      ? recentViews / avgViews
      : 0;

  const rawVelocity =
    (recencyBoost * 25) +
    (recentLikes * 0.002) +
    (recentComments * 0.004) +
    (videos.length * 2);

  const velocityScore = Math.min(
    100,
    Math.round(rawVelocity)
  );

  return {
    velocityScore,
    totalViews,
    totalLikes,
    totalComments,
  };
}

async function fetchYouTubeSignal(query) {


  console.log('====================');
  console.log('YOUTUBE FUNCTION HIT');
  console.log('QUERY:', query);
  console.log('KEY EXISTS:', !!env.YOUTUBE_API_KEY);
  console.log('====================');

  if (!env.YOUTUBE_API_KEY) {
    return {
      source: 'youtube',
      query,
      configured: false,

      videoCount: 0,

      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,

      velocityScore: 0,

      topVideos: [],
    };
  }

  return cache.wrap(`youtube:${query}`, async () => {
    try {
      const search = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: env.YOUTUBE_API_KEY,
            q: query,

            part: 'snippet',
            type: 'video',

            maxResults: 20,
            order: 'relevance',

            publishedAfter:
              new Date(
                Date.now() -
                90 * 24 * 60 * 60 * 1000
              ).toISOString(),
          },

          timeout: env.YOUTUBE_TIMEOUT_MS,
        }
      );

      const items =
        search.data?.items || [];
        console.log('YOUTUBE SEARCH RESULTS:', items.length);

      const videoIds = items
        .map((it) => it.id?.videoId)
        .filter(Boolean);
        console.log('YOUTUBE VIDEO IDS:', videoIds.length);

      if (!videoIds.length) {
        return {
          source: 'youtube',
          query,
          configured: true,

          videoCount: 0,

          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,

          velocityScore: 0,

          topVideos: [],
        };
      }

      const stats = await axios.get(
        'https://www.googleapis.com/youtube/v3/videos',
        {
          params: {
            key: env.YOUTUBE_API_KEY,
            id: videoIds.join(','),

            part: 'statistics,snippet',
          },

          timeout: env.YOUTUBE_TIMEOUT_MS,
        }
      );

      const videos =
        (stats.data?.items || []).map((video) => ({
          title: video.snippet?.title || '',

          channel:
            video.snippet?.channelTitle || '',

          url:
            `https://www.youtube.com/watch?v=${video.id}`,

          views: Number(
            video.statistics?.viewCount || 0
          ),

          likes: Number(
            video.statistics?.likeCount || 0
          ),

          comments: Number(
            video.statistics?.commentCount || 0
          ),

          publishedAt:
            video.snippet?.publishedAt,
        }));

      videos.sort(
        (a, b) => b.views - a.views
      );

      const {
        velocityScore,
        totalViews,
        totalLikes,
        totalComments,
      } = calculateVelocity(videos);

      return {
        source: 'youtube',
        query,
        configured: true,

        videoCount: videos.length,

        totalViews,
        totalLikes,
        totalComments,

        velocityScore,

        topVideos: videos.slice(0, 5),
      };
    } catch (err) {

  console.log('====================');
  console.log('YOUTUBE ERROR');
  console.log('MESSAGE:', err.message);

  if (err.response) {
    console.log('STATUS:', err.response.status);
    console.log(
      'DATA:',
      JSON.stringify(err.response.data, null, 2)
    );
  }

  console.log('====================');

  logger.warn(
    { err: err.message, query },
    'YouTube fetch failed'
  );

  return {
    source: 'youtube',
    query,
    error: err.message,
    configured: true,

    videoCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,

    velocityScore: 0,

    topVideos: [],
  };
}
  }, env.CACHE_TRENDS_TTL_MS);
}

module.exports = {
  fetchYouTubeSignal,
};