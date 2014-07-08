'use strict';

// based on https://github.com/jacksondk/fractal/blob/master/js/fractal.js

var CPX = {
    add: function(a, b) {
        return {r: a.r + b.r, i: a.i + b.i};
    },
    subtract: function(a, b) {
        return {r: a.r - b.r, i: a.i - b.i};
    },
    multiply: function(a, b) {
        return {r: a.r*b.r - a.i*b.i, i: a.i*b.r + a.r*b.i};
    },
    toString: function(a) {
        return "" + a.r + "+" + a.i + "i";
    },
    abs: function(a) {
        return Math.sqrt(a.r*a.r + a.i*a.i);
    },
    abs2: function(a) {
        return a.r*a.r + a.i*a.i;
    }
};

self.onmessage = function(ev) {
    var o = ev.data;
    var imgData = o.id;
    var w = o.d[0];
    var h = o.d[1];
    var tl = o.tl;
    var br = o.br;
    var maxIter = o.iter;
    postMessage({m: ['start', w, h, tl.i, tl.r, br.i, br.r, maxIter].join(' ') });

    var i, y, x;
    var dy = (br.i - tl.i) / h;
    var dx = (br.r - tl.r) / w;
    var iter;
    for (y = 0; y < h; ++y) {
        for (x = 0; x < w; ++x) {
            var p = {r: tl.r + x*dx, i: tl.i + y*dy };
            var v = {r: 0, i: 0}
            iter = 0;

            while (CPX.abs2(v) < 4 && iter < maxIter) {
                v = CPX.add( CPX.multiply(v, v), p);
                ++iter;
            }
            
            if (iter > 255) { iter %= 255; }

            var index = (y*w + x) * 4;
            imgData.data[index  ] = iter;
            imgData.data[index+1] = iter;
            imgData.data[index+2] = iter;
            imgData.data[index+3] = 255;
        }
    }

    postMessage({id:imgData, m:'end', index:o.index, ir:o.ir, ii:o.ii, d:o.d});
};
