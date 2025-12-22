/* eslint-disable no-underscore-dangle */
import { DataWrap } from './DataWrap';

export class CommonVec extends DataWrap<Float32Array, CommonVec> {
    // numComponent: number;

    get numComponent() {
        return this._components.length;
    }

    constructor(arr: number[] | number | Float32Array) {
        super();
        if (arr instanceof Float32Array) {
            this._components = arr;
        } else {
            this._components = new Float32Array(arr as number);
        }
        // this.numComponent = this._components.length;
    }

    override setValue(...args: number[]) {
        const len = args.length;
        if (len !== this.numComponent) {
            this._components = new Float32Array(args);
        } else {
            super.setValue(...args);
        }
    }

    clone() {
        const NUMComponent = this.numComponent;
        const a = new CommonVec(NUMComponent);
        for (let i = 0; i < NUMComponent; i++) {
            a.components[i] = this._components[i];
        }
        return a;
    }
}
