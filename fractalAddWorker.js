var addWorker = function(index) {
    var payload = cfg;
    var worker = createWorker(code);
    
    // worker aux resources
    var cvsEl = createCanvas(payload.d);
    var ctx = cvsEl.getContext('2d');
    var imgData = ctx.createImageData(payload.d[0], payload.d[1]);
    payload.id = imgData;

    worker.onmessage = function(ev) { // webworker I/O
        var o = ev.data;
      
        if (o.id) { // imageData returned
            ctx.putImageData(o.id, 0, 0);
            var b64Result = cvsEl.toDataURL('image/jpeg');
            
            // free worker resources
            worker.terminate();
            document.body.removeChild(cvsEl);
            cvsEl = undefined; imgData = undefined; ctx = undefined; delete o.id; delete o.m;
            
            if (1) { // gather stuff and answer
                o.resultImg = b64Result;
                o.jobId = cfg.jobId;

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

                ajax(cfg.answerTo, o, function(err, res) {
                    console.log(err, res);
                });
            }
        }
    };
    worker.postMessage(payload);
};
