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
            ir:        ir,
            ii:        ii
        };
    }
