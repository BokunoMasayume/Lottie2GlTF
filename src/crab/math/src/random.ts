export const random = Math.random;

/**
 * 根据符号返回 -1，0，+1。
 */
export function sign(v: number) {
    return ((v > 0) as unknown as number) - ((v < 0) as unknown as number);
}

/**
 * 返回[min,max)范围内的随机数
 * @param min
 * @param max
 * @returns
 */
export function randomRange(min: number, max: number) {
    return random() * (max - min) + min;
}

/**
 * 返回[min,max)之间的随机整数
 * @param min
 * @param max
 * @returns
 */
export function randomRangeInt(min: number, max: number) {
    return Math.floor(randomRange(min, max));
}

/**
 * 通过设置随机种子随机
 * 线性同余算法
 * @param seed
 * @returns
 */
export function sRandom(seed: number): () => number {
    let value = seed;
    return () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280.0;
    };
}

/**
 * 随机正负
 * @returns
 */
export function randomSign() {
    let sgn = randomRange(-1, 1);
    if (sgn === 0) {
        sgn++;
    }
    return sign(sgn);
}

/**
 * 对数组随机排序
 * Fisher–Yates shuffle 洗牌算法
 * @param arr
 */
export function randomSortArray(arr: any[]) {
    for (let i = 0; i < arr.length; i++) {
        const transpose = i + randomRangeInt(0, arr.length - i);
        const val = arr[transpose];
        // eslint-disable-next-line no-param-reassign
        arr[transpose] = arr[i];
        // eslint-disable-next-line no-param-reassign
        arr[i] = val;
    }
}
