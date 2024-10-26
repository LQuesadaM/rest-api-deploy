const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().positive(),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).optional().default(4.4),
  poster: z.string().url({ msg: "Poster must be a valid URL" }),
  genre: z
    .array(
      z.enum([
        "Action",
        "Adventure",
        "Comedy",
        "Crime",
        "Drama",
        "Fantasy",
        "Horror",
        "Thriller",
        "Sci-Fi",
        "Dystopian",
      ])
    )
    .nonempty("At least one genre is required"),
});

function validateMovie(input) {
  return movieSchema.safeParse(input);
}

// partial hace que todas las propiedades del movieSchema sean opcionales
// Tener en cuenta q es opcional solo para actualizar
function validatePartialMovie(input) {
  return movieSchema.partial().safeParse(input);
}

module.exports = {
  validateMovie,
  validatePartialMovie,
};
