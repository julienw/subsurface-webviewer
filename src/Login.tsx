import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { getLogin, setLogin } from "./store/loginSlice";
import "./Login.css";

export function Login() {
  const loginFromStore = useAppSelector(getLogin);
  const loadingFailed = useAppSelector(
    (state) => state.data.loading === "failed"
  );
  const [openFromForm, setOpenFromForm] = useState(null as null | boolean);
  const [loginFromForm, setLoginFromForm] = useState(
    loginFromStore ?? localStorage.login ?? ""
  );
  const [persistFromForm, setPersistFromForm] = useState(
    "login" in localStorage
  );

  const dispatch = useAppDispatch();
  const onFormSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    dispatch(setLogin(loginFromForm));
    setOpenFromForm(false);

    // Possibly persist in localStorage
    if (persistFromForm) {
      localStorage.login = loginFromForm;
    }
  };

  const onFormReset = (e: SyntheticEvent<HTMLFormElement>) => {
    dispatch(setLogin(null));
    delete localStorage.login;
    setLoginFromForm("");
    setPersistFromForm(false);
  };

  const open = loadingFailed || (openFromForm ?? !loginFromForm);

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
            name="login-input"
            onChange={(e) => setLoginFromForm(e.currentTarget.value)}
            value={loginFromForm}
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
