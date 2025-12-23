import { Mat4, Quaternion, Vec2, Vec3, Vec4, m4 } from '@crab/math';
import { LottieSchema, RuntimeLayer } from "../types/lottie-schema";
import { MultiKeyframeValue } from "../types/lottie-schema/properties/keyframe/multiKeyframe";
import { Vec3Curve } from './vec3Curve';
import { PathCurve } from './pathCurve';
import { ScalarCurve } from './scalarCurve';
import { rangeInclusive } from './utils';
import MultiDimensionalProperty from '../types/lottie-schema/properties/multiDimensional';
import { Node } from '../lottie-parse/node';
import { getLottieBaseInfo } from '../lottie-parse';
import { getFlattenNodes } from '../lottie-parse/utils';


function readFxxkingControllPoint(wrapper: any): [number, number] {
    return [
        wrapper === undefined ? 0 : wrapper.x instanceof Array ? wrapper.x[0]! : wrapper.x,
        wrapper === undefined ? 0 : wrapper.y instanceof Array ? wrapper.y[0]! : wrapper.y,
    ];
}

function collectScalar(curve: ScalarCurve, kf: any[]) {
    const len = kf.length;
    for (let i = 0; i < len; i++) {
        const current = kf[i];
        const prev = kf[i - 1];
        const value =
            current.s === undefined
                ? prev.e === undefined
                    ? 0
                    : prev.e instanceof Array
                    ? prev.e[0]!
                    : prev.e
                : current.s instanceof Array
                ? current.s[0]!
                : current.s;
        curve.addKeyPoint({
            value,
            time: current.t,
            o: readFxxkingControllPoint(current.o),
            i: readFxxkingControllPoint(prev?.i),
        });
    }
}

function generateAnchor(value: RuntimeLayer['ks']): Vec3Curve {
    const res = new Vec3Curve();
    if (value.a === undefined) {
        res.addKeyPoint({ value: 0, time: 0 }, 0);
        res.addKeyPoint({ value: 0, time: 0 }, 1);
        res.addKeyPoint({ value: 0, time: 0 }, 2);
    } else if (!value.a.a) {
        res.addKeyPoint({ value: value.a.k[0]! as number, time: 0 }, 0);
        res.addKeyPoint({ value: value.a.k[1]! as number, time: 0 }, 1);
        res.addKeyPoint({ value: value.a.k[2]! as number, time: 0 }, 2);
    } else {
        throw new Error('还没实现anchor的动画');
    }

    return res;
}

function generateSeperateTranslate(value: any, curve: ScalarCurve) {
    if (!value.a) {
        curve.addKeyPoint({
            value: value.k[0] ?? 0,
            time: 0,
        });
    } else {
        collectScalar(curve, value.k);
    }
}
// eslint-disable-next-line sonarjs/cognitive-complexity
export function generateTranslate(value: RuntimeLayer['ks']): Vec3Curve | PathCurve {
    if (value.p === undefined) {
        return new Vec3Curve();
    } else if ((value.p as any).s) {
        // seperate
        const res = new Vec3Curve();
        value.p.x && generateSeperateTranslate(value.p.x, res.seperateCurves[0]!);
        (value.p as any).y && generateSeperateTranslate((value.p as any).y, res.seperateCurves[1]!);
        (value.p as any).z && generateSeperateTranslate((value.p as any).z, res.seperateCurves[2]!);
        return res;
    } else {
        // not seperate
        const res = new PathCurve();
        if (!(value.p as MultiDimensionalProperty).a) {
            res.addKeyPoint({
                value: new Vec3(...((value.p as any).k as [number, number, number])),
                time: 0,
            });
        } else {
            const position = (value.p as MultiDimensionalProperty).k as MultiKeyframeValue[];
            const len = position.length;
            for (let i = 0; i < len; i++) {
                const current = position[i]!;
                const prev = position[i - 1];
                // TODO @zhangyashan ix/iy 为啥用prev不用current
                const ox: number =
                    current.o === undefined ? 0 : current.o.x instanceof Array ? current.o.x[0]! : current.o.x;
                const oy: number =
                    current.o === undefined ? 0 : current.o.y instanceof Array ? current.o.y[1]! : current.o.y;
                const ix: number = prev?.i === undefined ? 0 : prev.i.x instanceof Array ? prev.i.x[0]! : prev.i.x;
                const iy: number = prev?.i === undefined ? 0 : prev.i.y instanceof Array ? prev.i.y[0]! : prev.i.y;

                res.addKeyPoint({
                    value: new Vec3(...((current.s ?? prev!.e)! as unknown as [number, number, number])),
                    time: current.t,
                    o: [ox, oy],
                    i: [ix, iy],
                    to: current.to,
                    ti: current.ti,
                });
            }
        }
        return res;
    }
}

