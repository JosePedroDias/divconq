'use strict';



var request = require('request');
var async   = require('async');



var fetch = function(fn) {
    return fn.toString()
        .replace(/^[^\/]+\/\*!?/, '')
        .replace(/\*\/[^\/]+$/,   '');
};


var divideFn = function() {/*
    var l = cfg.parts[0] * cfg.parts[1];
    var cfgs = new Array(l);

    var dr, di, ir, ii;
    for (var i = 0; i < l; ++i) {
        dr = (cfg.br.r - cfg.tl.r) / cfg.parts[0];
        di = (cfg.br.i - cfg.tl.i) / cfg.parts[1];
        ir =    i % cfg.parts[0];
        ii = ~~(i / cfg.parts[0]);
      
        cfgs[i] = {
            d:         [cfg.d[0]/cfg.parts[0], cfg.d[1]/cfg.parts[1]],
            tl:        {r: cfg.tl.r +  ir   *dr, i: cfg.tl.i +  ii    *di},
            br:        {r: cfg.tl.r + (ir+1)*dr, i: cfg.tl.i + (ii+1)*di},
            iter:      cfg.iter,
            useCanvas: cfg.useCanvas,
            index:     i,   // for joining the work back
            ir:        ir,
            ii:        ii
        };
    }
*/};

var worker = function() {/*
// based on https://github.com/jacksondk/fractal/blob/master/js/fractal.js

//log('starting');

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

//throw 'x';
//x.y = 2;

var onMessage = function(o) {
    //throw 'y';
    var imgData = o.id;
    var w = o.d[0];
    var h = o.d[1];
    var tl = o.tl;
    var br = o.br;
    var maxIter = o.iter;

    //log(o.id ? 'Y':'N');
    //log(JSON.stringify(o));
    //log(['received', w, h, tl.i, tl.r, br.i, br.r, maxIter].join(' '));

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

    done({
        id:    imgData,
        index: o.index,
        ir:    o.ir,
        ii:    o.ii,
        d:     o.d
    });
};
*/};

var conquerFn = function() {/*
    var W = cfg.d[0];
    var H = cfg.d[1];
    var w = results[0].d[0];
    var h = results[0].d[1];
    //console.log(1, cfg);

    var smallImg = new Image();

    var canvasEl = new Canvas(W, H);
    var ctx = canvasEl.getContext('2d');
    
    //ctx.fillStyle = '#FF0';
    //ctx.fillRect(0, 0, W, H);

    var i, I, res;
    for (i = 0, I = results.length; i < I; ++i) {
        res = results[i];
        smallImg.src = res.resultImg;
        ctx.drawImage(smallImg, res.ir*w, res.ii*h, w, h);    
    }
 
    var buf = canvasEl.toBuffer();
    fs.writeFileSync(cfg.jobId + '.png', buf);

    console.log('done #' + results[0].index);
*/};

var cfg = function() {/*
{
    jobId:       123,            // just for reference back to the server
    useCanvas:   'image/jpeg',   // if set, instantiates a hidden canvas and returns its imageData as id key. uses compression defined as value (image/jpeg or image/png)
    d:           [256*3, 256*2], // image size in px
    tl:          {r:-2, i: 1},   // top left fractal pos
    br:          {r: 1, i:-1},   // bottom right fractal pos
    iter:        240,            // maximum iteration steps
    parts:       [2, 2]          // divide work into w x h parts
}
*/};

divideFn  = fetch(divideFn);
worker    = fetch(worker);
conquerFn = fetch(conquerFn);
cfg       = fetch(cfg);



var cb = function(err, res) {
    if (err) { return console.error('ERROR:', err); }
    console.log('RESULT:', res);
};

var req2 = function(path, fields, cb) {
    request({
        method: 'GET',
        url:    host + path,
        form:   fields
    }, function(err, resp, body) {
        if (err) { return cb(err); }

        var o = JSON.parse(body);
        if (o.error) { return cb(o.error);}

        cb(null, o.result);
    });
};



var host = 'http://127.0.0.1:4000';

var kId, jId;

async.series([
    function(cb2) {req2('/kind/new',
        {
            divideFn:  divideFn,
            worker:    worker,
            conquerFn: conquerFn
        },
        function(err, res) {
            if (err) { return cb2(err); }

            kId = res;
            cb2(null, 'kId:' + res);
        });
    },
    function(cb2) {req2('/job/' + kId + '/new',
        {
            cfg: cfg
        },
        function(err, res) {
            if (err) { return cb2(err); }

            jId = res;
            cb2(null, 'jId:' + res);
        });
    }
], cb);
