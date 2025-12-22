import { getAnimation } from "./animation";
import { getNodeTreeFromLottie } from "./lottie-parse";


export function Lottie2Gltf(lottie: any) {
    const TransScale = 1 / lottie.w;

    // 生成nodes
    const tree = getNodeTreeFromLottie(lottie);

    // 生成动画
    const animation = getAnimation(lottie, tree, lottie.ip, lottie.op);


}