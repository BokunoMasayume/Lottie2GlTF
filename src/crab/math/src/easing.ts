/* eslint-disable no-param-reassign */
import { DataWrap } from './DataWrap';
import { Quaternion } from './Quaternion';
import { Vec4 } from './Vec4';

/**
 * 四元数差值
 * reference: https://krasjet.github.io/quaternion/quaternion.pdf
 */
export function slerp(t: number, a: Vec4, b: Vec4, res?: Vec4) {
    res = res ?? new Vec4();
    const ax = a.components[0];
    const ay = a.components[1];
    const az = a.components[2];
    const aw = a.components[3];
    let bx = b.components[0];
    let by = b.components[1];
    let bz = b.components[2];
    let bw = b.components[3];
    let omega;
    let cosom;
    let sinom;
    let scale0;
    let scale1;
    cosom = ax * bx + ay * by + az * bz + aw * bw;

    if (cosom < 0) {
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    if (1 - cosom > 0.00001) {
        // 真正的slerp
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        // 当角度很小的时候， 用lerp近似
        scale0 = 1.0 - t;
        scale1 = t;
    }
    res.components[0] = scale0 * ax + scale1 * bx;
    res.components[1] = scale0 * ay + scale1 * by;
    res.components[2] = scale0 * az + scale1 * bz;
    res.components[3] = scale0 * aw + scale1 * bw;
    return res;
}

export class Easing {
    static step(t: number, previousValue: number, nextValue: number): any;
    static step<T extends DataWrap<any>>(t: number, previousValue: T, nextValue: T, res?: T) {
        if (res) {
            const len = res.components.length;
            for (let i = 0; i < len; i++) {
                res.components[i] = previousValue.components[i];
            }
        }
        return res ?? previousValue;
    }

    static linear(t: number, previousValue: number, nextValue: number): any;
    static linear<T extends DataWrap<any>>(t: number, previousValue: T, nextValue: T, res?: T) {
        if (typeof previousValue === 'number' && typeof nextValue === 'number') {
            return (1 - t) * previousValue + t * nextValue;
        } else if (res) {
            if (previousValue instanceof Quaternion && nextValue instanceof Quaternion) {
                return slerp(t, previousValue, nextValue, res as any);
            } else {
                const len = previousValue.components.length;
                for (let i = 0; i < len; i++) {
                    res.components[i] = (1 - t) * previousValue.components[i] + t * nextValue.components[i];
                }
                return res;
            }
        }
    }

    /**
     *
     * reference
     * https://zhuanlan.zhihu.com/p/268030358
     * https://github.com/KhronosGroup/glTF/tree/master/specification/2.0?ts=4#appendix-c-spline-interpolation
     * @param t
     * @param previousValue
     * @param nextValue
     * @param previousTan 注意, 这里是缩放(乘以)time_k+1 - time_k 之后的
     * @param nextTan 注意, 这里是缩放(乘以)time_k+1 - time_k 之后的
     */
    static cubicSpline(t: number, previousValue: number, nextValue: number, previousTan: number, nextTan: number): any;
    static cubicSpline<T extends DataWrap<any>>(
        t: number,
        previousValue: T,
        nextValue: T,
        previousTan: T,
        nextTan: T,
        res?: T,
    ) {
        const p0 = previousValue;
        const p1 = nextValue;
        const m0 = previousTan;
        const m1 = nextTan;
        const t2 = t * t;
        const t3 = t2 * t;
        if (typeof p0 === 'number' && typeof p1 === 'number' && typeof m0 === 'number' && typeof m1 === 'number') {
            return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
        } else if (res) {
            const len = previousValue.components.length;
            for (let i = 0; i < len; i++) {
                res.components[i] =
                    p0.components[i] * (2 * t3 - 3 * t2 + 1) +
                    m0.components[i] * (t3 - 2 * t2 + t) +
                    p1.components[i] * (-2 * t3 + 3 * t2) +
                    m1.components[i] * (t3 - t2);
            }
            return res;
        }
    }
}
