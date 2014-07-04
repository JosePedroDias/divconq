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
