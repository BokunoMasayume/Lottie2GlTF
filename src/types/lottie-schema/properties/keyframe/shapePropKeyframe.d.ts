import { MultiBezierInterpolation } from './bezier';
import BaseKeyframe from './baseKeyframe';

/**
 * Shape 类型的图形属性，描述图形的一条路径
 */
export declare type ShapeValue = {
    // Closed: 路径是否闭合
    c: boolean;

    // In: 路径的贝塞尔曲线入点坐标
    i: [number, number][];

    // Out: 路径的贝塞尔曲线出点坐标
    o: [number, number][];

    // Vertices: 路径的贝塞尔曲线顶点坐标
    v: [number, number][];
};

/**
 * 描述属性的一段关键帧，一个动画可以包含多段关键帧
 */
export declare type ShapeKeyframeValue = BaseKeyframe & {
    // Start: 关键帧段的起始值
    s: ShapeValue[];

    // End: 关键帧段的结束值，官方未定义此属性，在5.6.10版本中被发现
    e?: ShapeValue[];

    // In: 贝塞尔曲线开始点
    i?: MultiBezierInterpolation;

    // In: 贝塞尔曲线结束点
    o?: MultiBezierInterpolation;
};

export default ShapeKeyframeValue;
