#!/usr/bin/env node
/**
 * 传入lottie, 导出gltf
 *
 * e.g. node ./lottie2gltf.js somelottie.json somegltffile
 *
 * https://www.toptal.com/developers/css/sprite-generator/
 */
let TransScale = 0.05;

let sortingOrder = 100;

const fs = require('fs');
const path = require('path');

var srcPath = process.argv[2],
    dstPath = process.argv[3];

const dstName = path.basename(srcPath, '.json') + '.gltf';
const dstBinName = path.basename(srcPath, '.json') + '.bin';
if (!dstPath) {
    dstPath = path.join(srcPath, '../' + dstName);
}
const dstBinPath = path.join(dstPath, '../' + dstBinName);

const targets = {
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
};
const componentTypeMap = {
    BYTE: 5120,
    UNSIGNED_BYTE: 5121,
    SHORT: 5122,
    UNSIGNED_INT: 5125,
    UNSIGNED_SHORT: 5123,
    INT: 5124,
    FLOAT: 5126,
    HALF_FLOAT: 5131,
};

const typeStringMap = {
    1: 'SCALAR',
    2: 'VEC2',
    3: 'VEC3',
    4: 'VEC4',
    9: 'MAT3',
    16: 'MAT4',
};

var lottie = JSON.parse(fs.readFileSync(srcPath, 'utf8'));

TransScale = 1 / lottie.w;

var gltf = {
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
            name: lottie.nm,
            channels: [],
            samplers: [],
        },
    ],
};

var midNodeMap = {
    // layers 里的图层
    main: {
        // ind: gltfnode
    },
    // precomp 里的图层 id: {ind: gltfnode}
};

var layer2nodeMap = new WeakMap();
var node2layerMap = new WeakMap();

var arraybuffers = [];
var abLength = 0;

var BezierFactory = (function () {
    /**
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2015 – MIT License
     *
     * Credits: is based on Firefox's nsSMILKeySpline.cpp
     * Usage:
     * var spline = BezierEasing([ 0.25, 0.1, 0.25, 1.0 ])
     * spline.get(x) => returns the easing value | x must be in [0, 1] range
     *
     */

    var ob = {};
    ob.getBezierEasing = getBezierEasing;
    var beziers = {};

    function getBezierEasing(a, b, c, d, nm) {
        var str = nm || ('bez_' + a + '_' + b + '_' + c + '_' + d).replace(/\./g, 'p');
        if (beziers[str]) {
            return beziers[str];
        }
        var bezEasing = new BezierEasing([a, b, c, d]);
        beziers[str] = bezEasing;
        return bezEasing;
    }

    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;

    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    var float32ArraySupported = typeof Float32Array === 'function';

    function A(aA1, aA2) {
        return 1.0 - 3.0 * aA2 + 3.0 * aA1;
    }
    function B(aA1, aA2) {
        return 3.0 * aA2 - 6.0 * aA1;
    }
    function C(aA1) {
        return 3.0 * aA1;
    }
    /**
     * 3 * a1 * (1-t) * (1-t) + 3 * a2 * t * (1-t) +t*t
     * = 3 * a1 * (1 - 2*t + t* t) + 3 * a2 *t - 3 * a2 * t *t + t*t
     * = 3 *a1 - 6 * a1 * t + 3 * a1 * t *t + 3 * a2 *t - 3 * a2 *t *t + t *t
     *
     * t*t - 3 *a2 *t*t +3 *a1 *t*t + 3*a2 *t - 6 * a1*t +  3*a1
     */

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function calcBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
    }

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    function getSlope(aT, aA1, aA2) {
        // readnote 3 * (1 - 3 * aA2 + 3 * aA1) *aT * aT    +   2 * (3 * aA2 - 6 *aA1) * aT + 3*aA1
        // = 3*aT*aT - 9 * aA2 * aT *aT + 9 *aA1 *aT * aT  + 6 *aA2 *aT - 12 *aA1*aT + 3*aA1
        return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
    }

    function binarySubdivide(aX, aA, aB, mX1, mX2) {
        var currentX,
            currentT,
            i = 0;
        do {
            currentT = aA + (aB - aA) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - aX;
            if (currentX > 0.0) {
                aB = currentT;
            } else {
                aA = currentT;
            }
        } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
        return currentT;
    }

    function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
        for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
            var currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope === 0.0) return aGuessT;
            var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }

    /**
     * points is an array of [ mX1, mY1, mX2, mY2 ]
     */
    function BezierEasing(points) {
        this._p = points;
        this._mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
        this._precomputed = false;

        this.get = this.get.bind(this);
    }

    BezierEasing.prototype = {
        get: function (x) {
            var mX1 = this._p[0],
                mY1 = this._p[1],
                mX2 = this._p[2],
                mY2 = this._p[3];
            if (!this._precomputed) this._precompute();
            if (mX1 === mY1 && mX2 === mY2) return x; // linear
            // Because JavaScript number are imprecise, we should guarantee the extremes are right.
            if (x === 0) return 0;
            if (x === 1) return 1;
            return calcBezier(this._getTForX(x), mY1, mY2);
        },

        // Private part

        _precompute: function () {
            var mX1 = this._p[0],
                mY1 = this._p[1],
                mX2 = this._p[2],
                mY2 = this._p[3];
            this._precomputed = true;
            if (mX1 !== mY1 || mX2 !== mY2) {
                this._calcSampleValues();
            }
        },

        _calcSampleValues: function () {
            var mX1 = this._p[0],
                mX2 = this._p[2];
            for (var i = 0; i < kSplineTableSize; ++i) {
                this._mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
            }
        },

        /**
         * getTForX chose the fastest heuristic to determine the percentage value precisely from a given X projection.
         */
        _getTForX: function (aX) {
            var mX1 = this._p[0],
                mX2 = this._p[2],
                mSampleValues = this._mSampleValues;

            var intervalStart = 0.0;
            var currentSample = 1;
            var lastSample = kSplineTableSize - 1;

            for (; currentSample !== lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += kSampleStepSize;
            }
            --currentSample;

            // Interpolate to provide an initial guess for t
            var dist =
                (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample + 1] - mSampleValues[currentSample]);
            var guessForT = intervalStart + dist * kSampleStepSize;
            // readnote 这里是猜测 比例为 guessForT 处 x 的插值是 aX
            // getSlope 获取斜率(导数), 如果斜率为0, 就直接返回 , 此处t变化, x变化不大, 因而guessForT对应的与ax相差不大
            // 吗的还是不懂
            var initialSlope = getSlope(guessForT, mX1, mX2);
            if (initialSlope >= NEWTON_MIN_SLOPE) {
                return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
            }
            if (initialSlope === 0.0) {
                return guessForT;
            }
            return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        },
    };

    return ob;
})();

const defaultCurveSegments = 300;

