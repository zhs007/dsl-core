"use strict";

// 导出静态表为excel，这时会把静态表放在第一个tab页，后面的页放枚举列表，方便编辑查看

var fs = require('fs');
var util = require('util');
var base = require('./base');
var xlsx = require('node-xlsx');

// 判断是否有TAB页
function hasTAB(excelobj, tabname) {
    for (let ii = 0; ii < excelobj.length; ++ii) {
        if (excelobj[ii].name == tabname) {
            return true;
        }
    }

    return false;
}

function exportEnum(enumname, root) {
    let curobj = base.getGlobalObj(enumname, root);
    if (curobj != undefined) {
        let tab = {name: enumname, data: []};

        for (let ii = 0; ii < curobj.val.length; ++ii) {
            let curline = curobj.val[ii];
            tab.data.push([curline.name, curline.val.val, curline.comment]);
        }

        return tab;
    }

    return undefined;
}

function findField(arrdata, fieldname) {
    for (let ii = 0; ii < arrdata[1].length; ++ii) {
        if (arrdata[1][ii] == fieldname) {
            return ii;
        }
    }

    return -1;
}

// src1 是老版本，src2 是新版本
function mergeExcel(src1, src2) {
    if (src1 == undefined) {
        return src2;
    }

    if (src1[0].name != src2[0].name) {
        return src2;
    }

    if (src1[0].data.length <= 2) {
        return src2;
    }

    let dest = [];
    dest.push({name: src2[0].name, data: []});

    for (let ii = 0; ii < src1[0].data.length; ++ii) {
        dest[0].data.push([]);
    }

    for (let ii = 0; ii < src2[0].data[1].length; ++ii) {
        let sf = findField(src1[0].data, src2[0].data[1][ii]);
        if (sf != -1) {
            let cn = src1[0].data.length - 2;

            dest[0].data[0].push(src2[0].data[0][ii]);
            dest[0].data[1].push(src2[0].data[1][ii]);

            for (let jj = 0; jj < cn; ++jj) {
                dest[0].data[jj + 2].push(src1[0].data[jj + 2][sf]);
            }
        }
        else {
            let cn = src1[0].data.length - 2;

            dest[0].data[0].push(src2[0].data[0][ii]);
            dest[0].data[1].push(src2[0].data[1][ii]);

            for (let jj = 0; jj < cn; ++jj) {
                dest[0].data[jj + 2].push('');
            }
        }
    }

    for (let ii = 1; ii < src2.length; ++ii) {
        dest.push(src2[ii]);
    }

    return dest;
}

function exportStatic(path, obj, callback, root) {
    let arrold = undefined;
    if (fs.existsSync(path)) {
        arrold = xlsx.parse(path);
    }

    var arr = [];
    arr.push({name: obj.name, data: []});

    var comment = [];
    var head = [];

    base.forEachStruct(obj.name, obj, root, function (structname, memberobj, root) {
        let curcomment = memberobj.comment;

        let curobj = base.getGlobalObj(memberobj.type, root);
        if (base.isEnum(memberobj.type, root)) {
            curcomment = util.format('%s(%s)', memberobj.comment, memberobj.type);

            if (!hasTAB(arr, memberobj.type)) {
                let curtab = exportEnum(memberobj.type, root);
                arr.push(curtab);
            }
        }

        comment.push(curcomment);
        head.push(memberobj.name.name);
    });

    arr[0].data.push(comment);
    arr[0].data.push(head);

    let destarr = mergeExcel(arrold, arr);

    var exceldata = xlsx.build(destarr);
    fs.writeFileSync(path, exceldata, 'binary');
}

function exportExcel(path, obj, callback) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    if (Array.isArray(obj)) {
        for (var i = 0; i < obj.length; ++i) {
            if (obj[i].type == 'static') {
                var fn = base.getMemberName(obj[i].name);

                exportStatic(path + '/' + fn + '.xlsx', obj[i], callback, obj);
            }
        }

        return ;
    }
}

exports.exportExcel = exportExcel;