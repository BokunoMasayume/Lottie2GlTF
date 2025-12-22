const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;

const kSplineTableSize = 11;
const kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

// var float32ArraySupported = typeof Float32Array === 'function';

function A(aA1: number, aA2: number) {
    return 1.0 - 3.0 * aA2 + 3.0 * aA1;
}
function B(aA1: number, aA2: number) {
    return 3.0 * aA2 - 6.0 * aA1;
}
function C(aA1: number) {
    return 3.0 * aA1;
}

export class BezierEasing {
    points: number[];
    mSampleValues = new Float32Array(kSplineTableSize);
    precomputed = false;
    constructor(points: number[]) {
        this.points = points;

        const mX1 = this.points[0]!;
        const mY1 = this.points[1]!;
        const mX2 = this.points[2]!;
        const mY2 = this.points[3]!;
        if (!this.precomputed) this.precompute();
    }

    isLinear() {
        const mX1 = this.points[0]!;
        const mY1 = this.points[1]!;
        const mX2 = this.points[2]!;
        const mY2 = this.points[3]!;
        return mX1 === mY1 && mX2 === mY2;
    }

    // 公共方法
    get(x: number) {
        const mX1 = this.points[0]!;
        const mY1 = this.points[1]!;
        const mX2 = this.points[2]!;
        const mY2 = this.points[3]!;
        if (!this.precomputed) this.precompute();
        if (mX1 === mY1 && mX2 === mY2) return x; // linear
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (x === 0) return 0;
        if (x === 1) return 1;
        return this.calcBezier(this.getTForX(x), mY1, mY2);
    }

    // 私有方法
    precompute() {
        const mX1 = this.points[0]!;
        const mY1 = this.points[1]!;
        const mX2 = this.points[2]!;
        const mY2 = this.points[3]!;
        this.precomputed = true;
        if (mX1 !== mY1 || mX2 !== mY2) {
            this.calcSampleValues();
        }
    }

    calcSampleValues() {
        const mX1 = this.points[0]!;
        const mX2 = this.points[2]!;
        for (let i = 0; i < kSplineTableSize; ++i) {
            this.mSampleValues[i] = this.calcBezier(i * kSampleStepSize, mX1, mX2);
        }
    }

    getTForX(aX: number) {
        const mX1 = this.points[0]!;
        const mX2 = this.points[2]!;
        const mSampleValues = this.mSampleValues;

        let intervalStart = 0.0;
        let currentSample = 1;
        const lastSample = kSplineTableSize - 1;

        for (
            ;
            currentSample !== lastSample && mSampleValues[currentSample] && mSampleValues[currentSample]! <= aX;
            ++currentSample
        ) {
            intervalStart += kSampleStepSize;
        }
        --currentSample;

        // Interpolate to provide an initial guess for t
        const dist =
            (aX - mSampleValues[currentSample]!) / (mSampleValues[currentSample + 1]! - mSampleValues[currentSample]!);
        const guessForT = intervalStart + dist * kSampleStepSize;
        const initialSlope = this.getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
            return this.newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
            return guessForT;
        }
        return this.binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }

    // 私有工具方法
    calcBezier(aT: number, aA1: number, aA2: number) {
        return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }
    getSlope(aT: number, aA1: number, aA2: number) {
        return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    binarySubdivide(aX: number, aa: number, ab: number, mX1: number, mX2: number) {
        let currentX = 0;
        let currentT = 0;
        let i = 0;
        let aA = aa;
        let aB = ab;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = this.calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            } else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    }

    newtonRaphsonIterate(aX: number, aGuess: number, mX1: number, mX2: number) {
        let aGuessT = aGuess;
        for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
            const currentSlope = this.getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) return aGuessT;
            const currentX = this.calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }
}

const beziers: { [name: string]: BezierEasing } = {};

export function getBezierEasing(a: number, b: number, c: number, d: number, nm?: string) {
    const str = nm ?? `bez_${a}_${b}_${c}_${d}`.replace(/\./g, 'p');
    if (beziers[str]) {
        return beziers[str]!;
    }
    const bezEasing = new BezierEasing([a, b, c, d]);
    beziers[str] = bezEasing;
    return bezEasing;
}
