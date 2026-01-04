# GuMap

[![npm version](https://img.shields.io/npm/v/@zachvictor/gu-map.svg)](https://www.npmjs.com/package/@zachvictor/gu-map)
[![license](https://img.shields.io/npm/l/@zachvictor/gu-map.svg)](https://www.apache.org/licenses/LICENSE-2.0)

A JavaScript Map wrapper with **dot accessor notation** and **immutability** features.

## Installation

```bash
npm install @zachvictor/gu-map
```

## Usage

```javascript
import { createGuMap } from '@zachvictor/gu-map';

// Basic usage with dot notation
const map = createGuMap([['foo', 1], ['bar', 2]]);
console.log(map.foo);  // 1
map.baz = 3;           // set via dot notation
map.get('baz');        // 3 (standard Map methods work too)

// Iteration works as expected
for (const [key, value] of map) {
  console.log(key, value);
}

// Immutable properties (can add, cannot change)
const immutableProps = createGuMap([['x', 10]], {
  immutableProperties: true,
  throwErrorOnPropertyMutate: true
});
immutableProps.y = 20;  // OK: new property
immutableProps.x = 99;  // Error: cannot change existing property

// Fully immutable map
const frozen = createGuMap([['a', 1]], {
  immutableMap: true,
  throwErrorOnPropertyMutate: true
});
frozen.b = 2;  // Error: map is immutable
```

## API

### `createGuMap(iterable?, options?)`

Creates a new GuMap. Returns a Proxy wrapping a Map instance.

- `iterable` — Array or iterable of key-value pairs (same as `Map`)
- `options` — Configuration object (see below)

Returns a proxy that passes `instanceof Map` checks.

### Configuration Options

| Option                            | Type    | Default | Description                                                  |
|-----------------------------------|---------|---------|--------------------------------------------------------------|
| `immutableMap`                    | boolean | false   | Complete immutability—no add, change, or delete              |
| `immutableProperties`             | boolean | false   | Properties can be added but not changed                      |
| `throwErrorOnPropertyMutate`      | boolean | false   | Throw error on mutation attempt (see note below)             |
| `throwErrorOnNonexistentProperty` | boolean | false   | Throw error when accessing nonexistent property              |

**Note on `throwErrorOnPropertyMutate`:** When `false`, mutation attempts are blocked but the behavior depends on JavaScript's strict mode. In ES modules (strict mode), blocked mutations throw `TypeError`. In non-strict mode, they fail silently.

### Supported Map Methods

All standard Map methods work: `get()`, `set()`, `has()`, `delete()`, `entries()`, `keys()`, `values()`, `forEach()`, `clear()`, `size`, and `Symbol.iterator`.

### Operators

- **Dot notation**: `map.foo` and `map.foo = 1`
- **`in` operator**: `'foo' in map`
- **Spread/iteration**: `[...map]` and `for...of`
- **`delete` operator**: `delete map.foo`

### Aliases

For backwards compatibility:
- `GuMap` is an alias for `createGuMap`
- `GuMapConfig` is an alias for `normalizeConfig`

## Testing

```bash
npm test
```

Uses Node.js built-in test runner with 50 tests covering all configuration options and edge cases.

## Why "GuMap"?

The name combines 固 (gù, meaning "solid" or "firm" in Chinese) with Map—a nod to the immutability features. Pronunciation: "goo-map".

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
