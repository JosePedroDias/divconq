var conquerWork = function(cfg, results) {
    var Image = Canvas.Image;

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
};
