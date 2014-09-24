#!/usr/bin/env node

"use strict";

var http = require("http");
var request = require("request");
var sqlite3 = require('sqlite3').verbose();


//var db = new sqlite3.Database(':memory:');
var db = new sqlite3.Database('./poi.db');
var db;

function createDb() {
    console.log("createDb poi");
    db = new sqlite3.Database('./poi.db', createTable);
}

function createTable() {
    console.log("createTable poi");
	var sql = 'CREATE TABLE POI (hotPointID varchar ( 256 ) NOT NULL PRIMARY KEY, x decimal, y decimal, name varchar ( 256 ), address varchar ( 256 ), phone varchar ( 256 ), url varchar ( 256 ), type integer, isupload integer)'
    db.run(sql,queryData);
}

var postStr = {
	keyWord:"政府",
	level:9,
	mapBound:"115.08095,39.82987,117.55562,40.37094",
	queryType:1,
	count:20,
	start:0,
	queryTerminal:10000
};

var formData = {
  postStr: JSON.stringify(postStr),
  type: 'query'
};

var form = {form:formData};

function queryData() {
	var form = {form:formData};

	var r = request.post('http://www.tianditu.cn/query.shtml', form, function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }
	  // console.log('response.statusCode:',httpResponse.statusCode);
	  // console.log('Upload successful!  Server responded with:', body);
  
	  var data = JSON.parse(body);
	  console.log(data.count);
	  insertRows(data.pois)
	})
	
}

function insertRows(pois) {
    console.log("insertRows pois");

    var stmt = db.prepare("INSERT OR REPLACE INTO POI VALUES (?,?,?,?,?,?,?,?,?)");
    for (var i = 0; i < pois.length; i++) {
		var poi = pois[i];
		var xy = poi.lonlat.split(" ");
        stmt.run(poi.hotPointID,xy[0],xy[1],poi.name,poi.address,poi.phone,poi.url);
    }
    stmt.finalize(closeDb);
}


function closeDb() {
    console.log("closeDb");
    db.close();
}

createDb();



