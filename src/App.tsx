/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Localized } from "@fluent/react";
import { useAppSelector } from "./store/hooks";
import { Login } from "./Login";
import { DiveList } from "./DiveList";
import { SingleDive } from "./SingleDive";
import "./App.css";

function App() {
  const user = useAppSelector((state) => state.login.user);
  const loadingState = useAppSelector((state) => state.data.loading);

  return (
    <div className="App">
      <h1>
        <Localized id="main-title" />
      </h1>
      <Localized id="welcome-to-subsurface" />
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/single-dive/:compressedDive" component={SingleDive} />
          <Route>
            <Login />
            {loadingState === "succeeded" && user ? (
              <Localized id="hello-user" vars={{ user }} />
            ) : null}
            <DiveList />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
