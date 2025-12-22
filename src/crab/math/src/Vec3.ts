/* eslint-disable no-underscore-dangle */
import { DataWrap } from './DataWrap';
import m4 from './m4';
import type { Mat4 } from './Mat4';
import type { Quaternion } from './Quaternion';

const sqrt = Math.sqrt;
const EPSILON = 0.000001;
export class Vec3 extends DataWrap<Float32Array> {
    // private _components: [number, number, number] = [0, 0, 0];
    constructor(x?: number, y?: number, z?: number) {
        super();
        this._components = new Float32Array([x ?? 0, y ?? 0, z ?? 0]);
    }
    set x(value: number) {
        this._components[0] = value || 0;
    }
    get x() {
        return this._components[0] || 0;
    }

    set y(value: number) {
        this._components[1] = value || 0;
    }
    get y() {
        return this._components[1] || 0;
    }

    set z(value: number) {
        this._components[2] = value || 0;
    }
    get z() {
        return this._components[2] || 0;
    }

    setValue(x: number, y: number, z: number) {
        this._components[0] = x;
        this._components[1] = y;
        this._components[2] = z;
        return this;
    }

    copy(v: Vec3) {
        this._components[0] = v.components[0];
        this._components[1] = v.components[1];
        this._components[2] = v.components[2];
        return this;
    }

    add(v: Vec3) {
        this._components[0] += v.components[0];
        this._components[1] += v.components[1];
        this._components[2] += v.components[2];
        return this;
    }

    minus(v: Vec3) {
        this._components[0] -= v.components[0];
        this._components[1] -= v.components[1];
        this._components[2] -= v.components[2];
        return this;
    }

    scale(s: number) {
        this._components[0] *= s;
        this._components[1] *= s;
        this._components[2] *= s;
        return this;
    }

    length() {
        let len = 0;
        for (let i = 0; i < 3; i++) {
            len += this._components[i] * this._components[i];
        }
        return Math.sqrt(len);
    }

    lengthSq() {
        let len = 0;
        for (let i = 0; i < 3; i++) {
            len += this._components[i] * this._components[i];
        }
        return len;
    }

    applyMat4(m: Mat4) {
        const v0 =
            this._components[0] * m.components[0 * 4 + 0] +
            this._components[1] * m.components[1 * 4 + 0] +
            this._components[2] * m.components[2 * 4 + 0] +
            m.components[3 * 4 + 0];
        const v1 =
            this._components[0] * m.components[0 * 4 + 1] +
            this._components[1] * m.components[1 * 4 + 1] +
            this._components[2] * m.components[2 * 4 + 1] +
            m.components[3 * 4 + 1];
        const v2 =
            this._components[0] * m.components[0 * 4 + 2] +
            this._components[1] * m.components[1 * 4 + 2] +
            this._components[2] * m.components[2 * 4 + 2] +
            m.components[3 * 4 + 2];

        const w =
            this._components[0] * m.components[3] +
            this._components[1] * m.components[7] +
            this._components[2] * m.components[11] +
            m.components[15];
        this._components[0] = v0 / w;
        this._components[1] = v1 / w;
        this._components[2] = v2 / w;
        return this;
    }

    applyMat4Dir(m: Mat4) {
        const v0 =
            this._components[0] * m.components[0 * 4 + 0] +
            this._components[1] * m.components[1 * 4 + 0] +
            this._components[2] * m.components[2 * 4 + 0];
        const v1 =
            this._components[0] * m.components[0 * 4 + 1] +
            this._components[1] * m.components[1 * 4 + 1] +
            this._components[2] * m.components[2 * 4 + 1];
        const v2 =
            this._components[0] * m.components[0 * 4 + 2] +
            this._components[1] * m.components[1 * 4 + 2] +
            this._components[2] * m.components[2 * 4 + 2];
        this._components[0] = v0;
        this._components[1] = v1;
        this._components[2] = v2;
        return this;
    }

    transformQuat(q: Quaternion) {
        const ix = q.w * this.x + q.y * this.z - q.z * this.y;
        const iy = q.w * this.y + q.z * this.x - q.x * this.z;
        const iz = q.w * this.z + q.x * this.y - q.y * this.x;
        const iw = -q.x * this.x - q.y * this.y - q.z * this.z;

        this.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
        this.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
        this.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
        return this;
    }

    dot(b: Vec3) {
        return this.x * b.x + this.y * b.y + this.z * b.z;
    }

    cross(b: Vec3, out?: Vec3) {
        const res = out ?? new Vec3();
        m4.cross(this.components, b.components, res.components);
        return res;
    }

    /**
     * 两点之间距离的平方
     * @param a
     * @param b
     * @returns
     */
    public static squaredDistance(a: Vec3, b: Vec3) {
        const x = b.x - a.x;
        const y = b.y - a.y;
        const z = b.z - a.z;
        return x * x + y * y + z * z;
    }

    /**
     * 两点之间的距离
     * @param a
     * @param b
     * @returns
     */
    public static distance(a: Vec3, b: Vec3) {
        return sqrt(Vec3.squaredDistance(a, b));
    }

    /**
     * 向量叉积（向量积）
     */
    public static cross(a: Vec3, b: Vec3, out?: Vec3) {
        if (out === undefined) {
            // eslint-disable-next-line no-param-reassign
            out = new Vec3();
        }
        out.setValue(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
        return out;
    }

    public static strictEquals(a: Vec3, b: Vec3) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }

    public static equals(a: Vec3, b: Vec3, epsilon = EPSILON) {
        return (
            Math.abs(a.x - b.x) <= epsilon * Math.max(1.0, Math.abs(a.x), Math.abs(b.x)) &&
            Math.abs(a.y - b.y) <= epsilon * Math.max(1.0, Math.abs(a.y), Math.abs(b.y)) &&
            Math.abs(a.z - b.z) <= epsilon * Math.max(1.0, Math.abs(a.z), Math.abs(b.z))
        );
    }

    /**
     * 将当前向量的各个分量取反
     */
    public negative() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }

    normalize() {
        const len = this.length();
        this.scale(1 / len);
        return this;
    }

    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }

    clone() {
        const a = new Vec3(...this._components);
        return a;
    }
}
