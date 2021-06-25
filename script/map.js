var Map = function () {
    var bMap = api.require('bMap');
    var _this = this;
    _this.init = function () {
        if (api.systemType != 'ios') return;
        bMap.initMapSDK(function (ret) {
            if (ret.status) {}
        });
    }
    _this.init();
    // 判断权限是否开启
    _this.judge = function (callback) {
        bMap.getLocationServices(function (ret, err) {

            console.log(JSON.stringify(ret));
            if (typeof callback == 'function') {
                if (ret.enable) {
                    if (api.systemType == 'ios' && ret.authorizationStatus == 'denied') {
                        // ios 永不允许
                        callback(400, '未获取定位授权')
                    } else {
                        getPermission(['location'], function (code) {
                            if (code != 0) {
                                // _alert('请先开启权限');
                                callback(400, '未获取定位授权')
                            } else {
                                callback(200)
                            }
                        })
                    }
                } else {
                    var m = api.systemType == 'ios' ? '请先将隐私->定位服务开启' : '请先开启GPS';
                    callback(500, m)
                }
            }
        });

    }


    // 获取当前经纬度 type为空时 表示无权限时使用默认地址 否则提示用户先开启定位
    _this.getLocation = function (callback, type) {
        _this.judge(function (code, msg) {
            if (code != 200) {
                var result = {
                    status: false,
                    lon: $api.getStorage('lon'),
                    lat: $api.getStorage('lat'),
                };
                if (!type) {
                    result.status = true;
                    callback(result);
                    // _msg('未开启定位，将使用系统默认地址')
                } else {
                    callback(result);
                }
                // _msg(msg || '未开启定位');
                return;
            }
            bMap.getLocation({
                accuracy: '10m',
                autoStop: true,
                filter: 1
            }, function (ret) {
                callback(ret)
            });
        })

    }

    // 通过经纬度获取当前地址
    _this.getAddress = function (lon, lat, callback) {
        console.log(lon)
        console.log(lat)
        bMap.getNameFromCoords({
            lon: Number(lon),
            lat: Number(lat)
        }, function (ret, err) {
            console.log(JSON.stringify(ret))
            console.log(JSON.stringify(err))
            callback(ret, err);
        });
    }


    // 根据单个关键字搜索兴趣点
    _this.search = function (kw, city, index, callback) {
        bMap.searchInCity({
            city: city,
            keyword: kw,
            pageIndex: index,
            pageCapacity: 20
        }, function (ret, err) {
            if (ret && typeof callback == 'function') {
                callback(ret);
            }
        });
    }


    // 推荐搜索关键字
    _this.tuijian = function (kw, city, callback) {
        bMap.autocomplete({
            keyword: kw,
            city: city
        }, function (ret) {
            if (ret && typeof callback == 'function') {
                callback(ret);
            }
        });
    }

    // 打开百度地图
    _this.open = function (data, callback) {
        var lon = data.lon || $api.getStorage('lon');
        var lat = data.lat || $api.getStorage('lat');
        bMap.open({
            rect: {
                x: 0,
                y: 0,
                w: api.frameWidth,
                h: api.frameHeight
            },
            center: {
                lon: lon,
                lat: lat
            },
            zoomLevel: 18,
            showUserLocation: true,
            fixedOn: api.frameName,
            fixed: true
        }, function (ret, err) {
            console.log(JSON.stringify(ret))
            console.log(JSON.stringify(err))
            if (typeof callback == 'function') {
                callback();
            }
        });
    }

    // 权限打开情况
    _this.quanxian = function (callback) {
        bMap.getLocationServices(function (ret, err) {
            console.log(JSON.stringify(ret));
            console.log(JSON.stringify(err));
            if (ret.enable) {
                if (typeof callback == 'function') {
                    callback();
                }
            } else {
                // alert("未开启定位功能！");
                var m = api.systemType == 'ios' ? '请先将隐私->定位服务开启' : '请先开启GPS';
                _msg(m)
            }
        });
    }

    _this.point = function (data) {
        bMap.addAnnotations({
            annotations: [{
                id: 1,
                lon: data.lon,
                lat: data.lat
                // }, {
                //     id: 2,
                //     lon: 116.29,
                //     lat: 40.109
                // }, {
                //     id: 3,
                //     lon: 116.298,
                //     lat: 40.11
            }],
            draggable: true
        }, function (ret) {
            // if (ret) {
            //     alert(ret.id);
            // }
        });
    }
}