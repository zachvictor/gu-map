'use strict';
class GuMapConfig {
  /**
   * GuMapConfig structures the parameter object used by the GuMap constructor.
   * The options values are cast to Boolean and stored as properties (undefined becomes false).
   * @param {Object|GuMapConfig} options
   * @param {boolean} options.immutableMap Map-as-constructed is immutable: properties cannot be added, changed, or deleted. Overrides immutableProperties.
   * @param {boolean} options.immutableProperties If immutableMap is false, then properties can be set but not changed.
   * @param {boolean} options.throwErrorOnPropertyMutate If true when immutableMap or immutableProperties is true, then an error is thrown if an attempt is made to change the value of an existing property. Otherwise, the proxy getter returns false, and nothing actually gets set.
   * @param {boolean} options.throwErrorOnNonexistentProperty If true, then an error is thrown if an attempt is made to get the value of a nonexistent property. Otherwise, the default Map behavior prevails, returning undefined.
   */
  constructor(options) {
    this.immutableMap = Boolean(options?.immutableMap);
    this.immutableProperties = this.immutableMap || Boolean(options?.immutableProperties);
    this.throwErrorOnPropertyMutate = Boolean(options?.throwErrorOnPropertyMutate);
    this.throwErrorOnNonexistentProperty = Boolean(options?.throwErrorOnNonexistentProperty);
    Object.freeze(this);
  }
}
export default GuMapConfig;