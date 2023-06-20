import { useSelector } from "react-redux";
import { Localized } from "@fluent/react";
import { Login } from "./Login";
import { DataLoader } from "./DataLoader";
import { DiveList } from "./DiveList";
import type { RootState } from "./types";
import "./App.css";

function App() {
  const user = useSelector((state: RootState) => state.login?.user);

  return (
    <div className="App">
      <h1>
        <Localized id="main-title" />
      </h1>
      <Localized id="welcome-to-subsurface" />
      <Login />
      <DataLoader />
      {user ? <Localized id="hello-user" vars={{ user }} /> : null}
      <DiveList />
    </div>
  );
}

export default App;
