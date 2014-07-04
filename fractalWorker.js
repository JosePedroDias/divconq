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

    //try {

    var i, row, column;
    var drow = (br.i - tl.i) / h;
    var dcol = (br.r - tl.r) / w;
    var iter;
    for (row = 0; row < h; ++row) {
        for (column = 0; column < w; ++column) {
            var p = {r: tl.r + column*dcol, i: tl.i + row*drow };
            var v = {r: 0, i: 0}
            iter = 0;

            while (CPX.abs2(v) < 4 && iter < maxIter) {
                v = CPX.add( CPX.multiply(v, v), p);
                iter++;
            }
            
            if (iter > 255) { iter %= 255; }

            var index = (row*w + column) * 4;
            imgData.data[index+0] = iter % 255;
            imgData.data[index+1] = iter % 255;
            imgData.data[index+2] = iter % 255;
            imgData.data[index+3] = 255;
        }
    }

    //} catch(ex) { console.error(ex); }

    postMessage({id:imgData, m:'end', index:o.index, ir:o.ir, ii:o.ii, d:o.d});
};
