/* eslint-disable no-underscore-dangle */
import { DataWrap } from './DataWrap';
import { Mat3 } from './Mat3';
import { Vec3 } from './Vec3';
import { Vec4 } from './Vec4';
import m4 from './m4';

export class Mat4 extends DataWrap<Float32Array> {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    constructor(
        a1?: number,
        a2?: number,
        a3?: number,
        a4?: number,
        b1?: number,
        b2?: number,
        b3?: number,
        b4?: number,
        c1?: number,
        c2?: number,
        c3?: number,
        c4?: number,
        d1?: number,
        d2?: number,
        d3?: number,
        d4?: number,
    ) {
        super();
        this._components = new Float32Array([
            a1 ?? 1,
            a2 ?? 0,
            a3 ?? 0,
            a4 ?? 0,
            b1 ?? 0,
            b2 ?? 1,
            b3 ?? 0,
            b4 ?? 0,
            c1 ?? 0,
            c2 ?? 0,
            c3 ?? 1,
            c4 ?? 0,
            d1 ?? 0,
            d2 ?? 0,
            d3 ?? 0,
            d4 ?? 1,
        ]);
    }

    override setValue(c: Float32Array | number, ...args: number[]) {
        if (c instanceof Float32Array) {
            this._components = c;
        } else {
            this._components[0] = c;
            // TODO
        }
    }

    copy(m: Mat4) {
        for (let i = 0; i < 16; i++) {
            this._components[i] = m.components[i];
        }
        return this;
    }

    inverse() {
        const a = m4.inverse(this._components);
        this._components = a;
        return this;
    }

    multiply(m: Mat4) {
        const a = m4.multiply(this._components, m.components);
        this._components = a;
        return this;
    }

    leftMultiply(m: Mat4) {
        const a = m4.multiply(m.components, this._components);
        this._components = a;
        return this;
    }

    compose(translate: Vec3, rotation: Vec4, scale: Vec3) {
        this._components = m4.compose(translate.components, rotation.components, scale.components) as Float32Array;
        return this;
    }

    identity() {
        m4.identity(this._components);
        return this;
    }

    setFromTranslation(t: Vec3) {
        // for (let i = 0; i < 16; i++) {
        //     this._components[i] = 0;
        // }
        this.identity();
        this._components[12] = t.components[0];
        this._components[13] = t.components[1];
        this._components[14] = t.components[2];

        return this;
    }

    clone() {
        const a = new Mat4(...this.components);
        return a;
    }

    transformPoint(p: Vec3) {
        const n = new Vec3();
        m4.transformPoint(this.components, p.components, n.components);
        return n;
    }

    transformDirection(d: Vec3) {
        const n = new Vec3();
        m4.transformDirection(this.components, d.components, n.components);
        return n;
    }

    getBasis(out?: Mat3) {
        const res = out ?? new Mat3();
        res.setValue(
            this.components[0],
            this.components[1],
            this.components[2],

            this.components[4],
            this.components[5],
            this.components[6],

            this.components[8],
            this.components[9],
            this.components[10],
        );

        return res;
    }
}
