/**角度转弧度系数 */
const D2R = Math.PI / 180.0;
/**弧度转角度系数 */
const R2D = 180.0 / Math.PI;

/**
 * 把角度换算成弧度。
 */
export function toRadian(a: number) {
    return a * D2R;
}

/**
 * 把弧度换算成角度。
 */
export function toDegree(a: number) {
    return a * R2D;
}

/**
 * 将数值限定在给定范围内，小于min返回min,大于max返回Max
 * @param val
 * @param min
 * @param max
 * @returns
 */
export function clamp(val: number, min: number, max: number) {
    if (min > max) {
        const temp = min;
        // eslint-disable-next-line no-param-reassign
        min = max;
        // eslint-disable-next-line no-param-reassign
        max = temp;
    }
    return val < min ? min : val > max ? max : val;
}
