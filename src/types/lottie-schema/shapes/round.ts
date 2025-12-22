import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type ValueProperty from '../properties/value';
import type { BaseShape } from './baseShape';

export declare interface Round extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Round;

    /**
     * Radius: 半径
     * Rounded Corner Radius
     */
    r: ValueProperty;
}
