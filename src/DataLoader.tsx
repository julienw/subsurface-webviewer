import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { fetchDataForUser } from "./store/dataSlice";

export function DataLoader() {
  const login = useAppSelector((state) => state.login);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (login && login.user && login.password) {
      dispatch(fetchDataForUser(login));
    }
  }, [login, dispatch]);

  return null;
}
