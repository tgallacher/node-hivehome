# node-Hivehome

An (_unofficial_) NodeJS SDK for [Hivehome](https://www.hivehome.com) smarthome products.

> This uses Hivehome's web API, which isn't officially designated for public consumption. Therefore, this may break randomly if the Hivehome team make breaking changes. Nevertheless, we'll try and fix things as fast as possible.

> ⚠️ This is still a WIP, and we're still working to expand the feature support for the range of Hivehome's smarthome platform. Start a [discussion](https://github.com/tgallacher/node-hivehome/discussions) to help me identify which parts should be focused next.

**TOC**

<!-- TOC -->

- [Installation](#installation)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [TODO](#todo)
- [Alternative(s)](#alternatives)

<!-- /TOC -->

## Installation

```sh
$ yarn add node-hivehome # or, npm install node-hivehome
```

## Documentation

The documentation can be viewed at [https://tgallacher.github.io/node-hivehome/](https://tgallacher.github.io/node-hivehome/). This is auto-generated from the code, using [typedoc](https://typedoc.org/).

## Quick Start

As a quick example for getting going, with your email and password you can view the heating product(s) and their current state (e.g. temperature) by running the following:

```js
// index.js
const { Hive } = require('./dist');

(async ()=>{
  const hive = new Hive('hello@example.com');
  // Note: Doesn't support MFA yet. Need to disable in Hivehome's App for first login.
  await hive.auth.login('supersecretpassword');

  const heatingData = await hive.heating.get();

  console.log(JSON.stringify(heatingData, null, 2));
})()
```

Once installed, and with the above script, running:

```sh
node index.js
```

should print out the current state of all Hivehome _heating_ product(s) registered to the account used for logging in.

## TODO

- [ ] Add support for MFA flow
- [ ] Add support for `devices`
- [x] Add support for `heating` products (excl. `trv`s)
- [ ] Add support for `light` products
- [ ] Add support for `camera` products
- [ ] Add support for `sensor` products
- [ ] Add support for `plug` products
- [ ] Add support for `shield` products

## Alternative(s)

- [Pyhive/Pyhiveapi](https://github.com/Pyhive/Pyhiveapi) - Python library interface for Hivehome
