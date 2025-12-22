import { Layer } from './layer';
import { Angle } from './angle';
import { CheckBox } from './checkBox';
import { Color } from './color';
import { CustomValue } from './customValue';
import { DropDown } from './dropDown';
import { Fill } from './fill';
import { Group } from './group';
import { NoValue } from './noValue';
import { Point } from './point';
import { ProLevels } from './proLevels';
import { Slider } from './slider';
import { Stroke } from './stroke';
import { Tint } from './tint';
import { Tritone } from './tritone';

type Effect =
    | Slider
    | Angle
    | Color
    | Point
    | CheckBox
    | Group
    | NoValue
    | DropDown
    | CustomValue
    | Layer
    | Tint
    | Fill
    | Stroke
    | Tritone
    | ProLevels;
type Effects = Effect[];

export default Effects;
