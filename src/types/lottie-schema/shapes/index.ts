import type { Ellipse } from './ellipse';
import type { Fill } from './fill';
import type { GFill } from './gFill';
import type { Group } from './group';
import type { GStroke } from './gStroke';
import type { Merge } from './merge';
import type { Rect } from './rect';
import type { Repeater } from './repeater';
import type { Round } from './round';
import type { Shape } from './shape';
import type { Star } from './star';
import type { Stroke } from './stroke';
import type { TransformShape } from './transform';
import type { Trim } from './trim';

export type Shapes = (
    | Ellipse
    | Fill
    | GFill
    | Group
    | GStroke
    | Merge
    | Rect
    | Repeater
    | Round
    | Shape
    | Star
    | Stroke
    | TransformShape
    | Trim
)[];
