import { Vec3 } from '@crab/math';
import { ScalarCurve, type ScalarKeyPoint } from './scalarCurve';

export class Vec3Curve {
    result: Vec3 = new Vec3();
    seperateCurves: ScalarCurve[] = [];

    get isConstant() {
        return this.seperateCurves.every((c) => c.isConstant);
    }

    constructor() {
        for (let i = 0; i < 3; i++) {
            this.seperateCurves[i] = new ScalarCurve();
        }
    }

    get(t: number) {
        // const { result } = this;
        const res = new Vec3();
        res.x = this.seperateCurves[0]!.get(t);
        res.y = this.seperateCurves[1]!.get(t);
        res.z = this.seperateCurves[2]!.get(t);
        return res;
    }

    addKeyPoint(kp: ScalarKeyPoint, idx = 0) {
        this.seperateCurves[idx]?.addKeyPoint(kp);
    }

    get endFrame() {
        return this.seperateCurves.reduce((acc, cur) => {
            return Math.max(acc, cur.endFrame);
        }, -Infinity);
    }
}
