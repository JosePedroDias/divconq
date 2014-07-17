'use strict';



var levelup  = require('levelup');
var sublevel = require('level-sublevel');

var DB = sublevel( levelup('divconq.db') );



var ids         = DB.sublevel('id');
var kinds       = DB.sublevel('kind');
var jobs        = DB.sublevel('job');
var actives     = DB.sublevel('active');
var activePools = DB.sublevel('activePool');
var parts       = DB.sublevel('part');
var answers     = DB.sublevel('answer');
var results     = DB.sublevel('result');



var randInArr = function(arr) {
    var l = arr.length;
    return arr[ ~~(Math.random() * l) ];
};



var getNextId = function(name, cb) {
    ids.get(name, function(err, num) {
        num = parseInt(num, 10);
        if (err || isNaN(num)) {
            num = 0;
        }
        ++num;
        ids.put(name, ''+num, function(err) {
            if (err) { return cb(err); }

            cb(null, num);
        });
    });
};



//var log = function() {};

var log = function(name, args) {
    var a, r = [name, '('];
    for (var i = 0, I = args.length; i < I; ++i) {
        a = args[i];
        if (typeof a === 'string' && a.length > 20) {
            a = a.substring(0, 20) + '...';
        }
        r.push(a);
        r.push(', ');
    }
    if (I !== 0) {
        r.pop();
    }
    r.push(')');
    console.log( r.join('') );
};


