import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { GeminiError, type Env } from './gemini';
import { identifyRoute } from './routes/identify';
import { analyzeRoute } from './routes/analyze';
import { chatRoute } from './routes/chat';
import { sagaRoute } from './routes/saga';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 86400,
  }),
);

app.get('/health', (c) => {
  return c.json({
    ok: true,
    service: 'freyrs-eye-backend',
    app: c.env.APP_NAME,
    model: c.env.GEMINI_MODEL,
    hasApiKey: Boolean(c.env.GEMINI_API_KEY),
  });
});

app.route('/identify', identifyRoute);
app.route('/analyze', analyzeRoute);
app.route('/chat', chatRoute);
app.route('/saga', sagaRoute);

app.onError((err, c) => {
  if (err instanceof GeminiError) {
    return c.json({ error: err.message, detail: err.detail ?? null }, err.status as 400);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: err.message ?? 'Internal error' }, 500);
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
