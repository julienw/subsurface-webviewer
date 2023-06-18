import type { SyntheticEvent } from "react";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { setLogin } from "./store/loginSlice";
import { fetchDataForUser } from "./store/dataSlice";

export function DataLoader() {
  const login = useAppSelector((state) => state.login);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (login && login.user && login.password) {
      dispatch(fetchDataForUser(login));
    }
  }, [login]);

  return null;
}
