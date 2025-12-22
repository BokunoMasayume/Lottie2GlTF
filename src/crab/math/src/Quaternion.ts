/* eslint-disable no-param-reassign */
import { Vec3 } from './Vec3';
import { Vec4 } from './Vec4';

const halfToRad = (0.5 * Math.PI) / 180.0;
/** 旋转顺序 */
export enum QuatOrder {
    ZYX = 0,
    YZX,
    XZY,
    ZXY,
    YXZ,
    XYZ,
}

export class Quaternion extends Vec4 {
    multiplyQuat(quat: Quaternion) {
        const x = this.w * quat.x + this.x * quat.w + this.y * quat.z - this.z * quat.y;
        const y = this.w * quat.y + this.y * quat.w + this.z * quat.x - this.x * quat.z;
        const z = this.w * quat.z + this.z * quat.w + this.x * quat.y - this.y * quat.x;
        const w = this.w * quat.w - this.x * quat.x - this.y * quat.y - this.z * quat.z;
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }

    quatFromAxis(q1: Quaternion, q2: Quaternion, q3: Quaternion) {
        return q1.multiplyQuat(q2).multiplyQuat(q3);
    }

    // reference: https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
    fromEuler(x: number | Vec3, y?: number, z?: number, order: QuatOrder = QuatOrder.XYZ) {
        if (x instanceof Vec3) {
            y = x.y;
            z = x.z;
            x = x.x;
        } else {
            y = y ?? 0;
            z = z ?? 0;
        }

        x *= halfToRad;
        y *= halfToRad;
        z *= halfToRad;

        const sx = Math.sin(x);
        const cx = Math.cos(x);
        const sy = Math.sin(y);
        const cy = Math.cos(y);
        const sz = Math.sin(z);
        const cz = Math.cos(z);

        const qx = new Quaternion(sx, 0, 0, cx);
        const qy = new Quaternion(0, sy, 0, cy);
        const qz = new Quaternion(0, 0, sz, cz);
        let result = null;

        switch (order) {
            case QuatOrder.ZYX:
                result = this.quatFromAxis(qx, qy, qz);
                break;
            case QuatOrder.YZX:
                result = this.quatFromAxis(qx, qz, qy);
                break;
            case QuatOrder.XZY:
                result = this.quatFromAxis(qy, qz, qx);
                break;
            case QuatOrder.ZXY:
                result = this.quatFromAxis(qy, qx, qz);
                break;
            case QuatOrder.YXZ:
                result = this.quatFromAxis(qz, qx, qy);
                break;
            case QuatOrder.XYZ:
            default:
                result = this.quatFromAxis(qz, qy, qx);
                break;
        }

        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (result) {
            this.copy(result);
        }
        return this;
    }

    // reference : https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles
    // 精度不行, 慎用
    toEuler(): Vec3 {
        const euler = new Vec3();
        const { x, y, z, w } = this;
        // roll (x-axis rotation)
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        euler.x = Math.atan2(sinr_cosp, cosr_cosp);

        // pitch (y-axis rotation)
        const sinp = Math.sqrt(1 + 2 * (w * y - x * z));
        const cosp = Math.sqrt(1 - 2 * (w * y - x * z));
        euler.y = 2 * Math.atan2(sinp, cosp) - Math.PI / 2;

        // yaw (z-axis rotation)
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        euler.z = Math.atan2(siny_cosp, cosy_cosp);
        return euler.scale(1 / (2 * halfToRad));
    }

    /**
     * 根据旋转轴和旋转弧度计算四元数
     */
    static fromAxisAngle(axis: Vec3, rad: number, out?: Quaternion) {
        if (!out) {
            out = new Quaternion();
        }
        rad *= 0.5;
        const s = Math.sin(rad);
        out.x = s * axis.x;
        out.y = s * axis.y;
        out.z = s * axis.z;
        out.w = Math.cos(rad);
        return out;
    }
}
