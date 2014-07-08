(function() {
	'use strict'

	var kpi, log, cfg;

	try {

{{CORE}}



		var code = function() {/*
'use strict';

try {

var log  = function(msg) { postMessage({op:'log', msg:msg}); };
var kpi  = function(msg) { postMessage({op:'kpi', msg:msg}); };
var error = function(msg) { kpi(msg); log(msg); };
var done = function(o) { o.op = 'done'; postMessage(o); };

{{WORKER}}

self.onmessage = function(ev) {
	try {
		onMessage(ev.data);
	} catch (ex) {
		error('webworker onMessage() error:' + (ex.stack ? ex.stack : ex));
	}
};

} catch(ex) {
	error('webworker error:' + (ex.stack ? ex.stack : ex));
}
		*/}.toString()
		    .replace(/^[^\/]+\/\*!?/, '')
		    .replace(/\*\/[^\/]+$/,   '');

		cfg = {{CFG}};

		addWorker(code, cfg); //throw new Error('hey');

	} catch(ex) {
		kpi(cfg.kpiTo, 'divconq error:' + (ex.stack ? ex.stack : ex));
	}

})();
