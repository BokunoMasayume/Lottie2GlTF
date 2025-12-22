import type { RuntimeBaseLayer } from './base';
import { LayerType } from '../../schema-enum';

export interface RuntimeAPNGLayer extends RuntimeBaseLayer {
    /**
     * Type: 图层类型，固定值 LayerTypeEnum.APNG
     * Type of layer: APNG.
     */
    ty: LayerType.APNG;

    /**
     * Reference ID: 对资源(Assets ID)的引用
     * ReferenceID
     */
    refId: string;
}
