/* eslint-disable no-underscore-dangle */
export abstract class DataWrap<T = Float32Array, R extends DataWrap<T, R> = DataWrap<T, any>> {
    protected _components!: T;

    get components() {
        return this._components;
    }

    abstract clone(): R;

    setValue(...args: number[]) {
        const len = (this._components as Float32Array).length;
        for (let i = 0; i < len; i++) {
            (this._components as Float32Array)[i] = args[i] ?? 0;
        }
    }
}
