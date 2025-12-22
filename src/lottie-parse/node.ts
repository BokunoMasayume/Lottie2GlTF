import { Quaternion, Vec3 } from "@crab/math";
import { RuntimeLayer } from "../types/lottie-schema";
import { Layer } from "../types/lottie-schema/effects/layer";

// 中间格式, 会实际扩展为NODE和anchor两个gltf的node
export class Node {

    private static currentNodeId = 0;
    static generateNodeId() {
        this.currentNodeId += 1;
        return this.currentNodeId;
    }
    nodeId: string;
    id: number;

    // 指示是否对应了lottie里的图层
    isInLottie: boolean;

    parent: Node | null;

    hasAnchor = false;
    isAnchor = false;

    // from back to front
    children: Node[] = [];

    // if has valid drawImageId, it means it will be rendered, and has mesh
    drawImageId: string | null = null;

    // bigger is front
    drawOrder = 0;

    layerInfo: RuntimeLayer | null = null;

    translate: Vec3 = new Vec3(0, 0, 0);
    scale: Vec3 = new Vec3(1, 1, 1);
    rotate: Quaternion = new Quaternion(0, 0, 0, 1);

    anchor: Vec3 = new Vec3(0, 0, 0);
    opacity: number = 1;


    constructor(config: {
        id: number,
        isInLottie: boolean,
        parent?: Node,
        drawImageId?: string,
        drawOrder?: number;
    }){
        this.nodeId = Node.generateNodeId()+ '';
        this.id = config.id;
        this.isInLottie = config.isInLottie;
        this.parent = config.parent || null;
        this.drawImageId = config.drawImageId || null;
        this.drawOrder = config.drawOrder || 0;

    }

    get globalId(): string {
        const parentStr = this.parent?.globalId;
        const myStr = this.isInLottie ? `${this.id}` : '';
        if (parentStr && myStr) {
            return `${parentStr}-${myStr}`;
        }
        return parentStr || myStr || '';
    }

    addChild(child: Node){
        child.parent = this;
        this.children.unshift(child);
    }


}