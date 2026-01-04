import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createGuMap, GuMap, normalizeConfig, GuMapConfig } from '../index.js';

describe('normalizeConfig', () => {
  it('defaults all options to false when no options provided', () => {
    const config = normalizeConfig();
    assert.equal(config.immutableMap, false);
    assert.equal(config.immutableProperties, false);
    assert.equal(config.throwErrorOnPropertyMutate, false);
    assert.equal(config.throwErrorOnNonexistentProperty, false);
  });

  it('defaults all options to false when empty object provided', () => {
    const config = normalizeConfig({});
    assert.equal(config.immutableMap, false);
    assert.equal(config.immutableProperties, false);
    assert.equal(config.throwErrorOnPropertyMutate, false);
    assert.equal(config.throwErrorOnNonexistentProperty, false);
  });

  it('sets individual options correctly', () => {
    const config = normalizeConfig({ throwErrorOnNonexistentProperty: true });
    assert.equal(config.immutableMap, false);
    assert.equal(config.immutableProperties, false);
    assert.equal(config.throwErrorOnPropertyMutate, false);
    assert.equal(config.throwErrorOnNonexistentProperty, true);
  });

  it('immutableMap implies immutableProperties', () => {
    const config = normalizeConfig({ immutableMap: true });
    assert.equal(config.immutableMap, true);
    assert.equal(config.immutableProperties, true);
  });

  it('is frozen after creation', () => {
    const config = normalizeConfig({});
    assert.equal(Object.isFrozen(config), true);
  });

  it('casts truthy values to boolean', () => {
    const config = normalizeConfig({ immutableMap: 1, throwErrorOnPropertyMutate: 'yes' });
    assert.equal(config.immutableMap, true);
    assert.equal(config.throwErrorOnPropertyMutate, true);
  });

  it('GuMapConfig is an alias for normalizeConfig', () => {
    assert.equal(GuMapConfig, normalizeConfig);
  });
});

describe('createGuMap basic functionality', () => {
  it('creates map with array of entries', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    assert.equal(map.get('a'), 1);
    assert.equal(map.get('b'), 2);
  });

  it('GuMap is an alias for createGuMap', () => {
    assert.equal(GuMap, createGuMap);
  });

  it('supports dot notation for get', () => {
    const map = createGuMap([['foo', 42]]);
    assert.equal(map.foo, 42);
  });

  it('supports dot notation for set', () => {
    const map = createGuMap();
    map.bar = 100;
    assert.equal(map.bar, 100);
    assert.equal(map.get('bar'), 100);
  });

  it('returns undefined for nonexistent property by default', () => {
    const map = createGuMap();
    assert.equal(map.nonexistent, undefined);
  });

  it('supports has() method', () => {
    const map = createGuMap([['x', 1]]);
    assert.equal(map.has('x'), true);
    assert.equal(map.has('y'), false);
  });

  it('supports size', () => {
    const map = createGuMap([['a', 1], ['b', 2], ['c', 3]]);
    assert.equal(map.size, 3);
  });

  it('supports entries()', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const entries = [...map.entries()];
    assert.deepEqual(entries, [['a', 1], ['b', 2]]);
  });

  it('supports keys()', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const keys = [...map.keys()];
    assert.deepEqual(keys, ['a', 'b']);
  });

  it('supports values()', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const values = [...map.values()];
    assert.deepEqual(values, [1, 2]);
  });

  it('supports forEach()', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const collected = [];
    map.forEach((value, key) => {
      collected.push([key, value]);
    });
    assert.deepEqual(collected, [['a', 1], ['b', 2]]);
  });

  it('supports clear()', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    map.clear();
    assert.equal(map.size, 0);
  });

  it('supports delete operator', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const result = delete map.a;
    assert.equal(result, true);
    assert.equal(map.has('a'), false);
    assert.equal(map.size, 1);
  });

  it('supports delete() method', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const result = map.delete('a');
    assert.equal(result, true);
    assert.equal(map.has('a'), false);
    assert.equal(map.size, 1);
  });

  it('delete() returns false for nonexistent key', () => {
    const map = createGuMap();
    const result = map.delete('nonexistent');
    assert.equal(result, false);
  });

  it('delete operator returns false for nonexistent key (throws in strict mode)', () => {
    const map = createGuMap();
    // In ESM (strict mode), returning false from deleteProperty trap throws TypeError
    assert.throws(() => {
      delete map.nonexistent;
    }, TypeError);
  });
});

describe('createGuMap Symbol.iterator', () => {
  it('supports Symbol.iterator (spread operator)', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const entries = [...map];
    assert.deepEqual(entries, [['a', 1], ['b', 2]]);
  });

  it('supports for...of iteration', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const collected = [];
    for (const [key, value] of map) {
      collected.push([key, value]);
    }
    assert.deepEqual(collected, [['a', 1], ['b', 2]]);
  });
});

describe('createGuMap "in" operator (has trap)', () => {
  it('returns true for existing properties', () => {
    const map = createGuMap([['foo', 1]]);
    assert.equal('foo' in map, true);
  });

  it('returns false for nonexistent properties', () => {
    const map = createGuMap();
    assert.equal('nonexistent' in map, false);
  });

  it('returns true for bridge properties', () => {
    const map = createGuMap();
    assert.equal('get' in map, true);
    assert.equal('set' in map, true);
    assert.equal('entries' in map, true);
    assert.equal('size' in map, true);
  });
});

describe('createGuMap Object.keys (ownKeys trap)', () => {
  it('returns map keys and bridge keys', () => {
    const map = createGuMap([['a', 1], ['b', 2]]);
    const keys = Object.keys(map);
    assert.equal(keys.includes('a'), true);
    assert.equal(keys.includes('b'), true);
    assert.equal(keys.includes('get'), true);
    assert.equal(keys.includes('set'), true);
  });
});

