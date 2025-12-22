import type { RuntimeImage, RuntimeAPNG, RuntimeVideo, RuntimePreComp, RuntimeSequence } from './assets';

export type RuntimeAsset = RuntimeImage | RuntimeAPNG | RuntimeVideo | RuntimePreComp | RuntimeSequence;
export type RuntimeAssets = RuntimeAsset[];
