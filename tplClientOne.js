'use strict'



var code = function() {/*
{{WORKER}}
*/}.toString()
    .replace(/^[^\/]+\/\*!?/, '')
    .replace(/\*\/[^\/]+$/,   '');



{{DIVCONQ_CORE}}



{{CFG}}



{{DIVIDE_WORK}}



{{ADD_WORKER}}



addWorker(cfg.index);
