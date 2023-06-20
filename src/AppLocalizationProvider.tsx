import { Children, useEffect, useState } from "react";
import { type ReactNode } from "react";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import { negotiateLanguages } from "@fluent/langneg";
import { LocalizationProvider, ReactLocalization } from "@fluent/react";

// List all available locales.
const AVAILABLE_LOCALES = ["en-US"];

// Negotiate user language.
const languages = negotiateLanguages(navigator.languages, AVAILABLE_LOCALES, {
  defaultLocale: "en-US",
});

const messagesPromise = languages.map(getMessages);

// Load locales from files.
async function getMessages(locale: string): Promise<[string, string]> {
  const url = new URL(`../locales/${locale}.ftl`, import.meta.url);
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
    null
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
