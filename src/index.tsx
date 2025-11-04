import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/cloudflare-workers';
import type { Bindings, Variables } from './types';
import { authMiddleware } from './middleware/auth';
import auth from './routes/auth';
import training from './routes/training';
import progress from './routes/progress';
import responses from './routes/responses';
import processes from './routes/processes';

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Enable CORS for API routes
app.use('/api/*', cors());

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }));

// Public routes
app.route('/api/auth', auth);

// Protected routes (require authentication)
app.use('/api/training/*', authMiddleware);
app.use('/api/progress/*', authMiddleware);
app.use('/api/responses/*', authMiddleware);
app.use('/api/processes/*', authMiddleware);
app.use('/api/auth/me', authMiddleware);

app.route('/api/training', training);
app.route('/api/progress', progress);
app.route('/api/responses', responses);
app.route('/api/processes', processes);

// Main HTML page
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catalyst Tanulási Napló</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
            animation: slideIn 0.5s ease-out;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .step-card {
            transition: all 0.3s ease;
        }
        .step-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body class="bg-gray-50">
    <div id="app"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/tools-data.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>
  `);
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
