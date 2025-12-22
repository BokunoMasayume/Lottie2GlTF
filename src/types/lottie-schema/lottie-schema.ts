import type { BooleanType } from '../schema-enum';
import type { RuntimeLayer } from './layer';
import type { RuntimeAsset } from './asset';
export * from './shapes';
export interface LottieSchema {
    /**
     * Version: Adobe After Effects 插件 Bodymovin 的版本
     * Bodymovin Verssion
     */
    v: string; // version

    /**
     * Name: 动画名称
     * Animation name
     */
    nm: string; // name

    /**
     * Width: 动画容器宽度
     * Animation Width
     */
    w: number; // width

    /**
     * Height: 动画容器高度
     * Animation Height
     */
    h: number; // height

    /**
     * Frame Rate: 动画帧率
     * Frame Rate
     */
    fr: number; // fps

    /**
     * In Point: 动画起始帧
     * In Point of the Time Ruler. Sets the initial Frame of the animation.
     */
    ip: number; // startFrame

    /**
     * Out Point: 动画结束帧
     * Out Point of the Time Ruler. Sets the final Frame of the animation
     */
    op: number; // endFrame

    /**
     * 3D: 是否含有3D特效
     * Animation has 3-D layers
     */
    ddd: BooleanType;

    /**
     * Layers: 特效图层
     * List of Composition Layers
     */
    layers: RuntimeLayer[]; // layers

    /**
     * Assets: 可被复用的资源
     * source items that can be used in multiple places. Comps and Images for now.
     */
    assets: RuntimeAsset[]; // assets

    /**
     * Chars: 文本图层使用的字符集
     * source chars for text layers
     */
    chars?: any;

    /**
     * Markers: 遮罩
     * TODO: 官方文档并没有在Root中定义markers，5.6.10版本存在此属性，先加上并标记为可选
     */
    markers?: any;

    fonts?: any;
}
