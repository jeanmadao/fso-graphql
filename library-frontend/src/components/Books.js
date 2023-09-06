import { useQuery } from "@apollo/client";
import { useState } from "react";
import { ALL_BOOKS } from "../queries";

const Books = () => {
  const [filter, setFilter] = useState(null);
  const result = useQuery(ALL_BOOKS);
  if (result.loading) {
    return <div>loading...</div>;
  }

  const books = filter
    ? result.data.allBooks.filter((book) => book.genres.includes(filter))
    : result.data.allBooks;
  const genres = [
    ...new Set(result.data.allBooks.map((book) => book.genres).flat()),
  ];

  return (
    <div>
      <h2>books</h2>

      <p>
        in genre <b>{filter ? filter : "all"}</b>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => (
        <button key={genre} onClick={() => setFilter(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => setFilter("")}>all genres</button>
    </div>
  );
};

export default Books;
