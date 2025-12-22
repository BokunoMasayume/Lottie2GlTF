import type { RuntimeMask } from '../helpers/mask';
import type { RuntimeBaseLayer } from './base';
import { LayerType, BooleanType } from '../../schema-enum';

export interface RuntimeTextLayer extends RuntimeBaseLayer {
    /**
     * Type: 图层类型，固定值 LayerTypeEnum.Text
     * Type of layer: Text.
     */
    ty: LayerType.Text;

    /**
     * Blend Mode: 混合模式，默认值 BlendModeEnum.Normal
     * Blend Mode
     */
    // TODO 需要补充 blendModeEnum
    bm: any;

    // TODO
    /**
     * Text：文本
     * Text Data
     */
    t: any;

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
