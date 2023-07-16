/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useSelector } from "react-redux";
import { Localized } from "@fluent/react";
import { Login } from "./Login";
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
      {user ? <Localized id="hello-user" vars={{ user }} /> : null}
      <DiveList />
    </div>
  );
}

export default App;
