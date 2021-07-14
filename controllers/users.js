const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const ConflictError = require('../errors/conflict-error');
const AutorizeError = require('../errors/authorize-error');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUserById = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      if (user) {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    email, password, name,
  } = req.body;

  // хешируем пароль
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((user) => res.status(200).send({
      user: {
        email: user.email,
        name: user.name,
        _id: user._id,
      },
    }))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        const error = new ConflictError(
          'Пользователь с указанным email уже существует',
        );
        error.statusCode = 409;
        next(error);
      }
    })
    .catch(next);
};

module.exports.updateUser = (req, res, next) => {
  const { email, name, owner = req.user._id } = req.body;
  User.findByIdAndUpdate(owner, { email, name },
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => new NotFoundError('Пользователь не найден'))
    .then((user) => {
      if (user) {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
        expiresIn: '7d',
      });
      req.headers.authorization = `Bearer ${token}`;
      return res.send({ token });
    })
    .catch(() => {
      throw new AutorizeError('Неправильная почта или пароль');
    })
    .catch(next);
};
