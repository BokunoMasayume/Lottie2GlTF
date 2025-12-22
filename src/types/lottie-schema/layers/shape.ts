import type { Shape } from '../shapes/shape';
import type { RuntimeBaseLayer } from './base';
import { LayerType } from '../../schema-enum';

export interface RuntimeShapeLayer extends RuntimeBaseLayer {
    /**
     * Type: 图层类型，固定值 LayerTypeEnum.Shape
     * Type of layer: Shape.
     */
    ty: LayerType.Shape;

    /**
     * Blend Mode: 混合模式，默认值 BlendModeEnum.Normal
     * Blend Mode
     */
    bm: any;

    /**
     * Items: 图形元素列表
     * Shape list of items
     * PS：此属性在5.4.2版本中验证存在，在高版本中为shapes
     */
    it?: Shape[];

    /**
     * Items: 图形元素列表
     * Shape list of items
     * PS：在5.6.3版本中发现此属性，官方docs里标注的属性名称是it，两者应该选其一
     */
    shapes?: Shape[];
}
