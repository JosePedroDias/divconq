/*

PRODUCER                                                         SERVER

producer submits script functions 
                                       -->       new jobKind created with the code
producer submits config data 
                                       -->       new job is created, it's id returned
...

producer checks state of job
                                       -->      



----------------------------



CLIENT                    SERVER

divconq.js
               ->       select one job from pending jobs
                        select on index from pending ids in job
                        generate js for job with job code. include index
                        update job index state from unprocessed to processing
               <-
create webworker
let it process
return result back

*/



var fs   = require('fs');
var http = require('http');
var os   = require('os');
 


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

// TODO: https://gist.github.com/JosePedroDias/9634398 canvas drawing in nodejs (for reduce)



var files = {
	one:  loadFile('tplClientOne.js'),
	all:  loadFile('tplClientAll.js'),
	core: loadFile('divconqClientCore.js')
};



var PORT = 4000;



var srv = http.createServer(function(req, res) {

	var parts = req.url.split('/');
	parts.shift();
	//console.log( parts );

	if (parts[0] === 'favicon.ico') {
		res.writeHead(404);
		return res.end();
	}

	var workKind = parts[0];
	var tplKind  = parts[1];

	try {
		var divConqCore = files.core;
		var tpl = files[tplKind];
		var wkWorker     = loadFile(workKind + 'Worker.js');
		var wkCfg        = loadFile(workKind + 'Cfg.js');
		var wkDivideWork = loadFile(workKind + 'DivideWork.js');
		var wkAddWorker  = loadFile(workKind + 'AddWorker.js');

		var body = expandTemplate(tpl, {
			DIVCONQ_CORE: divConqCore,
			WORKER:       wkWorker,
			CFG:          wkCfg,
			DIVIDE_WORK:  wkDivideWork,
			ADD_WORKER:   wkAddWorker
		});

		//res.writeHead(200, {'Content-Length': body.length});
		return res.end(body);

	} catch (ex) {
		res.writeHead(404);
		//return res.end(ex.toString());
		res.end(ex.toString()); throw ex;
	}

	res.writeHead(404);
	return res.end('?');
});

srv.listen(PORT);



// outpul listening URLs
(function() {
	var ipsHash = getMyIPs();
	var interfaces = Object.keys(ipsHash);
	console.log(
		interfaces.map( function(itf) {
			return [itf, ' -> http://', ipsHash[itf], ':', PORT, '\n'].join('');
		}).join('')
	);
})();
