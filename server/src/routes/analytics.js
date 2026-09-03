import express from 'express';
import Analytics from '../models/Analytics.js';

const router = express.Router();

async function getOrCreateAnalytics() {
  let analytics = await Analytics.findOne();

  if (!analytics) {
    analytics = await Analytics.create({
      pageViews: [
        {
          date: new Date().toISOString().split('T')[0],
          views: 0,
        },
      ],
      projectViews: [],
    });
  }

  return analytics;
}

// GET analytics (public)
router.get('/', async (req, res) => {
  try {
    const analytics = await getOrCreateAnalytics();

    res.json(analytics);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST record page view (public - tracking)
router.post('/page-view', async (req, res) => {
  try {
    const analytics = await getOrCreateAnalytics();

    const today = new Date().toISOString().split('T')[0];

    const todayEntry = analytics.pageViews.find(
      (pageView) => pageView.date === today
    );

    if (todayEntry) {
      todayEntry.views += 1;
    } else {
      analytics.pageViews.push({
        date: today,
        views: 1,
      });
    }

    await analytics.save();

    res.json(analytics);
  } catch (error) {
    console.error('Failed to record page view:', error);
    res.status(500).json({ error: 'Failed to record page view' });
  }
});

// POST record project view (public - tracking)
router.post('/project-view', async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const analytics = await getOrCreateAnalytics();

    const projectView = analytics.projectViews.find(
      (pv) => pv.projectId === projectId
    );

    if (projectView) {
      projectView.views += 1;
    } else {
      analytics.projectViews.push({
        projectId,
        views: 1,
      });
    }

    await analytics.save();

    res.json(analytics);
  } catch (error) {
    console.error('Failed to record project view:', error);
    res.status(500).json({ error: 'Failed to record project view' });
  }
});

export default router;