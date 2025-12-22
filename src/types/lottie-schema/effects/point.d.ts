import MultiDimensionalProperty from '../properties/multiDimensional';

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
export type Type = 2;

/**
 * Effect value.
 */
export type EffectValue = MultiDimensionalProperty;

export interface Point {
    ix?: EffectIndex;
    mn?: MatchName;
    nm?: Name;
    ty?: Type;
    v?: EffectValue;
    [k: string]: unknown;
}
