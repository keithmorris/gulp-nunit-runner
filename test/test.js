/* global require,describe,it,beforeEach */
(function () {
	"use strict";
	var expect = require('chai').expect,
		nunit;

	function clearNunit() {
		delete require.cache[require.resolve('../')];
		nunit = require('../');
	}

	describe('Tests for gulp-nunit-runner', function () {
		beforeEach(function () {
			clearNunit();
		});

		describe('No executable command passed in', function () {
			it('Should throw an error.', function () {
				expect(function () {
					nunit({});
				}).to.throw(Error);
			});
		});

		describe('Adding assemblies and option switches should yield correct command.', function () {
			var stream;

			it('Should throw an error with no assemblies', function (cb) {
				stream = nunit({
					executable: 'C:\\nunit\\bin\\nunit-console.exe'
				});
				stream.on('error', function (err) {
					expect(err.message).to.equal('File may not be null.');
					cb();
				});
				stream.write();
			});

			it('Should have correct command with assemblies only.', function () {
				stream = nunit({
					executable: 'C:\\nunit\\bin\\nunit-console.exe'
				});
				nunit.addAssembly('First.Test.dll');
				nunit.addAssembly('Second.Test.dll');
				expect(nunit.getExecutionCommand()).to.equal('C:\\nunit\\bin\\nunit-console.exe  "First.Test.dll" "Second.Test.dll"');
			});

			it('Should have correct command with options added.', function () {
				stream = nunit({
					executable: 'C:\\nunit\\bin\\nunit-console.exe',
					options   : {
						nologo   : true,
						config   : 'Release',
						transform: 'myTransform.xslt'
					}
				});
				nunit.addAssembly('First.Test.dll');
				nunit.addAssembly('Second.Test.dll');
				expect(nunit.getExecutionCommand()).to.equal('C:\\nunit\\bin\\nunit-console.exe /nologo /config:"Release" /transform:"myTransform.xslt" "First.Test.dll" "Second.Test.dll"');
			});
		});
	});
}());

