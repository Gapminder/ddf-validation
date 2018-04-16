# ddf-validation User's guide

## Console utility usage

`validate-ddf [root] [options]`

```
Commands:
  root  DDF Root directory. Current directory will be processed if DDF Root directory is undefined.

Options:
  -v                     Print current version
  -i                     Generate datapackage.json
  --compress-datapackage Compress datapackage.json file
  --translations         Rewrite "translations" section in existing datapackage.json
  --content              Rewrite "resources" and "ddfSchema" sections in existing datapackage.json
  -j                     Fix wrong JSONs
  --rules                Print information regarding supported rules
  --multithread          Validate datapoints in separate threads
  --use-all-cpu          Use all CPU during validation via multithread mode
  --summary              Show summary data regarding the issues after validation
  --datapointless        Forget about datapoint validation
  --hidden               Allow hidden folders validation
  --include-tags         Process only issues by selected tags
  --exclude-tags         Process all tags except selected
  --include-rules        Process only issues by selected rules
  --exclude-rules        Process all rules except selected
  --exclude-dirs         Process all directories except selected.
  --heap                 Set custom heap size

Examples:
  validate-ddf ../ddf-example                                                        validate DDF datasets for the root
  validate-ddf ../ddf-example -i                                                     generate datapackage.json file
  validate-ddf ../ddf-example -i --translations                                      update only "translations" section in datapackage.json
  validate-ddf ../ddf-example -i --translations --content                            rewrite "translations", "resources" and "ddfSchema" sections in datapackage.json
  validate-ddf ../ddf-example -j                                                     fix JSONs for this DDF dataset
  validate-ddf  --rules                                                              print information regarding supported rules
  validate-ddf ../ddf-example --summary                                              Show summary data after validation in case of errors are found
  validate-ddf ../ddf-example --multithread                                          validate datapoints for `ddf-example` in separate threads
  validate-ddf ../ddf-example --multithread --use-all-cpu                            use all CPU during validation via multithread mode
  validate-ddf ../ddf-example --datapointless                                        forget about datapoint validation
  validate-ddf ../ddf-example --hidden                                               allow hidden folders validation
  validate-ddf ../ddf-example --include-rules "INCORRECT_JSON_FIELD"                 validate only by  INCORRECT_JSON_FIELD rule
  validate-ddf ../ddf-example --exclude-tags "WARNING"                               get all kinds of issues except warnings
  validate-ddf ../ddf-example --exclude-dirs "etl,foo-dir"                           validate "ddf-example" and its subdirectories except "etl" and "foo-dir"
  validate-ddf ../ddf-example --exclude-dirs "'dir1 with spaces','dir2 with spaces'" validate "ddf-example" and its subdirectories that contain spaces
  validate-ddf ../ddf-example --exclude-dirs '"dir1 with spaces","dir2 with spaces"' validate "ddf-example" and its subdirectories that contain spaces: case 2
  validate-ddf ../ddf-example -i --heap 4096 --compress-datapackage                  create compressed datapackage.json via 4Gb heap
```
