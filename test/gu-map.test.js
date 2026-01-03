import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GuMap, GuMapConfig } from '../index.js';

describe('GuMapConfig', () => {
  it('defaults all options to false when no options provided', () => {
    const config = new GuMapConfig();
    assert.equal(config.immutableMap, false);
    assert.equal(config.immutableProperties, false);
    assert.equal(config.throwErrorOnPropertyMutate, false);
    assert.equal(config.throwErrorOnNonexistentProperty, false);
  });

  it('defaults all options to false when empty object provided', () => {
    const config = new GuMapConfig({});
    assert.equal(config.immutableMap, false);
    assert.equal(config.immutableProperties, false);
    assert.equal(config.throwErrorOnPropertyMutate, false);
    assert.equal(config.throwErrorOnNonexistentProperty, false);
  });

  it('sets individual options correctly', () => {
    const config = new GuMapConfig({ throwErrorOnNonexistentProperty: true });
    assert.equal(config.immutableMap, false);
    assert.equal(config.immutableProperties, false);
    assert.equal(config.throwErrorOnPropertyMutate, false);
    assert.equal(config.throwErrorOnNonexistentProperty, true);
  });

  it('immutableMap implies immutableProperties', () => {
    const config = new GuMapConfig({ immutableMap: true });
    assert.equal(config.immutableMap, true);
    assert.equal(config.immutableProperties, true);
  });

  it('is frozen after construction', () => {
    const config = new GuMapConfig({});
    assert.equal(Object.isFrozen(config), true);
  });

  it('casts truthy values to boolean', () => {
    const config = new GuMapConfig({ immutableMap: 1, throwErrorOnPropertyMutate: 'yes' });
    assert.equal(config.immutableMap, true);
    assert.equal(config.throwErrorOnPropertyMutate, true);
  });
});

describe('GuMap basic functionality', () => {
  it('constructs with array of entries', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    assert.equal(map.get('a'), 1);
    assert.equal(map.get('b'), 2);
  });

  it('supports dot notation for get', () => {
    const map = new GuMap([['foo', 42]]);
    assert.equal(map.foo, 42);
  });

  it('supports dot notation for set', () => {
    const map = new GuMap();
    map.bar = 100;
    assert.equal(map.bar, 100);
    assert.equal(map.get('bar'), 100);
  });

  it('returns undefined for nonexistent property by default', () => {
    const map = new GuMap();
    assert.equal(map.nonexistent, undefined);
  });

  it('supports has()', () => {
    const map = new GuMap([['x', 1]]);
    assert.equal(map.has('x'), true);
    assert.equal(map.has('y'), false);
  });

  it('supports size', () => {
    const map = new GuMap([['a', 1], ['b', 2], ['c', 3]]);
    assert.equal(map.size, 3);
  });

  it('supports entries()', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    const entries = [...map.entries()];
    assert.deepEqual(entries, [['a', 1], ['b', 2]]);
  });

  it('supports keys()', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    const keys = [...map.keys()];
    assert.deepEqual(keys, ['a', 'b']);
  });

  it('supports values()', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    const values = [...map.values()];
    assert.deepEqual(values, [1, 2]);
  });

  it('supports forEach()', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    const collected = [];
    map.forEach((value, key) => {
      collected.push([key, value]);
    });
    assert.deepEqual(collected, [['a', 1], ['b', 2]]);
  });

  it('supports clear()', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    map.clear();
    assert.equal(map.size, 0);
  });

  it('supports delete', () => {
    const map = new GuMap([['a', 1], ['b', 2]]);
    const result = delete map.a;
    assert.equal(result, true);
    assert.equal(map.has('a'), false);
    assert.equal(map.size, 1);
  });

  it('delete returns false for nonexistent key', () => {
    const map = new GuMap();
    // In ESM (strict mode), returning false from deleteProperty trap throws TypeError
    assert.throws(() => {
      delete map.nonexistent;
    }, TypeError);
  });
});

