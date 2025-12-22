import CompositeEnum from '../enums/compositeEnum';
import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type { RuntimeTransform } from '../helpers/transform';
import type ValueProperty from '../properties/value';
import type { BaseShape } from './baseShape';

export declare interface Repeater extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Repeater;

    /**
     * Copies: 副本数量，默认值 { "a": 0, "k": 1 }
     * Number of Copies
     */
    c: ValueProperty;

    /**
     * Offset: 副本偏移量，默认值 { "a": 0, "k": 1 }
     * Offset of Copies
     */
    o: ValueProperty;

    /**
     * Composite: 副本混合方式
     * Composite of copies
     */
    m: CompositeEnum;

    /**
     * Transform: 作用于每个副本的变换属性
     * Transform values for each repeater copy
     */
    tr: RuntimeTransform;
}
