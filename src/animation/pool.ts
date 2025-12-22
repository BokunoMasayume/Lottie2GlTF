import type { BezierElement } from './type';
import { createSizedArray, createTypedArray, defaultCurveSegments } from './utils';

function doublePooling<T>(arr: Array<T>) {
    return arr.concat(createSizedArray(arr.length));
}

/**
 * 是对所有贝塞尔曲线使用折线拟似得时候的各个关键点缓存
 */
export class BezierPool {
    maxLength: number;

    length = 0;

    icreate: () => BezierElement;

    irelease?: (e: BezierElement) => void;

    pool: Array<BezierElement>;

    constructor(initialLength: number, create: () => BezierElement, release?: (e: BezierElement) => void) {
        this.maxLength = initialLength;
        this.icreate = create;
        this.irelease = release;
        this.pool = createSizedArray(this.maxLength);
    }

    newElement() {
        let element: BezierElement | undefined;
        if (this.length) {
            this.length -= 1;
            element = this.pool[this.length]!;
        } else {
            element = this.icreate();
        }
        return element;
    }

    release(element: BezierElement) {
        if (this.length === this.maxLength) {
            this.pool = doublePooling(this.pool);
            this.maxLength *= 2;
        }

        if (this.irelease) {
            this.irelease(element);
        }

        this.pool[this.length] = element;
        this.length += 1;
    }
}

const iCreate: () => BezierElement = () => ({
    addedLength: 0,
    percents: createTypedArray('float32', defaultCurveSegments),
    lengths: createTypedArray('float32', defaultCurveSegments),
});
/**
 * 获取BezierPool的工厂函数
 */
export const bezierLengthPool = new BezierPool(8, iCreate);
