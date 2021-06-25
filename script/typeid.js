// 分类取出长度
function typeidstrlen(str) {
    if (str.length < 3) {
        return 60;
    }
    var len = 0;
    for (var i = 0; i < str.length; i++) {
        var c = str.charCodeAt(i);
        //单字节加1   
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
            len++;
        } else {
            len += 3;
        }
    }
    console.log(len)
    return Math.ceil(len * 8.3333333);
}


// 文件
var File = function () {
    var fs = api.require('fs');
    var _this = this;

    // 打开文件
    _this.open = function (path, callback) {
        fs.open({
            path: path,
            flags: 'read_write'
        }, function (ret, err) {
            if (ret.status) {
                callback(200, ret.fd);
            } else {
                callback(400);
            }
        });
    }

    // 写入文件
    _this.write = function (path, json, callback) {
        _this.open(path, function (code, fd) {
            if (code == 200) {
                fs.write({
                    fd: fd,
                    data: json,
                    offset: 0
                }, function (rets, errs) {
                    if (rets && rets.status) {
                        callback(200)
                    } else {
                        callback(201, errs)
                    }
                });
            } else {
                callback(400)
            }
        })
    }

    // 读
    _this.read = function (path, callback) {
        _this.open(path, function (code, fd) {
            if (code == 200) {
                fs.read({
                    fd: fd,
                    offset: 0
                }, function (rets, errs) {
                    if (rets && rets.status) {
                        callback(200, rets.data)
                    } else {
                        callback(201, errs)
                    }
                });
            } else {
                callback(400)
            }
        })
    }

    // 创建
    _this.create = function (path, callback) {
        fs.createFile({
            path: path,
        }, function (ret, err) {
            if (ret && ret.status) {
                callback(200)
            } else {
                callback(400, err)
            }
        });
    }
}

// 获取用户自己设置的栏目
function getMyTypeid(callback) {
    if ($api.getStorage('token') && $api.getStorage('user')) {
        var user = $api.getStorage('user');
        // 已登录
        var file = new File();
        var path = 'fs://typeid_' + user.id + '.txt';
        file.read(path, function (code, data) {
            if (code == 200 && data) {
                var myTypeid = dealTypeid(data);
                callback(myTypeid);
            } else {
                callback($api.getStorage('typeid'));
            }
        })
    } else {
        callback($api.getStorage('typeid'));
    }
}

// 栏目id处理
function dealTypeid(str) {
    var publicTypeid = $api.getStorage('typeid');
    if (!str) {
        return publicTypeid;
    }
    var myArr = str.split(',');

    var pubObj = {};

    var pubType = publicTypeid.data;
    for (var i = 0, len = pubType.length; i < len; i++) {
        pubObj[pubType[i].id] = pubType[i];
    }

    var myData = [];
    var myTypeid = [];
    for (var i = 0, len = myArr.length; i < len; i++) {
        if (pubObj[myArr[i]]) {
            myTypeid.push(myArr[i]);
            myData.push(pubObj[myArr[i]]);
        }
    }
    var obj = {
        typeid: myTypeid,
        data: myData,
    }
    return obj;
}