import { BooleanType } from '../../schema-enum';

export type RuntimeBaseProperty = {
    // keyframe: 关键帧属性值
    k: unknown;

    // Expression: 属性表达式，用于修改属性值
    x?: string;

    // Index: 属性 Index，用于表达式
    ix?: string;

    // Animated: 是否动画属性
    a?: BooleanType;
};
