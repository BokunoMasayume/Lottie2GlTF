// 图层类型
export enum LayerType {
    // 合成图层
    PreComp = 0,

    // 固态图层
    Solid = 1,

    // 图片图层
    Image = 2,

    // 空图层
    Null = 3,

    // 图形图层
    Shape = 4,

    // 文本图层
    Text = 5,

    // 序列帧图层
    Sequence = 8,

    // 透明视频图层
    TransparentVideo = 16,

    // APNG 图层
    APNG = 17,

    // camera 图层
    Camera = 13,
}

// 资源类型
export enum AssetType {
    // 图层属性，如果包含video、apng、image需要用这个包一层
    PreComp = 0,

    // 图片资源
    Image = 1,

    // 视频资源
    Video = 12,

    // APNG 资源
    APNG = 13,

    // Sequence 序列帧图层属性，下面包含多个image资源
    Sequence = 14,
}

// 用数值表示布尔值
export enum BooleanType {
    False = 0,
    True = 1,
}

export enum KsPlayerAssetType {
    // 图片资源
    Image = 0,

    // 视频资源
    Video = 1,

    // APNG 资源
    APNG = 2,
}
