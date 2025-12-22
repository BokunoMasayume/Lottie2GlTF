import type { RuntimeTransform } from '../helpers/transform';
import type Effects from '../effects';
import { BooleanType, LayerType } from '../../schema-enum';

export interface RuntimeBaseLayer {
    /**
     * Type: 图层类型
     * Type of layer
     */
    ty: LayerType;

    /**
     * Key Frames: 图形变换关键帧
     * Transform properties
     */
    ks: RuntimeTransform;

    /**
     * Auto Orient: 沿路径运动时使自动定向的 AE 属性，默认值 false
     * Auto-Orient along path AE property.
     */
    ao: BooleanType;

    /**
     * 3D: 是否为3D图层，默认值 false
     * 3d layer flag
     */
    ddd: BooleanType;

    /**
     * Index: AE 图层的 Index，被用于图层父级查找和表达式
     * Layer index in AE. Used for parenting and expressions.
     */
    ind: number;

    /**
     * Class: 解析后的图层名称，用作 SVG/HTML 渲染时的标签 class 属性
     * Parsed layer name used as html class on SVG/HTML renderer
     */
    cl?: string;

    /**
     * Layer Name: 解析后的图层名称，用作 SVG/HTML 渲染时的标签 id 属性
     * Parsed layer name used as html id on SVG/HTML renderer
     */
    ln?: string;

    /**
     * In Point: 图层初始帧
     * In Point of layer. Sets the initial frame of the layer.
     */
    ip: number;

    /**
     * Out Point: 图层结束帧
     * Out Point of layer. Sets the final frame of the layer.
     */
    op: number;

    /**
     * Start Time: 图层开始时间
     * Start Time of layer. Sets the start time of the layer.
     */
    st: number;

    /**
     * Name: AE 图层名称，应用于表达式
     * After Effects Layer Name. Used for expressions.
     */
    nm: string;

    /**
     * Stretch: 拉伸，默认值 1
     * Layer Time Stretching
     */
    sr: number;

    /**
     * Parent: 父级图层的 ind
     * Layer Parent. Uses ind of parent.
     */
    parent?: number;

    /**
     * Effects: 图层特效列表
     * List of Effects
     */
    ef?: Effects;

    /**
     * Width: 图层宽度
     * Width
     */
    w?: number;

    /**
     * Height: 图层高度
     * Height
     */
    h?: number;

    // 指示使用蒙层
    tt?: number;

    // 指示作为蒙层使用, 以及蒙层的类型
    td?: number;

    // 指示将哪个图层作为蒙层使用, 不传时默认为上一个图层
    tp?: number;
}
