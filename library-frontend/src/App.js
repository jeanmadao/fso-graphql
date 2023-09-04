import { Route, Routes } from "react-router-dom";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Menu from "./components/Menu";
import NewBook from "./components/NewBook";

const App = () => {
  return (
    <div>
      <Menu />
      <Routes>
        <Route path="/" element={<Authors />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/add" element={<NewBook />} />
      </Routes>
    </div>
  );
};

export default App;