function generateXRotate(value: RuntimeLayer['ks']): ScalarCurve {
    const xCurve = new ScalarCurve();
    if (value.rx === undefined || value.rx.a === 0) {
        xCurve.addKeyPoint({
            value: (value.rx?.k as number) ?? 0,
            time: 0,
        });
    } else {
        const rotate = value.rx.k;
        collectScalar(xCurve, rotate as any[]);
    }

    return xCurve;
}

function generateYRotate(value: RuntimeLayer['ks']): ScalarCurve {
    const yCurve = new ScalarCurve();
    if (value.ry === undefined || value.ry.a === 0) {
        yCurve.addKeyPoint({
            value: (value.ry?.k as number) ?? 0,
            time: 0,
        });
    } else {
        collectScalar(yCurve, value.ry.k as any[]);
    }
    return yCurve;
}

function generateZRotate(value: RuntimeLayer['ks']): ScalarCurve {
    const zCurve = new ScalarCurve();
    const info = value.rz ?? value.r;
    if (info === undefined || info.a === 0) {
        zCurve.addKeyPoint({
            value: (info?.k as number) ?? 0,
            time: 0,
        });
    } else {
        collectScalar(zCurve, info.k as any[]);
    }

    return zCurve;
}

function generateRotateOrigin(value: RuntimeLayer['ks']): Vec3Curve {
    const res = new Vec3Curve();
    if (value.or === undefined || value.or.a === 0) {
        ((value.or?.k ?? [0, 0, 0]) as number[]).forEach((kv, idx) => {
            res.addKeyPoint(
                {
                    value: kv,
                    time: 0,
                },
                idx,
            );
        });
    } else {
        const origin = value.or.k as MultiKeyframeValue[];
        const len = origin.length;
        for (let i = 0; i < len; i++) {
            const current = origin[i]!;
            const prev = origin[i - 1];
            for (let k = 0; k < 3; k++) {
                res.addKeyPoint(
                    {
                        time: current.t,
                        value: (current.s ?? prev!.e)[k],
                        // TODO @zhangyashan prev current?
                        i: [prev?.i?.x[k] ?? 0, prev?.i?.y[k] ?? 0],
                        o: [current.o?.x[k] ?? 0, current.o?.y[k] ?? 0],
                    },
                    k,
                );
            }
        }
    }
    return res;
}

