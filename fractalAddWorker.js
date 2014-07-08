var addWorker = function(index) {
    //cfg.index = index;
    //var payload = divideWork(cfg);
    var payload = cfg;
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

            if (0) { // show computed image (optional)
                var imgEl = document.createElement('img');
                imgEl.src = b64Result;
                var s = imgEl.style;
                s.position = 'absolute';
                s.left = (o.ir*o.d[0])+'px';
                s.top  = (o.ii*o.d[1])+'px';
                document.body.appendChild(imgEl);
            }
            
            // free worker resources
            worker.terminate();
            document.body.removeChild(cvsEl);
            cvsEl = undefined; imgData = undefined; ctx = undefined; delete o.id; delete o.m;
            
            if (1) {
                o.resultImg = b64Result;
                o.jobId = cfg.jobId;
                console.log('SENDING BACK TO SERVER...', o);

                var ajax = function(uri, data, cb) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', uri, true);
                    var cbInner = function() {
                        if (xhr.readyState === 4 && xhr === 200) {
                            return cb(null, JSON.parse(xhr.response));
                        }
                        cb('error requesting ' + uri);
                    };
                    xhr.onload = cbInner;
                    xhr.onerror = cbInner;
                    xhr.send( JSON.stringify(o) );
                };

                ajax('http://127.0.0.1:4000/fractal/onex', o, function(err, res) {
                    console.log(err, res);
                });
            }
            
            // could send result back now, logging instead
            /*--yetToComplete;
            log('#' + o.index + ' done, left:' + yetToComplete);
            if (yetToComplete === 0) {
                log('DONE!');
            }*/
        }
    };
    worker.postMessage(payload);
};
