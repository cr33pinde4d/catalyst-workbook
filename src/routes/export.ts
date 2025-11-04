import { Hono } from 'hono';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// GET /api/export/process/:id - Export process data for PDF generation
app.get('/process/:id', async (c) => {
  const db = c.env.DB;
  const userId = c.get('userId');
  const processId = c.req.param('id');

  try {
    // Verify ownership
    const process = await db.prepare(`
      SELECT * FROM processes WHERE id = ? AND user_id = ?
    `).bind(processId, userId).first();

    if (!process) {
      return c.json({ error: 'Process not found' }, 404);
    }

    // Get all training days
    const daysResult = await db.prepare(`
      SELECT * FROM training_days ORDER BY day_number
    `).all();

    // Get all training steps
    const stepsResult = await db.prepare(`
      SELECT * FROM training_steps ORDER BY day_id, step_number
    `).all();

    // Get all process responses
    const responsesResult = await db.prepare(`
      SELECT * FROM process_responses
      WHERE process_id = ?
      ORDER BY day_id, step_id
    `).bind(processId).all();

    // Organize data by day and step
    const exportData = {
      process,
      days: daysResult.results.map((day: any) => {
        const daySteps = stepsResult.results.filter((s: any) => s.day_id === day.id);
        
        return {
          ...day,
          steps: daySteps.map((step: any) => {
            const stepResponses = responsesResult.results.filter(
              (r: any) => r.day_id === day.id && r.step_id === step.id
            );
            
            // Convert responses array to object
            const responsesObj: any = {};
            stepResponses.forEach((r: any) => {
              responsesObj[r.field_name] = r.response_text;
            });
            
            return {
              ...step,
              responses: responsesObj
            };
          })
        };
      })
    };

    return c.json(exportData);
  } catch (error: any) {
    console.error('Error exporting process:', error);
    return c.json({ error: 'Failed to export process' }, 500);
  }
});

export default app;
