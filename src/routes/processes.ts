import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/processes - List all user's processes
app.get('/', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const result = await db.prepare(`
      SELECT 
        p.*,
        COALESCE(COUNT(DISTINCT ps.id), 0) as total_steps,
        COALESCE(SUM(CASE WHEN ps.completed = 1 THEN 1 ELSE 0 END), 0) as completed_steps
      FROM processes p
      LEFT JOIN process_steps ps ON p.id = ps.process_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `).bind(userId).all();

    const processes = result.results.map((p: any) => ({
      ...p,
      progress: p.total_steps > 0 ? Math.round((p.completed_steps / p.total_steps) * 100) : 0
    }));

    return c.json({ processes });
  } catch (error: any) {
    console.error('Error fetching processes:', error);
    return c.json({ error: 'Failed to fetch processes', details: error.message }, 500);
  }
});

// GET /api/processes/:id - Get single process details
app.get('/:id', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');

  try {
    // Get process details
    const processResult = await db.prepare(`
      SELECT * FROM processes 
      WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!processResult) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Get process step completion status
    const stepsResult = await db.prepare(`
      SELECT 
        ps.day_id,
        ps.step_id,
        ps.completed,
        ps.completed_at,
        td.order_num as day_number,
        td.title as day_title,
        ts.step_number,
        ts.title as step_title
      FROM process_steps ps
      JOIN training_days td ON ps.day_id = td.id
      JOIN training_steps ts ON ps.step_id = ts.id
      WHERE ps.process_id = ?
      ORDER BY td.order_num, ts.step_number
    `).bind(processId).all();

    return c.json({ 
      process: processResult,
      steps: stepsResult.results 
    });
  } catch (error: any) {
    console.error('Error fetching process:', error);
    return c.json({ error: 'Failed to fetch process' }, 500);
  }
});

// POST /api/processes - Create new process
app.post('/', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');

  try {
    const { title, description } = await c.req.json();

    if (!title) {
      return c.json({ error: 'Title is required' }, 400);
    }

    // Create process
    const result = await db.prepare(`
      INSERT INTO processes (user_id, title, description, status, current_day, current_step)
      VALUES (?, ?, ?, 'active', 1, 1)
      RETURNING id
    `).bind(userId, title, description || null).first();

    const processId = (result as any).id;

    // Initialize all process steps
    // First, get all training steps
    const stepsResult = await db.prepare(`
      SELECT id, day_id FROM training_steps ORDER BY day_id, step_number
    `).all();

    // Create process_steps entries for all steps
    const stepInserts = stepsResult.results.map((step: any) => 
      db.prepare(`
        INSERT INTO process_steps (process_id, day_id, step_id, completed)
        VALUES (?, ?, ?, 0)
      `).bind(processId, step.day_id, step.id)
    );

    await db.batch(stepInserts);

    return c.json({ 
      success: true, 
      processId,
      message: 'Process created successfully' 
    });
  } catch (error: any) {
    console.error('Error creating process:', error);
    return c.json({ error: 'Failed to create process' }, 500);
  }
});

// PUT /api/processes/:id - Update process
app.put('/:id', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');

  try {
    const { title, description, status, current_day, current_step } = await c.req.json();

    // Verify ownership
    const existing = await db.prepare(`
      SELECT id FROM processes WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!existing) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
      
      // Set completed_at if status is completed
      if (status === 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      }
    }
    if (current_day !== undefined) {
      updates.push('current_day = ?');
      values.push(current_day);
    }
    if (current_step !== undefined) {
      updates.push('current_step = ?');
      values.push(current_step);
    }

    if (updates.length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    values.push(processId);

    await db.prepare(`
      UPDATE processes 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...values).run();

    return c.json({ success: true, message: 'Process updated successfully' });
  } catch (error: any) {
    console.error('Error updating process:', error);
    return c.json({ error: 'Failed to update process' }, 500);
  }
});

// DELETE /api/processes/:id - Delete process
app.delete('/:id', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');

  try {
    // Verify ownership
    const existing = await db.prepare(`
      SELECT id FROM processes WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!existing) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Delete process (cascade will handle related records)
    await db.prepare(`
      DELETE FROM processes WHERE id = ?
    `).bind(processId).run();

    return c.json({ success: true, message: 'Process deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting process:', error);
    return c.json({ error: 'Failed to delete process' }, 500);
  }
});

// GET /api/processes/:id/responses - Get all responses for a process
app.get('/:id/responses', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');

  try {
    // Verify ownership
    const process = await db.prepare(`
      SELECT id FROM processes WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!process) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Get all responses
    const result = await db.prepare(`
      SELECT * FROM process_responses
      WHERE process_id = ?
      ORDER BY day_id, step_id, field_name
    `).bind(processId).all();

    return c.json({ responses: result.results });
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    return c.json({ error: 'Failed to fetch responses' }, 500);
  }
});

// POST /api/processes/:id/responses - Save/update responses
app.post('/:id/responses', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');

  try {
    const { responses } = await c.req.json();

    // Verify ownership
    const process = await db.prepare(`
      SELECT id FROM processes WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!process) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Upsert responses
    const upserts = Object.entries(responses).map(([key, value]) => {
      const [dayId, stepId, fieldName] = key.split('-');
      return db.prepare(`
        INSERT INTO process_responses (process_id, day_id, step_id, field_name, response_text)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(process_id, day_id, step_id, field_name) 
        DO UPDATE SET response_text = excluded.response_text, updated_at = CURRENT_TIMESTAMP
      `).bind(processId, dayId, stepId, fieldName, value as string);
    });

    await db.batch(upserts);

    return c.json({ success: true, message: 'Responses saved successfully' });
  } catch (error: any) {
    console.error('Error saving responses:', error);
    return c.json({ error: 'Failed to save responses' }, 500);
  }
});

// POST /api/processes/:id/steps/:stepId/complete - Mark step as completed
app.post('/:id/steps/:stepId/complete', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');
  const stepId = c.req.param('stepId');

  try {
    // Verify ownership
    const process = await db.prepare(`
      SELECT id FROM processes WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!process) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Mark step as completed
    await db.prepare(`
      UPDATE process_steps 
      SET completed = 1, completed_at = CURRENT_TIMESTAMP
      WHERE process_id = ? AND step_id = ?
    `).bind(processId, stepId).run();

    return c.json({ success: true, message: 'Step marked as completed' });
  } catch (error: any) {
    console.error('Error completing step:', error);
    return c.json({ error: 'Failed to complete step' }, 500);
  }
});

export default app;
