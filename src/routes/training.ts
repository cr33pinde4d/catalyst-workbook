import { Hono } from 'hono';
import type { Bindings, Variables, TrainingDay, TrainingStep } from '../types';

const training = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all training days
training.get('/days', async (c) => {
  try {
    const days = await c.env.DB.prepare(
      'SELECT * FROM training_days ORDER BY order_num ASC'
    )
      .all<TrainingDay>();

    return c.json({ days: days.results || [] });
  } catch (error) {
    console.error('Error fetching training days:', error);
    return c.json({ error: 'Failed to fetch training days' }, 500);
  }
});

// Get specific training day with steps
training.get('/days/:dayId', async (c) => {
  try {
    const dayId = parseInt(c.req.param('dayId'));

    const day = await c.env.DB.prepare(
      'SELECT * FROM training_days WHERE id = ?'
    )
      .bind(dayId)
      .first<TrainingDay>();

    if (!day) {
      return c.json({ error: 'Training day not found' }, 404);
    }

    const steps = await c.env.DB.prepare(
      'SELECT * FROM training_steps WHERE day_id = ? ORDER BY step_number ASC'
    )
      .bind(dayId)
      .all<TrainingStep>();

    return c.json({
      day,
      steps: steps.results || []
    });
  } catch (error) {
    console.error('Error fetching training day:', error);
    return c.json({ error: 'Failed to fetch training day' }, 500);
  }
});

// Get specific step
training.get('/steps/:stepId', async (c) => {
  try {
    const stepId = parseInt(c.req.param('stepId'));

    const step = await c.env.DB.prepare(
      'SELECT * FROM training_steps WHERE id = ?'
    )
      .bind(stepId)
      .first<TrainingStep>();

    if (!step) {
      return c.json({ error: 'Step not found' }, 404);
    }

    return c.json({ step });
  } catch (error) {
    console.error('Error fetching step:', error);
    return c.json({ error: 'Failed to fetch step' }, 500);
  }
});

export default training;
