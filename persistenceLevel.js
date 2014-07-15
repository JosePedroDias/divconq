'use strict';



var levelup  = require('levelup');
var sublevel = require('level-sublevel');

var DB = sublevel( levelup('divconq.db') );

/*
jobKind

*/


var ids     = DB.sublevel('id');
var kinds   = DB.sublevel('kind');
var jobs    = DB.sublevel('job');
var parts   = DB.sublevel('part');
var answers = DB.sublevel('answer');
var results = DB.sublevel('result');



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



var log = function(name, args) {
    var r = [name, '('];
    for (var i = 0, I = args.length; i < I; ++i) {
        r.push(args[i]);
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

        createKind: function(name, divideFn, worker, conquerFn, cb) { // returns kindId // kind/new
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

        updateKind: function(kId, name, divideFn, worker, conquerFn, cb) { // kind/update/<kId>
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

        getKinds: function(cb) { // kind/all
            log('getKinds', []);
            
            var res = [];
            kinds.createReadStream({
                keys:   false
            })
            .on('data',  function(o) {   res.push( JSON.parse(o) ); })
            .on('end',   function() {    cb(null, res);             })
            .on('error', function(err) { cb(err);                   })
            .on('close', function() {    cb('closed!');             });
        },


        ////


        createJob: function(kId, cfg, cb) { // returns jobId // job/new
            log('createJob', [kId, cfg]);

            kId = parseInt(kId, 10);
            if (isNaN(kId)) { return cb('invalid kId!'); }
            
            getNextId('job', function(err, jId) {
                if (err) { return cb(err); }

                var kjId = [kId, jId].join('_');

                cfg = JSON.parse(cfg);

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

        getJob: function(kId, jId, cb) { // job/<kId>
            log('getJob', [kId, jId]);

            var kjId = [kId, jId].join('_');

            jobs.get(kjId, function(err, job) {
                if (err) { return cb(err); }

                job = JSON.parse(job);

                cb(null, job);
            });
        },

        getAnActiveJob: function(cb) { // returns {divideFn, worker, conquerFn, jobId} // job/an_active
            log('getAnActiveJob', []);
            // TODO STORE
            setImmediate(function() { cb(null, {divideFn:'d', worker:'w', conquerFn:'w', jobId:'j1'}); });
        },

        getJobs: function(cb) { // job/all
            log('getJobs', []);

            var res = [];
            jobs.createReadStream({
                keys:   false
            })
            .on('data',  function(o) {   res.push( JSON.parse(o) ); })
            .on('end',   function() {    cb(null, res);             })
            .on('error', function(err) { cb(err);                   })
            .on('close', function() {    cb('closed!');             });
        },


        ////


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


        setAnswer: function(kId, jId, index, answer, cb) { // job/<kId>
            log('setAnswer', [kId, jId, index]);

            var kji = [kId, jId, index].join('_');

            answers.put(kji, answer, cb);
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