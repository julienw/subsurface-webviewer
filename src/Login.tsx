import type { SyntheticEvent } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { getLogin, setLogin } from "./store/loginSlice";

export function Login() {
  const login = useAppSelector(getLogin);
  const dispatch = useAppDispatch();
  const onFormSubmit = (e: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(setLogin(formData.get("login-input")));
  };

  return (
    <form onSubmit={onFormSubmit}>
      <label>
        Subsurface login: <input name="login-input" defaultValue={login} />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}
