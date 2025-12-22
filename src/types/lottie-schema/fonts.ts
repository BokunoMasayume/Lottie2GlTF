/**
 * Describes how a font with given settings should be loaded
 */
export type Font = {
    ascent?: Ascent;
    fFamily: FontFamily;
    fName: Name;
    fStyle: FontStyle;
    fPath?: Path;
    fWeight?: Weight;
    fClass?: CSSClass;
    [k: string]: unknown;
};
/**
 * Text will be moved down based on this value
 */
export type Ascent = number;
export type FontFamily = string;
/**
 * Name used by text documents to reference this font, usually it's fFamily followed by fStyle
 */
export type Name = string;
export type FontStyle = string;
export type Path = string;
export type Weight = string;
/**
 * CSS Class applied to text objects using this font
 */
export type CSSClass = string;
