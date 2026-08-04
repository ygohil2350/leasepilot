import { describe, expect, it } from 'vitest';
import reducer, { selectProperty } from './propertiesSlice';
describe('properties reducer', () => {
  it('tracks the selected map property', () => {
    const state = reducer(undefined, selectProperty('property-1'));
    expect(state.selectedId).toBe('property-1');
  });
});
