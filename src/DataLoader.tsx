import type { SyntheticEvent } from "react";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { getLogin, setLogin } from "./store/loginSlice";
import { fetchDataForUser } from "./store/dataSlice";

function getDataUrl(user: string) {
  return `https://cloud.subsurface-divelog.org/user/${user}/dives.html_files/file.js`;
}

export function DataLoader() {
  const login = useAppSelector(getLogin);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (login) {
      dispatch(fetchDataForUser(login));
    }
  }, [login]);

  return null;
}
