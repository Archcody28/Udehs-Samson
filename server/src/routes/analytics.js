import express from 'express';
import Analytics from '../models/Analytics.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET analytics (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST record page view (public - tracking)
router.post('/page-view', async (req, res) => {
  try {
    let analytics = await Analytics.findOne();
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    const pageViews = analytics.pageViews;
    const lastIndex = pageViews.length - 1;
    if (pageViews[lastIndex]) {
      pageViews[lastIndex].views += 1;
    }
    await analytics.save();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record page view' });
  }
});

// POST record project view (public - tracking)
router.post('/project-view', async (req, res) => {
  try {
    const { projectId } = req.body;
    let analytics = await Analytics.findOne();
    if (!analytics) {
      return res.status(404).json({ error: 'Analytics not found' });
    }
    const projectView = analytics.projectViews.find(
      (pv) => pv.projectId === projectId
    );
    if (projectView) {
      projectView.views += 1;
    } else {
      analytics.projectViews.push({ projectId, views: 1 });
    }
    await analytics.save();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record project view' });
  }
});

export default router;