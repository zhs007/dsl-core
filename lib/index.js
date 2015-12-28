"use strict";

var fs = require('fs');
var dsl = require('./grammar/dsl');
var grammar = require('./grammar');
var base = require('./base');
var sql = require('./sql');
var excel = require('./excel');
var protobuf = require('./protobuf');

// 编译字符串
function compile(str) {
    return dsl.parse(str);
}

// 编译文件
function compileFile(filename) {
    let str = fs.readFileSync(filename, 'utf-8');
    return dsl.parse(str);
}

exports.compile = compile;
exports.compileFile = compileFile;

exports.checkGrammar = grammar.checkGrammar;
exports.reverseObj = grammar.reverseObj;

exports.procInMessage = base.procInMessage;
exports.getVer = base.getVer;

exports.exportSql = sql.exportSql;

exports.exportExcel = excel.exportExcel;

exports.exportProtobuf = protobuf.exportProtobuf;