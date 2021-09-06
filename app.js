const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const { errors } = require("celebrate");
const allRoutes = require("./routes/index");
const handlingErrors = require("./app-handling-errors");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const { PORT = 3000 } = process.env;
const { NODE_ENV, DATA_BASE } = process.env;

// создаем приложение
const app = express();
app.use(express.json());

// подключаемся к серверу mongo
mongoose.connect(
  NODE_ENV === "production"
    ? DATA_BASE
    : "mongodb://localhost:27017/bitfilmsdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }
);

app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: "Вы превысили лимит в 100 запросов за 10 минут!",
  })
);

app.use(helmet());

app.use(requestLogger);

app.get("/crash-test", () => {
  setTimeout(() => {
    throw new Error("Сервер сейчас упадёт");
  }, 0);
});

app.use("/", allRoutes);

app.use(errorLogger);

app.use(errors());

app.use(handlingErrors);

app.listen(PORT);
