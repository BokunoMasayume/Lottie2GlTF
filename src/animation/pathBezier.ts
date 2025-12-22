/**
 * port from lottie-web
 */

import { bezierLengthPool } from './pool';
import { bmSqrt, createSizedArray, defaultCurveSegments } from './utils';

const math = Math;

class BezierData {
    segmentLength = 0;
    points: Array<PointData>;
    constructor(length: number) {
        this.segmentLength = length;
        this.points = new Array(length);
    }
}

class PointData {
    partialLength: number;
    point: Array<number>;
    bezPercent: number;
    constructor(partial: number, point: Array<number>, bezPercent = 0) {
        this.partialLength = partial;
        this.point = point;
        this.bezPercent = bezPercent;
    }
}
// TODO line 504

export class PathBezier {
    private storedData: { [name: string]: BezierData } = {};

    // 公共方法
    getSegmentsLength() {
        throw new Error('getSegmentsLength尚未实现');
    }

    getNewSegment() {
        throw new Error('getNewSegment尚未实现');
    }

    getPointInSegment() {
        throw new Error('getPointInSegment尚未实现');
    }

    buildBezierData(pt1: number[], pt2: number[], pt3: number[], pt4: number[]) {
        const bezierName =
            `${pt1[0]!}_${pt1[1]!}_${pt2[0]!}_${pt2[1]!}_${pt3[0]!}_${pt3[1]!}_${pt4[0]!}_${pt4[1]!}`.replace(
                /\./g,
                'p',
            );
        if (!this.storedData[bezierName]) {
            let curveSegments = defaultCurveSegments;
            let k = -1;
            let i = -1;
            let len = 0;
            let ptCoord;
            let perc = -1;
            let addedLength = 0;
            let ptDistance = -1;
            let point: number[] = [];
            let lastPoint: null | number[] = null;
            if (
                pt1.length === 2 &&
                (pt1[0] !== pt2[0] || pt1[1] !== pt2[1]) &&
                this.pointOnLine2D(pt1[0]!, pt1[1]!, pt2[0]!, pt2[1]!, pt1[0]! + pt3[0]!, pt1[1]! + pt3[1]!) &&
                this.pointOnLine2D(pt1[0]!, pt1[1]!, pt2[0]!, pt2[1]!, pt2[0]! + pt4[0]!, pt2[1]! + pt4[1]!)
            ) {
                curveSegments = 2;
            }
            const bezierData = new BezierData(curveSegments);
            len = pt3.length;
            for (k = 0; k < curveSegments; k++) {
                point = createSizedArray<number>(len);
                perc = k / (curveSegments - 1);
                ptDistance = 0;
                for (i = 0; i < len; i++) {
                    ptCoord =
                        (1 - perc) ** 3 * pt1[i]! +
                        3 * (1 - perc) ** 2 * perc * (pt1[i]! + pt3[i]!) +
                        3 * (1 - perc) * perc ** 2 * (pt2[i]! + pt4[i]!) +
                        perc ** 3 * pt2[i]!;
                    point[i] = ptCoord;
                    if (lastPoint !== null) {
                        ptDistance += (point[i]! - lastPoint[i]!) ** 2;
                    }
                }

                ptDistance = bmSqrt(ptDistance);
                addedLength += ptDistance;
                bezierData.points[k] = new PointData(ptDistance, point, perc);
                lastPoint = point;
            }
            bezierData.segmentLength = addedLength;
            this.storedData[bezierName] = bezierData;
        }

        return this.storedData[bezierName]!;
    }

    /**
     * 判断 p3 是否在 p1, p2连成的直线上
     */
    pointOnLine2D(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        const det1 = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
        return det1 > -0.001 && det1 < 0.001;
    }

    pointOnLine3D(
        x1: number,
        y1: number,
        z1: number,
        x2: number,
        y2: number,
        z2: number,
        x3: number,
        y3: number,
        z3: number,
    ) {
        if (z1 === 0 && z2 === 0 && z3 === 0) {
            return this.pointOnLine2D(x1, y1, x2, y2, x3, y3);
        }
        const dist1 = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
        const dist2 = math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2 + (z3 - z1) ** 2);
        const dist3 = math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2 + (z3 - z2) ** 2);
        let diffDist = 0;
        if (dist1 > dist2) {
            if (dist1 > dist3) {
                diffDist = dist1 - dist2 - dist3;
            } else {
                diffDist = dist3 - dist2 - dist1;
            }
        } else if (dist3 > dist2) {
            diffDist = dist3 - dist2 - dist1;
        } else {
            diffDist = dist2 - dist1 - dist3;
        }
        return diffDist > -0.0001 && diffDist < 0.0001;
    }

    // 私有方法
    getBezierLength(pt1: number[], pt2: number[], pt3: number[], pt4: number[]) {
        const curveSegments = defaultCurveSegments;

        let k = -1;
        let i = -1;
        let len = 0;
        let ptCoord = 0;
        let perc = 0;
        let addedLength = 0;
        let ptDistance = -1;
        const point: number[] = [];
        const lastPoint: number[] = [];
        const lengthData = bezierLengthPool.newElement();
        len = pt3.length;
        for (k = 0; k < curveSegments; k++) {
            perc = k / (curveSegments - 1);
            ptDistance = 0;
            for (i = 0; i < len; i++) {
                ptCoord =
                    (1 - perc) ** 3 * pt1[i]! +
                    3 * (1 - perc) ** 2 * perc * pt3[i]! +
                    3 * (1 - perc) * perc ** 2 * pt4[i]! +
                    perc ** 3 * pt2[i]!;
                point[i] = ptCoord;
                if (lastPoint[i] !== null && lastPoint[i] !== undefined) {
                    ptDistance += (point[i]! - lastPoint[i]!) ** 2;
                }
                lastPoint[i] = point[i]!;
            }
            if (ptDistance) {
                ptDistance = bmSqrt(ptDistance);
                addedLength += ptDistance;
            }
            lengthData.percents[k] = perc;
            lengthData.lengths[k] = addedLength;
        }

        lengthData.addedLength = addedLength;
        return lengthData;
    }

    // TODO 没实现
    getDistancePerc(perc: number, bezierData: any) {
        const percents = bezierData.percents;
        const lengths = bezierData.lengths;
    }
}

export const bez = new PathBezier();
