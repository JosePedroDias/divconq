(function() {
    'use strict'

    var kpi, log, cfg;

    try {

{{CORE}}

        var code = function() {/*
'use strict';

try {

    var pm = function(o) { 
        var args = [o];
        if (self.cfg.mode === 'iframe') { args.push('*'); }
        self.postMessage.apply(self, args);
    };
    var log = function(msg) { pm({op:'log', msg:msg}); };
    var kpi = function(msg) { pm({op:'kpi', msg:msg}); };
    var error = function(msg) { kpi(msg); log(msg); };
    var done = function(o) { o.op = 'done'; pm(o); };

{{WORKER}}

    self.addEventListener('message', function(ev) {
        self.cfg = ev.data;
        try {
            onMessage(ev.data);
        } catch (ex) {
            error('webworker onMessage() error:' + (ex.stack ? ex.stack : ex));
        }
    });

} catch(ex) {
    error('webworker error:' + (ex.stack ? ex.stack : ex));
}
        */}.toString()
            .replace(/^[^\/]+\/\*!?/, '')
            .replace(/\*\/[^\/]+$/,   '');

        cfg = {{CFG}};

        addWorker(code, cfg);

    } catch(ex) {
        kpi(cfg.kpiTo, 'divconq error:' + (ex.stack ? ex.stack : ex));
    }

})();
