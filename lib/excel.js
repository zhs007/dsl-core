"use strict";

// 导出静态表为excel，这时会把静态表放在第一个tab页，后面的页放枚举列表，方便编辑查看

var fs = require('fs');
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

function exportStatic(path, obj, callback, root) {
    var arr = [];
    arr.push({name: obj.name, data: []});

    var comment = [];
    var head = [];

    base.forEachStruct(obj.name, obj, root, function (structname, memberobj, root) {
        comment.push(memberobj.comment);
        head.push(memberobj.name.name);

        let curobj = base.getGlobalObj(memberobj.type, root);
        if (base.isEnum(memberobj.type, root)) {
            if (!hasTAB(arr, memberobj.type)) {
                let curtab = exportEnum(memberobj.type, root);
                arr.push(curtab);
            }
        }
    });

    arr[0].data.push(comment);
    arr[0].data.push(head);

    var exceldata = xlsx.build(arr);
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