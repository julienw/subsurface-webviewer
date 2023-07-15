/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SyntheticEvent } from "react";
import { Localized } from "@fluent/react";
import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { setLogin } from "./store/loginSlice";
import "./Login.css";

export function Login() {
  const loginFromStore = useAppSelector((state) => state.login);
  const loadingState = useAppSelector((state) => state.data.loading);
  const [openFromForm, setOpenFromForm] = useState(null as null | boolean);
  const [userFromForm, setUserFromForm] = useState(
    loginFromStore?.user ?? localStorage.login ?? ""
  );
  const [passwordFromForm, setPasswordFromForm] = useState(
    loginFromStore?.password ?? localStorage.password ?? ""
  );
  const [persistFromForm, setPersistFromForm] = useState(
    "login" in localStorage
  );
  const [autologinFromForm, setAutologinFromForm] = useState(
    persistFromForm && localStorage.autologin === "true"
  );

  useEffect(() => {
    if (autologinFromForm) {
      dispatch(setLogin({ user: userFromForm, password: passwordFromForm }));
    }
  }, []);

  const dispatch = useAppDispatch();
  const onFormSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    dispatch(setLogin({ user: userFromForm, password: passwordFromForm }));
    setOpenFromForm(false);

    // Possibly persist in localStorage
    if (persistFromForm) {
      localStorage.login = userFromForm;
      localStorage.password = passwordFromForm;
      localStorage.autologin = autologinFromForm;
    }
  };

  const onFormReset = (_e: SyntheticEvent<HTMLFormElement>) => {
    dispatch(setLogin(null));
    delete localStorage.login;
    delete localStorage.password;
    delete localStorage.autologin;
    setUserFromForm("");
    setPasswordFromForm("");
    setPersistFromForm(false);
    setAutologinFromForm(false);
  };

  const open =
    loadingState === "failed" ||
    loadingState == "idle" ||
    (openFromForm ?? !userFromForm);

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
      <form
        className="login-form"
        onSubmit={onFormSubmit}
        onReset={onFormReset}
      >
        <label>
          <Localized id="login-user" />{" "}
          <input
            name="user-input"
            onChange={(e) => setUserFromForm(e.currentTarget.value)}
            value={userFromForm}
          />
        </label>
        <label>
          <Localized id="login-password" />{" "}
          <input
            name="password-input"
            type="password"
            onChange={(e) => setPasswordFromForm(e.currentTarget.value)}
            value={passwordFromForm}
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
          <button type="reset">
            <Localized id="login-reset" />
          </button>
        </div>
      </form>
    </details>
  );
}
