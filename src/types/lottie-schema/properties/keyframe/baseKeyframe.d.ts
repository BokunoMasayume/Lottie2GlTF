declare type BaseKeyframe = {
    // Start: 关键帧段的起始值
    s: any[];

    // End: 关键帧段的结束值，官方未定义此属性，在5.6.10版本中被发现
    e?: any[];

    // Time: 关键帧段的起始帧
    t: number;

    // In: 贝塞尔曲线开始点
    i?: unknown;

    // In: 贝塞尔曲线结束点
    o?: unknown;

    // Tangent In: 进入空间切线，仅用于空间属性
    // PS：官方docs未定义，在5.6.3版本发现可能会存在
    ti?: number[];

    // Tangent Out: 进出空间切线，仅用于空间属性
    // PS：官方docs未定义，在5.6.3版本发现可能会存在
    to?: number[];
};

export default BaseKeyframe;