var subframeEnabled = true;
var expressionsPlugin;
var cachedColors = {};
var bmRnd;
var bmPow = Math.pow;
var bmSqrt = Math.sqrt;
var bmFloor = Math.floor;
var bmMax = Math.max;
var bmMin = Math.min;

var createTypedArray = (function () {
    function createRegularArray(type, len) {
        var i = 0;
        var arr = [];
        var value;
        switch (type) {
            case 'int16':
            case 'uint8c':
                value = 1;
                break;
            default:
                value = 1.1;
                break;
        }
        for (i = 0; i < len; i += 1) {
            arr.push(value);
        }
        return arr;
    }
    function createTypedArrayFactory(type, len) {
        if (type === 'float32') {
            return new Float32Array(len);
        }
        if (type === 'int16') {
            return new Int16Array(len);
        }
        if (type === 'uint8c') {
            return new Uint8ClampedArray(len);
        }
        return createRegularArray(type, len);
    }
    if (typeof Uint8ClampedArray === 'function' && typeof Float32Array === 'function') {
        return createTypedArrayFactory;
    }
    return createRegularArray;
})();

function createSizedArray(len) {
    return Array.apply(null, { length: len });
}

var poolFactory = (function () {
    return function (initialLength, _create, _release) {
        var _length = 0;
        var _maxLength = initialLength;
        var pool = createSizedArray(_maxLength);

        var ob = {
            newElement: newElement,
            release: release,
        };

        function newElement() {
            var element;
            if (_length) {
                _length -= 1;
                element = pool[_length];
            } else {
                element = _create();
            }
            return element;
        }

        function release(element) {
            if (_length === _maxLength) {
                pool = pooling.double(pool);
                _maxLength *= 2;
            }
            if (_release) {
                _release(element);
            }
            pool[_length] = element;
            _length += 1;
        }

        return ob;
    };
})();
var pooling = (function () {
    function double(arr) {
        return arr.concat(createSizedArray(arr.length));
    }

    return {
        double: double,
    };
})();
var bezierLengthPool = (function () {
    function create() {
        return {
            addedLength: 0,
            percents: createTypedArray('float32', defaultCurveSegments),
            lengths: createTypedArray('float32', defaultCurveSegments),
        };
    }
    return poolFactory(8, create);
})();

