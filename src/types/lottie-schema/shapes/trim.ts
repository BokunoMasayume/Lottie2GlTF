import ShapeTypeEnum from '../enums/shapeTypeEnum';
import type ValueProperty from '../properties/value';
import type { BaseShape } from './baseShape';

export declare interface Trim extends BaseShape {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Trim;

    /**
     * Start: 修剪起始点
     * Trim Start.
     */
    s: ValueProperty;

    /**
     * End: 修剪结束点
     * Trim End.
     */
    e: ValueProperty;

    /**
     * Opacity: 不透明度
     * Trim Offset.
     */
    o: ValueProperty;
}
