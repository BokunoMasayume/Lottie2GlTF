import ShapeTypeEnum from '../enums/shapeTypeEnum';

export declare interface Merge {
    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: typeof ShapeTypeEnum.Merge;

    /**
     * Merge Mode: 合并模式
     * Merge Mode
     */
    mm: number;
}
