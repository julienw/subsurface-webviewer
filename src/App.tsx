import { useState } from "react";
import { useSelector } from "react-redux";
import { Localized } from "@fluent/react";
import { Login } from "./Login";
import { DataLoader } from "./DataLoader";
import { getLogin } from "./store/loginSlice";
import { DiveList } from "./DiveList";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const login = useSelector(getLogin);

  return (
    <div className="App">
      <h1>
        <Localized id="main-title" />
      </h1>
      <Localized id="welcome-to-subsurface" />
      <Login />
      <DataLoader />
      {login ? <Localized id="hello-user" vars={{ user: login }} /> : null}
      <DiveList />
    </div>
  );
}

export default App;
