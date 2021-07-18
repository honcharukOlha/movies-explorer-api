const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const auth = require('../middlewares/auth');
const { login, createUser } = require('../controllers/users');
const NotFoundError = require('../errors/not-found-error');

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
      name: Joi.string().required().min(2).max(30),
    }),
  }),
  createUser,
);

router.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required().min(8),
    }),
  }),
  login,
);

router.use('/users', auth, usersRouter);
router.use('/movies', auth, moviesRouter);
router.use('/*', (req, res, next) => {
  next(
    new NotFoundError(
      'Ресурс не найден',
    ),
  );
});

module.exports = router;
