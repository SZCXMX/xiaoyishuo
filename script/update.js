// 打开ffxiang_frm后在ffxiang_win调用updateVision();
// 版本更新
function updateVision(type) {
    _ajaxNT('api/index/appurl', function (ret, err) {
        console.log(JSON.stringify(ret))
        var version = api.appVersion;
        var v = versionCompare(version, ret.anzhuo.anzhuonum);
        if (ret.code == 200) {
            if (api.systemType == 'ios' && versionCompare(version, ret.apple.appnum)) {
                showDetail('up_modal', {
                    appurl: ret.apple.appurl,
                    must: ret.apple.applesw
                })
            } else if (api.systemType != 'ios' && versionCompare(version, ret.anzhuo.anzhuonum)) {
                showDetail('up_modal', {
                    appurl: ret.anzhuo.anzhuourl,
                    must: ret.anzhuo.adsw
                })
            }else {
                if(type == 1){
                    _msg('当前已是最新版本')
                }
            }
        }
    })
}
// https://developers.weixin.qq.com/miniprogram/dev/framework/compatibility.html
// v1 手机版本号， v2 服务器版本号
function versionCompare(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)

    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }

    for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])

        if (num1 > num2) {
            return 0
        } else if (num1 < num2) {
            return 1
        }
    }
    return 0;
}

//打开进度条模块
function openUIActionProgress(url, must) {
    var UIActionProgress = api.require('UIActionProgress');
    UIActionProgress.open({
        maskBg: 'rgba(0,0,0,0.4)',
        styles: {
            h: 108,
            bg: '#fff',
            title: {
                size: 14,
                color: '#000',
                marginT: 10
            },
            msg: {
                size: 12,
                color: '#666',
                marginT: 5
            },
            lable: {
                size: 12,
                color: '#696969',
                marginB: 5
            },
            progressBar: {
                size: 4,
                normal: '#ccc',
                active: '#03a9f4',
                marginB: 15,
                margin: 5
            }
        },
        data: {
            title: '正在连接服务器...',
            value: 0
        }
    }, function (ret) {
        if (ret.eventType == 'show') {
            //这里应该是调用api.download去下载一个文件，然后根据api.download中的回调下载进度去修改模块参数；
            //由于是示例代码，使用setInterval来模拟下载进度变化。
            //循环调用
            console.log(url)
            api.download({
                // url: ret.anzhuo.anzhuourl,
                url: url,
                report: true
            }, function (retg, errg) {

                console.log(JSON.stringify(retg))
                console.log(JSON.stringify(errg))
                if (retg && 0 == retg.state) {
                    setData(retg.percent);
                }
                if (retg && 1 == retg.state) {
                    /* 下载完成 */
                    var savePath = retg.savePath;
                    api.installApp({
                        appUri: savePath
                    });
                }
                if (retg.msg) {
                    alert(retg.msg);
                    closeUIActionProgress();
                    if (must == 1) {
                        api.closeWidget({
                            silent: true
                        });
                    }
                }
            });
        }
    });
};
//修改参数
function setData(value) {
    var UIActionProgress = api.require('UIActionProgress');
    if (value == 100) {
        UIActionProgress.setData({
            data: {
                title: '下载完成',
                msg: '',
                value: value
            }
        });
        setTimeout(function () {
            //关闭进度条模块
            closeUIActionProgress();
        }, 300);
    } else {
        //修改进度条参数
        UIActionProgress.setData({
            data: {
                title: '下载中...',
                msg: '',
                value: value
            }
        });
    }
};
//关闭模块
function closeUIActionProgress() {
    var UIActionProgress = api.require('UIActionProgress');
    UIActionProgress.close();
};

// 下载
function downNewVersion(appurl, must) {
    api.closeFrame({
        name: 'up_modal'
    });
    if (api.systemType == 'ios') {
        if (!appurl.match('itunes.apple.com')) { // 链接非itunes 则打开内置浏览器网页
            _url({
                url: appurl,
                must: must
            }, 'must_download');
        } else {
            api.installApp({
                appUri: appurl
            });
        }
    } else {
        if (!appurl.match('.apk')) { // 链接非apk 则打开内置浏览器网页
            _url({
                url: appurl,
                must: must
            }, 'must_download');
        } else {
            openUIActionProgress(appurl, must)
        }
        // api.download({
        //     url: appurl,
        //     report: true
        // }, function (retg, errg) {
        //     if (retg && 1 == retg.state) {
        //         /* 下载完成 */
        //         var savePath = retg.savePath;
        //         api.installApp({
        //             appUri: savePath
        //         });
        //     }
        // });
    }
}