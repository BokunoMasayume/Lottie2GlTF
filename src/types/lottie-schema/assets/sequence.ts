import type { RuntimeBaseAsset } from './base';
import type { RuntimeBaseLayer } from '../layers';
import { AssetType, BooleanType } from '../../schema-enum';

export interface RuntimeSequence extends RuntimeBaseAsset {
    /**
     * Type: 资源类型
     * Type of asset
     */
    ty?: AssetType.Sequence;

    /**
     * Layers：每一帧
     */
    layers: RuntimeBaseLayer[];

    /**
     * FrameHeight: 序列帧高度
     */
    h?: number;

    /**
     * FrameWidth: 序列帧宽度
     */
    w?: number;

    /**
     * FrameName: 序列帧名称
     */
    p?: string;

    /**
     * FramePath: 序列帧地址
     */
    u?: string;

    /**
     * Absolute Path?: 是否绝对路径
     */
    e?: BooleanType;

    /**
     * FrameForm: 序列帧起始帧
     */
    // form?: number;

    /**
     * FrameTo: 序列帧结束帧
     */
    // to?: number;

    /**
     * FrameRate: 序列帧率
     */
    fps?: number;
}
