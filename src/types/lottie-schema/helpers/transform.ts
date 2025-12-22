import type MultiDimensionalProperty from '../properties/multiDimensional';
import type ValueProperty from '../properties/value';

export type RuntimeTransform = {
    /**
     * Opacity: 不透明度，默认值 { "a": 0, "k": 100 }
     * Transform Opacity
     */
    o: ValueProperty;

    /**
     * Scale: 缩放，默认值 { "a": 0, "k": [100, 100, 100] }
     * Transform Scale
     */
    s: MultiDimensionalProperty;

    /**
     * Anchor Point: 锚点，默认值 { "a": 0, "k": [0, 0, 0] }
     * Transform Anchor Point
     */
    a: MultiDimensionalProperty;

    /**
     * Skew: 斜率，默认值 { "a": 0, "k": 0 }
     * Transform Skew
     */
    sk?: ValueProperty;

    /**
     * Skew Axis: 轴线斜率，默认值 { "a": 0, "k": 0 }
     * Transform Skew Axis
     */
    sa?: ValueProperty;

    /**
     * Rotation: 旋转，默认值 { "a": 0, "k": 0 }
     * Transform Rotation
     */
    r?: ValueProperty;

    // Rotation X: X 轴旋转
    rx?: ValueProperty;

    // Rotation Y: Y 轴旋转
    ry?: ValueProperty;

    // Rotation Z: Z 轴旋转
    rz?: ValueProperty;

    // Rotation: X、Y、Z轴旋转
    or?: MultiDimensionalProperty;

    /**
     * Position: 位置，默认值 { "a": 0, "k": [0, 0, 0] }
     * Transform Position
     */
    p:
        | MultiDimensionalProperty
        | {
              s: boolean;
              x?: ValueProperty;
              y?: ValueProperty;
              z?: ValueProperty;
          };

    /**
     * Position X: X 轴位置，默认值 { "a": 0, "k": 0 }
     * Transform Position X
     */
    px?: ValueProperty;

    /**
     * Position Y: Y 轴位置，默认值 { "a": 0, "k": 0 }
     * Transform Position Y
     */
    py?: ValueProperty;

    /**
     * Position Z: Z 轴位置，默认值 { "a": 0, "k": 0 }
     * Transform Position Z
     */
    pz?: ValueProperty;
};
