'use script';



var fs         = require('fs');
var http       = require('http');
var os         = require('os');
var vm         = require('vm');
var formidable = require('formidable');
var Canvas     = require('canvas'); // sudo apt-get install libgif-dev libjpeg-dev libcairo2-dev

var csl    = require('./csl');
var pers   = require('./persistenceLevel')();
var sample = require('./samples/primes');



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



var templates = {
    tpl:    loadFile('templates/tpl.js'),
    core:   loadFile('templates/core.js'),
    manage: loadFile('templates/manage.html')
};



var prepareJob = function(kId, jId, kind, cfg) {
    var sandbox = {};
    vm.runInNewContext(
        [
            'var cfg = ', cfg.trim(), ';\n',
            'var divideWork = function(cfg) {\n',
            kind.divideFn.trim(), ';\n',
            '};\n',
            'var cfgs = divideWork(cfg);'
        ].join(''),
        sandbox
    );
    
    var answerTo = [domain, 'answer', kId, jId].join('/');
    var kpiTo    = [domain, 'kpi',    kId, jId].join('/');

    var tpl = expandTemplate(templates.tpl, {
        CORE:   templates.core,
        WORKER: kind.worker
    });

    var parts = sandbox.cfgs;
    parts.forEach(function(c, index) {
        c.answerTo = answerTo + '/' + index;
        c.kpiTo    = kpiTo    + '/' + index;
    });

    parts = parts.map(function(p) {
        return JSON.stringify(p);
    });

    return {
        tpl:   tpl,
        parts: parts
    };
};



var srv = http.createServer(function(req, res) {

    var parts = req.url.split('/');
    parts.shift();

    var op = parts[0];
    //console.log([ csl.green[0], '\n\n-> [', parts.join(','), ']', csl.green[1] ].join(''));

    if (op === 'favicon.ico') {
        res.writeHead(404);
        return res.end();
    }

    var cb, body, form;
    if (op === 'kind' || op === 'job' || op === 'result' || op === 'active') {
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
                if (err) {
                    body = '';
                }

                res.writeHead(200, {
                    'Content-Type':   'text/javascript; charset=utf-8',
                    'Content-Length': body.length
                });
                return res.end(body);
            });
            return;
        }
        else if (op === 'answer') {
            var parts2 = [];
            req.on('data', function(data) {
                parts2.push(data);
            });
            req.on('end', function() {
                var answer = parts2.join('');
                //console.log('0. received ' + answer.length + ' bytes');

                var kId = parts[1];
                var jId = parts[2];
                var index = parts[3];

                pers.createAnswer(kId, jId, index, answer, function(err) {
                    if (err) { throw err; }

                    //console.log('1. answer saved');

                    pers.updateActive(kId, jId, index, function(err, nrPartsLeft) {
                        if (err) { throw err; }

                        if (nrPartsLeft > 0) {
                            console.log('2. actived updated - parts left to answer: ' + nrPartsLeft);
                            
                            var body = '{"status":"ok"}';
                            res.writeHead(200, {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type':                'application/json; charset=utf-8',
                                'Content-Length':              body.length
                            });
                            return res.end(body);
                        }

                        pers.updateActivePool('remove', kId, jId, function(err) {
                            if (err) { throw err; }

                            //console.log('2. active removed - all job answer gathered, pool updated');

                            pers.getKind(kId, function(err, kind) {
                                if (err) { throw err; }

                                //console.log('3. kind gathered');

                                pers.getJob(kId, jId, function(err, job) {
                                    if (err) { throw err; }

                                    //console.log('4. job gathered');

                                    pers.getAnswers(kId, jId, function(err, answers) {
                                        if (err) { throw err; }

                                        //console.log('5. answers gathered');

                                        var sandbox = {
                                            console: console,
                                            fs:      fs,
                                            Canvas:  Canvas,
                                            Image:   Canvas.Image
                                        };
                                        vm.runInNewContext(
                                            ['var conquerWork = function(cfg, results) {', kind.conquerFn, '}; var result = conquerWork(', job.trim(), ', [', answers, ']);'].join(''),
                                            sandbox
                                        );

                                        //console.log('6. answers conquered into result');

                                        pers.createResult(kId, jId, sandbox.result, function(err) {
                                            if (err) { throw err; }

                                            //console.log('7. result saved. all done for this job!');

                                            var body = '{"status":"ok"}';
                                            res.writeHead(200, {
                                                'Access-Control-Allow-Origin': '*',
                                                'Content-Type':                'application/json; charset=utf-8',
                                                'Content-Length':              body.length
                                            });
                                            res.end(body);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
            return;
        }
        else if (op === 'kpi') {
            console.log('KPI:');
            console.log('  kji:       ' + [parts[1], parts[2], parts[3]].join('/'));
            console.log('  data:      ' + decodeURIComponent(parts[4]));
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
            return cb('TODO SAVE KPI DATA');
        }
        else if (op === 'manage') {
            body = templates.manage;

            body = expandTemplate(body, {
                NAME:    sample.kind.name,
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
                form = new formidable.IncomingForm();
                form.parse(req, function(err, fields) {
                    if (err) { return cb(err); }

                    pers.createKind(fields.name, fields.divideFn, fields.worker, fields.conquerFn, cb);
                });
                return;
            }
            else if (parts[1] === 'update') {
                form = new formidable.IncomingForm();
                form.parse(req, function(err, fields) {
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
                form = new formidable.IncomingForm();
                form.parse(req, function(err, fields) {
                    if (err) { return cb(err); }

                    var kId = parts[1];

                    //console.log('1. received job');

                    pers.createJob(kId, fields.cfg, function(err, jId) {
                        if (err) { return cb(err); }

                        //console.log('2. saved job');

                        pers.getKind(kId, function(err, kind) {
                            if (err) { return cb(err); }

                            //console.log('3. fetched kind');

                            var exp = prepareJob(kId, jId, kind, fields.cfg);

                            //console.log('4. divided job cfg');

                            pers.createActive(kId, jId, exp.tpl, exp.parts.length, function(err) {
                                if (err) { return cb(err); }

                                //console.log('5. saved tpl and parts status');

                                pers.createParts(kId, jId, exp.parts, function(err) {
                                    if (err) { return cb(err); }

                                    //console.log('6. saved parts');

                                    pers.updateActivePool('add', kId, jId, function(err) {
                                        if (err) { return cb(err); }

                                        //console.log('7.updated active pool. Job is ongoing!');

                                        cb(null, jId);
                                    });
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
        else if (op === 'active') {
            return pers.getActives(cb);
        }
        else if (op === 'result') {
            if (parts[1] === 'all') {
                return pers.getResults(cb);
            }
            return pers.getResult(parts[1], parts[2], cb);
        }
    } catch (ex) {
        //throw ex;
        res.writeHead(500);
        return res.end([ex.toString()/*, ex.stacktrace()*/].join('\n'));
    }

    res.writeHead(404);
    res.end('unsupported path: "' + req.url + '"');
});

srv.listen(PORT);

console.log('running on ' + domain + ' ...');
