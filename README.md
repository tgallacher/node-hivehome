# Node-Hivehome

An (_unofficial_) NodeJS SDK for [Hivehome](https://www.hivehome.com) smarthome products.

> ⚠️ This uses Hivehome's web API, which isn't officially designated for public consumption. Therefore, this may break randomly if the Hivehome team make breaking changes. Nevertheless, we'll try and fix things as fast as possible.

> ⚠️ This is still a WIP, and I'm still working to expand the feature support for the range of Hivehome's smarthome platform. Create an [issue]() to help me identify which parts I should focus on first.

**TOC**

<!-- TOC -->

- [Installation](#installation)
- [API](#api)
  - [Auth](#auth)
    - [Login](#login)
    - [Refresh](#refresh)
  - [Heating](#heating)
    - [Get](#get)
    - [History](#history)
- [Related](#related)

<!-- /TOC -->

## Installation

> TODO Publish RC to NPM

## API

### Auth

Authenticate with Hivehome's API. Required before doing anything else with the SDK.

Currently, Hivehome's authentication token is valid for **1hr**. This library will check the validity of your auth token before making any request and will refresh the token if it is nearing expiry.

The only limitation is that a request will need to be made every **45min** (currently) to ensure the token is refreshed before it expires.

If your set up ensure this condition is met, then the MFA only needs to be disabled for the first authentication call, and can then be re-enabled. The token refresh flow doesn't re-trigger the MFA flow. _This is required until this library adds support for the MFA flow for the first auth flow_.

#### Login

```js
const { Hive } = require('./dist');

const email = '<email>';
const pass = '<password>';

const hive = new Hive(email);

// Note: Doesn't support MFA yet.
// Need to disable in Hivehome's App for first login.
await hive.auth.login(pass);
```

#### Refresh

As mentioned above, the library will auto refresh the token before making any request to Hivehome's API, assuming the current token is still active. You can use this to manually trigger a token refresh.

```js
await hive.auth.refresh();
```

### Heating

Get Heating product(s) data. The returned data is intentionally normalised in order to decouple the internal dependencies of this data structure from the upstream API.

See the [Product type](https://github.com/tgallacher/node-hivehome/blob/main/src/hive/types.ts#L17) for details of the data structure.

#### Get

```js
// ...following on from above Auth code

// normalised data response
const heatingData = await hive.heating.get();
```

#### History

Defaults to fetching data for the last `24hrs`, with a `30min` interval.

```js
const heatingHistory = await hive.heating.history('<product_id>');
```

Supply an object to configure the range and sampling interval. See [HistoryOption type](https://github.com/tgallacher/node-hivehome/blob/main/src/hive/heating.ts#L8) to see how to configure the request.

```js
const heatingHistory = await hive.heating.history('<product_id>', options);
```

## Related

- [Pyhive/Pyhiveapi](https://github.com/Pyhive/Pyhiveapi) - Python library interface for Hivehome
