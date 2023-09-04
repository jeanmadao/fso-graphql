import { Link } from "react-router-dom";

const Menu = () => {
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
      <Link style={linkStyle} to="/books/add">
        add book
      </Link>
    </div>
  );
};

export default Menu;
