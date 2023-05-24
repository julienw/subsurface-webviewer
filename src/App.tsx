import { useState } from "react";
import { useSelector } from "react-redux";
import { Login } from "./Login";
import { getLogin } from "./store/loginSlice";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const login = useSelector(getLogin);

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <Login />
      <div className="card">
        {login ? <>Hello {login}!</> : null}
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
