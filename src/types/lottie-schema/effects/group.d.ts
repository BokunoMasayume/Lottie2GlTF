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
export type Type = 5;

export interface Group {
    ix?: EffectIndex;
    mn?: MatchName;
    nm?: Name;
    ty?: Type;
    ef?: Effects;
    /**
     * Enabled AE property value
     */
    en?: number;
    [k: string]: unknown;
}
