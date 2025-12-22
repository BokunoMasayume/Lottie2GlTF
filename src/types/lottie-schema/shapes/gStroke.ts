import type { BaseShape } from './baseShape';
import GradientTypeEnum from '../enums/gradientTypeEnum';
import LineCapTypeEnum from '../enums/lineCapTypeEnum';
import LineJoinTypeEnum from '../enums/lineJoinTypeEnum';
import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';

export declare interface GStroke extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.GStroke;

    /**
     * Opacity: 不透明度
     * Stroke Opacity
     */
    o: ValueProperty;

    /**
     * StartPoint: 渐变起点
     * Gradient Start Point
     */
    s: MultiDimensionalProperty;

    /**
     * EndPoint: 渐变结束点
     * Gradient End Point
     */
    e: MultiDimensionalProperty;

    /**
     * GradientType: 渐变类型
     * Gradient Type
     */
    t: GradientTypeEnum;

    /**
     * HighlightLength: 高光长度，只在 GradientTypeEnum.Radial 时生效
     * Gradient Highlight Length. Only if type is Radial
     */
    h: ValueProperty;

    /**
     * HighlightAngle: 高光角度，只在 GradientTypeEnum.Radial 时生效
     * Highlight Angle. Only if type is Radial
     */
    a: ValueProperty;

    /**
     * GradientColors: 渐变色
     * Gradient Colors
     */
    g: any;

    /**
     * StrokeWidth: 线宽
     * Gradient Stroke Width
     */
    w: ValueProperty;

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
}
