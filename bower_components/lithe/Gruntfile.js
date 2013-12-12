var banner = '/* \r\n <%=pkg.name%> \r\n @author <%=pkg.author.name%> [<%=pkg.author.email%>] \r\n @fileoverview <%=pkg.description%> \r\n @vserion <%=pkg.version%> \r\n */\r\n';
module.exports = function(grunt) {
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
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
        }
    });
    grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['includes','uglify']);
};

