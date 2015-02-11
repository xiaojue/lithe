var banner = [
	'/**',
	'<%=pkg.name%>',
	'@author <%=pkg.author.name%> [<%=pkg.author.email%>]',
	'@fileoverview <%=pkg.description%>',
	'@vserion <%=pkg.version%>',
	'**/',
	''
].join('\r\n');

module.exports = function(grunt) {
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		jshint: {
			all: [
				'test/**/*.js',
				'lithe.js',
				'Gruntfile.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		includes:{
			options:{
				banner:banner
			},
			files:{
				src:'src/wrap.js',
				dest:'lithe.js'
			}
		},
		uglify:{
			options:{
				banner:banner
			},
			files:{
				src:'lithe.js',
				dest:'lithe.min.js'
			}
		},
		mocha: {
			test: {
				src: [
					'test/mocha/**/*.html'
				],
				options: {
					run: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha');

	grunt.registerTask('default', [
		'includes',
		'uglify',
		'jshint',
		'mocha'
	]);

};

