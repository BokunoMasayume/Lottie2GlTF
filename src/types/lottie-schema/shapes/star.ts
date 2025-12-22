import StarTypeEnum from '../enums/starTypeEnum';
import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';
import type { BaseShape } from './baseShape';

export type Direction = number;
export declare interface Star extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Star;

    /**
     * Direction: AE Direction，设置图形绘制方向，比如路径裁剪的方向
     * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
     */
    d: Direction;

    /**
     * Position: 位置
     * Rect's position
     */
    p: MultiDimensionalProperty;

    /**
     * Inner Radius: 内半径
     * Star's inner radius. (Star only)
     */
    ir: ValueProperty;

    /**
     * Inner Roundness: 内圆度
     * Star's inner radius. (Star only)
     */
    is: ValueProperty;

    /**
     * Outer Radius: 外半径
     * Star's outer radius.
     */
    or: ValueProperty;

    /**
     * Outer Roundness: 外圆度
     * Star's outer roundness.
     */
    os: ValueProperty;

    /**
     * Rotation: 旋转角度
     * Star's rotation.
     */
    r: ValueProperty;

    /**
     * Points: 顶点数量
     * Star's number of points.
     */
    pt: ValueProperty;

    /**
     * Star Type: 星星类型
     * Star's type. Polygon or Star.
     */
    sy: StarTypeEnum;
}