describe('GuMap immutableProperties mode', () => {
  it('allows adding new properties', () => {
    const map = new GuMap([], { immutableProperties: true });
    map.newProp = 123;
    assert.equal(map.newProp, 123);
  });

  it('throws when changing existing property with throwErrorOnPropertyMutate', () => {
    const map = new GuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.x = 2;
    }, /Cannot set property x/);
  });

  it('throws TypeError when changing existing property without throwErrorOnPropertyMutate (ESM strict mode)', () => {
    const map = new GuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: false
    });
    // In ESM (strict mode), returning false from set trap throws TypeError
    // This differs from non-strict mode where it would silently fail
    assert.throws(() => {
      map.x = 2;
    }, TypeError);
    assert.equal(map.x, 1); // unchanged
  });

  it('throws when deleting property with throwErrorOnPropertyMutate', () => {
    const map = new GuMap([['x', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      delete map.x;
    }, /Cannot delete property x/);
  });

  it('throws TypeError when deleting property without throwErrorOnPropertyMutate (ESM strict mode)', () => {
    const map = new GuMap([['x', 1]], {
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

describe('GuMap immutableMap mode', () => {
  it('throws when adding new property with throwErrorOnPropertyMutate', () => {
    const map = new GuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.newProp = 123;
    }, /Map is immutable.*Cannot set property newProp/);
  });

  it('throws when changing existing property with throwErrorOnPropertyMutate', () => {
    const map = new GuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.a = 2;
    }, /Map is immutable.*Cannot set property a/);
  });

  it('throws when deleting property with throwErrorOnPropertyMutate', () => {
    const map = new GuMap([['a', 1]], {
      immutableMap: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      delete map.a;
    }, /Map is immutable.*Cannot delete property a/);
  });

  it('throws TypeError on mutations without throwErrorOnPropertyMutate (ESM strict mode)', () => {
    const map = new GuMap([['a', 1]], {
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

describe('GuMap throwErrorOnNonexistentProperty', () => {
  it('throws when getting nonexistent property', () => {
    const map = new GuMap([], { throwErrorOnNonexistentProperty: true });
    assert.throws(() => {
      const _ = map.nonexistent;
    }, /does not exist.*Cannot get property nonexistent/);
  });

  it('throws when deleting nonexistent property', () => {
    const map = new GuMap([], { throwErrorOnNonexistentProperty: true });
    assert.throws(() => {
      delete map.nonexistent;
    }, /does not exist/);
  });

  it('does not throw for existing properties', () => {
    const map = new GuMap([['x', 1]], { throwErrorOnNonexistentProperty: true });
    assert.equal(map.x, 1); // no throw
  });
});

describe('GuMap edge cases and security', () => {
  it('throws when attempting to change prototype', () => {
    const map = new GuMap();
    assert.throws(() => {
      Object.setPrototypeOf(map, {});
    }, /prototype cannot be changed/);
  });

  it('bridge properties cannot be overwritten', () => {
    const map = new GuMap([], { throwErrorOnPropertyMutate: true });
    assert.throws(() => {
      map.entries = 'overwritten';
    }, /Cannot set property entries/);
  });

  it('bridge properties are accessible', () => {
    const map = new GuMap([['a', 1]]);
    assert.equal(typeof map.entries, 'function');
    assert.equal(typeof map.forEach, 'function');
    assert.equal(typeof map.get, 'function');
    assert.equal(typeof map.set, 'function');
    assert.equal(typeof map.has, 'function');
    assert.equal(typeof map.keys, 'function');
    assert.equal(typeof map.values, 'function');
    assert.equal(typeof map.clear, 'function');
    assert.equal(typeof map.size, 'number');
  });

  it('forEach receives proxy as third argument, not internal Map', () => {
    const map = new GuMap([['a', 1]], {
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
    const map = new GuMap([['a', 1]], {
      immutableProperties: true,
      throwErrorOnPropertyMutate: true
    });
    assert.throws(() => {
      map.set('a', 2);
    }, /Cannot set property a/);
  });

  it('set() method allows adding new properties in immutableProperties mode', () => {
    const map = new GuMap([], { immutableProperties: true });
    map.set('new', 42);
    assert.equal(map.get('new'), 42);
  });

  it('get() method works like dot notation', () => {
    const map = new GuMap([['foo', 'bar']]);
    assert.equal(map.get('foo'), 'bar');
    assert.equal(map.foo, 'bar');
  });
});
