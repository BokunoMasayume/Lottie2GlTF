// 图层类型
declare enum LayerTypeEnum {
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

    // 透明视频图层
    TransparentVideo = 16,

    // APNG 图层
    APNG = 17,
}

export default LayerTypeEnum;
