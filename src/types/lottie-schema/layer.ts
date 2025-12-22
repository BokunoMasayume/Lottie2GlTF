import type {
    RuntimeAPNGLayer,
    RuntimeImageLayer,
    RuntimeNullLayer,
    RuntimePreCompLayer,
    RuntimeShapeLayer,
    RuntimeSolidLayer,
    RuntimeTextLayer,
    RuntimeTransparentVideoLayer,
    RuntimeSequenceLayer,
    RuntimeCameraLayer,
} from './layers';

export type RuntimeLayer =
    | RuntimeAPNGLayer
    | RuntimeImageLayer
    | RuntimeNullLayer
    | RuntimePreCompLayer
    | RuntimeShapeLayer
    | RuntimeSolidLayer
    | RuntimeTextLayer
    | RuntimeTransparentVideoLayer
    | RuntimeSequenceLayer
    | RuntimeCameraLayer;

export type RuntimeLayers = RuntimeLayer[];
