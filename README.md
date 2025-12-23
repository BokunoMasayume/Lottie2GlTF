
# initImagesAndTextures

遍历lottie.assets中的图片, 加入到gltf的images和textures里

# fillLottie
从lottie.layers这个根合成入手
对每个合成调用fillPreComp
然后加入到node2layerMap和layer2nodeMap
加入到gltf.nodes里

## fillPreComp

首先获取这个合成的所有图层
然后使用createNode创建gltf中的node

将该合成加入midNodeMap

遍历每个图层:
添加node和nodeAnchor
- 如果是图片图层, 加mesh
- 如果是与合成, 递归fillPreComp
- 如果是null图层, 单出添加节点

然后根据ks信息加node的默认transform / mesh的material baseColor

# fillAnimation

填充animation信息

# writeGltf




# 新版的处理流程

## gltf内容关系

scenes引用nodes的根节点

node上有mesh和skin的引用, 以及accessors的引用

mesh上有material的引用, material有textures的引用, textures有images, samplers的引用

skin有accessors的引用

accessors有bufferViews的引用, bufferViews有buffers的引用

1. 读取lottie的基础信息: 
    宽, 高, 帧率
    图片id, 宽高, 实际内容

2. 使用lottie形成gltf的node树, 考虑
    与合成引用
    parent关系
    初始transform
    渲染节点的
        drawOrder
        引用图片

3. 计算动画信息

4. 组合gltf
    可以简单的多个mesh
    或者用骨骼变成单一mesh


TODO

- 图层合并