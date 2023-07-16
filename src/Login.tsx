/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SyntheticEvent } from "react";
import { Localized } from "@fluent/react";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { setUser, setPassword } from "./store/loginSlice";
import { fetchDataForUser } from "./store/dataSlice";
import "./Login.css";

export function Login() {
  const loginFromStore = useAppSelector((state) => state.login);
  const loadingState = useAppSelector((state) => state.data.loading);
  const [openFromForm, setOpenFromForm] = useState(!loginFromStore.user);
  const [persistFromForm, setPersistFromForm] = useState(
    "login" in localStorage
  );
  const [autologinFromForm, setAutologinFromForm] = useState(
    persistFromForm && localStorage.autologin === "true"
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (autologinFromForm || window.location.search.includes("fake")) {
      dispatch(fetchDataForUser(loginFromStore));
    }
  }, []);

  const onFormSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    dispatch(fetchDataForUser(loginFromStore));
    setOpenFromForm(false);

    // Possibly persist in localStorage
    if (persistFromForm) {
      localStorage.login = loginFromStore.user;
      localStorage.password = loginFromStore.password;
      localStorage.autologin = autologinFromForm;
    }
  };

  const onFormReset = (_e: SyntheticEvent<HTMLButtonElement, MouseEvent>) => {
    delete localStorage.login;
    delete localStorage.password;
    delete localStorage.autologin;
    dispatch(setUser(""));
    dispatch(setPassword(""));
    setPersistFromForm(false);
    setAutologinFromForm(false);
  };

  const open =
    loadingState === "failed" || loadingState == "idle" || openFromForm;

  return (
    <details
      open={open}
      onToggle={(e) => {
        setOpenFromForm(e.currentTarget.open);
      }}
    >
      <summary>
        <Localized id="login-summary" />
      </summary>
      {loadingState === "failed" ? <>Loading failed! Please try again</> : null}
      <div>
        <Localized id="login-explanation" />
      </div>
      <form className="login-form" onSubmit={onFormSubmit}>
        <label>
          <Localized id="login-user" />{" "}
          <input
            name="user-input"
            onChange={(e) => dispatch(setUser(e.currentTarget.value))}
            value={loginFromStore.user}
          />
        </label>
        <label>
          <Localized id="login-password" />{" "}
          <input
            name="password-input"
            type="password"
            onChange={(e) => dispatch(setPassword(e.currentTarget.value))}
            value={loginFromStore.password}
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="persist-checkbox"
            onChange={(e) => setPersistFromForm(e.currentTarget.checked)}
            checked={persistFromForm}
          />{" "}
          <Localized id="login-save-login" />
        </label>
        <label>
          <input
            type="checkbox"
            name="autologin"
            onChange={(e) => setAutologinFromForm(e.currentTarget.checked)}
            checked={autologinFromForm}
          />{" "}
          <Localized id="login-autologin" />
        </label>
        <div>
          <button type="submit">
            <Localized id="login-submit" />
          </button>
          <button type="button" onClick={onFormReset}>
            <Localized id="login-reset" />
          </button>
        </div>
      </form>
    </details>
  );
}
