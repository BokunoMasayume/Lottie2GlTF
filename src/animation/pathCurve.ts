import { Vec3 } from '@crab/math';
import { getBezierEasing } from './bezierEasing';
import { bez } from './pathBezier';

export type Vec3KeyPoint = {
    value: Vec3;
    time: number;
    i?: number[];
    o?: number[];
    ti?: number[];
    to?: number[];
};

export class PathCurve {
    result: Vec3 = new Vec3();

    keyPoints: Vec3KeyPoint[] = [];

    // 上次调用get获得数值对应的bezier percent 局部的
    lastResultBezPercent = 0;

    get isConstant() {
        return this.keyPoints.length <= 1;
    }
    get(t: number) {
        const res = new Vec3();
        if (this.keyPoints.length < 1) return res;
        const firstKeyPoint = this.keyPoints[0]!;
        const lastKeyPoint = this.keyPoints[this.keyPoints.length - 1]!;
        if (t <= firstKeyPoint.time) {
            return res.copy(firstKeyPoint.value);
        } else if (t >= lastKeyPoint.time) {
            return res.copy(lastKeyPoint.value);
        }
        let prevIdx = 0;
        for (let i = 0; i < this.keyPoints.length; i++) {
            const ckp = this.keyPoints[i]!;
            const nkp = this.keyPoints[i + 1];
            if (ckp.time <= t && nkp && nkp.time >= t) {
                prevIdx = i;
                break;
            }
        }
        const pkp = this.keyPoints[prevIdx]!;
        const nkp = this.keyPoints[prevIdx + 1]!;
        let percent = (t - pkp.time) / (nkp.time - pkp.time);
        const bezierEasing = getBezierEasing(
            pkp.o?.[0] ?? 0.33,
            pkp.o?.[1] ?? 0.33,
            nkp.i?.[0] ?? 0.66,
            nkp.i?.[1] ?? 0.66,
        );
        percent = bezierEasing.get(percent);

        res.x = pkp.value.components[0]! * (1 - percent) + nkp.value.components[0]! * percent;
        res.y = pkp.value.components[1]! * (1 - percent) + nkp.value.components[1]! * percent;
        res.z = pkp.value.components[2]! * (1 - percent) + nkp.value.components[2]! * percent;
        this.lastResultBezPercent = percent;
        if (pkp.to && pkp.ti) {
            const newValue = this.calcPath(pkp, nkp, percent);
            // res.x = newValue[0] ?? 0;
            // res.y = newValue[1] ?? 0;
            // res.z = newValue[2] ?? 0;
            res.setValue(...(newValue as [number, number, number]));
        }
        return res;
    }

    addKeyPoint(kp: Vec3KeyPoint) {
        // TODO 排序
        this.keyPoints.push(kp);
    }

    calcPath(pkp: Vec3KeyPoint, nkp: Vec3KeyPoint, percent: number) {
        const bezierData = bez.buildBezierData(
            Array.from(pkp.value.components),
            Array.from(nkp.value.components),
            pkp.to!,
            pkp.ti!,
        );
        const distanceInLine = bezierData.segmentLength * percent;
        let addedLength = 0;
        let j = 0;
        let flag = true;
        const jLen = bezierData.points.length;
        let kLen = -1;
        let k = -1;
        const newValue: number[] = [];
        while (flag) {
            addedLength += bezierData.points[j]!.partialLength;
            if (distanceInLine === 0 || percent === 0 || j === bezierData.points.length - 1) {
                kLen = bezierData.points[j]!.point.length;
                for (k = 0; k < kLen; k++) {
                    newValue[k] = bezierData.points[j]!.point[k]!;
                }
                break;
            } else if (
                distanceInLine >= addedLength &&
                distanceInLine < addedLength + bezierData.points[j + 1]!.partialLength
            ) {
                const segPerc = (distanceInLine - addedLength) / bezierData.points[j + 1]!.partialLength;

                this.lastResultBezPercent =
                    bezierData.points[j + 1]!.bezPercent * segPerc + bezierData.points[j]!.bezPercent * (1 - segPerc);
                kLen = bezierData.points[j]!.point.length;
                for (k = 0; k < kLen; k++) {
                    newValue[k] =
                        bezierData.points[j]!.point[k]! +
                        (bezierData.points[j + 1]!.point[k]! - bezierData.points[j]!.point[k]!) * segPerc;
                }
                break;
            }
            if (j < jLen - 1) {
                j++;
            } else {
                flag = false;
            }
        }
        return newValue;
    }

    get endFrame() {
        return this.keyPoints[this.keyPoints.length - 1]!.time;
    }
}
