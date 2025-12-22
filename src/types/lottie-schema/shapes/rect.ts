import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';
import type { BaseShape } from './baseShape';

export declare interface Rect extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Rect;

    /**
     * Direction: AE Direction，设置图形绘制方向，比如路径裁剪的方向
     * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
     */
    d: number;

    /**
     * Position: 位置
     * Rect's position
     */
    p: MultiDimensionalProperty;

    /**
     * Size: 大小
     * Rect's size
     */
    s: MultiDimensionalProperty;

    /**
     * RoundedCorners: 圆角
     * Rect's rounded corners
     */
    r?: ValueProperty;
}
