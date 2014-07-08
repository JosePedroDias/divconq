'use strict'



var code = function() {/*
{{WORKER}}
*/}.toString()
    .replace(/^[^\/]+\/\*!?/, '')
    .replace(/\*\/[^\/]+$/,   '');



{{DIVCONQ_CORE}}



var cfg = {{CFG}};



{{ADD_WORKER}}



addWorker(cfg.index);
