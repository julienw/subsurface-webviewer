import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { getLogin, setLogin } from "./store/loginSlice";

export function Login() {
  const login = useAppSelector(getLogin);
  const loadingFailed = useAppSelector(
    (state) => state.data.loading === "failed"
  );
  const [openFromState, setOpen] = useState(null as null | boolean);
  const dispatch = useAppDispatch();
  const onFormSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(setLogin(formData.get("login-input")));
    setOpen(false);
  };

  const open = loadingFailed || (openFromState ?? !login);

  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Login</summary>
      <form onSubmit={onFormSubmit}>
        <label>
          Subsurface login: <input name="login-input" defaultValue={login} />
        </label>
        <button type="submit">Login</button>
      </form>
    </details>
  );
}
