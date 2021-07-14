module.exports = (err, req, res, next) => {
  const { status = 500, message } = err;
  res.status(status)
    .header('Content-Type', 'application/json')
    .send({
      message: status === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
};
