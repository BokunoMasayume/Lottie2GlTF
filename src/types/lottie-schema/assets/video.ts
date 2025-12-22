import type { RuntimeBaseAsset } from './base';
import { AssetType, BooleanType } from '../../schema-enum';

export interface RuntimeVideo extends RuntimeBaseAsset {
    /**
     * Type: 资源类型
     * Type of asset
     */
    ty: AssetType.Video;

    /**
     * VideoHeight: 视频高度
     * Video Height
     */
    h: number;

    /**
     * VideoWidth: 视频宽度
     * Video Width
     */
    w: number;

    /**
     * VideoName: 视频名称
     * Video name
     */
    p: string;

    /**
     * VideoPath: 视频地址
     * Video path
     */
    u: string;

    /**
     * Absolute Path?: 是否绝对路径
     * Absolute Path
     */
    e?: BooleanType;

    /**
     * preAlpha: 是否预透明
     * preAlpha
     */
    pa?: BooleanType;

    /**
     * compressAlpha: 透明通道是否被压缩
     * compressAlpha
     */
    ca?: BooleanType;
}
