import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import destinationRoutes from './routes/destinations.routes.js';
import tripRoutes from './routes/trips.routes.js';
import chatRoutes from './routes/chat.routes.js';
import { configuredModel, isHuggingFaceConfigured } from './services/llm.service.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, llmConfigured: isHuggingFaceConfigured(), model: configuredModel() }));
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);

// Format error yang dibaca frontend: { code, message }
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ code: err.code || 'SERVER_ERROR', message: err.expose ? err.message : 'Terjadi kesalahan di server.' });
});

export default app;
