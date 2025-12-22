import Effects from '.';

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
export type Type = 20;

export interface Tint {
    ix?: EffectIndex;
    mn?: MatchName;
    nm?: Name;
    ty?: Type;
    ef?: Effects;
    [k: string]: unknown;
}
