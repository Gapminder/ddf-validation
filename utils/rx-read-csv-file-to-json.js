'use strict';

const fs = require('fs');
const Rx = require('rxjs');
const parse = require('csv-parse');
var Observable = Rx.Observable;

module.exports = function (filePath) {
  let record, output = [];
  return Observable.create(observer => {
    const parser = parse({});
    parser.on('readable', function(){
      while(record = parser.read()){
        observer.next(record);
      }
    });
    parser.on('error', function(err){
      observer.error(err);
    });
    parser.on('finish', function(){
      observer.complete(output);
    });

    fs.createReadStream(filePath).pipe(parser);
  }).publish().refCount();
};