describe('createGuMap instanceof', () => {
  it('is instanceof Map', () => {
    const map = createGuMap([['a', 1]]);
    assert.equal(map instanceof Map, true);
  });
});

describe('createGuMap immutableProperties mode', () => {
  it('allows adding new properties', () => {
    const map = createGuMap([], { immutableProperties: true });
    map.newProp = 123;
    assert.equal(map.newProp, 123);
  });

  it('throws when changing existing property with throwErrorOnPropertyMutate', () => {
    const map = createGuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.x = 2;
    }, /Cannot set property x/);
  });

  it('throws TypeError when changing existing property without throwErrorOnPropertyMutate (ESM strict mode)', () => {
    const map = createGuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: false
    });
    // In ESM (strict mode), returning false from set trap throws TypeError
    assert.throws(() => {
      map.x = 2;
    }, TypeError);
    assert.equal(map.x, 1); // unchanged
  });

  it('throws when deleting property with throwErrorOnPropertyMutate', () => {
    const map = createGuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      delete map.x;
    }, /Cannot delete property x/);
  });

  it('throws TypeError when deleting property without throwErrorOnPropertyMutate (ESM strict mode)', () => {
    const map = createGuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: false
    });
    // In ESM (strict mode), returning false from deleteProperty trap throws TypeError
    assert.throws(() => {
      delete map.x;
    }, TypeError);
    assert.equal(map.has('x'), true); // still exists
  });
});

describe('createGuMap immutableMap mode', () => {
  it('throws when adding new property with throwErrorOnPropertyMutate', () => {
    const map = createGuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.newProp = 123;
    }, /Map is immutable.*Cannot set property newProp/);
  });

  it('throws when changing existing property with throwErrorOnPropertyMutate', () => {
    const map = createGuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.a = 2;
    }, /Map is immutable.*Cannot set property a/);
  });

  it('throws when deleting property with throwErrorOnPropertyMutate', () => {
    const map = createGuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      delete map.a;
    }, /Map is immutable.*Cannot delete property a/);
  });

  it('throws TypeError on mutations without throwErrorOnPropertyMutate (ESM strict mode)', () => {
    const map = createGuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: false
    });

    // In ESM (strict mode), returning false from proxy traps throws TypeError
    assert.throws(() => {
      map.a = 2;
    }, TypeError);
    assert.equal(map.a, 1); // unchanged

    assert.throws(() => {
      map.newProp = 123;
    }, TypeError);
    assert.equal(map.has('newProp'), false); // not added

    assert.throws(() => {
      delete map.a;
    }, TypeError);
    assert.equal(map.has('a'), true); // not deleted
  });
});

describe('createGuMap throwErrorOnNonexistentProperty', () => {
  it('throws when getting nonexistent property', () => {
    const map = createGuMap([], { throwErrorOnNonexistentProperty: true });
    assert.throws(() => {
      void map.nonexistent;
    }, /does not exist.*Cannot get property nonexistent/);
  });

  it('throws when deleting nonexistent property', () => {
    const map = createGuMap([], { throwErrorOnNonexistentProperty: true });
    assert.throws(() => {
      delete map.nonexistent;
    }, /does not exist/);
  });

  it('does not throw for existing properties', () => {
    const map = createGuMap([['x', 1]], { throwErrorOnNonexistentProperty: true });
    assert.equal(map.x, 1); // no throw
  });
});

describe('createGuMap edge cases and security', () => {
  it('throws when attempting to change prototype', () => {
    const map = createGuMap();
    assert.throws(() => {
      Object.setPrototypeOf(map, {});
    }, /prototype cannot be changed/);
  });

  it('bridge properties cannot be overwritten', () => {
    const map = createGuMap([], { throwErrorOnPropertyMutate: true });
    assert.throws(() => {
      map.entries = 'overwritten';
    }, /Cannot set property entries/);
  });

  it('bridge properties are accessible', () => {
    const map = createGuMap([['a', 1]]);
    assert.equal(typeof map.entries, 'function');
    assert.equal(typeof map.forEach, 'function');
    assert.equal(typeof map.get, 'function');
    assert.equal(typeof map.set, 'function');
    assert.equal(typeof map.has, 'function');
    assert.equal(typeof map.keys, 'function');
    assert.equal(typeof map.values, 'function');
    assert.equal(typeof map.clear, 'function');
    assert.equal(typeof map.delete, 'function');
    assert.equal(typeof map.size, 'number');
  });

  it('forEach receives proxy as third argument, not internal Map', () => {
    const map = createGuMap([['a', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    map.forEach((value, key, mapArg) => {
      // If mapArg were the internal Map, this would succeed
      // Since it's the proxy with immutableProperties, it should throw
      assert.throws(() => {
        mapArg.a = 999;
      }, /Cannot set property a/);
    });
  });

  it('set() method respects immutability', () => {
    const map = createGuMap([['a', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.set('a', 2);
    }, /Cannot set property a/);
  });

  it('set() method allows adding new properties in immutableProperties mode', () => {
    const map = createGuMap([], { immutableProperties: true });
    map.set('new', 42);
    assert.equal(map.get('new'), 42);
  });

  it('get() method works like dot notation', () => {
    const map = createGuMap([['foo', 'bar']]);
    assert.equal(map.get('foo'), 'bar');
    assert.equal(map.foo, 'bar');
  });

  it('Symbol.toStringTag is GuMap', () => {
    const map = createGuMap();
    assert.equal(map[Symbol.toStringTag], 'GuMap');
    assert.equal(Object.prototype.toString.call(map), '[object GuMap]');
  });
});
