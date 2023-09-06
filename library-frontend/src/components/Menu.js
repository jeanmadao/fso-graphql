import { Link } from "react-router-dom";

const Menu = ({ logout, token }) => {
  const linkStyle = {
    paddingRight: "10px",
  };
  return (
    <div>
      <Link style={linkStyle} to="/">
        authors
      </Link>
      <Link style={linkStyle} to="/books">
        books
      </Link>
      {token && (
        <>
          <Link style={linkStyle} to="/books/add">
            add book
          </Link>
          <button onClick={logout}>logout</button>
        </>
      )}
      {!token && (
        <Link style={linkStyle} to="/login">
          login
        </Link>
      )}
    </div>
  );
};

export default Menu;
