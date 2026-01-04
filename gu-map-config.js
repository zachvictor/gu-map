/**
 * Normalize and freeze configuration options for createGuMap.
 *
 * @param {Object} [options] - Configuration options
 * @param {boolean} [options.immutableMap] - Complete immutability (no add/change/delete)
 * @param {boolean} [options.immutableProperties] - Properties can be added but not changed
 * @param {boolean} [options.throwErrorOnPropertyMutate] - Throw on blocked mutation
 * @param {boolean} [options.throwErrorOnNonexistentProperty] - Throw on missing property access
 * @returns {Object} Frozen configuration object
 */
function normalizeConfig(options) {
  const immutableMap = Boolean(options?.immutableMap);
  return Object.freeze({
    immutableMap,
    immutableProperties: immutableMap || Boolean(options?.immutableProperties),
    throwErrorOnPropertyMutate: Boolean(options?.throwErrorOnPropertyMutate),
    throwErrorOnNonexistentProperty: Boolean(options?.throwErrorOnNonexistentProperty),
  });
}

export { normalizeConfig, normalizeConfig as GuMapConfig };
