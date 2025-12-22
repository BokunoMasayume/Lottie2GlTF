import type { RuntimeMask } from '../helpers/mask';
import type { RuntimeBaseLayer } from './base';
import { LayerType, BooleanType } from '../../schema-enum';

export interface RuntimeSolidLayer extends RuntimeBaseLayer {
    /**
     * Type: 图层类型，固定值 LayerTypeEnum.Solid
     * Type of layer: Solid.
     */
    ty: LayerType.Solid;

    /**
     * Blend Mode: 混合模式，默认值 BlendModeEnum.Normal
     * Blend Mode
     */
    // TODO 需要补充 blendModeEnum
    bm: any;

    /**
     * Solid Color: 图层颜色(十六进制)
     * Color of the solid in hex
     */
    sc: string;

    /**
     * Solid Height: 图层高度
     * Height of the solid.
     */
    sh: number;

    /**
     * Solid Width: 图层宽度
     * Width of the solid.
     */
    sw: number;

    /**
     * Has Masks: 是否有遮罩，用于判断是否需要检测 masksProperties 属性
     * Boolean when layer has a mask. Will be deprecated in favor of checking masksProperties.
     */
    hasMask?: BooleanType;

    /**
     * Masks Properties: 遮罩列表
     * List of Masks
     */
    masksProperties?: RuntimeMask[];
}