var persistence = function() {

    var api = {

        createKind: function(name, divideFn, worker, conquerFn, cb) { // kind/new (POST)
            log('createKind', [divideFn, worker, conquerFn]);

            getNextId('kind', function(err, kId) {
                if (err) { return cb(err); }

                var o = {
                    id:        kId,
                    name:      name,
                    divideFn:  divideFn,
                    worker:    worker,
                    conquerFn: conquerFn
                };
                o = JSON.stringify(o);

                kinds.put(kId, o, function(err) {
                    if (err) { return cb(err); }

                    cb(null, kId);
                });
            });
        },

        getKind: function(kId, cb) { // kind/<kId>
            log('getKind', [kId]);

            kinds.get(kId, function(err, kind) {
                if (err) { return cb(err); }

                kind = JSON.parse(kind);

                cb(null, kind);
            });
        },

        // TODO NOT IN USE
        updateKind: function(kId, name, divideFn, worker, conquerFn, cb) { // kind/update/<kId> (POST)
            log('updateKind', [kId, name, divideFn, worker, conquerFn]);

            kId = parseInt(kId, 10);
            if (isNaN(kId)) { return cb('invalid kId!'); }

            var o = {
                id:        kId,
                name:      name,
                divideFn:  divideFn,
                worker:    worker,
                conquerFn: conquerFn
            };
            o = JSON.stringify(o);

            kinds.put(kId, o, cb);
        },

        getKinds: function(cb) { // kind/all (GET)
            log('getKinds', []);
            
            var res = [];
            kinds.createReadStream({
                keys:   false
            })
            .on('data',  function(o) {
                o = JSON.parse(o);
                res.push({
                    id:   o.id,
                    name: o.name
                });
            })
            .on('end',   function() {    cb(null, res);             })
            .on('error', function(err) { cb(err);                   })
            .on('close', function() {    cb('closed!');             });
        },


        ////


        createJob: function(kId, cfg, cb) { // job/new (POST)
            log('createJob', [kId, cfg]);

            kId = parseInt(kId, 10);
            if (isNaN(kId)) { return cb('invalid kId!'); }
            
            getNextId('job', function(err, jId) {
                if (err) { return cb(err); }

                var kjId = [kId, jId].join('_');

                var o = {
                    id:  jId,
                    kId: kId,
                    cfg: cfg
                };
                o = JSON.stringify(o);

                jobs.put(kjId, o, function(err) {
                    if (err) { return cb(err); }

                    cb(null, jId);
                });
            });
        },

        // TODO NOT YET IN USE
        getJob: function(kId, jId, cb) { // job/<kId>
            log('getJob', [kId, jId]);

            var kjId = [kId, jId].join('_');

            jobs.get(kjId, function(err, job) {
                if (err) { return cb(err); }

                job = JSON.parse(job);

                cb(null, job);
            });
        },


        ////


        createActive: function(kId, jId, tpl, numParts, cb) {
            log('createActive', [kId, jId, tpl, numParts]);

            var kjId = [kId, jId].join('_');

            var rp = new Array(numParts);
            for (var i = 0; i < numParts; ++i) {
                rp[i] = i;
            }

            var o = {
                tpl:            tpl,
                remainingParts: rp
            };
            o = JSON.stringify(o);

            actives.put(kjId, o, cb);
        },

        getAnActive: function(cb) { // /ask (GET)
            log('getAnActive', []);

            this.getActivePool(function(err, ap) {
                if (err) { return cb(err); }

                var kjId = randInArr(ap);

                console.log('1. out of activePool ' + JSON.stringify(ap) + ' elected ' + kjId);

                actives.get(kjId, function(err, active) {
                    if (err) { return cb(err); }

                    active = JSON.parse(active);

                    var index = randInArr( active.remainingParts );

                    console.log('2. out of remainingParts ' + JSON.stringify(active.remainingParts) + ' elected ' + index);

                    var tpl = active.tpl;
                    var kji = [kjId, index].join('_');

                    parts.get(kji, function(err, part) {
                        if (err) { return cb(err); }

                        tpl = tpl.replace( new RegExp('({{CFG}})', 'g'), part );

                        console.log('3. applying template with part');
                        
                        cb(null, tpl);
                    });
                });
            });
        },


        ////


        updateActivePool: function(op, kId, jId, cb) {
            log('updateActivePool', [op, kId, jId]);

            var kjId = [kId, jId].join('_');

            activePools.get('singleton', function(err, ap) {
                if (err) {
                    ap = [];
                }
                else {
                    ap = JSON.parse(ap);
                }

                if (op === 'add') {
                    ap.push(kjId);
                }
                else if (op === 'remove') {
                    var idx = ap.indexOf(kjId);
                    if (idx === -1) {
                        return cb('kjId ' + kjId + ' not found');
                    }
                    ap.splice(idx, 1);
                }
                else {
                    return cb('unsupported op: ' + op);
                }

                ap = JSON.stringify(ap);

                activePools.put('singleton', ap, cb);
            });
        },


        getActivePool: function(cb) { // activepool (GET)
            log('getActivePool', []);

            activePools.get('singleton', function(err, ap) {
                if (err) { return cb(err); }

                cb(null, JSON.parse(ap));
            });
        },


        ////


        createParts: function(kId, jId, prts, cb) {
            log('createParts', [kId, jId, prts]);

            var batch = prts.map(function(p, index) {
                return {
                    key:   [kId, jId, index].join('_'),
                    value: p,
                    type:  'put'
                };
            });

            parts.batch(batch, cb);
        },


        getPart: function(kId, jId, index, cb) { // job/<kId>
            log('getPart', [kId, jId, index]);

            var kji = [kId, jId, index].join('_');

            parts.get(kji, function(err, part) {
                if (err) { return cb(err); }

                part = JSON.parse(part);

                cb(null, part);
            });
        },


        ////


        createAnswer: function(kId, jId, index, answer, cb) {
            log('createAnswer', [kId, jId, index, answer]);

            var kji = [kId, jId, index].join('_');

            answers.put(kji, cb);
        },

        getAnswer: function(kId, jId, index, cb) {
            log('getAnswer', [kId, jId, index]);

            var kji = [kId, jId, index].join('_');

            answers.get(kji, function(err, part) {
                if (err) { return cb(err); }

                //part = JSON.parse(part);

                cb(null, part);
            });
        },


        ////


        getResult: function(kId, jId, cb) { // returns {status, result} // /result/<jId>
            log('getResult', [kId, jId]);

            var kjId = [kId, jId].join('_');

            results.get(kjId, function(err, result) {
                if (err) { return cb(err); }

                result = JSON.parse(result);

                cb(null, result);
            });
        },

    };

    return api;
};



module.exports = persistence;