import GradientTypeEnum from '../enums/gradientTypeEnum';
import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';

export declare interface GFill {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.GFill;

    /**
     * Opacity: 不透明度
     * Fill Opacity
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
}
