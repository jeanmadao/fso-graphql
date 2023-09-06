import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { ALL_BOOKS, ME } from "../queries";

const Books = ({ recommended }) => {
  const resultAllBooks = useQuery(ALL_BOOKS);
  const resultMe = useQuery(ME);
  const [filter, setFilter] = useState(null);
  useEffect(() => {
    if (recommended) {
      if (resultMe.data) {
        setFilter(resultMe.data.me.favoriteGenre);
      }
    } else {
      setFilter(null);
    }
  }, [resultMe.data, recommended]);
  if (resultAllBooks.loading || resultMe.loading) {
    return <div>loading...</div>;
  }

  const books = filter
    ? resultAllBooks.data.allBooks.filter((book) =>
        book.genres.includes(filter)
      )
    : resultAllBooks.data.allBooks;
  const genres = [
    ...new Set(resultAllBooks.data.allBooks.map((book) => book.genres).flat()),
  ];

  return (
    <div>
      <h2>{recommended ? "recommended" : "books"}</h2>
      <p>
        {recommended ? "books in your favorite" : "in"} genre{" "}
        <b>{filter ? filter : "all"}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th>title</th>
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
      {!recommended &&
        genres.map((genre) => (
          <button key={genre} onClick={() => setFilter(genre)}>
            {genre}
          </button>
        ))}
      {!recommended && (
        <button onClick={() => setFilter("")}>all genres</button>
      )}
    </div>
  );
};

export default Books;
