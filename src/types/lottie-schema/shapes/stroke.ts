import ShapeTypeEnum from '../enums/shapeTypeEnum';
import LineJoinTypeEnum from '../enums/lineJoinTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';
import type { BaseShape } from './baseShape';
import LineCapTypeEnum from '../enums/lineCapTypeEnum';

export declare interface Stroke extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Stroke;

    /**
     * Line Cap: 线段端点处理方式
     * Gradient Stroke Line Cap
     */
    lc: LineCapTypeEnum;

    /**
     * Line Join: 两线段连接点处理方式
     * Gradient Stroke Line Join
     */
    lj: LineJoinTypeEnum;

    /**
     * Miter Limit: lj 取 LineJoin.Miter 时的长度限制
     * Gradient Stroke Miter Limit. Only if Line Join is set to Miter.
     */
    ml: number;

    /**
     * Opacity: 不透明度
     * Stroke Opacity
     */
    o: ValueProperty;

    /**
     * Width: 线宽
     * Stroke Width
     */
    w: ValueProperty;

    /**
     * Color: 填充颜
     * Stroke Color
     */
    c: MultiDimensionalProperty;
}
