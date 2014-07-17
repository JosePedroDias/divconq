'use script';



var fs         = require('fs');
var http       = require('http');
var os         = require('os');
var vm         = require('vm');
var formidable = require('formidable');
var Canvas     = require('canvas'); // sudo apt-get install libgif-dev libjpeg-dev libcairo2-dev

var pers   = require('./persistenceLevel')();
var sample = require('./sampleKindAndJob');




var loadFile = function(path) {
    return fs.readFileSync(path).toString();
};

var expandTemplate = function(tplS, modelO) {
    for (var k in modelO) {
        tplS = tplS.replace( new RegExp('({{'+k+'}})', 'g'), modelO[k] );
    }
    return tplS;
};

var getMyIPs = function() {
    var ips = {};
    var ifaces = os.networkInterfaces();
    var onDetails = function(details) {
        if (details.family === 'IPv4') {
            ips[ dev ] = details.address;
        }
    };
    for (var dev in ifaces) {
        ifaces[dev].forEach(onDetails);
    } 
    return ips;
};

var PORT = 4000;

var domain = ['http://', getMyIPs().lo, ':', PORT].join('');



var files = {
    tpl:    loadFile('tpl.js'),
    core:   loadFile('core.js'),
    manage: loadFile('manage.html')
};



var prepareJob = function(kind, cfg) {
    var cfg2, tpl;
    var sandbox = {};
    vm.runInNewContext(
        [
            'var cfg = ', cfg, ';',
            kind.divideFn, ';',
            'var cfgs = divideWork(cfg);'
        ].join(''),
        sandbox
    );
    
    var answerTo = [domain, 'answer'].join('/');
    var kpiTo    = [domain, 'kpi'   ].join('/');

    return {
        tpl: expandTemplate(files.tpl, {
            CORE:   files.core,
            WORKER: kind.worker
        }),
        parts: sandbox.cfgs.forEach(function(c) {
            c.answerTo = answerTo;
            c.kpiTo    = kpiTo;
        }),
    };
};



var srv = http.createServer(function(req, res) {

    var parts = req.url.split('/');
    parts.shift();

    var op = parts[0];
    //console.log( parts );

    if (op === 'favicon.ico') {
        res.writeHead(404);
        return res.end();
    }

    var cb, body;
    if (op === 'kind' || op === 'job' || op === 'result') {
        cb = function(err, result) {
            var o = err ? {status:'error', error:err.toString()} : {status:'ok'};
            if (!err && result) {
                o.result = result;
            }
            body = JSON.stringify(o);
            res.writeHead(200, {
                'Content-Type':   'application/json; charset=utf-8',
                'Content-Length': body.length
            });
            return res.end(body);
        };
    }

    try {
        if (op === 'ask') {
            pers.getAnActive(function(err, body) {
                res.writeHead(200, {
                    'Content-Type':   'text/javascript; charset=utf-8',
                    'Content-Length': body.length
                });
                return res.end(body);
            });
            return;
        }
        else if (op === 'answer') {
            return cb('TODO');

            /*var parts2 = [];
            req.on('data', function(data) {
                parts2.push(data);
            });
            req.on('end', function() {
                var d = parts2.join('');
                //var o = JSON.parse(d);
                //console.log('received ' + d.length + ' bytes');

                // TODO save result

                if (1) { // if all results came, conquer
                    vm.runInNewContext(
                        [wkConquerWork, ';conquerWork(', wkCfg, ', [', d,']);'].join(''),
                        {console:console, fs:fs, Canvas:Canvas, Image:Canvas.Image}
                    );   

                    // TODO update job state to finished 
                }
            });
            body = '{"status":"OK"}';
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type':                'application/json; charset=utf-8',
                'Content-Length':              body.length
            });
            return res.end(body);*/
        }
        else if (op === 'kpi') {
            console.log('KPI:');
            console.log('  data:      ' + decodeURIComponent(parts[1]) );
            console.log('  userAgent: ' + req.headers['user-agent']);
            console.log('  referer:   ' + req.headers.referer);
            console.log('  host:      ' + req.headers.host);
            console.log('  ip:        ' + req.connection.remoteAddress);
            res.writeHead(200, {
                'Content-Type':   'image/png',
                'Cache-Control':  'no-cache, no-store, must-revalidate',
                'Pragma':         'no-cache',
                'Expires':        '0',
                'Content-Length': '0'
            });
            res.end();

            // TODO save data?
            return cb('TODO SAVE KPI DATA')            
        }
        else if (op === 'manage') {
            body = files.manage;

            body = expandTemplate(body, {
                DIVIDE:  sample.kind.divideFn,
                WORKER:  sample.kind.worker,
                CONQUER: sample.kind.conquerFn,
                CFG:     sample.cfg
            });

            res.writeHead(200, {
                'Content-Type':   'text/html; charset=utf-8',
                'Content-Length': body.length
            });
            return res.end(body);
        }
        else if (op === 'kind') {
            if (parts[1] === 'new') {
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                    if (err) { return cb(err); }

                    pers.createKind(fields.name, fields.divideFn, fields.worker, fields.conquerFn, cb);
                });
                return;
            }
            else if (parts[1] === 'update') {
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                    if (err) { return cb(err); }

                    pers.updateKind(parts[2], fields.name, fields.divideFn, fields.worker, fields.conquerFn, cb);
                });
                return;
            }
            else if (parts[1] === 'all') {
                return pers.getKinds(cb);
            }
            return pers.getKind(parts[1], cb);
        }
        else if (op === 'job') {
            if (parts[2] === 'new') {
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                    if (err) { return cb(err); }

                    var kId = parts[1];

                    console.log('1. received job');

                    pers.createJob(kId, fields.cfg, function(err, jId) {
                        if (err) { return cb(err); }

                        console.log('2. saved job');

                        pers.getKind(kId, function(err, kind) {
                            if (err) { return cb(err); }

                            console.log('3. fetched kind');

                            var exp = prepareJob(kind, fields.cfg);

                            console.log('4. divided job cfg');

                            pers.createActive(kId, jId, exp.tpl, exp.parts.length, function(err) {
                                if (err) { return cb(err); }

                                console.log('5. saved tpl and parts status');

                                pers.createParts(kId, jId, exp.parts, function(err) {
                                    if (err) { return cb(err); }

                                    console.log('6. saved parts. Job is ongoing!');

                                    cb(null, jId);
                                });
                            });
                        });
                    });
                });
                return;
            }
            else if (parts[1] === 'all') {
                return pers.getJobs(cb);
            }
            return pers.getJob(parts[1], parts[2], cb);
        }
        else if (op === 'part') {
            return pers.getPart(parts[1], parts[2], parts[3], cb);
        }
        /*else if (op === 'answer') {
            return pers.setAnswer(parts[1], parts[2], parts[3], cb);
        }*/
        else if (op === 'result') {
            return pers.getResult(parts[1], parts[2], cb);
        }
    } catch (ex) {
        //throw ex;
        res.writeHead(500);
        return res.end([ex.toString(), ex.stacktrace()].join('\n'));
    }

    // TODO TEMP
    //return pers.createPart(1, 2, 3, '{"a":"b"}', cb);

    res.writeHead(404);
    res.end('unsupported path: "' + req.url + '"');
});

srv.listen(PORT);

console.log('running on ' + domain + ' ...');
