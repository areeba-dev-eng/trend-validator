'use strict';

const {
  Router,
} = require('express');

const asyncHandler =
  require('../utils/asyncHandler');

const {
  BadRequestError,
} = require('../utils/errors');

const auth =
  require('../middleware/auth').default

const liveTrendsService =
  require('../services/liveTrends.service');

const competitorsService =
  require('../services/competitors.service');

const trendService =
  require('../services/trend.service');

const reddit =
  require('../services/sources/reddit');

const youtube =
  require('../services/sources/youtube');

const producthunt =
  require('../services/sources/producthunt');

const router =
  Router();

/* ---------------- LIVE TRENDS ---------------- */

router.get(
  '/live',

  asyncHandler(
    async (req, res) => {
      const limit =
        Math.max(
          1,
          Math.min(
            10,
            Number(
              req.query.limit
            ) || 4
          )
        );

      const data =
        await liveTrendsService.getLiveTrendsForHome(
          {
            limit,
          }
        );

      res.json({
        success: true,

        generatedAt:
          new Date().toISOString(),

        count:
          data?.items
            ?.length || 0,

        items:
          data?.items ||
          [],
      });
    }
  )
);

/* ---------------- COMPETITORS ---------------- */

router.get(
  '/competitors',

  auth,

  asyncHandler(
    async (req, res) => {
      const q =
        String(
          req.query.q || ''
        ).trim();

      if (!q) {
        throw new BadRequestError(
          'q is required'
        );
      }

      const items =
        await competitorsService.findCompetitors(
          q
        );

      res.json({
        success: true,

        query: q,

        count:
          items.length,

        items,
      });
    }
  )
);

/* ---------------- RAW SOURCES ---------------- */

router.get(
  '/sources',

  auth,

  asyncHandler(
    async (req, res) => {
      const q =
        String(
          req.query.q || ''
        ).trim();

      if (!q) {
        throw new BadRequestError(
          'q is required'
        );
      }

      const [
        trends,
        redditData,
        youtubeData,
        ph,
      ] =
        await Promise.all([
          trendService.fetchTrendData(
            q
          ),

          reddit.fetchRedditSignal(
            q
          ),

          youtube.fetchYouTubeSignal(
            q
          ),

          producthunt.fetchProductHuntSignal(
            q
          ),
        ]);

      res.json({
        success: true,

        query: q,

        generatedAt:
          new Date().toISOString(),

        googleTrends: {
          stats:
            trends.stats,

          series:
            trends.series,

          related:
            trends.related,
        },

        reddit: {
          postCount:
            redditData.postCount,

          totalUpvotes:
            redditData.totalUpvotes,

          totalComments:
            redditData.totalComments,

          engagementScore:
            redditData.engagementScore,

          topSubreddits:
            redditData.topSubreddits,

          topPosts:
            redditData.topPosts,
        },

        youtube: {
          configured:
            youtubeData.configured,

          videoCount:
            youtubeData.videoCount,

          totalViews:
            youtubeData.totalViews,

          velocityScore:
            youtubeData.velocityScore,

          topVideos:
            youtubeData.topVideos,
        },

        productHunt: {
          productCount:
            ph.productCount,

          topProducts:
            ph.topProducts,
        },
      });
    }
  )
);

module.exports = router;