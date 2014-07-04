'use strict'



var code = function() {/*
{{WORKER}}
*/}.toString()
    .replace(/^[^\/]+\/\*!?/, '')
    .replace(/\*\/[^\/]+$/,   '');



var log = function(m) {
    document.body.insertAdjacentHTML('beforeend', ['<div>', m, '</div>'].join(''));
};



{{DIVCONQ_CORE}}



var cfg = {
  jobId: 123,            // just for reference back to the server
  d:    [256*3, 256*2],  // image size in px
  tl:   {r:-2, i: 1},   // top left fractal pos
  br:   {r: 1, i:-1},   // bottom right fractal pos
  iter: 256,             // maximum iteration steps
  parts: [4, 4],        // divide work into 4 2x2 parts
  index: 0             // you're worker 1/4
};



var divideWork = function(cfg) {
    var dr = (cfg.br.r - cfg.tl.r) / cfg.parts[0];
    var di = (cfg.br.i - cfg.tl.i) / cfg.parts[1];
    var ir =    cfg.index % cfg.parts[0];
    var ii = ~~(cfg.index / cfg.parts[0]);
  
    var pl = {
        d:     [cfg.d[0]/cfg.parts[0], cfg.d[1]/cfg.parts[1]],
        tl:    {r: cfg.tl.r +  ir   *dr, i: cfg.tl.i +  ii    *di},
        br:    {r: cfg.tl.r + (ir+1)*dr, i: cfg.tl.i + (ii+1)*di},
        iter:  cfg.iter,
        ir:    ir, // for joining the work back
        ii:    ii,
        index: cfg.index
    };
    //console.log(pl);
    return pl;
};


var steps = cfg.parts[0] * cfg.parts[1];
var yetToComplete = steps;
log('workers: ' + yetToComplete);

var addWorker = function(index) {
    cfg.index = index;
    var payload = divideWork(cfg);
    var worker = createWorker(code);
    
    // worker aux resources
    var cvsEl = createCanvas(payload.d);
    var ctx = cvsEl.getContext('2d');
    var imgData = ctx.createImageData(payload.d[0], payload.d[1]);
    payload.id = imgData;

    worker.onmessage = function(ev) { // webworker I/O
        var o = ev.data;
        //if (o.m) { log(o.m); }
      
        if (o.id) { // imageData returned
            ctx.putImageData(o.id, 0, 0);
            var b64Result = cvsEl.toDataURL('image/jpeg');

            if (1) { // show computed image (optional)
                var imgEl = document.createElement('img');
                imgEl.src = b64Result;
                var s = imgEl.style;
                s.left = (o.ir*o.d[0])+'px';
                s.top  = (o.ii*o.d[1])+'px';
                document.body.appendChild(imgEl);
            }
            
            // free worker resources
            worker.terminate();
            document.body.removeChild(cvsEl);
            cvsEl = undefined; imgData = undefined; ctx = undefined; delete o.id; delete o.m;
            
            if (0) {
                o.resultImg = b64Result;
                o.jobId = cfg.jobId;
                console.log('SENDING BACK TO SERVER...', o);
            }
            
            // could send result back now, logging instead
            --yetToComplete;
            log('#' + o.index + ' done, left:' + yetToComplete);
            if (yetToComplete === 0) {
                log('DONE!');
            }
        }
    };
    worker.postMessage(payload);
};

for (var i = 0, I = steps; i < I; ++i) { // spawn the workers!
  addWorker(i);
}
