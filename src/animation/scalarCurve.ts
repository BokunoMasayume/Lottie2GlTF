import { getBezierEasing } from './bezierEasing';

export type ScalarKeyPoint = {
    value: number;
    time: number;
    i?: number[];
    o?: number[];
};

export class ScalarCurve {
    keyPoints: ScalarKeyPoint[] = [];

    get isConstant() {
        return this.keyPoints.length <= 1;
    }

    get(t: number) {
        if (this.keyPoints.length < 1) return 0;

        const firstKeyPoint = this.keyPoints[0]!;
        const lastKeyPoint = this.keyPoints[this.keyPoints.length - 1]!;
        if (t <= firstKeyPoint.time) {
            return firstKeyPoint.value;
        } else if (t >= lastKeyPoint.time) {
            return lastKeyPoint.value;
        } else {
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

            return (1 - percent) * pkp.value + percent * nkp.value;
        }
    }

    addKeyPoint(kp: ScalarKeyPoint) {
        // TODO 排序
        this.keyPoints.push(kp);
    }

    get endFrame() {
        return this.keyPoints[this.keyPoints.length - 1]?.time ?? -Infinity;
    }
}
