'use strict';



var request = require('request');
var async   = require('async');

var sample = require('./primes'+'Sample');



var cb = function(err, res) {
    if (err) { return console.error('ERROR:', err); }
    console.log('RESULT:', res);
};

var req2 = function(path, fields, cb) {
    request({
        method: 'GET',
        url:    host + path,
        form:   fields
    }, function(err, resp, body) {
        if (err) { return cb(err); }

        var o = JSON.parse(body);
        if (o.error) { return cb(o.error);}

        cb(null, o.result);
    });
};



var host = 'http://127.0.0.1:4000';

var kId, jId;

async.series([
    function(cb2) {req2('/kind/new',
        sample.kind,
        function(err, res) {
            if (err) { return cb2(err); }

            kId = res;
            cb2(null, 'kId:' + res);
        });
    },
    function(cb2) {req2('/job/' + kId + '/new',
        {
            cfg: sample.cfg
        },
        function(err, res) {
            if (err) { return cb2(err); }

            jId = res;
            cb2(null, 'jId:' + res);
        });
    }
], cb);
