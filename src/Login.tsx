import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { setLogin } from "./store/loginSlice";
import "./Login.css";

export function Login() {
  const loginFromStore = useAppSelector((state) => state.login);
  const loadingFailed = useAppSelector(
    (state) => state.data.loading === "failed"
  );
  const [openFromForm, setOpenFromForm] = useState(null as null | boolean);
  const [userFromForm, setUserFromForm] = useState(
    loginFromStore?.user ?? localStorage.login ?? ""
  );
  const [passwordFromForm, setPasswordFromForm] = useState(
    loginFromStore?.password ?? ""
  );
  const [persistFromForm, setPersistFromForm] = useState(
    "login" in localStorage
  );

  const dispatch = useAppDispatch();
  const onFormSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    dispatch(setLogin({ user: userFromForm, password: passwordFromForm }));
    setOpenFromForm(false);

    // Possibly persist in localStorage
    if (persistFromForm) {
      localStorage.login = userFromForm;
    }
  };

  const onFormReset = (e: SyntheticEvent<HTMLFormElement>) => {
    dispatch(setLogin(null));
    delete localStorage.login;
    setUserFromForm("");
    setPersistFromForm(false);
  };

  const open = loadingFailed || (openFromForm ?? !userFromForm);

  return (
    <details
      open={open}
      onToggle={(e) => {
        setOpenFromForm(e.currentTarget.open);
      }}
    >
      <summary>Login</summary>
      {loadingFailed ? <>Loading failed! Please try again</> : null}
      <form
        className="login-form"
        onSubmit={onFormSubmit}
        onReset={onFormReset}
      >
        <label>
          Subsurface login:{" "}
          <input
            name="user-input"
            onChange={(e) => setUserFromForm(e.currentTarget.value)}
            value={userFromForm}
          />
        </label>
        <label>
          Password:{" "}
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
          Save login
        </label>
        <div>
          <button type="submit">Login</button>
          <button type="reset">Clear</button>
        </div>
      </form>
    </details>
  );
}
