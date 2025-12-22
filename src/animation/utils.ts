export const defaultCurveSegments = 300;

export const bmSqrt = Math.sqrt;
export const bmFloor = Math.floor;
function createRegularArray(type: string, len: number) {
    let i = -1;
    const arr: number[] = [];
    let value = 0;
    switch (type) {
        case 'int16':
        case 'uint8c':
            value = 1;
            break;
        default:
            value = 1.1;
            break;
    }
    for (i = 0; i < len; i++) {
        arr.push(value);
    }
    return arr;
}

function createTypedArrayFactory(type: string, len: number) {
    switch (type) {
        case 'float32':
            return new Float32Array(len);
        case 'int16':
            return new Int16Array(len);
        case 'uint8c':
            return new Uint8ClampedArray(len);
        default:
            return createRegularArray(type, len);
    }
}

export function createTypedArray(type: string, len: number) {
    if (typeof Uint8ClampedArray === 'function' && typeof Float32Array === 'function') {
        return createTypedArrayFactory(type, len);
    } else {
        return createRegularArray(type, len);
    }
}

export function createSizedArray<T>(len: number) {
    return Array.from({ length: len }) as T[];
}

export function rangeInclusive(from: number, to: number, step = 1) {
    const result = [];
    for (let i = from; i < to; i += step) {
        result.push(i);
    }
    result.push(to);
    return result;
}
