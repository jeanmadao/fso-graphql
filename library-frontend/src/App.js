import { Route, Routes, useNavigate } from "react-router-dom";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Menu from "./components/Menu";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import { useState } from "react";
import { useSubscription, useApolloClient } from "@apollo/client";
import { ALL_BOOKS, BOOK_ADDED } from "./queries";

const App = () => {
  const [token, setToken] = useState(null);
  const client = useApolloClient();
  const navigate = useNavigate();

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded;
      window.alert(`${addedBook.title} has been added`);

      const genres = addedBook.genres;
      genres.forEach((genre) => {
        client.cache.updateQuery(
          { query: ALL_BOOKS, variables: { genre } },
          ({ allBooks }) => {
            return {
              allBooks: allBooks.concat(addedBook),
            };
          }
        );
      });
      client.cache.updateQuery(
        { query: ALL_BOOKS, variables: { genre: null } },
        ({ allBooks }) => {
          return {
            allBooks: allBooks.concat(addedBook),
          };
        }
      );
    },
  });

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    navigate("/");
  };

  return (
    <div>
      <Menu logout={logout} token={token} />
      <Routes>
        <Route path="/" element={<Authors token={token} />} />
        <Route path="/books" element={<Books recommended={false} />} />
        <Route path="/books/add" element={<NewBook />} />
        <Route
          path="/books/recommended"
          element={<Books recommended={true} />}
        />
        <Route path="/login" element={<Login setToken={setToken} />} />
      </Routes>
    </div>
  );
};

export default App;
