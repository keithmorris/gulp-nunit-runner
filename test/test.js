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

		describe('Test quoted executable path and path with spaces.', function(){
			var opts;
			var assemblies;

			it('Should not quote a non-quoted string', function(){
				opts = {
					executable: 'C:\\nunit\\bin\\nunit-console.exe'
				};

				expect(nunit.getExecutable(opts)).to.equal('C:\\nunit\\bin\\nunit-console.exe');
			});

			it('Should unquote a double-quoted string', function(){
				opts = {
					executable: '"C:\\nunit\\bin\\nunit-console.exe"'
				};

				expect(nunit.getExecutable(opts)).to.equal('C:\\nunit\\bin\\nunit-console.exe');
			});

			it('Should unquote a single-quoted string', function(){
				opts = {
					executable: "'C:\\nunit\\bin\\nunit-console.exe'"
				};

				expect(nunit.getExecutable(opts)).to.equal('C:\\nunit\\bin\\nunit-console.exe');
			});
		});

		describe('Adding assemblies and option switches should yield correct command.', function () {
			var stream;
			var opts;
			var assemblies;

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

			it('Should have correct options with assemblies only.', function () {
				opts = {
					executable: 'C:\\nunit\\bin\\nunit-console.exe'
				};

				assemblies = ['First.Test.dll', 'Second.Test.dll'];

				expect(nunit.getArguments(opts, assemblies)).to.deep.equal(['First.Test.dll', 'Second.Test.dll']);
			});

			it('Should have correct optiosns with options and assemblies.', function () {
				opts = {
					executable: 'C:\\nunit\\bin\\nunit-console.exe',
					options   : {
						nologo   : true,
						config   : 'Release',
						transform: 'myTransform.xslt'
					}
				};

				assemblies = ['First.Test.dll', 'Second.Test.dll'];


        expect(nunit.getArguments(opts, assemblies)).to.deep.equal(
          [
            '/nologo',
            '/config:Release',
            '/transform:myTransform.xslt',
            'First.Test.dll',
            'Second.Test.dll'
           ]);

			});
		});
	});
}());
