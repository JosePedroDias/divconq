log = function(m) {
    //console.log(m);
    m = m.replace(/\n/g, '<br/>');
    document.body.insertAdjacentHTML('beforeend', ['<pre>', m, '</pre>'].join(''));
};



kpi = function(u, m) {
    (new Image()).src = [u, encodeURIComponent(m)].join('/');
};



var createWorker = function(code) {
    window.URL = window.URL || window.webkitURL;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    var blob;
    try {
        blob = new Blob([code], {type:'application/javascript'});
    } catch (e) {
        blob = new BlobBuilder(); blob.append(code); blob = blob.getBlob();
    }
    return new Worker(URL.createObjectURL(blob));
};



var createCanvas = function(dims) {
    var cvsEl = document.createElement('canvas');
    cvsEl.width  = dims[0];
    cvsEl.height = dims[1];
    document.body.appendChild(cvsEl);
    return cvsEl;
};



var postJSON = function(uri, data, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', uri, true);
    var cbInner = function() {
        //console.log(xhr.readyState, xhr.status);
        if (xhr.readyState === 4 && xhr.status === 200) {
            return cb(null, JSON.parse(xhr.response));
        }
        cb('postJSON: error requesting ' + uri);
    };
    xhr.onload = cbInner;
    xhr.onerror = cbInner;
    xhr.send( JSON.stringify(data) );
};



var addWorker = function(code, cfg) {
    //kpi(cfg.kpiTo, 'hi there');

    var worker = createWorker(code);
    
    // worker aux resources
    var cvsEl, ctx;
    if (cfg.useCanvas) {
        cvsEl = createCanvas(cfg.d);
        ctx = cvsEl.getContext('2d');
        cfg.id = ctx.createImageData(cfg.d[0], cfg.d[1]);
    }

    // webworker I/O
    worker.onmessage = function(ev) {
        var o = ev.data;
        //console.log(o);

        switch (o.op) {
            case 'log':
                log(o.msg);
                break;

            case 'kpi':
                kpi(cfg.kpiTo, o.msg);
                break;

            case 'done':
                if (o.id) { // imageData returned
                    // draw to canvas and get base64 JPEG back
                    ctx.putImageData(o.id, 0, 0);
                    var b64Result = cvsEl.toDataURL( cfg.useCanvas );
                    
                    // free worker resources
                    document.body.removeChild(cvsEl);
                    cvsEl = undefined; ctx = undefined; delete o.id; delete o.m;
                    
                    // gather stuff and answer
                    o.resultImg = b64Result;    
                }

                worker.terminate();

                o.jobId = cfg.jobId;

                postJSON(cfg.answerTo, o, function(err, res) {
                    //console.log(err || res);
                    if (err) {
                        return log(err);
                    }
                    //log('OK!');
                });
                break;

            default:
                log('unsupported op: "' + o.op + '"');
        }
    };

    worker.postMessage(cfg);
};
