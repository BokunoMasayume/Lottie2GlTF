import type { AnimaClass } from '../keyPoints';
import type { LottieSchema } from './lottie-schema';

export type SequenceInfo = {
    /**
     * 所处comp的id, 如果在根目录就是root
     */
    id: string;
    /**
     * 帧率
     */
    fps: number;

    /**
     * 宽度
     */
    width: number;

    /**
     * 高度
     */
    height: number;

    /**
     * 帧id列表
     */
    frames: string[];
};

export type LottieRawAsset = {
    // lottie json
    entryName: string;
    files: {
        // filepath 是路径, 而不只是文件名
        [filepath: string]: File;
    };
};

export type LottieExportAsset = {
    entryName: string;
    files: {
        [filepath: string]: File | LottieSchema;
    };
};

export type SequencesInfo = {
    // 是否除了序列帧(们)没有其他可展示元素
    isPure: boolean;
    sequences: SequenceInfo[];
};

export type LottieEventMap = {
    enterFrame: { type: 'enterFrame'; currentTime: number; totalTime: number; direction: number };
    loopComplete: { type: 'loopComplete'; currentLoop: number; totalLoops: number; direction: number };
    complete: { type: 'complete'; direction: number };
};

/**
 * 参与
 */

type Dimension = 'X' | 'Y' | 'Z';
type Transform = 'translate' | 'rotate' | 'scale';
export type AnimatedProp = 'opacity' | `${Transform}${Dimension | '' | '3d'}`;

export type Vector3 = [number, number, number];
export type Vector2 = [number, number];
export type Scalar = number;
export type PropKeyframeInfo<T extends Scalar | Vector3 | Vector2> = {
    startFrame: number;
    endFrame: number;
    startValue: T;
    endValue: T;

    // easing
    ox: number;
    oy: number;
    ix: number;
    iy: number;

    // [ox, oy, ix, iy]
    pathBezOut?: T;
    pathBezIn?: T;
};

export type PropAnimaInfo<T extends AnimatedProp, R extends Scalar | Vector3 | Vector2 = any> = {
    name: T;
    startFrame: number;
    endFrame: number;
    // 有序的!
    keyFrames: PropKeyframeInfo<R>[];
};
export type LayerAimationInfo = {
    width: number;
    height: number;
    startFrame: number;
    endFrame: number;
    animation: AnimaClass[];
    anchor: [number, number];
};

export type KeyPoint = {
    frame: number;
    props: {
        [name: string]: Scalar | Vector3 | Vector2;
    };
};

export type AnimationGroup = {
    hasTransform: boolean;
    // startFrame: number;
    // endFrame: number;
    easingFunc: string;
    // easingFunc: 'linear' | `cubic-bezier(${string}`;
    keyFrames: PropAnimaInfo<any>[];
};
