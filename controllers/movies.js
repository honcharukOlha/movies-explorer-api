const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getMovies = (req, res, next) => {
  const owner = req.user._id;

  Movie.find({ owner })
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.createMovies = (req, res, next) => {
  const {
    country, director, duration, year, description,
    image, trailer, thumbnail, nameRU, nameEN, movieId, owner = req.user._id,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner,
  })
    .then((movie) => res.status(200).send({
      _id: movie._id,
      country: movie.country,
      director: movie.director,
      duration: movie.duration,
      year: movie.year,
      description: movie.description,
      image: movie.image,
      trailer: movie.trailer,
      thumbnail: movie.thumbnail,
      movieId: movie.movieId,
      nameRU: movie.nameRU,
      nameEN: movie.nameEN,
    }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovies = (req, res, next) => {
  const owner = req.user._id;
  const SUCCESS = 200;
  Card.findById(req.params.movieId)
    .orFail(() => new NotFoundError('Видео не найдено'))
    .then((movie) => {
      if (movie.owner.toString() !== owner) {
        throw new ForbiddenError(
          'Удаление видео других пользователей невозможно',
        );
      }
      Card.findByIdAndDelete(req.params.cardId).then(() => {
        res.status(SUCCESS).send({ success: 'Видео успешно удалено' });
      });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
