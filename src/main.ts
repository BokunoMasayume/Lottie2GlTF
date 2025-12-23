import path from "path";
import fs from "fs";
import { getAnimation } from "./animation";
import { GlTFHelper } from "./gltfHelper";
import { getNodeTreeFromLottie } from "./lottie-parse";
import { getFlattenNodes } from "./lottie-parse/utils";
import { LottieSchema, RuntimeImage } from "./types/lottie-schema";
import { AssetType } from "./types/schema-enum";
import { getGltfTemplate } from "./utils";


export function Lottie2Gltf(lottie: LottieSchema, dstPath: string) {
    const TransScale = 1 / lottie.w;

    // 生成nodes
    const tree = getNodeTreeFromLottie(lottie);

    // 生成动画
    const animation = getAnimation(lottie, tree, lottie.ip, lottie.op);


    // gltf 中的叶子属性有: nodes, animations, skins
    const rawNodes = getFlattenNodes(tree);

    const gltfHelper = new GlTFHelper(TransScale);

    const findNodeIdx = (id: string) => rawNodes.findIndex(node => node.nodeId === id);

    const imgs = (lottie.assets
                .filter(asset => !(asset as any).layers) as RuntimeImage[])
                .map(asset => {
                    return {
                        name: asset.id,
                        uri: asset.u + asset.p,
                        width: asset.w,
                        height: asset.h,
                    }
                });


    const nodes = rawNodes.map(node => {
        let nodeInfo: any = {
            name: node.nodeId,
            
            children: node.children.map(child => findNodeIdx(child.nodeId)),
        };
        if (node.matrix) {
            nodeInfo.matrix = [...node.matrix.components];
        } else {
            nodeInfo.translation = [node.translate.x, node.translate.y, node.translate.z];
            nodeInfo.rotation = [node.rotate.x, node.rotate.y, node.rotate.z, node.rotate.w];
            nodeInfo.scale = [node.scale.x, node.scale.y, node.scale.z];
        }
        let imgId = ''
        if (node.drawImageId && !node.hasAnchor) {
            imgId = node.drawImageId;
        } else if (node.isAnchor && node.parent?.drawImageId) {
            imgId = node.parent.drawImageId;
        }
        if (imgId) {
            const img = imgs.find(img => img.name === imgId)!;
            nodeInfo.mesh = gltfHelper.createMesh(imgId, img.uri, img.width, img.height);
        }
        
        return nodeInfo;
    });

    // animations
    const timelineIdx = gltfHelper.createAccessor(gltfHelper.createTypedArray(animation.timeline), 1);
    const samplers: any[] = [];
    const channels: any[] = [];
    animation.animations.forEach(anim => {
        samplers.push({
            input: timelineIdx,
            output: gltfHelper.createAccessor(gltfHelper.createTypedArray(anim.keyframes as any), anim.target === 'translation' ? 3 : anim.target === 'rotation' ? 4 : anim.target === 'scale' ? 3 : 1),
            interpolation: 'LINEAR',
        });
        channels.push({
            sampler: samplers.length - 1,
            target: {
                node: findNodeIdx(anim.node.nodeId),
                path: anim.target,
            }
        });
    });
    const animations = [{
        name: 'default',
        channels,
        samplers,
    }];

    const gltf = {
        ...getGltfTemplate(),
        buffers: gltfHelper.buffers,
        bufferViews: gltfHelper.bufferViews,
        accessors: gltfHelper.accessors,
        images: gltfHelper.images,
        textures: gltfHelper.textures,
        materials: gltfHelper.materials,
        meshes: gltfHelper.meshes,
        nodes,
        animations,
    };

    const dstBinPath = path.join(dstPath, '../buffer.bin');
    fs.writeFileSync(dstPath, JSON.stringify(gltf), {
        encoding: 'utf8',
        flag: 'w+',
    });

    gltfHelper.rawBufferViews.forEach(bufferView => {
        const buf = new Uint8Array(bufferView.buffer);
        fs.appendFileSync(dstBinPath, buf, {
            flag: 'a+',
        });
    });

}