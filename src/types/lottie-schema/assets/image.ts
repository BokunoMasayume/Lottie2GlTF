import type { RuntimeBaseAsset } from './base';
import { AssetType, BooleanType } from '../../schema-enum';

export interface RuntimeImage extends RuntimeBaseAsset {
    /**
     * Type: 资源类型
     * Type of asset
     */
    ty?: AssetType.Image;

    /**
     * ImageHeight: 图片高度
     * Image Height
     */
    h: number;

    /**
     * ImageWidth: 图片宽度
     * Image Width
     */
    w: number;

    /**
     * ImageName: 图片名称
     * Image name
     */
    p: string;

    /**
     * ImagePath: 图片地址
     * Image path
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
}
