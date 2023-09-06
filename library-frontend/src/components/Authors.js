import { useMutation, useQuery } from "@apollo/client";
import { useState } from "react";
import Select from "react-select";
import { ALL_AUTHORS, ALL_BOOKS, EDIT_AUTHOR } from "../queries";

const Authors = ({ token }) => {
  const [name, setName] = useState(null);
  const [setBornTo, setSetBornTo] = useState("");
  const result = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
  });

  if (result.loading) {
    return <div>loading...</div>;
  }

  const options = result.data.allAuthors.map((author) => {
    return { value: author.name, label: author.name };
  });

  const submit = async (event) => {
    event.preventDefault();

    editAuthor({ variables: { name, setBornTo } });

    setName("");
    setSetBornTo("");
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token && (
        <>
          <h3>Set birthyear</h3>

          <form onSubmit={submit}>
            <Select
              defaultValue={name}
              onChange={(event) => setName(event.value)}
              options={options}
            />
            <div>
              born
              <input
                type="number"
                value={setBornTo}
                onChange={({ target }) => setSetBornTo(Number(target.value))}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </>
      )}
    </div>
  );
};

export default Authors;
