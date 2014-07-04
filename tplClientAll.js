'use strict'



var code = function() {/*
{{WORKER}}
*/}.toString()
    .replace(/^[^\/]+\/\*!?/, '')
    .replace(/\*\/[^\/]+$/,   '');



{{DIVCONQ_CORE}}



{{CFG}}



{{DIVIDE_WORK}}



var steps = cfg.parts[0] * cfg.parts[1];
var yetToComplete = steps;
log('workers: ' + yetToComplete);



{{ADD_WORKER}}



for (var i = 0, I = steps; i < I; ++i) { // spawn the workers!
  addWorker(i);
}
