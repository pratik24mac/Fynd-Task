var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    webserver = require('gulp-webserver');

gulp.task('webserver', function() {
    gulp.src('.')
        .pipe(webserver({
            livereload: true,
            port: 8089,
            open: true
        }));
});
gulp.task('watch', function() {
    gulp.watch(['.html,./app/js/*.js,./app/css/*.css'], ['livereload']);
});
gulp.task('livereload', function() {
    livereload.listen();
    livereload({
        start: true
    });
});
gulp.task('default', ['webserver', 'watch']);