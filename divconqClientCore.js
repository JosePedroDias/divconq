var log = function(m) {
    document.body.insertAdjacentHTML('beforeend', ['<div>', m, '</div>'].join(''));
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
