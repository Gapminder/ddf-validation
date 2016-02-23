// todo: populate exceptions
// todo: complete rx observable
// todo: try to rewrite using https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/expand.md
// todo: and https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/if.md
'use strict';
const fs = require('fs');
const rx = require('rxjs');
const path = require('path');

function filesFilter(fileName) {
  return fileName && fileName[0] !== '.' && fileName[0] !== '~';
}

function readDir(observer, root, counter) {
  fs.readdir(root, (err, files)=> {
    if (!files || files.length === 0) {
      if (--counter === 0) {
        observer.complete();
      }
      return;
    }

    const filteredFiles = files
      .filter(filesFilter)
      .map(file => path.join(root, file));

    if (filteredFiles.length <= 0) {
      observer.complete();
      return;
    }

    filteredFiles.forEach(function (file) {
      observer.next(file);
      fs.stat(file, (err, stats) => {
        if (stats && stats.isDirectory()) {
          return readDir(observer, file, counter++);
        }
        if (--counter === 0) {
          observer.complete();
        }
      });
    });
  })
}

module.exports = folder => {
  const stats = fs.statSync(folder);
  if (!stats.isDirectory()) {
    return null;
  }

  return rx.Observable.create(observer => {
    observer.next(folder);
    return readDir(observer, folder, 1);
  });
};

// almost there :)
//function getSubFolders$(normFolder) {
//  return readdir$(normFolder)
//  // unwrap file names array to sequence of file names
//    .mergeMap(x=>x)
//    // map folder to stats object
//    .mergeMap(fileName=> {
//      let filePath = path.resolve(normFolder, fileName);
//      return stat$(filePath)
//        .filter(x => x.isDirectory())
//        .map(stats=> {
//          return {fileName, filePath, stats};
//        })
//    })
//}