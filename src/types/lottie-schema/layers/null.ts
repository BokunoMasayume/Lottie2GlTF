import type { RuntimeBaseLayer } from './base';
import { LayerType } from '../../schema-enum';

export interface RuntimeNullLayer extends RuntimeBaseLayer {
    /**
     * Type: 图层类型，固定值 LayerTypeEnum.Null
     * Type of layer: Image.
     */
    ty: LayerType.Null;
}
