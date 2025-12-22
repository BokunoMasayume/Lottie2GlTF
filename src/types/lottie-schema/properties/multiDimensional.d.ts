import { MultiValue, MultiKeyframeValue } from './keyframe/multiKeyframe';
import type { RuntimeBaseProperty as BaseProperty } from './baseProperty';

/**
 * 一段属性值描述
 */
export declare type MultiDimensional = BaseProperty & {
    // Property Value Keyframes: 一段关键帧属性值
    k: MultiValue;
};

/**
 * 多段属性值描述
 */
export declare type MultiDimensionalKeyframed = BaseProperty & {
    // Property Value Keyframes: 多段属性值描述
    k: MultiKeyframeValue[];

    // Tangent Out: 移出切线，仅用于空间属性
    to: number[];

    // Tangent In: 达到切线，仅用于空间属性
    ti: number[];
};

declare type MultiDimensionalProperty = MultiDimensional | MultiDimensionalKeyframed;

export default MultiDimensionalProperty;
