"use strict";
var _ = require('lodash'),
	exec = require('child_process').exec,
	gutil = require('gulp-util'),
	PluginError = gutil.PluginError,
	through = require('event-stream').through;

var PLUGIN_NAME = 'gulp-nunit-runner';

var assemblies = [],
	switches = [],
	options;

var runner,
	stream,
	fail,
	end;

// Main entry point
var runner = function gulpNunitRunner(opts) {
	options = opts;

	if (!opts || !opts.executable) {
		throw new PluginError(PLUGIN_NAME, "Path to NUnit executable is required in options.executable.");
	}
	// trim any existing surrounding quotes and then wrap in ""
	opts.executable = '"' + opts.executable.replace(/(^")|(^')|("$)|('$)/g, "") + '"';

	if (opts.options) {
		parseSwitches(opts.options);
	}

	// Creating and return a stream through which each file will pass
	stream = through(transform, flush);
	setupHandlers();
	return stream;
};

var setupHandlers = function () {
	fail = _.bind(function (msg) {
		this.emit('error', new gutil.PluginError(PLUGIN_NAME, msg));
	}, stream);

	end = _.bind(function () {
		this.emit('end');
	}, stream);
};

runner.addAssembly = function (assembly) {
	assemblies.push(assembly);
}

runner.getExecutionCommand = function () {
	var execute = [];
	execute.push(options.executable);
	if (switches.length) {
		execute.push(switches.join(' '));
	}
	execute.push('"' + assemblies.join('" "') + '"');
	execute = execute.join(' ');
	return execute;
};

function parseSwitches(options) {
	_.forEach(options, function (val, key) {
		if (typeof val === 'boolean') {
			if (val) {
				switches.push('/' + key);
			}
			return;
		}
		if (typeof val === 'string') {
			switches.push('/' + key + ':"' + val + '"');
		}
	});
}

function transform(file, enc, callback) {
	if (!file) {
		return fail('File may not be null.');
	}
	runner.addAssembly(file.path);
	this.push(file);
}

function flush() {

	if (assemblies.length === 0) {
		return fail('Some assemblies required.'); //<-- See what I did there ;)
	}

	var cp = exec(runner.getExecutionCommand(), function (err/*,stdout, stderr*/) {
		if (err) {
			gutil.log(gutil.colors.red('NUnit tests failed.'));
			return fail('NUnit tests failed.');
		}
		gutil.log(gutil.colors.cyan('NUnit tests passed'));
		return end();
	});

	cp.stdout.pipe(process.stdout);
	cp.stderr.pipe(process.stderr);
}

module.exports = runner;
