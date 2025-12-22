/**
 * 遮罩模式
 * Mask mode. Not all mask types are supported.
 */
declare enum MaskModeEnum {
    None = 'n',

    Additive = 'a',

    Subtract = 's',

    Intersect = 'i',

    Lighten = 'l',

    Darken = 'd',

    Difference = 'f',
}

export default MaskModeEnum;
