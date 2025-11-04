import { Hono } from 'hono';
import type { Bindings, Variables, UserResponse } from '../types';

const responses = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Get all responses for a user
responses.get('/', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const userResponses = await c.env.DB.prepare(
      'SELECT * FROM user_responses WHERE user_id = ? ORDER BY day_id, step_id, field_name'
    )
      .bind(user.id)
      .all<UserResponse>();

    return c.json({ responses: userResponses.results || [] });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return c.json({ error: 'Failed to fetch responses' }, 500);
  }
});

// Get responses for specific day
responses.get('/day/:dayId', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const dayId = parseInt(c.req.param('dayId'));

    const userResponses = await c.env.DB.prepare(
      'SELECT * FROM user_responses WHERE user_id = ? AND day_id = ? ORDER BY step_id, field_name'
    )
      .bind(user.id, dayId)
      .all<UserResponse>();

    return c.json({ responses: userResponses.results || [] });
  } catch (error) {
    console.error('Error fetching day responses:', error);
    return c.json({ error: 'Failed to fetch day responses' }, 500);
  }
});

// Get responses for specific step
responses.get('/step/:stepId', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const stepId = parseInt(c.req.param('stepId'));

    const userResponses = await c.env.DB.prepare(
      'SELECT * FROM user_responses WHERE user_id = ? AND step_id = ? ORDER BY field_name'
    )
      .bind(user.id, stepId)
      .all<UserResponse>();

    return c.json({ responses: userResponses.results || [] });
  } catch (error) {
    console.error('Error fetching step responses:', error);
    return c.json({ error: 'Failed to fetch step responses' }, 500);
  }
});

// Save or update response
responses.post('/', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { day_id, step_id, field_name, field_value } = await c.req.json();

    if (!day_id || !step_id || !field_name || field_value === undefined) {
      return c.json({ error: 'day_id, step_id, field_name, and field_value are required' }, 400);
    }

    // Check if response exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM user_responses WHERE user_id = ? AND day_id = ? AND step_id = ? AND field_name = ?'
    )
      .bind(user.id, day_id, step_id, field_name)
      .first();

    let result;
    if (existing) {
      // Update existing response
      result = await c.env.DB.prepare(
        `UPDATE user_responses 
         SET field_value = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND day_id = ? AND step_id = ? AND field_name = ?
         RETURNING *`
      )
        .bind(field_value, user.id, day_id, step_id, field_name)
        .first<UserResponse>();
    } else {
      // Create new response
      result = await c.env.DB.prepare(
        `INSERT INTO user_responses (user_id, day_id, step_id, field_name, field_value)
         VALUES (?, ?, ?, ?, ?)
         RETURNING *`
      )
        .bind(user.id, day_id, step_id, field_name, field_value)
        .first<UserResponse>();
    }

    return c.json({ response: result });
  } catch (error) {
    console.error('Error saving response:', error);
    return c.json({ error: 'Failed to save response' }, 500);
  }
});

// Batch save responses
responses.post('/batch', async (c) => {
  try {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Unauthorized' }, 401);

    const { responses: responsesToSave } = await c.req.json();

    if (!Array.isArray(responsesToSave) || responsesToSave.length === 0) {
      return c.json({ error: 'responses array is required' }, 400);
    }

    const results = [];
    for (const resp of responsesToSave) {
      const { day_id, step_id, field_name, field_value } = resp;

      // Check if exists
      const existing = await c.env.DB.prepare(
        'SELECT id FROM user_responses WHERE user_id = ? AND day_id = ? AND step_id = ? AND field_name = ?'
      )
        .bind(user.id, day_id, step_id, field_name)
        .first();

      if (existing) {
        await c.env.DB.prepare(
          `UPDATE user_responses 
           SET field_value = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ? AND day_id = ? AND step_id = ? AND field_name = ?`
        )
          .bind(field_value, user.id, day_id, step_id, field_name)
          .run();
      } else {
        await c.env.DB.prepare(
          `INSERT INTO user_responses (user_id, day_id, step_id, field_name, field_value)
           VALUES (?, ?, ?, ?, ?)`
        )
          .bind(user.id, day_id, step_id, field_name, field_value)
          .run();
      }

      results.push({ day_id, step_id, field_name, saved: true });
    }

    return c.json({ results, count: results.length });
  } catch (error) {
    console.error('Error batch saving responses:', error);
    return c.json({ error: 'Failed to batch save responses' }, 500);
  }
});

export default responses;
