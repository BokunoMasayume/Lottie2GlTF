import { LottieSchema, RuntimePreComp } from "../types/lottie-schema"
import { LayerType } from "../types/schema-enum";
import { Node } from "./node";

export function getLottieBaseInfo(lottie: LottieSchema) {
    return {
        // 宽度 
        width: lottie.w,
        // 高度
        height: lottie.h,
        // 帧率
        frameRate: lottie.fr,
        // 起始帧
        startFrame: lottie.ip,
        // 结束帧
        endFrame: lottie.op,
    }
}

// 每个可绘制(image)node的id为从root到当前precomp的ind, e.g. 0-2, 从后到前
const drawOrder: Node[] = [];

export const getDrawOrder = () => {
    return drawOrder;
}

// TODO 对于precomp的引用layer来说, ip只影响该图层何时展示, 不影响该图层当前播放帧, 影响当前播放帧的是st
/**
 * 
 * @param preComp 
 */
function getNodeTreeFromPreComp(preComp: RuntimePreComp | LottieSchema, lottie: LottieSchema, parentNode: Node|null) {
    const rootNode = parentNode ?? new Node({
        id: -1,
        isInLottie: false,
    });
    const nodes = preComp.layers.map(layer => {
        const node = new Node({
            id: layer.ind,
            isInLottie: true,
            parent: rootNode,
        });
        node.layerInfo = layer;
        return node;
    });

    // 处理同级依赖
    nodes.forEach((node, idx) => {
        const layerInfo = preComp.layers[idx]!;
        if (layerInfo.parent) {
            node.parent = nodes.filter((n) => n.id === layerInfo.parent)[0];
        }
    });

    nodes.forEach((node, idx) => {
        const layerInfo = preComp.layers[idx]!;

        switch(layerInfo.ty) {
            case LayerType.Image:
                node.drawImageId = layerInfo.refId;
                getDrawOrder().unshift(node);
                break;
            case LayerType.PreComp:
                const precompInfo = lottie.assets.filter(ass => ass.id === layerInfo.refId)[0] as RuntimePreComp;
                getNodeTreeFromPreComp(precompInfo, lottie, node);
                break;
            default:
                // 其他的都当null
                break;
        }
    });

    return rootNode;
}

export function getNodeTreeFromLottie(lottie: LottieSchema) {
    const root = getNodeTreeFromPreComp(lottie, lottie, null);

    const drawablePrefis = getDrawOrder().map(n => n.globalId);

    // 遍历树, 如果有node的globalId不是任何drawable的前缀, 则删除该node
    const stack = [root];
    while(stack.length > 0) {
        const node = stack.pop();
        if (node) {
            if (node.isInLottie && node.parent && !drawablePrefis.some(prefix => prefix.startsWith(node.globalId))) {
                node.parent.children = node.parent?.children?.filter(n => n !== node) || [];
            }
            stack.push(...node.children);
        }
    } 

    return root;

}