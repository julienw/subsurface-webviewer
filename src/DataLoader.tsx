/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
