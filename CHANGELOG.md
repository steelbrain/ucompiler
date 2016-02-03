#### 3.1.3

* Add `preprocessor` priority, used by ucompiler-plugin-rollup

#### 3.1.2

* Hopefully support windows path separator
* Fix a potential bug in cli where invalid errors won't be handled properly
* Fix a bug with sourceMap resolver where it won't resolve properly if oldSourceMap wasn't set

#### 3.1.1

* Fix a bug where files imported in other files will be accidently compiled

#### 3.1.0

* Stricter plugin result validation
* Allow passing multiple target watch locations
* Lock files being written so they are not written twice and thus not emptied
* Allow ignoring writing of files that are imported anywhere
* Recompile any importers when a child file changes

#### 3.0.1

* Fix source map resolution for compilers that concat files
* Show internal errors via cli

#### 3.0.0

* Complete rewrite
* Support rule based compilations
* Simplify plugin API
* Automatically create target directories

#### 2.1.3

* Fix a bug where ucompiler would crash if a file was created and deleted instantly

#### 2.1.2

* A magic happened
