'use strict';
import GuMapConfig from './gu-map-config';

class GuMap extends Map {
  /**
   * GuMap extends Map to support dot accessor notation and immutability features.
   * This class does not bridge Map[@@iterator]: please use entries() instead.
   * The class name is a bilingual compound word, transliterating 固Map ("gù-map") into Latin letters.
   * 固 can mean strong, solid, and sure -- an allusion to this class's immutability-features.
   * @param {Array|Object} iterable
   * @param {GuMapConfig|Object} config
   * @return {Proxy} wrapped Map implementing dot notation for property accessors and enforcing property-level immutability on set.
   */
  constructor(iterable, config) {
    super(iterable);
    const _map = this; // "this" after super before proxy refers to the "internal" Map.
    const cfg = new GuMapConfig(config);
    const errBase = 'GuMap Error:';
    const errImmutable = () => cfg.immutableMap ? ' Map is immutable.' : ' Properties are immutable.';
    const errProp = (verb, key) => ` Cannot ${verb} property ${key}.`;
    const errNonexistent = (key) => ` Property ${key} does not exist.`;
    /**
     * @typedef MapBridge => Map prototype. See https://tc39.es/ecma262/#sec-properties-of-the-map-prototype-object
     * @property {Function} clear
     * @property {Function} entries
     * @property {Function} forEach
     * @property {Function} get
     * @property {Function} has
     * @property {Function} keys
     * @property {Function} set
     * @property {number} size
     * @property {Function} values
     */
    /**
     * @type MapBridge
     */
    const bridge = {
      clear: () => _map.clear(),
      entries: () => _map.entries(),
      forEach: (callbackFn, thisArg) => {
        // Ignore 3rd arg to block direct access to "internal" Map.
        _map.forEach((value, key) => {
          // Use mapProxy for 3rd arg to block direct access and prevent unwanted mutation.
          callbackFn(value, key, mapProxy);
        }, thisArg)},
      get: (getKey) => doGet(getKey),
      has: (hasKey) => _map.has(hasKey),
      keys: () => _map.keys(),
      set: (setKey, setValue) => doSet(setKey, setValue),
      get size() {
        return _map.size;
      },
      values: () => _map.values()
    }
    const throwXorReturn = (err, ret) => {
      if (err) throw new Error(err);
      return ret;
    }
    const doDelete = (key) => {
      let err, ret = false;
      // If Map/prop is immutable, don't delete prop, and prepare error msg (per options).
      if (cfg.immutableMap || cfg.immutableProperties) {
        err = cfg.throwErrorOnPropertyMutate ? `${errBase}${errImmutable()}${errProp('delete', key)}` : '';
        // If prop doesn't exist, then prepare error message (per options).
      } else if (!_map.has(key) && cfg.throwErrorOnNonexistentProperty) {
        err = `${errBase}${errImmutable()}${errNonexistent('delete', key)}`;
        // Default case: delete entry (nonexistent key returns false).
      } else {
        ret = _map.delete(key);
      }
      return throwXorReturn(err, ret);
    }
    const doGet = (key) => {
      let err, ret = false;
      // Bridge native Map properties except Symbol.iterator (bridged properties cannot be overwritten).
      if (key in bridge) {
        ret = bridge[key];
      }
      // If prop doesn't exist, then prepare error msg (per options).
      else if (!_map.has(key) && cfg.throwErrorOnNonexistentProperty) {
        err = `${errBase}${errNonexistent(key)}${errProp('get', key)}`;
        // Default case: native Map getter (nonexistent key returns undefined).
      } else {
        ret = _map.get(key);
      }
      return throwXorReturn(err, ret);
    };
    const doSet = (key, value) => {
      let err, ret = false;
      // If Map is immutable, or if props are immutable and prop exists, then don't set prop, and prepare error msg (per options).
      if (cfg.immutableMap || (cfg.immutableProperties && _map.has(key)) || key in bridge) {
        err = cfg.throwErrorOnPropertyMutate ? `${errBase}${errImmutable()}${errProp('set', key)}` : '';
      // Default case: super behavior for deleting an entry.
      } else {
        ret = _map.set(key, value);
      }
      return throwXorReturn(err, ret);
    };
    const mapProxy = new Proxy(this, {
      deleteProperty(target, key) {
        return doDelete(key);
      },
      set(target, key, value) {
        return doSet(key, value);
      },
      setPrototypeOf() {
        throw new Error(`${errBase} The prototype cannot be changed.`);
      },
      get(target, key) {
        return doGet(key);
      }
    });
    return mapProxy;
  }
}

export default GuMap;