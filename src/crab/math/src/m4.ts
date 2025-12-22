/* eslint-disable no-param-reassign */
/**
 * 四元数差值
 * reference: https://krasjet.github.io/quaternion/quaternion.pdf
 */
export function slerp(a: Vec4, b: Vec4, t: number) {
    const out: number[] = [];
    const ax = a[0];
    const ay = a[1];
    const az = a[2];
    const aw = a[3];
    let bx = b[0];
    let by = b[1];
    let bz = b[2];
    let bw = b[3];

    let omega;
    let cosom;
    let sinom;
    let scale0;
    let scale1;

    cosom = ax * bx + ay * by + az * bz + aw * bw;

    if (cosom < 0.0) {
        /**
         * 两个不同的单位四元数𝑞与−𝑞对应的其实是同一个旋转
         * 选择最近的路径 （<90度那个）
         */
        cosom = -cosom;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
    }
    if (1.0 - cosom > 0.000001) {
        // 当角度很小的时候， 用lerp近似
        omega = Math.acos(cosom);
        sinom = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {
        // 真正的slerp
        scale0 = 1.0 - t;
        scale1 = t;
    }
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
}

// 此处四元数虚部在前， 实部在后

type Mat4 = Float32Array;
type Vec3 = Float32Array;
type Vec4 = Float32Array;
type Vec2 = Float32Array;
/**
 * 计算a_xy在数组中的实际位置
 * @param x
 * @param y
 */
function calcPos(x: number, y: number): number {
    return y * 4 + x;
}

/**
 * computer graphics 4 *4 matrices calculation
 * 矩阵列优先表示方法
 * [a, b, c, d, e, f, g, h, i]
 * = | a    d   g|
 *   | b    e   h|
 *   | c    f   i|
 */
export class Matrix4 {
    /**
     * 矩阵乘法 AB
     * @param a A
     * @param b B
     * @param dst
     * @returns dst
     */
    multiply(a: Mat4 | Array<number>, b: Mat4 | Array<number>, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                dst[calcPos(i, j)] = 0;
                for (let k = 0; k < 4; k++) {
                    dst[calcPos(i, j)] += a[calcPos(i, k)] * b[calcPos(k, j)];
                }
            }
        }

        return dst;
    }

    unitTranslation(): Array<number> {
        return [0, 0, 0];
    }

    unitScale() {
        return [1, 1, 1];
    }

    unitRotation() {
        return [0, 0, 0, 1];
    }

    /******************************** 向量 矢量 vector *****************************/

    /**
     * 向量加法
     * @param a
     * @param b
     * @param dst
     * @returns
     */
    addVectors(a: Vec3 | Array<number>, b: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        const num = a.length;
        dst = dst ?? new Float32Array(num);
        for (let i = 0; i < num; i++) {
            dst[i] = a[i] + b[i];
        }

        return dst;
    }

    /**
     * 向量减法
     * @param a
     * @param b
     * @param dst
     * @returns
     */
    subtractVectors(a: Vec3 | Array<number>, b: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        const num = a.length;
        dst = dst ?? new Float32Array(num);
        for (let i = 0; i < num; i++) {
            dst[i] = a[i] - b[i];
        }

        return dst;
    }

    /**
     * 矢量缩放（矢量和标量乘法）
     * @param v
     * @param s
     * @param dst
     * @returns
     */
    scaleVector(v: Vec3 | Array<number>, s: number, dst?: Vec3): Vec3 {
        const num = v.length;
        dst = dst ?? new Float32Array(num);
        for (let i = 0; i < num; i++) {
            dst[i] = v[i] * s;
        }

        return dst;
    }

    /**
     * 矢量归一化
     * @param v
     * @param dst
     * @returns
     */
    normalize(v: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        const num = v.length;
        let length = 0;
        dst = dst ?? new Float32Array(num);
        for (let i = 0; i < num; i++) {
            length += v[i] * v[i];
        }
        length = Math.sqrt(length);
        for (let i = 0; i < num; i++) {
            dst[i] = v[i] / length;
        }

        return dst;
    }

    /**
     * 矢量长度
     * @param v
     * @returns
     */
    length(v: Vec3 | Array<number>): number {
        const num = v.length;
        let length = 0;
        for (let i = 0; i < num; i++) {
            length += v[i] * v[i];
        }
        return Math.sqrt(length);
    }

    /**
     * 矢量长度的平方
     * @param v
     * @returns
     */
    lengthSq(v: Vec3 | Array<number>): number {
        const num = v.length;
        let length = 0;
        for (let i = 0; i < num; i++) {
            length += v[i] * v[i];
        }
        return length;
    }

    /**
     * 向量叉乘
     * @param a
     * @param b
     * @param dst
     */
    cross(a: Vec3 | Array<number>, b: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        dst = dst ?? new Float32Array(3);
        dst[0] = a[1] * b[2] - a[2] * b[1];
        dst[1] = a[2] * b[0] - a[0] * b[2];
        dst[2] = a[0] * b[1] - a[1] * b[0];

        return dst;
    }

    /**
     * 向量点乘
     * @param a
     * @param b
     * @returns
     */
    dot(a: Vec3 | Array<number>, b: Vec3 | Array<number>): number {
        const num = a.length;
        let res = 0;
        for (let i = 0; i < num; i++) {
            res += a[i] * b[i];
        }
        return res;
    }

    /**
     * 两点间距离的平方
     * @param a
     * @param b
     * @returns
     */
    distanceSq(a: Vec3 | Array<number>, b: Vec3 | Array<number>): number {
        const num = a.length;
        const dis = new Float32Array(num);
        for (let i = 0; i < num; i++) {
            dis[i] = a[i] - b[i];
        }

        return this.dot(dis, dis);
    }

    /**
     * 两点间距离
     * @param a
     * @param b
     */
    distance(a: Vec3 | Array<number>, b: Vec3 | Array<number>): number {
        return Math.sqrt(this.distanceSq(a, b));
    }

    /**
     * 获得一个单位矩阵
     * @param dst
     * @returns
     */
    identity(dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;
        return dst;
    }

    /**
     * 克隆矩阵
     * @param m
     * @param dst
     */
    clone(m: Mat4 | Array<number>, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        for (let i = 0; i < 16; i++) {
            dst[i] = m[i];
        }
        return dst;
    }

    /**
     * 转置一个矩阵
     * @param m
     * @param dst
     */
    transpose(m: Mat4 | Array<number>, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        dst[0] = m[0];
        dst[1] = m[4];
        dst[2] = m[8];
        dst[3] = m[12];
        dst[4] = m[1];
        dst[5] = m[5];
        dst[6] = m[9];
        dst[7] = m[13];
        dst[8] = m[2];
        dst[9] = m[6];
        dst[10] = m[10];
        dst[11] = m[14];
        dst[12] = m[3];
        dst[13] = m[7];
        dst[14] = m[11];
        dst[15] = m[15];

        return dst;
    }

    /******************************** 摄像机 camera *****************************/

    /**
     * 摄像机
     * 这个是摄像机坐标系, 它的逆矩阵就是view matrix
     * lookat_mat * [0, 0, 0] = cameraPos
     * so view_mat 使当前坐标系坐标变回去摄像机坐标系里的值
     * 世界坐标系不变， 视图坐标系更改
     * webgl的展示区域是-1 - +1 右手系
     * 这个矩阵做的变化是将视图坐标系的原点置于target(此处是个translate),
     * y轴正方向为up
     * z轴正方向为cameraPosition - target
     * 则x轴正方向就是cross(up, cameraPosition - target)
     * 注意： 三者要归一化
     * 因为up可能只是指示性的， 不和y轴完全重叠， y轴可以用cross(cameraPositon - target, xAxis)计算得到
     * 得到新坐标系的三个基向量， 就可以拼接为转换矩阵了
     * references：
     * https://baike.baidu.com/item/%E5%90%91%E9%87%8F%E7%A7%AF/4601007
     * https://baike.baidu.com/item/%E5%8F%B3%E6%89%8B%E7%B3%BB/9751780
     * https://www.bilibili.com/video/BV1ys411472E
     * @param cameraPosition 摄像机位置
     * @param target lookat的位置
     * @param up 上方向
     * @param dst 结果矩阵
     */
    lookAt(
        cameraPosition: Vec3 | Array<number>,
        target: Vec3 | Array<number>,
        up: Vec3 | Array<number>,
        dst?: Mat4,
    ): Mat4 {
        dst = dst ?? new Float32Array(16);

        const zAxis = this.normalize(
            // this.subtractVectors(target, cameraPosition)
            this.subtractVectors(cameraPosition, target),
        );
        const xAxis = this.normalize(this.cross(up, zAxis));
        const yAxis = this.normalize(this.cross(zAxis, xAxis));

        dst[0] = xAxis[0];
        dst[1] = xAxis[1];
        dst[2] = xAxis[2];
        dst[3] = 0;

        dst[4] = yAxis[0];
        dst[5] = yAxis[1];
        dst[6] = yAxis[2];
        dst[7] = 0;

        dst[8] = zAxis[0];
        dst[9] = zAxis[1];
        dst[10] = zAxis[2];
        dst[11] = 0;

        dst[12] = cameraPosition[0];
        dst[13] = cameraPosition[1];
        dst[14] = cameraPosition[2];
        dst[15] = 1;

        return dst;
    }

    /**
     * 摄像机透视矩阵
     * 通过这个矩阵， 将参数描述的截锥（frustum）空间转换到剪裁空间（xyz轴都是-1 ~ 1）
     * @param fieldOfViewInRadians 上下可视角度（弧度制）
     * @param aspect 可视区域的分辨比例 （width / height）
     * @param near 近处的距离
     * @param far 远处的距离
     * @param dst 结果矩阵
     * z注意， perspective divide : [x , y , z ] / z 这一步实际上是除以的w
     * 该矩阵将w由1变为-z， 自动完成了，
     * 之后webgl会自动进行[x, y, z] / w
     * reference:
     * https://www.qiujiawei.com/linear-algebra-12/
     */
    perspective(fieldOfViewInRadians: number, aspect: number, near: number, far: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        const f = Math.tan(Math.PI * 0.5 - fieldOfViewInRadians * 0.5);
        const rangeInv = 1.0 / (near - far);

        dst[0] = f / aspect;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = f;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = (near + far) * rangeInv;
        dst[11] = -1;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = near * far * rangeInv * 2;
        dst[15] = 0;

        return dst;
    }

    /**
     * 正交投影矩阵
     * 线性变换， 构造方程a[xyz] + b = [x'y'z']
     * @param left x轴坐标
     * @param right x轴坐标
     * @param bottom y轴坐标
     * @param top y轴坐标
     * @param near 距离（非z轴坐标）
     * @param far 距离
     * @param dst 结果矩阵
     * @returns
     */
    orthographic(
        left: number,
        right: number,
        bottom: number,
        top: number,
        near: number,
        far: number,
        dst?: Mat4,
    ): Mat4 {
        dst = dst ?? new Float32Array(16);

        dst[0] = 2 / (right - left);
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 2 / (top - bottom);
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 2 / (near - far);
        dst[11] = 0;
        dst[12] = (left + right) / (left - right);
        dst[13] = (bottom + top) / (bottom - top);
        dst[14] = (near + far) / (near - far);
        dst[15] = 1;

        return dst;
    }

    /**
     * 透视矩阵
     * 先把p转成p' 再按照perspective里的搞
     */
    frustum(left: number, right: number, bottom: number, top: number, near: number, far: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        const dx = right - left;
        const dy = top - bottom;
        const dz = far - near;

        dst[0] = (2 * near) / dx;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = (2 * near) / dy;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = (left + right) / dx;
        dst[9] = (top + bottom) / dy;
        dst[10] = -(far + near) / dz;
        dst[11] = -1;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = (-2 * near * far) / dz;
        dst[15] = 0;

        return dst;
    }

    /**
     * 生成位移矩阵
     * @param tx
     * @param ty
     * @param tz
     * @param dst
     */
    translation(tx: number, ty: number, tz: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = tx;
        dst[13] = ty;
        dst[14] = tz;
        dst[15] = 1;

        return dst;
    }

    /**
     * 矩阵位移变换
     * @param m \
     * @param tx
     * @param ty
     * @param tz
     * @param dst
     * @returns
     */
    translate(m: Mat4 | Array<number>, tx: number, ty: number, tz: number, dst?: Mat4): Mat4 {
        // return this.multiply(m, this.translation(tx, ty, tz), dst);

        dst = dst ?? new Float32Array(16);

        if (m !== dst) {
            dst[0] = m[calcPos(0, 0)];
            dst[1] = m[calcPos(1, 0)];
            dst[2] = m[calcPos(2, 0)];
            dst[3] = m[calcPos(3, 0)];
            dst[4] = m[calcPos(0, 1)];
            dst[5] = m[calcPos(1, 1)];
            dst[6] = m[calcPos(2, 1)];
            dst[7] = m[calcPos(3, 1)];
            dst[8] = m[calcPos(0, 2)];
            dst[9] = m[calcPos(1, 2)];
            dst[10] = m[calcPos(2, 2)];
            dst[11] = m[calcPos(3, 2)];
        }

        dst[12] = m[calcPos(0, 0)] * tx + m[calcPos(0, 1)] * ty + m[calcPos(0, 2)] * tz + m[calcPos(0, 3)];
        dst[13] = m[calcPos(1, 0)] * tx + m[calcPos(1, 1)] * ty + m[calcPos(1, 2)] * tz + m[calcPos(1, 3)];
        dst[14] = m[calcPos(2, 0)] * tx + m[calcPos(2, 1)] * ty + m[calcPos(2, 2)] * tz + m[calcPos(2, 3)];
        dst[15] = m[calcPos(3, 0)] * tx + m[calcPos(3, 1)] * ty + m[calcPos(3, 2)] * tz + m[calcPos(3, 3)];

        return dst;
    }

    /***************** 一堆旋转。。。 **/
    xRotation(angleInRadians: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        dst[0] = 1;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = c;
        dst[6] = s;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = -s;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    xRotate(m: Mat4 | Array<number>, angleInRadians: number, dst?: Mat4): Mat4 {
        // this is the optimized version of
        // return multiply(m, xRotation(angleInRadians), dst);
        dst = dst ?? new Float32Array(16);

        const m10 = m[4];
        const m11 = m[5];
        const m12 = m[6];
        const m13 = m[7];
        const m20 = m[8];
        const m21 = m[9];
        const m22 = m[10];
        const m23 = m[11];
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        dst[4] = c * m10 + s * m20;
        dst[5] = c * m11 + s * m21;
        dst[6] = c * m12 + s * m22;
        dst[7] = c * m13 + s * m23;
        dst[8] = c * m20 - s * m10;
        dst[9] = c * m21 - s * m11;
        dst[10] = c * m22 - s * m12;
        dst[11] = c * m23 - s * m13;

        if (m !== dst) {
            dst[0] = m[0];
            dst[1] = m[1];
            dst[2] = m[2];
            dst[3] = m[3];
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    yRotation(angleInRadians: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        dst[0] = c;
        dst[1] = 0;
        dst[2] = -s;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = 1;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = s;
        dst[9] = 0;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    yRotate(m: Mat4 | Array<number>, angleInRadians: number, dst?: Mat4): Mat4 {
        // this is the optimized version of
        // return multiply(m, yRotation(angleInRadians), dst);
        dst = dst ?? new Float32Array(16);

        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        dst[0] = c * m00 - s * m20;
        dst[1] = c * m01 - s * m21;
        dst[2] = c * m02 - s * m22;
        dst[3] = c * m03 - s * m23;
        dst[8] = c * m20 + s * m00;
        dst[9] = c * m21 + s * m01;
        dst[10] = c * m22 + s * m02;
        dst[11] = c * m23 + s * m03;

        if (m !== dst) {
            dst[4] = m[4];
            dst[5] = m[5];
            dst[6] = m[6];
            dst[7] = m[7];
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    zRotation(angleInRadians: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        dst[0] = c;
        dst[1] = s;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = -s;
        dst[5] = c;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    zRotate(m: Mat4 | Array<number>, angleInRadians: number, dst?: Mat4): Mat4 {
        // This is the optimized version of
        // return multiply(m, zRotation(angleInRadians), dst);
        dst = dst ?? new Float32Array(16);

        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);

        dst[0] = c * m00 + s * m10;
        dst[1] = c * m01 + s * m11;
        dst[2] = c * m02 + s * m12;
        dst[3] = c * m03 + s * m13;
        dst[4] = c * m10 - s * m00;
        dst[5] = c * m11 - s * m01;
        dst[6] = c * m12 - s * m02;
        dst[7] = c * m13 - s * m03;

        if (m !== dst) {
            dst[8] = m[8];
            dst[9] = m[9];
            dst[10] = m[10];
            dst[11] = m[11];
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * 绕着轴axis旋转
     * 看起来就很四元数
     * https://krasjet.github.io/quaternion/quaternion.pdf
     * 按照这里3.3章的矩阵化简
     * @param axis
     * @param angleInRadians
     * @param dst
     * @returns
     */
    axisRotation(axis: Vec3 | Array<number>, angleInRadians: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        let x = axis[0];
        let y = axis[1];
        let z = axis[2];
        const n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        const xx = x * x;
        const yy = y * y;
        const zz = z * z;
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        const oneMinusCosine = 1 - c;

        dst[0] = xx + (1 - xx) * c;
        dst[1] = x * y * oneMinusCosine + z * s;
        dst[2] = x * z * oneMinusCosine - y * s;
        dst[3] = 0;
        dst[4] = x * y * oneMinusCosine - z * s;
        dst[5] = yy + (1 - yy) * c;
        dst[6] = y * z * oneMinusCosine + x * s;
        dst[7] = 0;
        dst[8] = x * z * oneMinusCosine + y * s;
        dst[9] = y * z * oneMinusCosine - x * s;
        dst[10] = zz + (1 - zz) * c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * 化简的原理在于这终究是个旋转，是个完全线性空间的变换， 不涉及位移
     * @param m
     * @param axis
     * @param angleInRadians
     * @param dst
     * @returns
     */
    axisRotate(m: Mat4 | Array<number>, axis: Vec3 | Array<number>, angleInRadians: number, dst?: Mat4): Mat4 {
        // This is the optimized version of
        // return multiply(m, axisRotation(axis, angleInRadians), dst);
        dst = dst ?? new Float32Array(16);

        let x = axis[0];
        let y = axis[1];
        let z = axis[2];
        const n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        const xx = x * x;
        const yy = y * y;
        const zz = z * z;
        const c = Math.cos(angleInRadians);
        const s = Math.sin(angleInRadians);
        const oneMinusCosine = 1 - c;

        const r00 = xx + (1 - xx) * c;
        const r01 = x * y * oneMinusCosine + z * s;
        const r02 = x * z * oneMinusCosine - y * s;
        const r10 = x * y * oneMinusCosine - z * s;
        const r11 = yy + (1 - yy) * c;
        const r12 = y * z * oneMinusCosine + x * s;
        const r20 = x * z * oneMinusCosine + y * s;
        const r21 = y * z * oneMinusCosine - x * s;
        const r22 = zz + (1 - zz) * c;

        const m00 = m[0];
        const m01 = m[1];
        const m02 = m[2];
        const m03 = m[3];
        const m10 = m[4];
        const m11 = m[5];
        const m12 = m[6];
        const m13 = m[7];
        const m20 = m[8];
        const m21 = m[9];
        const m22 = m[10];
        const m23 = m[11];

        dst[0] = r00 * m00 + r01 * m10 + r02 * m20;
        dst[1] = r00 * m01 + r01 * m11 + r02 * m21;
        dst[2] = r00 * m02 + r01 * m12 + r02 * m22;
        dst[3] = r00 * m03 + r01 * m13 + r02 * m23;
        dst[4] = r10 * m00 + r11 * m10 + r12 * m20;
        dst[5] = r10 * m01 + r11 * m11 + r12 * m21;
        dst[6] = r10 * m02 + r11 * m12 + r12 * m22;
        dst[7] = r10 * m03 + r11 * m13 + r12 * m23;
        dst[8] = r20 * m00 + r21 * m10 + r22 * m20;
        dst[9] = r20 * m01 + r21 * m11 + r22 * m21;
        dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
        dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

        if (m !== dst) {
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    scaling(sx: number, sy: number, sz: number, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        dst[0] = sx;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;
        dst[4] = 0;
        dst[5] = sy;
        dst[6] = 0;
        dst[7] = 0;
        dst[8] = 0;
        dst[9] = 0;
        dst[10] = sz;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * 优化原理同上
     * @param m
     * @param sx
     * @param sy
     * @param sz
     * @param dst
     * @returns
     */
    scale(m: Mat4 | Array<number>, sx: number, sy: number, sz: number, dst?: Mat4): Mat4 {
        // This is the optimized version of
        // return multiply(m, scaling(sx, sy, sz), dst);
        dst = dst ?? new Float32Array(16);

        dst[0] = sx * m[0 * 4 + 0];
        dst[1] = sx * m[0 * 4 + 1];
        dst[2] = sx * m[0 * 4 + 2];
        dst[3] = sx * m[0 * 4 + 3];
        dst[4] = sy * m[1 * 4 + 0];
        dst[5] = sy * m[1 * 4 + 1];
        dst[6] = sy * m[1 * 4 + 2];
        dst[7] = sy * m[1 * 4 + 3];
        dst[8] = sz * m[2 * 4 + 0];
        dst[9] = sz * m[2 * 4 + 1];
        dst[10] = sz * m[2 * 4 + 2];
        dst[11] = sz * m[2 * 4 + 3];

        if (m !== dst) {
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * 将一个节点的旋转， 缩放， 位移变换放在一起
     * 其中旋转用四元数表示
     * https://krasjet.github.io/quaternion/quaternion.pdf
     * 参考上面的连接， 比axisRotation那个更直接，甚至不用化简了
     * 另： 此处四元数虚部在前， 实部在后
     * @param translation
     * @param quaternion
     * @param scale
     * @param dst
     * @returns
     */
    compose(translation: Vec3, quaternion: Vec4, scale: Vec3, dst?: Mat4 | Array<number>) {
        dst = dst ?? new Float32Array(16);

        const x = quaternion[0];
        const y = quaternion[1];
        const z = quaternion[2];
        const w = quaternion[3];

        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;

        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;

        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        const sx = scale[0];
        const sy = scale[1];
        const sz = scale[2];

        dst[0] = (1 - (yy + zz)) * sx;
        dst[1] = (xy + wz) * sx;
        dst[2] = (xz - wy) * sx;
        dst[3] = 0;

        dst[4] = (xy - wz) * sy;
        dst[5] = (1 - (xx + zz)) * sy;
        dst[6] = (yz + wx) * sy;
        dst[7] = 0;

        dst[8] = (xz + wy) * sz;
        dst[9] = (yz - wx) * sz;
        dst[10] = (1 - (xx + yy)) * sz;
        dst[11] = 0;

        dst[12] = translation[0];
        dst[13] = translation[1];
        dst[14] = translation[2];
        dst[15] = 1;

        return dst;
    }

    /**
     * 纯旋转矩阵转四元数
     * references:
     * https://zhuanlan.zhihu.com/p/45404840
     * http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
     * 精髓是一个项用trace(迹)表示， 其他三个项用矩阵的两个项和前面用迹表示的项一起表示
     *
     * @param m
     * @param dst 【x, y, z, w】
     */
    quatFromRotationMatrix(m: Mat4, dst: any = []) {
        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
        const m11 = m[0];
        const m12 = m[4];
        const m13 = m[8];
        const m21 = m[1];
        const m22 = m[5];
        const m23 = m[9];
        const m31 = m[2];
        const m32 = m[6];
        const m33 = m[10];

        const trace = m11 + m22 + m33;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1);
            dst[3] = 0.25 / s;
            dst[0] = (m32 - m23) * s;
            dst[1] = (m13 - m31) * s;
            dst[2] = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {
            const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
            dst[3] = (m32 - m23) / s;
            dst[0] = 0.25 * s;
            dst[1] = (m12 + m21) / s;
            dst[2] = (m13 + m31) / s;
        } else if (m22 > m33) {
            const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
            dst[3] = (m13 - m31) / s;
            dst[0] = (m12 + m21) / s;
            dst[1] = 0.25 * s;
            dst[2] = (m23 + m32) / s;
        } else {
            const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
            dst[3] = (m21 - m12) / s;
            dst[0] = (m13 + m31) / s;
            dst[1] = (m23 + m32) / s;
            dst[2] = 0.25 * s;
        }

        return dst;
    }

    rulerToMatrix(x: number, y: number, z: number, dst?: Mat4) {
        dst = dst ?? new Float32Array(16);

        const cx = Math.cos(x);
        const sx = Math.sin(x);
        const cy = Math.cos(y);
        const sy = Math.sin(y);
        const cz = Math.cos(z);
        const sz = Math.sin(z);

        dst[0] = cz * cy;
        dst[1] = sz * cy;
        dst[2] = -sy;
        dst[3] = 0;

        dst[4] = cz * sy * sx - sz * cx;
        dst[5] = sz * sy * sx + cz * cx;
        dst[6] = cy * sx;
        dst[7] = 0;

        dst[8] = cz * sy * cx + sz * sx;
        dst[9] = sz * sy * cx - cz * sx;
        dst[10] = cy * cx;
        dst[11] = 0;

        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * 将一个节点的变换矩阵分解为位移， 旋转， 缩放
     * 没啥好说的
     * @param mat
     * @param translation
     * @param quaternion
     * @param scale
     */
    decompose(
        mat: Mat4 | Array<number>,
        translation: Vec3 | Array<number>,
        quaternion: Vec4 | Array<number>,
        scale: Vec3 | Array<number>,
    ) {
        let sx = this.length(mat.slice(0, 3));
        const sy = this.length(mat.slice(4, 7));
        const sz = this.length(mat.slice(8, 11));

        // if determinate is negative, we need to invert one scale
        const det = this.determinate(mat);
        if (det < 0) {
            sx = -sx;
        }

        translation[0] = mat[12];
        translation[1] = mat[13];
        translation[2] = mat[14];

        // scale the rotation part
        const matrix = this.copy(mat);

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        matrix[0] *= invSX;
        matrix[1] *= invSX;
        matrix[2] *= invSX;

        matrix[4] *= invSY;
        matrix[5] *= invSY;
        matrix[6] *= invSY;

        matrix[8] *= invSZ;
        matrix[9] *= invSZ;
        matrix[10] *= invSZ;

        this.quatFromRotationMatrix(matrix, quaternion);

        scale[0] = sx;
        scale[1] = sy;
        scale[2] = sz;
    }

    spriteMatrixFromMatrix(mat: Mat4 | Array<number>, dst?: Mat4 | Array<number>) {
        dst = dst ?? new Float32Array(16);

        let sx = this.length(mat.slice(0, 3));
        const sy = this.length(mat.slice(4, 7));
        const sz = this.length(mat.slice(8, 11));

        // if determinate is negative, we need to invert one scale
        const det = this.determinate(mat);
        if (det < 0) {
            sx = -sx;
        }

        const tx = mat[12];
        const ty = mat[13];
        const tz = mat[14];

        dst[0] = sx;
        dst[1] = 0;
        dst[2] = 0;
        dst[3] = 0;

        dst[4] = 0;
        dst[5] = sy;
        dst[6] = 0;
        dst[7] = 0;

        dst[8] = 0;
        dst[9] = 0;
        dst[10] = sz;
        dst[11] = 0;

        dst[12] = tx;
        dst[13] = ty;
        dst[14] = tz;
        dst[15] = 1;

        return dst;
    }

    /**
     * 行列式的，额， 倒数
     * @param m
     * @returns
     */
    determinate(m: Mat4 | Array<number>): number {
        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const m30 = m[3 * 4 + 0];
        const m31 = m[3 * 4 + 1];
        const m32 = m[3 * 4 + 2];
        const m33 = m[3 * 4 + 3];
        const tmp_0 = m22 * m33;
        const tmp_1 = m32 * m23;
        const tmp_2 = m12 * m33;
        const tmp_3 = m32 * m13;
        const tmp_4 = m12 * m23;
        const tmp_5 = m22 * m13;
        const tmp_6 = m02 * m33;
        const tmp_7 = m32 * m03;
        const tmp_8 = m02 * m23;
        const tmp_9 = m22 * m03;
        const tmp_10 = m02 * m13;
        const tmp_11 = m12 * m03;

        const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        const t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        const t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        return 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
    }

    copy(src: Mat4 | Array<number>, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);

        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3];
        dst[4] = src[4];
        dst[5] = src[5];
        dst[6] = src[6];
        dst[7] = src[7];
        dst[8] = src[8];
        dst[9] = src[9];
        dst[10] = src[10];
        dst[11] = src[11];
        dst[12] = src[12];
        dst[13] = src[13];
        dst[14] = src[14];
        dst[15] = src[15];

        return dst;
    }

    /**
     * 求逆矩阵
     * references
     * https://semath.info/src/inverse-cofactor-ex4.html
     * https://blog.csdn.net/XY1790026787/article/details/106144101
     * @param m
     * @param dst
     * @returns
     */
    inverse(m: Mat4 | Array<number>, dst?: Mat4): Mat4 {
        dst = dst ?? new Float32Array(16);
        const m00 = m[0 * 4 + 0];
        const m01 = m[0 * 4 + 1];
        const m02 = m[0 * 4 + 2];
        const m03 = m[0 * 4 + 3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const m30 = m[3 * 4 + 0];
        const m31 = m[3 * 4 + 1];
        const m32 = m[3 * 4 + 2];
        const m33 = m[3 * 4 + 3];
        const tmp_0 = m22 * m33;
        const tmp_1 = m32 * m23;
        const tmp_2 = m12 * m33;
        const tmp_3 = m32 * m13;
        const tmp_4 = m12 * m23;
        const tmp_5 = m22 * m13;
        const tmp_6 = m02 * m33;
        const tmp_7 = m32 * m03;
        const tmp_8 = m02 * m23;
        const tmp_9 = m22 * m03;
        const tmp_10 = m02 * m13;
        const tmp_11 = m12 * m03;
        const tmp_12 = m20 * m31;
        const tmp_13 = m30 * m21;
        const tmp_14 = m10 * m31;
        const tmp_15 = m30 * m11;
        const tmp_16 = m10 * m21;
        const tmp_17 = m20 * m11;
        const tmp_18 = m00 * m31;
        const tmp_19 = m30 * m01;
        const tmp_20 = m00 * m21;
        const tmp_21 = m20 * m01;
        const tmp_22 = m00 * m11;
        const tmp_23 = m10 * m01;

        const t0 = tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31 - (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        const t1 = tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31 - (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        const t2 = tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31 - (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        const t3 = tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21 - (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        const d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;
        dst[4] = d * (tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30 - (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
        dst[5] = d * (tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30 - (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
        dst[6] = d * (tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30 - (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
        dst[7] = d * (tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20 - (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
        dst[8] = d * (tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33 - (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
        dst[9] = d * (tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33 - (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
        dst[10] = d * (tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33 - (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
        dst[11] = d * (tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23 - (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
        dst[12] = d * (tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12 - (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
        dst[13] = d * (tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22 - (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
        dst[14] = d * (tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02 - (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
        dst[15] = d * (tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12 - (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

        return dst;
    }

    transformVector(m: Mat4 | Array<number>, v: Vec4 | Array<number>, dst?: Vec4): Vec4 {
        dst = dst ?? new Float32Array(4);
        for (let i = 0; i < 4; ++i) {
            dst[i] = 0.0;
            for (let j = 0; j < 4; ++j) {
                dst[i] += v[j] * m[j * 4 + i];
            }
        }
        return dst;
    }

    /**
     * 似乎自带透视 （除以w惹）
     * 这个和下面的transformDirection因为只有三个元素， 故分为这个除以w的，和下面那个不除以w的
     * @param m
     * @param v
     * @param dst
     * @returns
     */
    transformPoint(m: Mat4 | Array<number>, v: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        dst = dst ?? new Float32Array(3);
        const v0 = v[0];
        const v1 = v[1];
        const v2 = v[2];
        const d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];
        dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
        dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
        dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

        return dst;
    }

    /**
     * 没透视的
     * @param m
     * @param v
     * @param dst
     * @returns
     */
    transformDirection(m: Mat4 | Array<number>, v: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        dst = dst ?? new Float32Array(3);

        const v0 = v[0];
        const v1 = v[1];
        const v2 = v[2];

        dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
        dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
        dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

        return dst;
    }

    /**
     * // TODO 没搞明白这个的物理意义
     * 物理意义来了https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
     * 没仔细看， 困了
     * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
     * as a normal to a surface, and computes a vector which is normal upon
     * transforming that surface by the matrix. The effect of this function is the
     * same as transforming v (as a direction) by the inverse-transpose of m.  This
     * function assumes the transformation of 3-dimensional space represented by the
     * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion.  Returns a vector with 3
     * entries.
     * @param {Matrix4} m The matrix.
     * @param {Vector3} v The normal.
     * @param {Vector3} [dst] The direction.
     * @return {Vector3} The transformed direction.
     * @memberOf module:webgl-3d-math
     */
    transformNormal(m: Mat4 | Array<number>, v: Vec3 | Array<number>, dst?: Vec3): Vec3 {
        dst = dst ?? new Float32Array(3);
        const mi = this.inverse(m);
        const v0 = v[0];
        const v1 = v[1];
        const v2 = v[2];

        // 这里是逆矩阵的转置矩阵哦
        dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
        dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
        dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

        return dst;
    }

    mix(a: Vec3 | Array<number>, b: Vec3 | Array<number>, percent = 0) {
        const res = new Float32Array(a.length);
        a.forEach((aval, idx) => {
            res[idx] = (1 - percent) * aval + percent * b[idx];
        });
        return res;
    }
}

const m4 = new Matrix4();
// console.log
// window.m4 = m4;
export default m4;
