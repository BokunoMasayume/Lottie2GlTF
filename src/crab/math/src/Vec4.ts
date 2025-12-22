/* eslint-disable no-underscore-dangle */
import { DataWrap } from './DataWrap';

export class Vec4 extends DataWrap<Float32Array> {
    constructor(x?: number, y?: number, z?: number, w?: number) {
        super();
        this._components = new Float32Array([x ?? 0, y ?? 0, z ?? 0, w ?? 1]);
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

    set w(value: number) {
        this._components[3] = value || 0;
    }
    get w() {
        return this._components[3] || 0;
    }

    setValue(x: number, y: number, z: number, w: number) {
        this._components[0] = x;
        this._components[1] = y;
        this._components[2] = z;
        this._components[3] = w;
        return this;
    }

    copy(v: Vec4) {
        this._components[0] = v.components[0];
        this._components[1] = v.components[1];
        this._components[2] = v.components[2];
        this._components[3] = v.components[3];
        return this;
    }

    add(v: Vec4) {
        this._components[0] += v.components[0];
        this._components[1] += v.components[1];
        this._components[2] += v.components[2];
        this._components[3] += v.components[3];
        return this;
    }

    scale(s: number) {
        this._components[0] *= s;
        this._components[1] *= s;
        this._components[2] *= s;
        this._components[3] *= s;
        return this;
    }

    lengthSq() {
        let len = 0;
        for (let i = 0; i < 4; i++) {
            len += this._components[i] * this._components[i];
        }
        return len;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    toString() {
        return `(${this.x},${this.y},${this.z},${this.w})`;
    }

    clone() {
        const a = new (this.constructor as new (...args: any[]) => Vec4)(...this._components);
        return a;
    }
}
