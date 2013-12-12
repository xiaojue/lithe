var path = require('path');
var config = require('./config.js');
var banner = '/* <%=pkg.name%> | <%=pkg.description%> | vserion <%=pkg.version%>*/\r\n';
module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		lithe: {
			example: {
				options: {
					basepath: __dirname,
					alias: config.alias
				},
				files: {
					"../assest/conf/": "conf/"
				}
			}
		},
		concat: {
			config: {
				files: {
					'../assest/lithe.min.js': ['../../lithe.min.js', '../assest/config.js']
				}
			}
		},
		uglify: {
			options: {
				mangle: {
					except: ['require']
				},
				banner: banner
			},
			apps: {
				src: '../assest/conf/*.js',
				dest: '../assest/conf/',
				expand: true,
				flatten: true,
				ext: '.js'
			},
			config: {
				files: {
					"../assest/config.js": ['config.js']
				}
			}
		}
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-lithe');
	grunt.registerTask('default', ['lithe:example', 'uglify:apps', 'uglify:config', 'concat:config']);
};

