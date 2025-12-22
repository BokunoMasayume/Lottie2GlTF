import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';

export declare interface Fill {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Fill;

    /**
     * Opacity: 不透明度
     * Fill Opacity
     */
    o: ValueProperty;

    /**
     * Color: 填充颜
     * Fill Color
     */
    c: MultiDimensionalProperty;
}
