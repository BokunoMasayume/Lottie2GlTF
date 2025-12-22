import ValueProperty from '../properties/value';

/**
 * Effect Index. Used for expressions.
 */
export type EffectIndex = number;
/**
 * After Effect's Match Name. Used for expressions.
 */
export type MatchName = string;
/**
 * After Effect's Name. Used for expressions.
 */
export type Name = string;
/**
 * Effect type.
 */
export type Type = number;
/**
 * Effect value.
 */
export type EffectValue = ValueProperty;

export interface Slider {
    ix?: EffectIndex;
    mn?: MatchName;
    nm?: Name;
    ty?: Type;
    v?: EffectValue;
    [k: string]: unknown;
}
