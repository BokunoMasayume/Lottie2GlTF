import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type ShapeProperty from '../properties/shape';
import type { BaseShape } from './baseShape';

export type Direction = number;
export declare interface Shape extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Shape;

    /**
     * Direction: AE Direction，设置图形绘制方向，比如路径裁剪的方向
     * After Effect's Direction. Direction how the shape is drawn. Used for trim path for example.
     */
    d: number;

    /**
     * Vertices: Vertices 图形顶点
     * Shape's vertices
     */
    ks: ShapeProperty;
}
