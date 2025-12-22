import type { RuntimeTransform } from '../helpers/transform';

export declare interface TransformShape extends Omit<RuntimeTransform, 'px' | 'py' | 'pz' | 'rx' | 'ry' | 'rz'> {
    /**
     * Name: AE 名称，使用与表达式
     * After Effect's Name. Used for expressions.
     */
    name: string;
}
