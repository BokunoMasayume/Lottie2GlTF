import ValueKeyframe from './keyframe/valueKeyframe';
import type { RuntimeBaseProperty as BaseProperty } from './baseProperty';

/**
 * 一段属性值描述
 */
export declare type Value = BaseProperty & {
    // Property Value Keyframes: 一段关键帧属性值
    k: number;
};

/**
 * 多段属性值描述
 */
export declare type ValueKeyframed = BaseProperty & {
    // Property Value Keyframes: 多段关键帧属性值
    k: ValueKeyframe[];
};

declare type ValueProperty = Value | ValueKeyframed;

export default ValueProperty;
