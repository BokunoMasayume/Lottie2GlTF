// TODO import Shape from '../shapes/shape';

export interface RuntimeChar {
    /**
     * Character：字符值
     * Character Value
     */
    ch: string;

    /**
     * Font Family：字体名称
     * Character Font Family
     */
    fFamily: string;

    /**
     * Font Size：字体大小
     * Character Font Size
     */
    size: string;

    /**
     * Font Style：字体样式
     * Character Font Style
     */
    style: string;

    /**
     * Width：字体宽度
     * Character Width
     */
    w?: number;

    // TODO
    /**
     * Data：字体数据
     * Character Data
     */
    data?: any;
}