function bezFunction() {
    var math = Math;

    // ok
    function pointOnLine2D(x1, y1, x2, y2, x3, y3) {
        var det1 = x1 * y2 + y1 * x3 + x2 * y3 - x3 * y2 - y3 * x1 - x2 * y1;
        return det1 > -0.001 && det1 < 0.001;
    }

    // ok
    function pointOnLine3D(x1, y1, z1, x2, y2, z2, x3, y3, z3) {
        if (z1 === 0 && z2 === 0 && z3 === 0) {
            return pointOnLine2D(x1, y1, x2, y2, x3, y3);
        }
        var dist1 = math.sqrt(math.pow(x2 - x1, 2) + math.pow(y2 - y1, 2) + math.pow(z2 - z1, 2));
        var dist2 = math.sqrt(math.pow(x3 - x1, 2) + math.pow(y3 - y1, 2) + math.pow(z3 - z1, 2));
        var dist3 = math.sqrt(math.pow(x3 - x2, 2) + math.pow(y3 - y2, 2) + math.pow(z3 - z2, 2));
        var diffDist;
        if (dist1 > dist2) {
            if (dist1 > dist3) {
                diffDist = dist1 - dist2 - dist3;
            } else {
                diffDist = dist3 - dist2 - dist1;
            }
        } else if (dist3 > dist2) {
            diffDist = dist3 - dist2 - dist1;
        } else {
            diffDist = dist2 - dist1 - dist3;
        }
        return diffDist > -0.0001 && diffDist < 0.0001;
    }

    var getBezierLength = (function () {
        return function (pt1, pt2, pt3, pt4) {
            var curveSegments = defaultCurveSegments;
            var k;
            var i;
            var len;
            var ptCoord;
            var perc;
            var addedLength = 0;
            var ptDistance;
            var point = [];
            var lastPoint = [];
            var lengthData = bezierLengthPool.newElement();
            len = pt3.length;
            for (k = 0; k < curveSegments; k += 1) {
                perc = k / (curveSegments - 1);
                ptDistance = 0;
                for (i = 0; i < len; i += 1) {
                    ptCoord =
                        bmPow(1 - perc, 3) * pt1[i] +
                        3 * bmPow(1 - perc, 2) * perc * pt3[i] +
                        3 * (1 - perc) * bmPow(perc, 2) * pt4[i] +
                        bmPow(perc, 3) * pt2[i];
                    point[i] = ptCoord;
                    if (lastPoint[i] !== null) {
                        ptDistance += bmPow(point[i] - lastPoint[i], 2);
                    }
                    lastPoint[i] = point[i];
                }
                if (ptDistance) {
                    ptDistance = bmSqrt(ptDistance);
                    addedLength += ptDistance;
                }
                lengthData.percents[k] = perc;
                lengthData.lengths[k] = addedLength;
            }
            lengthData.addedLength = addedLength;
            return lengthData;
        };
    })();

    function getSegmentsLength(shapeData) {
        var segmentsLength = segmentsLengthPool.newElement();
        var closed = shapeData.c;
        var pathV = shapeData.v;
        var pathO = shapeData.o;
        var pathI = shapeData.i;
        var i;
        var len = shapeData._length;
        var lengths = segmentsLength.lengths;
        var totalLength = 0;
        for (i = 0; i < len - 1; i += 1) {
            lengths[i] = getBezierLength(pathV[i], pathV[i + 1], pathO[i], pathI[i + 1]);
            totalLength += lengths[i].addedLength;
        }
        if (closed && len) {
            lengths[i] = getBezierLength(pathV[i], pathV[0], pathO[i], pathI[0]);
            totalLength += lengths[i].addedLength;
        }
        segmentsLength.totalLength = totalLength;
        return segmentsLength;
    }

    function BezierData(length) {
        this.segmentLength = 0;
        this.points = new Array(length);
    }

    function PointData(partial, point) {
        this.partialLength = partial;
        this.point = point;
    }

    var buildBezierData = (function () {
        var storedData = {};

        return function (pt1, pt2, pt3, pt4) {
            var bezierName = (
                pt1[0] +
                '_' +
                pt1[1] +
                '_' +
                pt2[0] +
                '_' +
                pt2[1] +
                '_' +
                pt3[0] +
                '_' +
                pt3[1] +
                '_' +
                pt4[0] +
                '_' +
                pt4[1]
            ).replace(/\./g, 'p');
            if (!storedData[bezierName]) {
                var curveSegments = defaultCurveSegments;
                var k;
                var i;
                var len;
                var ptCoord;
                var perc;
                var addedLength = 0;
                var ptDistance;
                var point;
                var lastPoint = null;
                if (
                    pt1.length === 2 &&
                    (pt1[0] !== pt2[0] || pt1[1] !== pt2[1]) &&
                    pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt1[0] + pt3[0], pt1[1] + pt3[1]) &&
                    pointOnLine2D(pt1[0], pt1[1], pt2[0], pt2[1], pt2[0] + pt4[0], pt2[1] + pt4[1])
                ) {
                    curveSegments = 2;
                }
                var bezierData = new BezierData(curveSegments);
                len = pt3.length;
                for (k = 0; k < curveSegments; k += 1) {
                    point = createSizedArray(len);
                    perc = k / (curveSegments - 1);
                    ptDistance = 0;
                    for (i = 0; i < len; i += 1) {
                        ptCoord =
                            bmPow(1 - perc, 3) * pt1[i] +
                            3 * bmPow(1 - perc, 2) * perc * (pt1[i] + pt3[i]) +
                            3 * (1 - perc) * bmPow(perc, 2) * (pt2[i] + pt4[i]) +
                            bmPow(perc, 3) * pt2[i];
                        point[i] = ptCoord;
                        if (lastPoint !== null) {
                            ptDistance += bmPow(point[i] - lastPoint[i], 2);
                        }
                    }
                    ptDistance = bmSqrt(ptDistance);
                    addedLength += ptDistance;
                    bezierData.points[k] = new PointData(ptDistance, point);
                    lastPoint = point;
                }
                bezierData.segmentLength = addedLength;
                storedData[bezierName] = bezierData;
            }
            return storedData[bezierName];
        };
    })();

    function getDistancePerc(perc, bezierData) {
        var percents = bezierData.percents;
        var lengths = bezierData.lengths;
        var len = percents.length;
        var initPos = bmFloor((len - 1) * perc);
        var lengthPos = perc * bezierData.addedLength;
        var lPerc = 0;
        if (initPos === len - 1 || initPos === 0 || lengthPos === lengths[initPos]) {
            return percents[initPos];
        }
        var dir = lengths[initPos] > lengthPos ? -1 : 1;
        var flag = true;
        while (flag) {
            if (lengths[initPos] <= lengthPos && lengths[initPos + 1] > lengthPos) {
                lPerc = (lengthPos - lengths[initPos]) / (lengths[initPos + 1] - lengths[initPos]);
                flag = false;
            } else {
                initPos += dir;
            }
            if (initPos < 0 || initPos >= len - 1) {
                // FIX for TypedArrays that don't store floating point values with enough accuracy
                if (initPos === len - 1) {
                    return percents[initPos];
                }
                flag = false;
            }
        }
        return percents[initPos] + (percents[initPos + 1] - percents[initPos]) * lPerc;
    }

    function getPointInSegment(pt1, pt2, pt3, pt4, percent, bezierData) {
        var t1 = getDistancePerc(percent, bezierData);
        var u1 = 1 - t1;
        var ptX =
            math.round(
                (u1 * u1 * u1 * pt1[0] +
                    (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[0] +
                    (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[0] +
                    t1 * t1 * t1 * pt2[0]) *
                    1000,
            ) / 1000;
        var ptY =
            math.round(
                (u1 * u1 * u1 * pt1[1] +
                    (t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1) * pt3[1] +
                    (t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1) * pt4[1] +
                    t1 * t1 * t1 * pt2[1]) *
                    1000,
            ) / 1000;
        return [ptX, ptY];
    }

    var bezierSegmentPoints = createTypedArray('float32', 8);

    function getNewSegment(pt1, pt2, pt3, pt4, startPerc, endPerc, bezierData) {
        if (startPerc < 0) {
            startPerc = 0;
        } else if (startPerc > 1) {
            startPerc = 1;
        }
        var t0 = getDistancePerc(startPerc, bezierData);
        endPerc = endPerc > 1 ? 1 : endPerc;
        var t1 = getDistancePerc(endPerc, bezierData);
        var i;
        var len = pt1.length;
        var u0 = 1 - t0;
        var u1 = 1 - t1;
        var u0u0u0 = u0 * u0 * u0;
        var t0u0u0_3 = t0 * u0 * u0 * 3; // eslint-disable-line camelcase
        var t0t0u0_3 = t0 * t0 * u0 * 3; // eslint-disable-line camelcase
        var t0t0t0 = t0 * t0 * t0;
        //
        var u0u0u1 = u0 * u0 * u1;
        var t0u0u1_3 = t0 * u0 * u1 + u0 * t0 * u1 + u0 * u0 * t1; // eslint-disable-line camelcase
        var t0t0u1_3 = t0 * t0 * u1 + u0 * t0 * t1 + t0 * u0 * t1; // eslint-disable-line camelcase
        var t0t0t1 = t0 * t0 * t1;
        //
        var u0u1u1 = u0 * u1 * u1;
        var t0u1u1_3 = t0 * u1 * u1 + u0 * t1 * u1 + u0 * u1 * t1; // eslint-disable-line camelcase
        var t0t1u1_3 = t0 * t1 * u1 + u0 * t1 * t1 + t0 * u1 * t1; // eslint-disable-line camelcase
        var t0t1t1 = t0 * t1 * t1;
        //
        var u1u1u1 = u1 * u1 * u1;
        var t1u1u1_3 = t1 * u1 * u1 + u1 * t1 * u1 + u1 * u1 * t1; // eslint-disable-line camelcase
        var t1t1u1_3 = t1 * t1 * u1 + u1 * t1 * t1 + t1 * u1 * t1; // eslint-disable-line camelcase
        var t1t1t1 = t1 * t1 * t1;
        for (i = 0; i < len; i += 1) {
            bezierSegmentPoints[i * 4] =
                math.round((u0u0u0 * pt1[i] + t0u0u0_3 * pt3[i] + t0t0u0_3 * pt4[i] + t0t0t0 * pt2[i]) * 1000) / 1000; // eslint-disable-line camelcase
            bezierSegmentPoints[i * 4 + 1] =
                math.round((u0u0u1 * pt1[i] + t0u0u1_3 * pt3[i] + t0t0u1_3 * pt4[i] + t0t0t1 * pt2[i]) * 1000) / 1000; // eslint-disable-line camelcase
            bezierSegmentPoints[i * 4 + 2] =
                math.round((u0u1u1 * pt1[i] + t0u1u1_3 * pt3[i] + t0t1u1_3 * pt4[i] + t0t1t1 * pt2[i]) * 1000) / 1000; // eslint-disable-line camelcase
            bezierSegmentPoints[i * 4 + 3] =
                math.round((u1u1u1 * pt1[i] + t1u1u1_3 * pt3[i] + t1t1u1_3 * pt4[i] + t1t1t1 * pt2[i]) * 1000) / 1000; // eslint-disable-line camelcase
        }

        return bezierSegmentPoints;
    }

    return {
        getSegmentsLength: getSegmentsLength,
        getNewSegment: getNewSegment,
        getPointInSegment: getPointInSegment,
        buildBezierData: buildBezierData,
        pointOnLine2D: pointOnLine2D,
        pointOnLine3D: pointOnLine3D,
    };
}

var bez = bezFunction();

function calcBezier(a, p0, p1, b, percent) {
    let m0 = [
        (1 - percent) * a[0] + percent * p0[0],
        (1 - percent) * a[1] + percent * p0[1],
        (1 - percent) * a[2] + percent * p0[2],
    ];
    let m1 = [
        (1 - percent) * p0[0] + percent * p1[0],
        (1 - percent) * p0[1] + percent * p1[1],
        (1 - percent) * p0[2] + percent * p1[2],
    ];
    let m2 = [
        (1 - percent) * p1[0] + percent * b[0],
        (1 - percent) * p1[1] + percent * b[1],
        (1 - percent) * p1[2] + percent * b[2],
    ];

    let n0 = [
        (1 - percent) * m0[0] + percent * m1[0],
        (1 - percent) * m0[1] + percent * m1[1],
        (1 - percent) * m0[2] + percent * m1[2],
    ];
    let n1 = [
        (1 - percent) * m1[0] + percent * m2[0],
        (1 - percent) * m1[1] + percent * m2[1],
        (1 - percent) * m1[2] + percent * m2[2],
    ];

    return [
        (1 - percent) * n0[0] + percent * n1[0],
        (1 - percent) * n0[1] + percent * n1[1],
        (1 - percent) * n0[2] + percent * n1[2],
    ];
}

function initImagesAndTextures() {
    lottie.assets.forEach((ass, idx) => {
        if (ass.layers) return;
        gltf.images.push({
            name: ass.id,
            uri: ass.u + ass.p, // TODO 这里
        });
        gltf.textures.push({
            name: ass.id,
            sampler: 0,
            source: idx,
        });
    });
}

function getLottieLayer(prenm = 'main' /**precomp id */, ind = 0) {
    var pre;
    if (prenm === 'main') {
        pre = lottie.layers;
    } else {
        pre = lottie.assets.filter((ass) => {
            return ass.id == prenm;
        })[0].layers;
    }
    return pre.filter((lay) => {
        return lay.ind == ind;
    })[0];
}

function createNode(name) {
    return {
        name: name,
        translation: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
        children: [],
    };
}

/**
 * buffer: 现阶段设置成0就ok了
 * byteLength: accessor typedarray的byteLength
 * byteOffset: abLength
 * target: targets
 */
function createBufferView(byteLength, target) {
    const bufferView = {
        buffer: 0,
        byteLength: byteLength,
        target: target,
        byteOffset: abLength,
    };
    abLength += byteLength;
    return bufferView;
}

/**
 * compoonentType
 * type:
 * count: 就是几个3维矢量这种count count = array.length / type
 * bufferView
 * byteOffset 在bufferView上的偏移, 现阶段设成0就ok了
 */
function createAccessor(typedarray, type, target = targets.ARRAY_BUFFER) {
    const accessor = {
        count: typedarray.length / type,
        byteOffset: 0,
        type: typeStringMap[type],
    };
    const bv = createBufferView(typedarray.byteLength, target);
    gltf.bufferViews.push(bv);
    accessor.bufferView = gltf.bufferViews.length - 1;
    if (typedarray instanceof Float32Array) {
        accessor.componentType = componentTypeMap.FLOAT;
    } else if (typedarray instanceof Uint8Array) {
        accessor.componentType = componentTypeMap.UNSIGNED_BYTE;
    } else if (typedarray instanceof Int8Array) {
        accessor.componentType = componentTypeMap.BYTE;
    } else if (typedarray instanceof Uint16Array) {
        accessor.componentType = componentTypeMap.UNSIGNED_SHORT;
    } else if (typedarray instanceof Int16Array) {
        accessor.componentType = componentTypeMap.SHORT;
    } else if (typedarray instanceof Uint32Array) {
        accessor.componentType = componentTypeMap.UNSIGNED_INT;
    } else if (typedarray instanceof Int32Array) {
        accessor.componentType = componentTypeMap.INT;
    } else {
        console.warn('createAccessor: 什么鬼类型啊, 处理不了, 焯');
    }
    arraybuffers.push(typedarray);
    return accessor;
}

function createMaterial(textureName) {
    let idx = 0;
    for (let i = 0; i < gltf.textures.length; i++) {
        if (gltf.textures[i].name === textureName) {
            idx = i;
            break;
        }
    }
    return {
        // TODO
        // alphaMode: 'OPAQUE',
        pbrMetallicRoughness: {
            baseColorTexture: {
                index: idx,
                texCoord: 0,
            },
            baseColorFactor: [1, 1, 1, 1],
            metallicFactor: 0,
            roughnessFactor: 0,
        },
        extras: {
            crab: {
                transparent: true,
            },
        },
    };
}

function createMesh(imgName, width, height) {
    let material = createMaterial(imgName);
    gltf.materials.push(material);

    let w = width * TransScale;
    let h = height * TransScale;

    let positionArray = new Float32Array([
        // - ax, ay, 0,
        // w - ax, ay, 0,
        // -ax, ay - h, 0,
        // -ax, ay - h, 0,
        // w - ax, ay, 0,
        // w - ax, ay - h, 0
        0,
        0,
        0,

        w,
        0,
        0,

        0,
        -h,
        0,

        0,
        -h,
        0,

        w,
        0,
        0,

        w,
        -h,
        0,
    ]);
    let uvArray = new Float32Array([
        0, 0, 
        1, 0, 
        0, 1, 
        0, 1, 
        1, 0, 1, 1]);
    const posiAccessor = createAccessor(positionArray, 3);
    const uvAccessor = createAccessor(uvArray, 2);
    gltf.accessors.push(posiAccessor);
    gltf.accessors.push(uvAccessor);
    const mesh = {
        primitives: [
            {
                material: gltf.materials.length - 1,
                mode: 4,
                attributes: {
                    POSITION: gltf.accessors.length - 2,
                    TEXCOORD_0: gltf.accessors.length - 1,
                },
                extras: {
                    crab: {
                        sortingOrder: sortingOrder,
                        isScreenSpace: true,
                    },
                },
            },
        ],
    };
    sortingOrder--;

    return mesh;
}

function fillPreComp(pnm) {
    var pre;
    if (pnm === 'main') {
        pre = lottie;
    } else {
        pre = lottie.assets.filter((ass) => {
            return ass.id == pnm;
        })[0];
    }

    const root = createNode(pnm);
    // gltf.nodes.push(root);
    let descens = [];

    midNodeMap[pnm] = {};

    pre.layers.forEach((layer) => {
        let node;
        let nodeAnchor;
        switch (layer.ty) {
            case 2: // image
                node = createNode(layer.nm);
                nodeAnchor = createNode(layer.nm + '_anchor');
                let asset = lottie.assets.filter((ass) => {
                    return ass.id === layer.refId;
                })[0];
                let mesh = createMesh(layer.refId, asset.w, asset.h);
                mesh.name = layer.nm;
                gltf.meshes.push(mesh);
                nodeAnchor.mesh = gltf.meshes.length - 1;
                break;
            case 0: // precomp
                node = fillPreComp(layer.refId);
                nodeAnchor = gltf.nodes[node.children[0]];
                break;
            case 1: // solid
                console.warn('还没支持solid图层');
                break;
            case 3: // null
                node = createNode(layer.nm);
                nodeAnchor = createNode(layer.nm + '_anchor');
                break;
            case 4: // shape 第一版先不支持
                console.warn('还没支持shape图层');
                break;
            case 5: // text 永远不支持
                console.warn('还没支持text图层');
                break;
            default:
                node = createNode(layer.nm);
                nodeAnchor = createNode(layer.nm + '_anchor');
                break;
        }
        if (node) {
            node2layerMap.set(node, layer);
            node2layerMap.set(nodeAnchor, layer);
            layer2nodeMap.set(layer, node);

            midNodeMap[pnm][layer.ind] = node;
            gltf.nodes.push(node);
            let noIdx = gltf.nodes.length - 1;
            let anIdx = -1;
            if (layer.ty != 0) {
                gltf.nodes.push(nodeAnchor);
                anIdx = gltf.nodes.length - 1;
                node.children.push(anIdx);
            } else {
                for (let i = 0; i < gltf.nodes.length; i++) {
                    if (gltf.nodes[i] == nodeAnchor) {
                        anIdx = i;
                        break;
                    }
                }
            }
            descens.push({
                index: noIdx,
                node: node,
                layer: layer,
            });
            if (layer.ks && layer.ks.r && !layer.ks.r.a) {
                let rotate = layer.ks.r.k;
                // rotation上没有动画
                if (rotate.length) {
                    node.rotation = quatFromRotationMatrix(
                        xRotate(
                            yRotate(zRotate(identity(), (rotate[2] * Math.PI) / 180), (rotate[1] * Math.PI) / 180),
                            (rotate[0] * Math.PI) / 180,
                        ),
                    );
                } else {
                    node.rotation = quatFromRotationMatrix(zRotate(identity(), (rotate * Math.PI) / 180));
                }
            } else if (layer.ks && layer.ks.r && layer.ks.r.a) {
                // 有一个动画
                gltf.animations[0].channels.push({
                    target: {
                        node: noIdx,
                        path: 'rotation',
                    },
                });

                node.rotation = quatFromRotationMatrix(zRotate(identity(), (-layer.ks.r.k[0].s[0] * Math.PI) / 180));
            }

            if (layer.ks && layer.ks.p && !layer.ks.p.a && !layer.ks.p.s) {
                //不分轴
                let position = layer.ks.p.k;
                // translate上没有动画
                node.translation = [
                    position[0] * TransScale,
                    -position[1] * TransScale,
                    // (lottie.h - position[1]) * TransScale,
                    position[2] * TransScale,
                ];
            } else if (layer.ks && layer.ks.p && layer.ks.p.a && !layer.ks.p.s) {
                gltf.animations[0].channels.push({
                    target: {
                        node: noIdx,
                        path: 'translation',
                    },
                });
                let p = layer.ks.p.k[0].s;
                node.translation = [
                    p[0] * TransScale,
                    -p[1] * TransScale,
                    // (lottie.h - p[1]) * TransScale,
                    p[2] * TransScale,
                ];
            } else if (layer.ks && layer.ks.p && layer.ks.p.s) {
                // 分轴
                // TODO 分轴这里还需要更鲁棒
                if (!layer.ks.p.x.a && !layer.ks.p.y.a) {
                    node.translation = [layer.ks.p.x.k[0] * TransScale, -layer.ks.p.y.k[1] * TransScale, 0];
                } else {
                    node.translation = [
                        (layer.ks.p.x.a ? layer.ks.p.x.k[0].s[0] : layer.ks.p.x.k[0]) * TransScale,
                        -(layer.ks.p.y.a ? layer.ks.p.y.k[0].s[0] : layer.ks.p.y.k[0]) * TransScale,
                        0,
                    ];
                    gltf.animations[0].channels.push({
                        target: {
                            node: noIdx,
                            path: 'translation',
                        },
                    });
                }
            }

            if (layer.ks && layer.ks.s && !layer.ks.s.a) {
                let scale = layer.ks.s.k;
                node.scale = scale.map((s) => s / 100);
            } else if (layer.ks && layer.ks.s && layer.ks.s.a) {
                gltf.animations[0].channels.push({
                    target: {
                        node: noIdx,
                        path: 'scale',
                    },
                });
                let s = layer.ks.s.k[0].s;
                node.scale = s.map((s) => s / 100);

                // node.scale = layer.ks.s.k[0].s[0] / 100
            }

            // TODO 没有支持anchor动画
            if (layer.ks && layer.ks.a && !layer.ks.a.a) {
                // anchor没有动画
                let anchor = layer.ks.a.k;
                nodeAnchor.translation = [
                    -anchor[0] * TransScale,
                    anchor[1] * TransScale,
                    // (anchor[1] - lottie.h) * TransScale,
                    -anchor[2] * TransScale,
                ];
            }

            if (layer.ks && layer.ks.o) {
                let opacity = layer.ks.o.k;
                if (!layer.ks.o.a && nodeAnchor.mesh !== undefined) {
                    gltf.materials[
                        gltf.meshes[nodeAnchor.mesh].primitives[0].material
                    ].pbrMetallicRoughness.baseColorFactor[3] = opacity / 100;
                }
                if (layer.ks.o.a) {
                    gltf.animations[0].channels.push({
                        target: {
                            node: anIdx,
                            path: 'opacity',
                        },
                    });
                }
            }
        }
    });

    let anchor = createNode(pnm + '_anchor');
    let precomplayer = lottie.layers.filter((lay) => {
        return lay.refId == pnm;
    })[0];

    if (precomplayer && precomplayer.ks) {
        gltf.nodes.push(anchor);
        root.children.push(gltf.nodes.length - 1);
        anchor.translation = [
            -precomplayer.ks.a.k[0] * TransScale,
            -precomplayer.ks.a.k[1] * TransScale,
            -precomplayer.ks.a.k[2] * TransScale,
        ];
    }

    descens.forEach((des) => {
        if (des.layer.parent !== undefined) {
            let parent = descens.filter((d) => d.layer.ind === des.layer.parent)[0];
            let parentAnchor = gltf.nodes[parent.node.children[0]];
            parentAnchor.children.push(des.index);
        } else {
            if (pnm === 'main') {
                root.children.push(des.index);
            } else {
                anchor.children.push(des.index);
            }
        }
    });

    return root;
}

function fillLottie() {
    const root = fillPreComp('main');
    node2layerMap.set(root, lottie);
    layer2nodeMap.set(lottie, root);
    gltf.nodes.push(root);
    gltf.scenes[0].nodes = [gltf.nodes.length - 1];
    return root;
}

function getChannel(nidx, path) {
    return gltf.animations[0].channels.filter((channel) => {
        return channel.target.node === nidx && channel.target.path == path;
    })[0];
}

function createSampler(input, output, outputtype, interpolation = 'LINEAR') {
    let time = createAccessor(input, 1);
    let value = createAccessor(output, outputtype);
    gltf.accessors.push(time);
    gltf.accessors.push(value);
    return {
        input: gltf.accessors.length - 2,
        output: gltf.accessors.length - 1,
        interpolation: interpolation,
    };
}

function getSegment(keyList, currenttime) {
    let currentIdx = 0;
    for (let kidx = 0; kidx < keyList.length; kidx++) {
        let nowk = keyList[kidx];
        let nextk = keyList[kidx + 1];
        if (nowk.t / lottie.fr <= currenttime && nextk && nextk.t / lottie.fr > currenttime) {
            currentIdx = kidx;
            break;
        }
        if (kidx == 0 && currenttime < nowk.t / lottie.fr) {
            currentIdx = 0;
            break;
        }
        if (kidx == keyList.length - 1 && currenttime >= nowk.t / lottie.fr) {
            currentIdx = kidx - 1;
            break;
        }
    }

    return currentIdx;
}
const framePerSecond = 60;
function calcNodeAnimation(node, nidx) {
    let layer = node2layerMap.get(node);
    if (layer) {
        // 因为anchor
        let endtime = layer.op / lottie.fr;
        if (lottie.op / lottie.fr < endtime) endtime = lottie.op / lottie.fr;
        let starttime = layer.ip / lottie.fr;
        // if (starttime < (lottie.ip / lottie.fr)) starttime = lottie.ip / lottie.fr;
        const frames = Math.ceil((endtime - starttime) * framePerSecond);
        const totalFrames = ((lottie.op - lottie.ip) / lottie.fr) * framePerSecond;
        // TODO translation 后做
        let transChannel = getChannel(nidx, 'translation');
        if (transChannel) {
            const seperate = layer.ks.p.s;
            // TODO 非常凑活
            let isTranslationLoop = seperate
                ? layer.ks.p.x.x && layer.ks.p.x.x.includes('loop')
                : layer.ks.p.x && layer.ks.p.x.includes('loop');

            const transKeys = layer.ks.p.k;
            const transXKeys = layer.ks.p.x;
            const transYKeys = layer.ks.p.y;

            let localFrames, localFrames2;
            if (seperate) {
                if (transXKeys.a) {
                    localFrames =
                        ((transXKeys.k[transXKeys.k.length - 1].t - transXKeys.k[0].t) / lottie.fr) * framePerSecond;
                } else {
                    localFrames = 1;
                }
                if (transYKeys.a) {
                    localFrames2 =
                        ((transYKeys.k[transYKeys.k.length - 1].t - transYKeys.k[0].t) / lottie.fr) * framePerSecond;
                } else {
                    localFrames2 = 1;
                }
            } else {
                localFrames = ((transKeys[transKeys.length - 1].t - transKeys[0].t) / lottie.fr) * framePerSecond;
            }

            // if (layer.nm == 'Null 13') {
            //     console.log(layer.nm, frames, localFrames,localFrames2, seperate, starttime, isTranslationLoop);
            // }
            let times = new Float32Array(frames);
            let keyvalues = new Float32Array(frames * 3);
            for (let i = 0; i < frames; i++) {
                // 每一帧
                let currenttime = starttime + i / framePerSecond;
                let currenttime2 = currenttime;
                times[i] = currenttime;
                if (isTranslationLoop) {
                    // currenttime = starttime  + (i % localFrames) / framePerSecond;
                    // currenttime = starttime  + (i % localFrames) / framePerSecond;
                    if (seperate) {
                        // currenttime2 = starttime + (i % localFrames2) / framePerSecond;
                        while (transXKeys.a && currenttime >= transXKeys.k[transXKeys.k.length - 1].t / lottie.fr) {
                            // currenttime += transXKeys.k[0].t / lottie.fr * framePerSecond;
                            currenttime -= localFrames / framePerSecond;
                        }
                        while (transYKeys.a && currenttime2 >= transYKeys.k[transYKeys.k.length - 1].t / lottie.fr) {
                            // currenttime2 += transYKeys.k[0].t / lottie.fr * framePerSecond;
                            currenttime2 -= localFrames2 / framePerSecond;
                        }
                    } else {
                        // currenttime += transKeys[0].t / lottie.fr * framePerSecond;
                        while (currenttime >= transKeys[transKeys.length - 1].t / lottie.fr) {
                            currenttime -= localFrames / framePerSecond;
                        }
                    }
                }
                // if (layer.nm == 'Null 13') {
                //     console.log('currenttime', currenttime, 'currenttime2', currenttime2);
                // }
                let currentIdx = 0;
                let currentIdx2 = 0;
                if (seperate) {
                    if (transXKeys.a) {
                        currentIdx = getSegment(transXKeys.k, currenttime);
                    }
                    if (transYKeys.a) {
                        currentIdx2 = getSegment(transYKeys.k, currenttime2);
                    }
                } else {
                    currentIdx = getSegment(transKeys, currenttime);
                }

                let prev, prev2, next, next2;
                if (seperate) {
                    prev = transXKeys.a ? transXKeys.k[currentIdx] : 0;
                    next = transXKeys.a ? transXKeys.k[currentIdx + 1] : 0;

                    prev2 = transYKeys.a ? transYKeys.k[currentIdx2] : 0;
                    next2 = transYKeys.a ? transYKeys.k[currentIdx2 + 1] : 0;
                } else {
                    prev = transKeys[currentIdx];
                    next = transKeys[currentIdx + 1];
                }

                let percent, percent2;
                if (seperate) {
                    if (transXKeys.a) {
                        percent = (currenttime - prev.t / lottie.fr) / (next.t / lottie.fr - prev.t / lottie.fr);
                        if (percent < 0) percent = 0;
                        if (percent > 1) percent = 1;
                    }
                    if (transYKeys.a) {
                        percent2 = (currenttime2 - prev2.t / lottie.fr) / (next2.t / lottie.fr - prev2.t / lottie.fr);
                        if (percent2 < 0) percent2 = 0;
                        if (percent2 > 1) percent2 = 1;
                    }
                } else {
                    percent = (currenttime - prev.t / lottie.fr) / (next.t / lottie.fr - prev.t / lottie.fr);
                    if (percent < 0) percent = 0;
                    if (percent > 1) percent = 1;
                }

                let bezier, bezier2, realPercent, realPercent2, tx, ty, tz;
                if (seperate) {
                    if (transXKeys.a) {
                        bezier = BezierFactory.getBezierEasing(prev.o.x, prev.o.y, prev.i.x, prev.i.y);
                        realPercent = bezier.get(percent);
                    }
                    if (transYKeys.a) {
                        bezier2 = BezierFactory.getBezierEasing(prev2.o.x, prev2.o.y, prev2.i.x, prev2.i.y);
                        realPercent2 = bezier2.get(percent2);
                    }
                } else {
                    bezier = BezierFactory.getBezierEasing(prev.o.x, prev.o.y, prev.i.x, prev.i.y);
                    realPercent = bezier.get(percent);
                }

                if (seperate) {
                    tx = transXKeys.a
                        ? (1 - realPercent) * prev.s[0] + realPercent * (prev.e || next.s)[0]
                        : transXKeys.k[0];
                    ty = transYKeys.a
                        ? (1 - realPercent2) * prev2.s[0] + realPercent2 * (prev2.e || next2.s)[0]
                        : transYKeys.k[0];
                    tz = 0;
                } else {
                    tx = (1 - realPercent) * prev.s[0] + realPercent * (prev.e || next.s)[0];
                    ty = (1 - realPercent) * prev.s[1] + realPercent * (prev.e || next.s)[1];
                    tz = (1 - realPercent) * prev.s[2] + realPercent * (prev.e || next.s)[2];
                }

                if (prev.to && prev.ti) {
                    let bezierdata = bez.buildBezierData(prev.s, prev.e || next.s, prev.to, prev.ti);
                    let distanceInLine = bezierdata.segmentLength * realPercent;
                    let addedLength = 0;
                    let j = 0;
                    flag = true;
                    let jLen = bezierdata.points.length;
                    let kLen, k;
                    let newValue = [];
                    while (flag) {
                        addedLength += bezierdata.points[j].partialLength;
                        if (distanceInLine == 0 || realPercent == 0 || j == bezierdata.points.length - 1) {
                            kLen = bezierdata.points[j].point.length;
                            for (k = 0; k < kLen; k++) {
                                newValue[k] = bezierdata.points[j].point[k];
                            }
                            break;
                        } else if (
                            distanceInLine >= addedLength &&
                            distanceInLine < addedLength + bezierdata.points[j + 1].partialLength
                        ) {
                            let segPerc = (distanceInLine - addedLength) / bezierdata.points[j + 1].partialLength;
                            kLen = bezierdata.points[j].point.length;
                            for (k = 0; k < kLen; k++) {
                                newValue[k] =
                                    bezierdata.points[j].point[k] +
                                    (bezierdata.points[j + 1].point[k] - bezierdata.points[j].point[k]) * segPerc;
                            }
                            break;
                        }
                        if (j < jLen - 1) {
                            j++;
                        } else {
                            flag = false;
                        }
                    }

                    [tx, ty, tz] = newValue;
                }

                // seperate && isTranslationLoop && console.log(layer.nm, "totalFrames:",totalFrames, 'frames:', frames, 'localFrames:', localFrames, "i:", i, "currenttime:", currenttime, "tx:" ,tx,
                //   'localFrames2:', localFrames2, "currenttime2:", currenttime2, "ty:", ty);

                keyvalues[i * 3] = tx * TransScale;
                // keyvalues[i * 3 + 1] = ty * TransScale;
                keyvalues[i * 3 + 1] = -ty * TransScale;
                // keyvalues[i * 3 + 1] = (lottie.h - ty) * TransScale;
                keyvalues[i * 3 + 2] = tz * TransScale;
            }

            let sampler = createSampler(times, keyvalues, 3);
            gltf.animations[0].samplers.push(sampler);
            transChannel.sampler = gltf.animations[0].samplers.length - 1;
        }
        let rotationChannel = getChannel(nidx, 'rotation');
        if (rotationChannel) {
            let isRotationLoop = layer.ks.r.x && layer.ks.r.x.includes('loop');

            const transKeys = layer.ks.r.k;

            let localFrames = ((transKeys[transKeys.length - 1].t - transKeys[0].t) / lottie.fr) * framePerSecond;

            let times = new Float32Array(frames);
            let keyvalues = new Float32Array(frames * 4);

            // isRotationLoop && console.log(layer.nm, totalFrames, localFrames)

            for (let i = 0; i < frames; i++) {
                // 每一帧
                let currenttime = starttime + i / framePerSecond;
                times[i] = currenttime;
                // 找到当前帧区间
                let currentIdx = 0;
                if (isRotationLoop) {
                    // currenttime = starttime + (i % localFrames) / framePerSecond;
                    while (currenttime >= transKeys[transKeys.length - 1].t / lottie.fr) {
                        currenttime -= localFrames / framePerSecond;
                    }
                }
                for (let kidx = 0; kidx < transKeys.length; kidx++) {
                    let nowk = transKeys[kidx];
                    let nextk = transKeys[kidx + 1];
                    if (nowk.t / lottie.fr <= currenttime && nextk && nextk.t / lottie.fr > currenttime) {
                        currentIdx = kidx;
                        break;
                    }
                    if (kidx == 0 && currenttime < nowk.t / lottie.fr) {
                        currentIdx = 0;
                        break;
                    }
                    if (kidx == transKeys.length - 1 && currenttime >= nowk.t / lottie.fr) {
                        // 因为 currentIdx 必须是prev的
                        currentIdx = kidx - 1;
                        break;
                    }
                }
                let prev = transKeys[currentIdx];
                let next = transKeys[currentIdx + 1];

                let percent = (currenttime - prev.t / lottie.fr) / (next.t / lottie.fr - prev.t / lottie.fr);
                if (percent < 0) percent = 0;
                if (percent > 1) percent = 1;

                let bezier = BezierFactory.getBezierEasing(prev.o.x, prev.o.y, prev.i.x, prev.i.y);
                let realPercent = bezier.get(percent);

                let rz = (1 - realPercent) * prev.s[0] + realPercent * (prev.e || next.s)[0];
                // isRotationLoop && (layer.nm.includes('二')) &&console.log(layer.nm, 'totalFrames:', totalFrames, 'frames:',frames,"localFrames:", localFrames, 'i:', i,'currenttime:', currenttime,'rotate:', rz)

                let quat = quatFromRotationMatrix(zRotate(identity(), (-rz * Math.PI) / 180));

                keyvalues[i * 4] = quat[0];
                keyvalues[i * 4 + 1] = quat[1];
                keyvalues[i * 4 + 2] = quat[2];
                keyvalues[i * 4 + 3] = quat[3];
                // console.log(`currentTime ${currenttime}, z deg ${rz}, frame ${i}, idx ${currentIdx}, percent ${percent}, realPercent ${realPercent}`);
            }

            let sampler = createSampler(times, keyvalues, 4);
            gltf.animations[0].samplers.push(sampler);
            rotationChannel.sampler = gltf.animations[0].samplers.length - 1;
        }

        let scaleChannel = getChannel(nidx, 'scale');
        if (scaleChannel) {
            const transKeys = layer.ks.s.k;
            let times = new Float32Array(frames);
            let keyvalues = new Float32Array(frames * 3);
            for (let i = 0; i < frames; i++) {
                let currenttime = starttime + i / framePerSecond;
                times[i] = currenttime;

                let currentIdx = 0;
                for (let kidx = 0; kidx < transKeys.length; kidx++) {
                    let nowk = transKeys[kidx];
                    let nextk = transKeys[kidx + 1];
                    if (nowk.t / lottie.fr <= currenttime && nextk && nextk.t / lottie.fr > currenttime) {
                        currentIdx = kidx;
                        break;
                    }
                    if (kidx == 0 && currenttime < nowk.t / lottie.fr) {
                        currentIdx = 0;
                        break;
                    }
                    if (kidx == transKeys.length - 1 && currenttime >= nowk.t / lottie.fr) {
                        // 因为 currentIdx 必须是prev的
                        currentIdx = kidx - 1;
                        break;
                    }
                }

                let prev = transKeys[currentIdx];
                let next = transKeys[currentIdx + 1];

                let percent = (currenttime - prev.t / lottie.fr) / (next.t / lottie.fr - prev.t / lottie.fr);
                if (percent < 0) percent = 0;
                if (percent > 1) percent = 1;

                let bezier = BezierFactory.getBezierEasing(prev.o.x[0], prev.o.y[0], prev.i.x[0], prev.i.y[0]);
                let realPercent = bezier.get(percent);

                let sx = (1 - realPercent) * prev.s[0] + realPercent * (prev.e || next.s)[0];
                let sy = (1 - realPercent) * prev.s[1] + realPercent * (prev.e || next.s)[1];
                let sz = (1 - realPercent) * prev.s[2] + realPercent * (prev.e || next.s)[2];
                keyvalues[i * 3] = sx / 100;
                keyvalues[i * 3 + 1] = sy / 100;
                keyvalues[i * 3 + 2] = sz / 100;
            }
            let sampler = createSampler(times, keyvalues, 3);
            gltf.animations[0].samplers.push(sampler);
            scaleChannel.sampler = gltf.animations[0].samplers.length - 1;
        }

        let opacityChannel = getChannel(nidx, 'opacity');
        if (opacityChannel) {
            let isOpacityLoop = layer.ks.o.x && layer.ks.o.x.includes('loop');
            const transKeys = layer.ks.o.k;

            let localFrames = ((transKeys[transKeys.length - 1].t - transKeys[0].t) / lottie.fr) * framePerSecond;

            let times = new Float32Array(frames);
            let keyvalues = new Float32Array(frames);
            for (let i = 0; i < frames; i++) {
                let currenttime = starttime + i / framePerSecond;
                times[i] = currenttime;

                if (isOpacityLoop) {
                    while (currenttime >= transKeys[transKeys.length - 1].t / lottie.fr) {
                        currenttime -= localFrames / framePerSecond;
                    }
                }

                let currentIdx = 0;
                for (let kidx = 0; kidx < transKeys.length; kidx++) {
                    let nowk = transKeys[kidx];
                    let nextk = transKeys[kidx + 1];
                    if (nowk.t / lottie.fr <= currenttime && nextk && nextk.t / lottie.fr > currenttime) {
                        currentIdx = kidx;
                        break;
                    }
                    if (kidx == 0 && currenttime < nowk.t / lottie.fr) {
                        currentIdx = 0;
                        break;
                    }
                    if (kidx == transKeys.length - 1 && currenttime >= nowk.t / lottie.fr) {
                        // 因为 currentIdx 必须是prev的
                        currentIdx = kidx - 1;
                        break;
                    }
                }

                let prev = transKeys[currentIdx];
                let next = transKeys[currentIdx + 1];
                let percent = (currenttime - prev.t / lottie.fr) / (next.t / lottie.fr - prev.t / lottie.fr);
                if (percent < 0) percent = 0;
                if (percent > 1) percent = 1;
                let bezier = BezierFactory.getBezierEasing(prev.o.x[0], prev.o.y[0], prev.i.x[0], prev.i.y[0]);
                let realPercent = bezier.get(percent);
                let opa = (1 - realPercent) * prev.s[0] + realPercent * (prev.e || next.s)[0];
                keyvalues[i] = opa / 100;
            }
            let sampler = createSampler(times, keyvalues, 1);
            gltf.animations[0].samplers.push(sampler);
            opacityChannel.sampler = gltf.animations[0].samplers.length - 1;
        }
    }

    node.children.forEach((nidx) => {
        calcNodeAnimation(gltf.nodes[nidx], nidx);
    });
}

function fillAnimation() {
    // delete gltf.animations;
    let roots = gltf.scenes[0].nodes;
    roots.forEach((idx) => {
        let node = gltf.nodes[idx];
        calcNodeAnimation(node, idx);
    });
}

function writeGltf() {
    gltf.buffers = [
        {
            uri: path.basename(dstBinName),
            byteLength: abLength,
        },
    ];
    fs.writeFileSync(dstPath, JSON.stringify(gltf), {
        encoding: 'utf8',
        flag: 'w+',
    });

    arraybuffers.forEach((ab) => {
        fs.appendFileSync(dstBinPath, ab, {
            encoding: 'ascii',
            flag: 'a+',
        });
    });
}

initImagesAndTextures();
fillLottie();
fillAnimation();
writeGltf();

function quatFromRotationMatrix(m, dst = []) {
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

function xRotate(m, angleInRadians, dst) {
    // this is the optimized version of
    // return multiply(m, xRotation(angleInRadians), dst);
    dst = dst || new Float32Array(16);

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

function yRotate(m, angleInRadians, dst) {
    // this is the optimized version of
    // return multiply(m, yRotation(angleInRadians), dst);
    dst = dst || new Float32Array(16);

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

function zRotate(m, angleInRadians, dst) {
    // This is the optimized version of
    // return multiply(m, zRotation(angleInRadians), dst);
    dst = dst || new Float32Array(16);

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

function identity(dst) {
    dst = dst || new Float32Array(16);
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

function inverse(m, dst) {
    dst = dst || new Float32Array(16);
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

function length(v) {
    const num = v.length;
    let length = 0;
    for (let i = 0; i < num; i++) {
        length += v[i] * v[i];
    }
    return Math.sqrt(length);
}

function determinate(m) {
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

function copy(src, dst) {
    dst = dst || new Float32Array(16);

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

function decompose(mat, translation, quaternion, scale) {
    let sx = length(mat.slice(0, 3));
    const sy = length(mat.slice(4, 7));
    const sz = length(mat.slice(8, 11));

    // if determinate is negative, we need to invert one scale
    const det = determinate(mat);
    if (det < 0) {
        sx = -sx;
    }

    translation[0] = mat[12];
    translation[1] = mat[13];
    translation[2] = mat[14];

    // scale the rotation part
    const matrix = copy(mat);

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

    quatFromRotationMatrix(matrix, quaternion);

    scale[0] = sx;
    scale[1] = sy;
    scale[2] = sz;
}

function compose(translation, quaternion, scale, dst) {
    dst = dst || new Float32Array(16);

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

function calcPos(x, y) {
    return y * 4 + x;
}
function multiply(a, b, dst) {
    dst = dst || new Float32Array(16);
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
