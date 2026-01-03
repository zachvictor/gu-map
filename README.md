# GuMap

[![npm version](https://img.shields.io/npm/v/@zachvictor/gu-map.svg)](https://www.npmjs.com/package/@zachvictor/gu-map)
[![license](https://img.shields.io/npm/l/@zachvictor/gu-map.svg)](https://www.apache.org/licenses/LICENSE-2.0)

A JavaScript Map extension with **dot accessor notation** and **immutability** features.

## Installation

```bash
npm install @zachvictor/gu-map
```

## Usage

```javascript
import { GuMap, GuMapConfig } from '@zachvictor/gu-map';

// Basic usage with dot notation
const map = new GuMap([['foo', 1], ['bar', 2]]);
console.log(map.foo);  // 1
map.baz = 3;           // set via dot notation
map.get('baz');        // 3 (standard Map method also works)

// Immutable properties (can add, cannot change)
const config = { immutableProperties: true, throwErrorOnPropertyMutate: true };
const immutableProps = new GuMap([['x', 10]], config);
immutableProps.y = 20;  // OK: new property
immutableProps.x = 99;  // Error: cannot change existing property

// Fully immutable map
const frozen = new GuMap([['a', 1]], { immutableMap: true, throwErrorOnPropertyMutate: true });
frozen.b = 2;  // Error: map is immutable
```

## API

### `new GuMap(iterable?, config?)`

Creates a new GuMap. Returns a Proxy wrapping the Map.

- `iterable` — Array or iterable of key-value pairs (same as `Map`)
- `config` — `GuMapConfig` object or plain object with options

### `GuMapConfig` Options

| Option                            | Type    | Default | Description                                                              |
|-----------------------------------|---------|---------|--------------------------------------------------------------------------|
| `immutableMap`                    | boolean | false   | Complete immutability—no add, change, or delete                          |
| `immutableProperties`             | boolean | false   | Properties can be added but not changed                                  |
| `throwErrorOnPropertyMutate`      | boolean | false   | Throw error on mutation attempt (vs silent failure)                      |
| `throwErrorOnNonexistentProperty` | boolean | false   | Throw error when accessing nonexistent property (vs returning undefined) |

### Bridged Map Methods

All standard Map methods are available: `get()`, `set()`, `has()`, `entries()`, `keys()`, `values()`, `forEach()`,
`clear()`, `size`.

**Note:** `Map[@@iterator]` is not bridged—use `entries()` instead.

## Why "GuMap"?

The name combines 固 (gù, meaning "solid" or "firm" in Chinese) with Map—a nod to the immutability features.
Pronunciation: "goo-map".

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)