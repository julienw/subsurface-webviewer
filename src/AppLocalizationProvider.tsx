/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Children, useEffect, useState } from "react";
import { type ReactNode } from "react";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { negotiateLanguages } from "@fluent/langneg";
import { LocalizationProvider, ReactLocalization } from "@fluent/react";

// List all available locales.
const AVAILABLE_LOCALES = ["en-US", "fr-FR"];

// This list has been copied from the l20n library in the Firefox OS project
// (ancestor of Fluent):
// https://github.com/mozilla-b2g/gaia/blob/975a35c0f5010df341e96d6c5ec60217f5347412/shared/js/intl/l20n-client.js#L31-L35
const RTL_LOCALES = ["ar", "he", "fa", "ps", "ur"];

// Negotiate user language.
const languages = negotiateLanguages(navigator.languages, AVAILABLE_LOCALES, {
  defaultLocale: "en-US",
});

const primaryLocale = languages[0];
const direction = RTL_LOCALES.includes(primaryLocale.slice(0, 2))
  ? "rtl"
  : "ltr";

document.documentElement.setAttribute("dir", direction);
document.documentElement.setAttribute("lang", primaryLocale);

const messagesPromise = languages.map(getMessages);

// Load locales from files.
async function getMessages(locale: string): Promise<[string, string]> {
  const url = new URL(`../locales/${locale}/subsurface.ftl`, import.meta.url);
  const response = await fetch(url);
  const messages = await response.text();
  return [locale, messages];
}

// Generate bundles for each locale.
function* lazyGenerateBundles(messages: Array<[string, string]>) {
  for (const [locale, content] of messages) {
    const bundle = new FluentBundle(locale);
    bundle.addResource(new FluentResource(content));
    yield bundle;
  }
}

interface AppLocalizationProviderProps {
  children: ReactNode;
}

export function AppLocalizationProvider(props: AppLocalizationProviderProps) {
  const [messages, setMessages] = useState<null | Array<[string, string]>>(
    null,
  );

  useEffect(() => {
    Promise.all(messagesPromise).then(setMessages);
  }, []);

  if (!messages) {
    return null;
  }

  const lazyBundles = lazyGenerateBundles(messages);
  const reactLocalization = new ReactLocalization(lazyBundles);
  return (
    <LocalizationProvider l10n={reactLocalization}>
      {Children.only(props.children)}
    </LocalizationProvider>
  );
}
