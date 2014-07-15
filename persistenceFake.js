'use strict';


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

		createNewJobKind: function(name, divideFn, workerFn, conquerFn, cb) { // returns jobKindId // job_kind/new
			log('createNewJobKind', [divideFn, workerFn, conquerFn]);
			// TODO STORE
			setImmediate(function() { cb(null, 'jk1'); });
		},

		updateJobKind: function(jobKindId, name, divideFn, workerFn, conquerFn, cb) { // job_kind/update/<jkId>
			log('updateJobKind', [jobKindId, name, divideFn, workerFn, conquerFn]);
			// TODO STORE
			setImmediate(function() { cb(null); });
		},

		getJobKinds: function(cb) { // job_kind/all
			log('getJobKinds', []);
			// TODO STORE
			setImmediate(function() { cb(null, [{id:'jk1', name:'asd', status:'x'}]); });
		},

		////

		createNewJob: function(jobKindId, cfg, cb) { // returns jobId // job/new
			log('createNewJob', [jobKindId, cfg]);
			// TODO STORE
			setImmediate(function() { cb(null, 'j1'); });
		},

		getAnActiveJob: function(cb) { // returns {divideFn, workerFn, conquerFn, jobId} // job/an_active
			log('getAnActiveJob', []);
			// TODO STORE
			setImmediate(function() { cb(null, {divideFn:'d', workerFn:'w', conquerFn:'w', jobId:'j1'}); });
		},

		getJobResults: function(jobId, cb) { // returns {status, result} // job/results/<jId>
			log('getJobResults', [jobId]);
			// TODO STORE
			setImmediate(function() { cb(null, ['a', 'b']); });
		},

		getJobs: function(cb) { // job/all
			log('getJobs', []);
			// TODO STORE
			setImmediate(function() { cb(null, [{}, {}]); });
		}

	};

	return api;
};



module.exports = persistence;