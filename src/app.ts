import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import router from './app/routes/index.js';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler.js';
import { notFound } from './app/middlewares/notFound.js';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'GearUp API is running',
    data: null,
  });
});

app.use('/api', router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
