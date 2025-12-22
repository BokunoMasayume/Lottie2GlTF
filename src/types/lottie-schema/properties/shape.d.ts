import ShapeValueKeyframe, { ShapeValue } from './keyframe/shapePropKeyframe';
import { RuntimeBaseProperty } from './baseProperty';

/**
 * 一段属性值描述
 */
export declare type Shape = RuntimeBaseProperty & {
    // Property Value: 一段关键帧属性值
    k: ShapeValue;
};

/**
 * 多段属性值描述
 */
export declare type ShapeKeyframe = RuntimeBaseProperty & {
    // Property Value Keyframes: 多段关键帧属性值
    k: ShapeValueKeyframe[];

    // Tangent In: 移出切线，仅用于空间属性
    ti: number[];

    // Tangent Out: 达到切线，仅用于空间属性
    to: number[];
};

declare type ShapeProperty = Shape | ShapeKeyframe;

export default ShapeProperty;
