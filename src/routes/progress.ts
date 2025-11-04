import { Hono } from 'hono';
import type { Bindings, Variables, UserProgress } from '../types';

const progress = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get user's overall progress
progress.get('/', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const progressData = await c.env.DB.prepare(
      `SELECT up.*, ts.title as step_title, td.title as day_title
       FROM user_progress up
       JOIN training_steps ts ON up.step_id = ts.id
       JOIN training_days td ON up.day_id = td.id
       WHERE up.user_id = ?
       ORDER BY td.order_num, ts.step_number`
    )
      .bind(user.id)
      .all();

    return c.json({ progress: progressData.results || [] });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return c.json({ error: 'Failed to fetch progress' }, 500);
  }
});

// Get progress for specific day
progress.get('/day/:dayId', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const dayId = parseInt(c.req.param('dayId'));

    const progressData = await c.env.DB.prepare(
      `SELECT up.*, ts.title as step_title
       FROM user_progress up
       JOIN training_steps ts ON up.step_id = ts.id
       WHERE up.user_id = ? AND up.day_id = ?
       ORDER BY ts.step_number`
    )
      .bind(user.id, dayId)
      .all();

    return c.json({ progress: progressData.results || [] });
  } catch (error) {
    console.error('Error fetching day progress:', error);
    return c.json({ error: 'Failed to fetch day progress' }, 500);
  }
});

// Update progress for a step
progress.post('/step/:stepId', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const stepId = parseInt(c.req.param('stepId'));
    const { status, day_id } = await c.req.json();

    if (!status || !day_id) {
      return c.json({ error: 'Status and day_id are required' }, 400);
    }

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    // Check if progress exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM user_progress WHERE user_id = ? AND step_id = ?'
    )
      .bind(user.id, stepId)
      .first();

    let result;
    if (existing) {
      // Update existing progress
      const updates = ['status = ?', 'last_updated = CURRENT_TIMESTAMP'];
      const params = [status];

      if (status === 'in_progress') {
        updates.push('started_at = COALESCE(started_at, CURRENT_TIMESTAMP)');
      } else if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      }

      params.push(user.id, stepId);

      result = await c.env.DB.prepare(
        `UPDATE user_progress SET ${updates.join(', ')} WHERE user_id = ? AND step_id = ? RETURNING *`
      )
        .bind(...params)
        .first<UserProgress>();
    } else {
      // Create new progress entry
      const started_at = status === 'in_progress' ? 'CURRENT_TIMESTAMP' : 'NULL';
      const completed_at = status === 'completed' ? 'CURRENT_TIMESTAMP' : 'NULL';

      result = await c.env.DB.prepare(
        `INSERT INTO user_progress (user_id, day_id, step_id, status, started_at, completed_at)
         VALUES (?, ?, ?, ?, ${started_at}, ${completed_at})
         RETURNING *`
      )
        .bind(user.id, day_id, stepId, status)
        .first<UserProgress>();
    }

    return c.json({ progress: result });
  } catch (error) {
    console.error('Error updating progress:', error);
    return c.json({ error: 'Failed to update progress' }, 500);
  }
});

export default progress;
