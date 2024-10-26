/* eslint-disable @typescript-eslint/no-var-requires */
const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const {
  validateMovie,
  validatePartialMovie,
} = require("./schemas/schemaMoviesValidate.js");
const cors = require("cors");
const app = express();

app.use(express.json());
// https://youtu.be/-9d3KhCqOtU?si=E-uLZxXwKxTEUZjj&t=5481 => Explicacion de midu sobre los cors
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:1234",
      ];

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }
    },
  })
);
app.disable("x-powered-by"); // deshabilitar el header X-Powered-By: Express

/* app.get("/", (req, res) => {
  res.send({ msg: "/movies" });
}); */

// Todos los recursos que sean MOVIES se identifica con /movies
app.get("/movies", (req, res) => {
  const { genre } = req.query;

  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      // comparacion de los generos de las peliculas en miniscula
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }

  res.json(movies);
});

// https://expressjs.com/en/guide/routing.html
app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: "Movie not found" });
});

// TODO: POST
app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  // agregar base de datos
  const newMovies = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data,
  };

  movies.push(newMovies);

  res.status(201).json(newMovies);
});

// TODO PATCH
app.patch("/movies/:id", (req, res) => {
  const { id } = req.params;

  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ msg: "Not movie found" });
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

// TODO DELETE
app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;

  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ msg: "Movie not found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ msg: "Movie deleted" });
});

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
