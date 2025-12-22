import { getAnimation } from "./animation";
import { Node } from "./lottie-parse/node";

export const getGltfTemplate = (nm?: string) => {
    return {
        scene: 0,
        scenes: [
            {
                name: 'main scene',
                nodes: [0],
            },
        ],
        asset: {
            generator: 'lottie2gltf v0.0.0',
        },
        buffers: [
            // {
            //     // 之后添加, 目前版本只有一个
            //     // uri
            //     // byteLength
            // }
        ],
        bufferViews: [
            // {
            //     buffer: 0,
            //     // byteLength
            //     byteOffset: 0,
            //     //target:
            // }
        ],
        accessors: [
            // {
            //     // componentType
            //     // type: SCALAR vEC3 VEC2...
            //     // count
            //     // bufferView
            //     // byteOffset
            //     // min
            //     // max
            // }
        ],
        images: [
            // {
            //     // name: "name"
            //     // uri: ''
            // }
        ],
        samplers: [{}],
        textures: [],
        materials: [],
        meshes: [],
        nodes: [],
        animations: [
            {
                name: nm ?? 'default',
                channels: [],
                samplers: [],
            },
        ],
    };
};



export function generateGlTF(tree: Node, animation: ReturnType<typeof getAnimation>) {

    
}