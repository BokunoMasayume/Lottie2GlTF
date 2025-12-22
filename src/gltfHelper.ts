import { Vec3, Vec4 } from "@crab/math";

export enum BufferTarget {
    ARRAY_BUFFER= 34962,
    ELEMENT_ARRAY_BUFFER= 34963,
}

export enum ComponentType {
    BYTE= 5120,
    UNSIGNED_BYTE= 5121,
    SHORT= 5122,
    UNSIGNED_INT= 5125,
    UNSIGNED_SHORT= 5123,
    INT= 5124,
    FLOAT= 5126,
    HALF_FLOAT= 5131,
}
const typeStringMap = {
    1: 'SCALAR',
    2: 'VEC2',
    3: 'VEC3',
    4: 'VEC4',
    9: 'MAT3',
    16: 'MAT4',
} as const;

type TypedArray =
    | Float32Array
    | Uint8Array
    | Uint8ClampedArray
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array;

type BufferViewItem = {
    buffer: number;
    byteLength: number;
    target: BufferTarget;
    byteOffset: number;
};

type AccessorItem = {
    count: number;
    byteOffset: number;
    type: (typeof typeStringMap)[keyof typeof typeStringMap];
    componentType: ComponentType;
    bufferView: number;
};

type ImageItem = {
    name: string;
    uri: string;
};

type TextureItem = {
    name: string;
    sampler: number;
    source: number;
};

type MaterialItem = {
    pbrMetallicRoughness: {
        baseColorTexture: {
            index: number,
            texCoord: number,
        },
        baseColorFactor: [number, number, number, number],
        metallicFactor: number,
        roughnessFactor: number,
    };
}

export class GlTFHelper {
    rawBufferViews: ArrayBufferView[] = [];

    abLength = 0;



    bufferViews: BufferViewItem[] = []
    accessors: AccessorItem[] = []

    images: ImageItem[] = [];
    textures: TextureItem[] = [];
    materials: MaterialItem[] = [];


    createBufferView(byte: ArrayBufferView, target: BufferTarget) {
        const bv: BufferViewItem = {
            buffer: 0,
            byteLength: byte.byteLength,
            target: target,
            byteOffset: this.abLength,
        };
        this.bufferViews.push(bv);
        this.abLength += byte.byteLength;
        return this.bufferViews.length - 1;
    }

    createAccessor(typedarray: TypedArray, itemNum: 1 | 2 | 3 | 4 | 9 | 16, target: BufferTarget = BufferTarget.ARRAY_BUFFER) {
        let componentType: ComponentType;
        if (typedarray instanceof Float32Array) {
            componentType = ComponentType.FLOAT;
        } else if (typedarray instanceof Uint8Array) {
            componentType = ComponentType.UNSIGNED_BYTE;
        } else if (typedarray instanceof Int8Array) {
            componentType = ComponentType.BYTE;
        } else if (typedarray instanceof Uint16Array) {
            componentType = ComponentType.UNSIGNED_SHORT;
        } else if (typedarray instanceof Int16Array) {
            componentType = ComponentType.SHORT;
        } else if (typedarray instanceof Uint32Array) {
            componentType = ComponentType.UNSIGNED_INT;
        } else if (typedarray instanceof Int32Array) {
            componentType = ComponentType.INT;
        } else {
            // 理论上不会走到这里，如果走到这里就抛异常
            throw new Error('Unsupported typed array type for accessor');
        }

        const accessor: AccessorItem = {
            count: typedarray.length / itemNum,
            byteOffset: 0,
            type: typeStringMap[itemNum],
            componentType: componentType,
            bufferView: this.createBufferView(typedarray, target),
        };
        this.accessors.push(accessor);
        return this.accessors.length - 1;
    }

    createTypedArray(arr: number[] | Vec3[] | Vec4[], isIndex = false) {
        let sample = arr[0];
        let array: number[] = [];
        if (typeof sample === 'number') {
            array = arr as number[];
        } else if (sample instanceof Vec3) {
            (arr as Vec3[]).forEach((item) => {
                array.push(item.x, item.y, item.z);
            });
        } else if (sample instanceof Vec4) {
            (arr as Vec4[]).forEach((item) => {
                array.push(item.x, item.y, item.z, item.w);
            });
        } else {
            throw new Error('Unsupported array type for typed array');
        }

        
        if (isIndex) {
            return new Uint16Array(array);
        } else {
            return new Float32Array(array);
        }

    }

    createImage(name: string, uri: string) {
        this.images.push({name, uri});
        return this.images.length - 1;
    }

    createTexture(name: string, uri: string, sampler = 0) {
        const textureIdx = this.textures.findIndex(item => item.name === name);
        if (textureIdx >= 0) {
            return textureIdx;
        }
        let imageIdx = this.images.findIndex(item => item.name === name);
        if  (imageIdx < 0) {
            imageIdx = this.createImage(name, uri);
        }
        const texture: TextureItem = {
            name, 
            sampler,
            source: imageIdx,
        };
        this.textures.push(texture);
        return this.textures.length - 1;
    }

    createMaterial(name: string, uri: string, opacity = 1) {
        const textureIdx = this.createTexture(name, uri);
        const material: MaterialItem = {
            pbrMetallicRoughness: {
                baseColorTexture: {
                    index: textureIdx,
                    texCoord: 0,
                },
                baseColorFactor: [1, 1, 1, opacity],
                metallicFactor: 0,
                roughnessFactor: 0,
            },
        };
        this.materials.push(material);
        return this.materials.length - 1;
    }

}