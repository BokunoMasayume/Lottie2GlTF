import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type { BaseShape } from './baseShape';

/**
 * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
 */
export type Direction = number;

export interface Ellipse extends BaseShape {
    /**
     * Direction: AE Direction，设置图形绘制方向，比如路径裁剪的方向，默认值 1
     * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
     */
    d: Direction;

    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Ellipse;

    /**
     * Position: 位置
     * Ellipse's position
     */
    p: MultiDimensionalProperty;

    /**
     * Size: 大小
     * Ellipse's size
     */
    s: MultiDimensionalProperty;
}
