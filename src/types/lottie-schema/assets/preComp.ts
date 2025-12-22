import type { RuntimeBaseAsset } from './base';
import { AssetType } from '../../schema-enum';
import type { RuntimeLayers } from '../layer';

export interface RuntimePreComp extends RuntimeBaseAsset {
    /**
     * Type: 资源类型
     * Type of asset
     */
    ty?: AssetType.PreComp;

    /**
     * Layers：预合成图层
     * Layers
     */
    layers: RuntimeLayers;

    /**
     * 帧率
     */
    fr?: number;

    /**
     * 合成名字
     */
    nm?: string;
}
