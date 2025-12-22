/* eslint-disable no-underscore-dangle */
import { DataWrap } from './DataWrap';

export class Vec2 extends DataWrap<Float32Array> {
    constructor(x?: number, y?: number) {
        super();
        this._components = new Float32Array([x ?? 0, y ?? 0]);
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

    setValue(x: number, y: number) {
        this._components[0] = x;
        this._components[1] = y;
        return this;
    }

    add(v: Vec2) {
        this._components[0] += v.components[0];
        this._components[1] += v.components[1];
        return this;
    }

    scale(s: number) {
        this._components[0] *= s;
        this._components[1] *= s;
        return this;
    }

    copy(v: Vec2) {
        this._components[0] = v.components[0];
        this._components[1] = v.components[1];
        return this;
    }

    lengthSq() {
        let len = 0;
        for (let i = 0; i < 2; i++) {
            len += this._components[i] * this._components[i];
        }
        return len;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    toString() {
        return `(${this.x},${this.y})`;
    }

    clone() {
        const a = new Vec2(...this._components);
        return a;
    }
}
