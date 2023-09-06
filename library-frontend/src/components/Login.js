import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { LOGIN } from "../queries";

const Login = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, result] = useMutation(LOGIN);

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("library-user-token", token);
    }
  }, [result.data]); // eslint-disable-line

  const handleLogin = (event) => {
    event.preventDefault();

    login({
      variables: { username, password },
    });
  };

  return (
    <div>
      <h2>login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="login-username">username: </label>
          <input
            type="text"
            id="login-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="login-password">password: </label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button>login</button>
      </form>
    </div>
  );
};

export default Login;
