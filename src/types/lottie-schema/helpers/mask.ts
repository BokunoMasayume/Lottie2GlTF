import MaskModeEnum from '../enums/maskModeEnum';
import type ShapeProperty from '../properties/shape';
import type ValueProperty from '../properties/value';

export interface RuntimeMask {
    /**
     * Inverted: 反转遮罩标记
     * Inverted Mask flag
     */
    inv: boolean;

    /**
     * Name: 遮罩名称，应用于特效和表达式
     * Mask name. Used for expressions and effects.
     */
    nm: string;

    /**
     * Points: 遮罩顶点
     * Mask vertices
     */
    pt: ShapeProperty;

    /**
     * Opacity: 遮罩透明度，默认值 { "a": 0, "k": 100 }
     * Mask opacity.
     */
    o: ValueProperty;

    /**
     * Mode: 遮罩模式，当前不是所有模式都支持
     * Mask mode. Not all mask types are supported.
     */
    mode: MaskModeEnum;
}