function generateScale(value: RuntimeLayer['ks']): Vec3Curve {
    const res = new Vec3Curve();
    if (!value.s.a) {
        (value.s.k as number[]).forEach((kv, idx) => {
            res.addKeyPoint(
                {
                    value: kv / 100,
                    time: 0,
                },
                idx,
            );
        });
    } else {
        const scale = value.s.k as MultiKeyframeValue[];
        const len = scale.length;
        for (let i = 0; i < len; i++) {
            const current = scale[i]!;
            const prev = scale[i - 1];
            for (let k = 0; k < 3; k++) {
                res.addKeyPoint(
                    {
                        time: current.t,
                        value: (current.s ?? prev!.e)[k] / 100,
                        i: [prev?.i?.x[k] ?? 0, prev?.i?.y[k] ?? 0],
                        o: [current.o?.x[k] ?? 0, current.o?.y[k] ?? 0],
                    },
                    k,
                );
            }
        }
    }

    return res;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function generateOpacity(value: RuntimeLayer['ks']): ScalarCurve {
    const res = new ScalarCurve();
    if (!value.o?.a) {
        res.addKeyPoint({
            value: (value.o.k as number) / 100,
            time: 0,
        });
    } else {
        const opacity = value.o.k;
        const len = (opacity as any[]).length;
        for (let i = 0; i < len; i++) {
            const current = (opacity as any[])[i]!;
            const prev = (opacity as any[])[i - 1];
            const ox: number =
                current.o === undefined ? 0 : current.o.x instanceof Array ? current.o.x[0]! : current.o.x;
            const oy: number =
                current.o === undefined ? 0 : current.o.y instanceof Array ? current.o.y[1]! : current.o.y;
            const ix: number = prev?.i === undefined ? 0 : prev.i.x instanceof Array ? prev.i.x[0]! : prev.i.x;
            const iy: number = prev?.i === undefined ? 0 : prev.i.y instanceof Array ? prev.i.y[0]! : prev.i.y;

            res.addKeyPoint({
                time: current.t,
                value: (current.s ?? prev?.e ?? 100) / 100,
                i: [ix, iy],
                o: [ox, oy],
            });
        }
    }
    return res;
}

function checkIfNeedCss(layerStart: number, layerEnd: number, curve: Vec3Curve | PathCurve | ScalarCurve) {
    if (curve.isConstant) {
        return false;
    }
    if (curve instanceof Vec3Curve) {
        const firstTime = curve.seperateCurves.reduce((ft, sc) => {
            const ctime = sc.keyPoints[0]?.time ?? Infinity;
            return ft < ctime ? ft : ctime;
        }, Infinity);
        const lastTime = curve.seperateCurves.reduce((lt, sc) => {
            const ctime = sc.keyPoints[sc.keyPoints.length - 1]?.time ?? -Infinity;
            return lt > ctime ? lt : ctime;
        }, -Infinity);

        return !(firstTime > layerEnd && lastTime < layerStart);
    } else {
        const firstTime = curve.keyPoints[0]?.time ?? Infinity;
        const lastTime = curve.keyPoints[curve.keyPoints.length - 1]?.time ?? -Infinity;
        return !(firstTime > layerEnd && lastTime < layerStart);
    }
}


// 获取单图层某一帧的transform, anchor, opacity
function createKeyframeGenerator(
    value: RuntimeLayer['ks'],
    ratio: number,
    sf: number,
    ef: number,
    offset = 0,
) {
    const anchorCurve = generateAnchor(value);
    const translateCurve = generateTranslate(value);
    const scaleCurve = generateScale(value);
    const rotateXCurve = generateXRotate(value);
    const rotateYCurve = generateYRotate(value);
    const rotateZCurve = generateZRotate(value);
    const rotateOCurve = generateRotateOrigin(value);
    const opacityCurve = generateOpacity(value);

    const getKeyframe = (frame: number) => {
        const currentFrame = frame + offset;
        const anchor = anchorCurve.get(currentFrame).scale(ratio);
        const translate = translateCurve.get(currentFrame).scale(ratio);
        const scale = scaleCurve.get(currentFrame);
        const rotateX = rotateXCurve.get(currentFrame);
        const rotateY = rotateYCurve.get(currentFrame);
        const rotateZ = rotateZCurve.get(currentFrame);
        const rotateO = rotateOCurve.get(currentFrame);
        const opacity = opacityCurve.get(currentFrame);
        const needsOpacity = checkIfNeedCss(sf, ef, opacityCurve);

        const transformMat = new Mat4();
        const negAnchor = anchor.clone().negative();
        transformMat.compose(
            translate,
            new Quaternion().fromEuler(-rotateX - rotateO.x, -rotateY - rotateO.y, rotateZ + rotateO.z),
            scale,
        );

        transformMat.multiply(new Mat4().setFromTranslation(negAnchor));

        const rotate = new Quaternion().fromEuler(-rotateX - rotateO.x, -rotateY - rotateO.y, rotateZ + rotateO.z);
        // Anchor在这造成插值问题
        // transformMat.multiply(new Mat4(...Array.from(m4.translation(-anchor.x, -anchor.y, anchor.z))));

        // 修复坐标
        translate.y = -translate.y;
        anchor.x = -anchor.x;
        anchor.z = -anchor.z;

        return {
            // opacity: applyOpacity ? opacity : 1,
            // // opacity: needsOpacity ? opacity : undefined,
            // /** 世界坐标 */
            // // transformMat,

            // anchor,
            opacity: {
                value: opacity,
                isConst: opacityCurve.isConstant
            },
            anchor: {
                value: anchor,
                isConst: anchorCurve.isConstant
            },
            translation: {
                value: translate,
                isConst: translateCurve.isConstant
            },
            scale: {
                value: scale,
                isConst: scaleCurve.isConstant
            },
            rotation: {
                value: rotate,
                isConst: rotateXCurve.isConstant && rotateYCurve.isConstant && rotateZCurve.isConstant
            }
        };
    };
    return getKeyframe;
}

const LayerInter = 0.1;

export type AnimationTarget = 'translation' | 'rotation' | 'scale' | 'opacity';
const getSingleAnimation = (getKeyframe: ReturnType<typeof createKeyframeGenerator>, key: AnimationTarget | 'anchor', startFrame: number, endFrame: number, node: Node) => {
    const keyFrames: Array<number | Vec3 | Quaternion> = []
    for (let i = startFrame; i <= endFrame; i ++) {
        const keyframe = getKeyframe(i);
        if (key === 'translation') {
            keyframe.translation.value.z = (node.drawOrder - node.parentDrawOrder()) * LayerInter;
            // keyframe.translation.value.z = node.drawOrder * LayerInter;
        }
        keyFrames.push(keyframe[key].value);
    }

    return keyFrames;
}

export function getAnimation(lottie: LottieSchema, tree: Node, startFrame: number, endFrame: number) {

    const { frameRate, width } = getLottieBaseInfo(lottie);
    const transScale = 1 / width;

    const animations: Array<{
        node: Node,
        target: AnimationTarget,
        keyframes: Array< number | Vec3 | Quaternion>
    }> = [];

    const flattenNodes = getFlattenNodes(tree);
    
    for (let i = 0; i < flattenNodes.length; i ++) {
        const node = flattenNodes[i]!;
        if (node && node.isInLottie && node.layerInfo) {
            const getKeyframe = createKeyframeGenerator(node.layerInfo.ks, transScale, startFrame, endFrame);
            const start = getKeyframe(startFrame);

            if (start.anchor.isConst && start.rotation.isConst && start.scale.isConst && start.translation.isConst) {
                node.anchor.setValue(start.anchor.value.x, start.anchor.value.y, 0);
                // node.anchor.setValue(start.anchor.value.x, start.anchor.value.y, start.anchor.value.z);
                node.translate.setValue(start.translation.value.x, start.translation.value.y, (node.drawOrder - node.parentDrawOrder()) * LayerInter);
                // node.translate.setValue(start.translation.value.x, start.translation.value.y, node.drawOrder * LayerInter);
                // node.translate.setValue(start.translation.value.x, start.translation.value.y, start.translation.value.z);
                node.scale.setValue(start.scale.value.x, start.scale.value.y, start.scale.value.z);
                node.rotate.setValue(start.rotation.value.x, start.rotation.value.y, start.rotation.value.z, start.rotation.value.w);

                const mat = new Mat4();
                mat.compose(node.translate, node.rotate, node.scale);
                mat.multiply(new Mat4().setFromTranslation(node.anchor));
                node.matrix = mat;
                node.opacity = start.opacity.value;
            } else {
                const children = node.children;
                const anchorNode = new Node({
                    id: -1,
                    globalId: node.globalId + '_anchor',
                    isInLottie: false,
                    parent: node,
                });
                anchorNode.isAnchor = true;
                anchorNode.children = [...children];
                node.hasAnchor = true;
                node.children = [anchorNode];

                node.translate.setValue(start.translation.value.x, start.translation.value.y, (node.drawOrder - node.parentDrawOrder()) * LayerInter);
                // node.translate.setValue(start.translation.value.x, start.translation.value.y, start.translation.value.z);
                node.scale.setValue(start.scale.value.x, start.scale.value.y, start.scale.value.z);
                node.rotate.setValue(start.rotation.value.x, start.rotation.value.y, start.rotation.value.z, start.rotation.value.w);
                anchorNode.opacity = start.opacity.value;
                anchorNode.translate.setValue(start.anchor.value.x, start.anchor.value.y, 0);
                // anchorNode.translate.setValue(start.anchor.value.x, start.anchor.value.y, start.anchor.value.z);


                if (!start.translation.isConst) {
                    const translationKeyframes = getSingleAnimation(getKeyframe, 'translation', startFrame, endFrame, node);
                    animations.push({
                        node,
                        target: 'translation',
                        keyframes: translationKeyframes,
                    })
                }
                if (!start.rotation.isConst) {
                    const rotationKeyframes = getSingleAnimation(getKeyframe, 'rotation', startFrame, endFrame, node);
                    animations.push({
                        node,
                        target: 'rotation',
                        keyframes: rotationKeyframes,
                    })
                }
                if (!start.scale.isConst) {
                    const scaleKeyframes = getSingleAnimation(getKeyframe, 'scale', startFrame, endFrame, node);
                    animations.push({
                        node,
                        target: 'scale',
                        keyframes: scaleKeyframes,
                    })
                }
            }

            if (!start.opacity.isConst) {
                const opacityKeyframes = getSingleAnimation(getKeyframe, 'opacity', startFrame, endFrame, node);
                animations.push({
                    node,
                    target: 'opacity',
                    keyframes: opacityKeyframes,
                })
            }
        }
    }

    const timeline: number[] = [];
    for (let i =0;i <= endFrame - startFrame; i ++) {
        timeline.push(i / frameRate);
    }
    return {
        timeline: timeline,
        animations,
    }

}