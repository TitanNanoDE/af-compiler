#AF Compiler

This compiler compiles any project that targets a JavaScript runtime. 
Other files than source code, like sass or less, can also be required and compiled in your project, even though it's not recommended.

The compiler is able to be used in a gulp `.pipe()`, but it is not required to use it that way.
 (Don't `.pipe(Gulp.dest(...))` since the compiler will already write the resulting bundles.)
