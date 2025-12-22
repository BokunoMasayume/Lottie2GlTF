/* eslint-disable no-underscore-dangle */
import { DataWrap } from './DataWrap';

export class Mat3 extends DataWrap<Float32Array> {
    constructor(
        a1?: number,
        a2?: number,
        a3?: number,
        b1?: number,
        b2?: number,
        b3?: number,
        c1?: number,
        c2?: number,
        c3?: number,
    ) {
        super();
        this._components = new Float32Array([
            a1 ?? 1,
            a2 ?? 0,
            a3 ?? 0,
            b1 ?? 0,
            b2 ?? 1,
            b3 ?? 0,
            c1 ?? 0,
            c2 ?? 0,
            c3 ?? 1,
        ]);
    }

    clone() {
        const a = new Mat3(...this.components);
        return a;
    }
}
