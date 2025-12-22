import type { Shapes } from '.';
import ShapeTypeEnum from '../enums/shapeTypeEnum';

export declare interface Group {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Group;

    /**
     * NumberOfProperties: 组属性号，应用于表达式
     * Group number of properties. Used for expressions.
     */
    np: number;

    /**
     * Items: 组中包含的图
     * Group list of items
     */
    it: Shapes;
}
