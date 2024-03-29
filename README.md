# Subsurface Web Viewer

This is a simple viewer for the data stored in the cloud server for the
well-known open source divelog [Subsurface](https://subsurface-divelog.org/).

It's in active development but already provides interesting features. If you
want to try it already, the current main branch is automatically deployed to
https://julienw.github.io/subsurface-webviewer/. Your login data is only stored
on your computer.

You can try it already with some data taken from either [Julien's Suunto Vyper
computer](https://julienw.github.io/subsurface-webviewer/?fake=julien) or
[Yann's Eon computer](https://julienw.github.io/subsurface-webviewer/?fake=yann).

## Features

- Shows your dive profiles
- Computes ascent and descent speed and graph them separately, with colors. This is useful to know at
  the first glance if you went too fast.
- Also graphs tank consumption as well as temperature if your computer provides
  this data.

## Known limitations

- Doesn't show events (ascent, gas change).
- Doesn't compute the saturation or OTU values
- Doesn't contain a dive planner

This is fairly simple for now, but I personally find it already easier to use
than the official mobile version of subsurface. Tell me what you think!

## Contributing

You will need a [nodejs](https://nodejs.org/) installation as well as a recent enough version of [Yarn
1 (Classic)](https://classic.yarnpkg.com/), version 1.10 is known to work correctly.
You can install it using `npm install -g yarn`. Please refer to [its documentation](https://classic.yarnpkg.com/en/docs/install) for other possible install procedures.

To get started clone the repo and get the web application started.

1. Run `git clone git@github.com:julienw/subsurface-webviewer.git`
2. Run `cd subsurface-webviewer`
3. Run `yarn install`, this will install all of the dependencies.
4. Run `yarn dev`, this will start up the development server.
5. Point your browser to [http://localhost:5173](http://localhost:5173). Note
   that the port will be different if you run more than one development server
   on the same machine. In that case pay attention to the message displayed in
   the console.

[Typescript](https://www.typescriptlang.org/) is used for type checking.

The app also contains some fake data to help with the development. Just add
`?fake=julien` or `?fake=yann` to the URL to get them displayed.

### A few more technical details

This gets the divelog data by tapping into the subsurface cloud web interface.
Then this uses [React](https://react.dev/) and [ChartJS](http://chartjs.org/) to
display the data.

### Submitting patches

First, thank you!

Please now that a few tests will run automatically on your pull request, so make
sure to run `yarn format:fix` and `yarn lint:fix` before submitting a
patch.

Also to make my life easier, please describe your change properly in the pull
request description: the WHY, the steps to test it manually, the manual tests
you already did.

### Localization

The application is ready to be localized. However only english and french are
available as of now. We'd love it if you can provide localization for your language,
however there's no system to keep the localization strings synchronized at the moment.

You can find the string files in the [locales/ directory](https://github.com/julienw/subsurface-webviewer/tree/main/locales),
with a subdirectory for each locale. Inside this directory, the file
subsurface.ftl contains the strings. The en-US version is always the authoritative
version so you can start by copying it.

There's also no locale switcher at the moment. The locale is automatically
selected from the preference set inside your browser. We want to implement a
locale selector in the future though.
