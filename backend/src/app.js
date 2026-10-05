import cors from 'cors';
import express from 'express';
import { rotaNaoEncontrada, tratarErros } from './middlewares/erro.middleware.js';
import { rotas } from './routes/index.js';

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', rotas);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
