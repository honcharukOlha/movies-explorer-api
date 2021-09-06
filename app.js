const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { errors } = require('celebrate');
const allRoutes = require('./routes/index');
const handlingErrors = require('./app-handling-errors');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000 } = process.env;
const { NODE_ENV, DATA_BASE } = process.env;

const options = {
  origin: [
    'http://localhost:3001',
    'https://super-movies-fro.nomoredomains.club',
    '*',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization', 'Accept'],
  credentials: true,
};

// создаем приложение
const app = express();
app.use(express.json());

app.use('*', cors(options));

// подключаемся к серверу mongo
mongoose.connect(
  NODE_ENV === 'production'
    ? DATA_BASE
    : 'mongodb://localhost:27017/bitfilmsdb',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
);

app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Вы превысили лимит в 100 запросов за 10 минут!',
  }),
);

app.use(helmet());

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.use('/', allRoutes);

app.use(errorLogger);

app.use(errors());

app.use(handlingErrors);

app.listen(PORT);
