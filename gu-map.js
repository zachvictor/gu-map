import { normalizeConfig } from './gu-map-config.js';

/**
 * Check if a key is a bridge property (Map method/property that should be forwarded).
 */
const isBridgeKey = (key) => BRIDGE_KEYS.has(key);

const BRIDGE_KEYS = new Set([
  'clear', 'delete', 'entries', 'forEach', 'get', 'has',
  'keys', 'set', 'size', 'values', Symbol.iterator, Symbol.toStringTag,
]);

/**
 * Create error message helpers bound to a config.
 */
const createErrorHelpers = (config) => {
  const base = 'GuMap Error:';
  return {
    immutable: () => config.immutableMap ? ' Map is immutable.' : ' Properties are immutable.',
    prop: (verb, key) => ` Cannot ${verb} property ${String(key)}.`,
    nonexistent: (key) => ` Property ${String(key)} does not exist.`,
    base,
  };
};

/**
 * Create the bridge object that forwards Map methods through the proxy.
 */
const createBridge = (map, getProxy, doGet, doSet, doDelete) => ({
  clear: () => map.clear(),
  delete: (key) => doDelete(key),
  entries: () => map.entries(),
  forEach: (callbackFn, thisArg) => {
    map.forEach((value, key) => {
      callbackFn(value, key, getProxy());
    }, thisArg);
  },
  get: (key) => doGet(key),
  has: (key) => map.has(key),
  keys: () => map.keys(),
  set: (key, value) => doSet(key, value),
  get size() {
    return map.size;
  },
  values: () => map.values(),
  [Symbol.iterator]: () => map.entries(),
  [Symbol.toStringTag]: 'GuMap',
});

/**
 * Create the core operations (doGet, doSet, doDelete) for the proxy traps.
 */
const createOperations = (map, config, getBridge, errors) => {
  const doGet = (key) => {
    const bridge = getBridge();
    if (isBridgeKey(key)) {
      return bridge[key];
    }
    if (!map.has(key) && config.throwErrorOnNonexistentProperty) {
      throw new Error(`${errors.base}${errors.nonexistent(key)}${errors.prop('get', key)}`);
    }
    return map.get(key);
  };

  const doSet = (key, value) => {
    if (isBridgeKey(key)) {
      if (config.throwErrorOnPropertyMutate) {
        throw new Error(`${errors.base}${errors.immutable()}${errors.prop('set', key)}`);
      }
      return false;
    }
    if (config.immutableMap || (config.immutableProperties && map.has(key))) {
      if (config.throwErrorOnPropertyMutate) {
        throw new Error(`${errors.base}${errors.immutable()}${errors.prop('set', key)}`);
      }
      return false;
    }
    map.set(key, value);
    return true;
  };

  const doDelete = (key) => {
    if (config.immutableMap || config.immutableProperties) {
      if (config.throwErrorOnPropertyMutate) {
        throw new Error(`${errors.base}${errors.immutable()}${errors.prop('delete', key)}`);
      }
      return false;
    }
    if (!map.has(key) && config.throwErrorOnNonexistentProperty) {
      throw new Error(`${errors.base}${errors.nonexistent(key)}${errors.prop('delete', key)}`);
    }
    return map.delete(key);
  };

  const doHas = (key) => {
    if (isBridgeKey(key)) {
      return true;
    }
    return map.has(key);
  };

  return { doGet, doSet, doDelete, doHas };
};

/**
 * Create a GuMap — a Map wrapped in a Proxy supporting dot notation and immutability.
 *
 * The name "GuMap" transliterates 固Map (gù-map) where 固 means solid/firm,
 * alluding to the immutability features.
 *
 * @param {Iterable<[any, any]>} [iterable] - Key-value pairs to initialize the map
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.immutableMap] - Complete immutability (no add/change/delete)
 * @param {boolean} [options.immutableProperties] - Properties can be added but not changed
 * @param {boolean} [options.throwErrorOnPropertyMutate] - Throw on blocked mutation
 * @param {boolean} [options.throwErrorOnNonexistentProperty] - Throw on missing property access
 * @returns {Map<any, any> & Record<string, any>} A proxied Map with dot notation and immutability support
 */
function createGuMap(iterable, options) {
  const map = new Map(iterable);
  const config = normalizeConfig(options);
  const errors = createErrorHelpers(config);

  let proxy;
  let bridge;

  const getProxy = () => proxy;
  const getBridge = () => bridge;

  const { doGet, doSet, doDelete, doHas } = createOperations(map, config, getBridge, errors);

  bridge = createBridge(map, getProxy, doGet, doSet, doDelete);

  proxy = new Proxy(map, {
    get(_target, key) {
      return doGet(key);
    },
    set(_target, key, value) {
      return doSet(key, value);
    },
    deleteProperty(_target, key) {
      return doDelete(key);
    },
    has(_target, key) {
      return doHas(key);
    },
    ownKeys(_target) {
      return [...map.keys(), ...BRIDGE_KEYS].filter(k => typeof k === 'string' || typeof k === 'symbol');
    },
    getOwnPropertyDescriptor(_target, key) {
      if (isBridgeKey(key) || map.has(key)) {
        return { configurable: true, enumerable: true, value: doGet(key) };
      }
      return undefined;
    },
    setPrototypeOf(_target) {
      throw new Error(`${errors.base} The prototype cannot be changed.`);
    },
  });

  return proxy;
}

export { createGuMap, createGuMap as GuMap };
