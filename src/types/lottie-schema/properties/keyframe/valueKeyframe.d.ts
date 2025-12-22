import { BezierInterpolation } from './bezier';
import BaseKeyframe from './baseKeyframe';

export declare type Value = number;

/**
 * 描述属性的一段关键帧，一个动画可以包含多段关键帧
 */
export declare type ValueKeyframe = BaseKeyframe & {
    // Start: 关键帧段的起始值
    s: Value[];

    // End: 关键帧段的结束值，官方未定义此属性，在5.6.10版本中被发现
    e?: Value[];

    // In: 贝塞尔曲线开始点
    i?: BezierInterpolation;

    // In: 贝塞尔曲线结束点
    o?: BezierInterpolation;
};

export default ValueKeyframe;
