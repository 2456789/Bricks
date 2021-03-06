module.exports = function(grunt) { 
  grunt.initConfig({ 
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      build: "dist",
      package: "package"
    },
    source: {
      js: ['src/javascript/Bricks.Main.js', 
           'src/javascript/Bricks.Attributes.js',  
           'src/javascript/Bricks.Dom.js', 
           'src/javascript/Bricks.Events.js', 
           'src/javascript/Bricks.Manipulation.js', 
           'src/javascript/Bricks.Elements.js', 
           'src/javascript/Bricks.CSS.js', 
           'src/javascript/Bricks.Ajax.js'],
      scss: ['src/scss']
    },
    clean: {
      build: {
        src: ['<%= meta.build %>/*', '<%= meta.package %>/*']
      }
    },
    sass: {
      options: {
        style: 'expanded',
        banner: '/*\n' +
                '*  <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> \n' +
                '*  Created by <%= pkg.author.name %> \n' +
                '*  License <%= pkg.license.type %> \n' +
                '*  <%= pkg.author.site %>\n' +
                '*/\n\n' 
      },
      dist: {
        files: {
          '<%= meta.build %>/css/<%= pkg.name %>.css': ['<%= source.scss %>/Bricks.scss']
        }
      }
    },
    concat: { 
      options: {
        banner: '/*\n' +
                '*  <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> \n' +
                '*  Created by <%= pkg.author.name %> \n' +
                '*  License <%= pkg.license.type %> \n' +
                '*  <%= pkg.author.site %>\n' +
                '*/\n\n'
      },
      js: {
        src: ['<%= source.js %>'],
        dest: '<%= meta.build %>/js/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        report: 'gzip',
        banner: '/*\n' +
                '*  <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> \n' +
                '*  Created by <%= pkg.author.name %> \n' +
                '*  License <%= pkg.license.type %> \n' +
                '*  <%= pkg.author.site %>\n' +
                '*/\n\n'
      },
      dist: {
        files: {
          '<%= meta.build %>/js/<%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    jshint: {
      files: ['Gruntfile.js', 'dist/js/Bricks.js'],
      options: {
        jshintrc: '.jshintrc',
        force: true
      }
    },
    cssmin: {
      add_banner: {
        options: {
          report: 'gzip',
        banner: '/*\n' +
                '*  <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("dd-mm-yyyy") %> \n' +
                '*  Created by <%= pkg.author.name %> \n' +
                '*  License <%= pkg.license.type %> \n' +
                '*  <%= pkg.author.site %>\n' +
                '*/\n\n'
        },
        files:{
          '<%= meta.build %>/css/<%= pkg.name %>.min.css': ['<%= meta.build %>/css/Bricks.css']
        }
      }
    },
    copy: {
      font: {
        expand: true,
        cwd: 'src/fonts/',
        src: '**',
        dest: '<%= meta.build %>/fonts/',
        flatten: true,
        filter: 'isFile'
      }
    },
    compress: {
      main: {
        options: {
          archive: '<%= meta.package %>/Bricks.zip'
        },
        files: [
          {expand: true, cwd: '<%= meta.build %>/css/', src: ['**'], dest: 'css/'},
          {expand: true, cwd: '<%= meta.build %>/js/', src: ['**'], dest: 'js/'},
          {expand: true, cwd: '<%= meta.build %>/fonts/', src: ['**'], dest: 'fonts/'}
        ]
      }
    },
    connect: {
      server: {
        options: {
          port: 33746,
          protocol: 'http',
          hostname: 'localhost',
          base: '.',
          debug: false,
          livereload: true
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      js: {
        files: ['<%= source.js %>/*', '<%= source.js %>/**/*'],
        tasks: ['concat', 'uglify'],
        options: {
          spawn: false
        }
      },
      sass: {
        files: ['<%= source.scss %>/*', '<%= source.scss %>/**/*'],
        tasks: ['sass', 'cssmin'],
        options: {
          spawn: false
        }
      },
      html: {
        files: ['example/*'],
        options: {
          spawn: false
        }
      },
      jshint: {
        files: ['Gruntfile.js', 'src/javascript/*.js', 'src/javascript/**/*.js'],
        tasks: ['jshint', 'concat', 'uglify'],
        options: {
          spawn: false
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.registerTask('default', ['clean', 'sass', 'concat', 'uglify', 'cssmin', 'copy', 'compress', 'jshint']);
  grunt.registerTask('dev', ['clean', 'sass', 'concat', 'uglify', 'cssmin', 'copy', 'compress', 'jshint', 'connect', 'watch']);
  grunt.registerTask('livereload', ['connect', 'watch']);
  grunt.registerTask('travis-ci', ['clean', 'sass', 'concat', 'uglify', 'cssmin', 'copy', 'compress', 'jshint']);
};