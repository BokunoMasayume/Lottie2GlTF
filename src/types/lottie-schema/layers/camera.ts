import type { LayerType } from '../../schema-enum';
import type { RuntimeBaseLayer } from './base';

export interface RuntimeCameraLayer extends RuntimeBaseLayer {
    ty: LayerType.Camera;

    bm: any;

    // 相机深度
    pe: any;
}
