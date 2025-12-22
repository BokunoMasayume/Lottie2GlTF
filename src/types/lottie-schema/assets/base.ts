import { AssetType, BooleanType } from '../../schema-enum';

export interface RuntimeBaseAsset {
    /**
     * AssetID: 资源唯一ID
     * Asset ID
     */
    id: string;

    /**
     * Type: 资源类型
     * Type of asset
     */
    ty?: AssetType;

    p?: string;

    u?: string;

    e?: BooleanType;

    /**
     * KS内部播放器需要的扩展属性，0: 图片 1: 视频 2: apng
     */
    r?: number;

    /**
     * preAlpha: 是否预透明
     * preAlpha
     */
    pa?: BooleanType;
}
