import { applyDefaults } from '../object';

describe('applyDefaults', () => {
  it('should not override "false" with default', () => {
    const obj = { value: false };
    const defaults = { value: true };

    const defaulted = applyDefaults(defaults, obj);

    expect(defaulted.value).toBe(false);
  });
});
