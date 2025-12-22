type RemoveReadonly<T> = {
    -readonly [K in keyof T]: T[K];
};

export type BezierElement = {
    addedLength: number;
    percents: RemoveReadonly<ArrayLike<number>>;
    lengths: RemoveReadonly<ArrayLike<number>>;
};
