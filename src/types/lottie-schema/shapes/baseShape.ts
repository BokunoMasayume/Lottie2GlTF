import ShapeTypeEnum from '../enums/shapeTypeEnum';

export declare interface BaseShape {
    /**
     * Match Name: AE 匹配名称，使用在表达式中
     * After Effect's Name. Used for expressions.
     */
    mn: string;

    /**
     * Name: AE 名称，使用在表达式中
     * After Effect's Name. Used for expressions.
     */
    nm: string;

    /**
     * Type: 图形内容类型
     * Shape content type.
     */
    ty: ShapeTypeEnum;
}
