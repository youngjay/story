var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var livereload = require('gulp-livereload');

gulp.task('build', function() {
    var b = browserify();
    b.add('./index.js');

    return b.bundle({
                standalone: 'Story'
            })
            .pipe(source('story.js'))
            .pipe(gulp.dest('.'))
});

gulp.task('watch', function() {
    var server = livereload();
    gulp.start('build');
    gulp.watch(['./index.js', './test/index.js'], ['build']).on('change', function(file) {
        setTimeout(function() {
            server.changed(file.path);  
        }, 500);
    }) 
});

gulp.task('default', ['watch']);
module.exports = gulp;
