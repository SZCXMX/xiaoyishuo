//根据window.devicePixelRatio获取像素比
function DPR() {
    if (window.devicePixelRatio && window.devicePixelRatio > 1) {
        return window.devicePixelRatio;
    }
    return 1;
}

//获取设备的devicePixelRatio
function getPixelRatio(context) {
    var backingStore = context.backingStorePixelRatio ||
        context.webkitBackingStorePixelRatio ||
        context.mozBackingStorePixelRatio ||
        context.msBackingStorePixelRatio ||
        context.oBackingStorePixelRatio ||
        context.backingStorePixelRatio || 1;
    return (window.devicePixelRatio || 1) / backingStore;
};

//将传入值转为整数
function parseValue(value) {
    return parseInt(value, 10);
};

//绘制canvas
function drawCanvas(selector) {
    // 获取想要转换的 DOM 节点
    var dom = document.querySelector(selector);
    var box = window.getComputedStyle(dom);
    // DOM 节点计算后宽高
    var width = parseValue(box.width);
    var height = parseValue(box.height);
    // 获取像素比
    var scaleBy = getPixelRatio(window);
    console.log(scaleBy)
    // 创建自定义 canvas 元素
    var canvas = document.createElement('canvas');

    // 设定 canvas 元素属性宽高为 DOM 节点宽高 * 像素比
    canvas.width = width * scaleBy;
    canvas.height = height * scaleBy;
    // 设定 canvas css宽高为 DOM 节点宽高
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    // 获取画笔
    var context = canvas.getContext('2d');

    // 将所有绘制内容放大像素比倍
    context.scale(scaleBy, scaleBy);

    // 将自定义 canvas 作为配置项传入，开始绘制
    return html2canvas(dom, {
        canvas
    });
}

//将图片保存到相册
function savePhotoToAlbum() {
    api.saveMediaToAlbum({
        path: 'fs://cache/' + img_name
    }, function (ret, err) {
        api.hideProgress();
        if (ret && ret.status) {
            api.toast({
                msg: '保存成功'
            });
        } else {
            api.toast({
                msg: '保存失败'
            });
        }
    });
}
var img_name;
//将canvas转为base64 base64转为png
function canvasToBase(el) {
    _loading();
    drawCanvas(el).then(function (canvas) {
        var imgUri = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); // 获取生成的图片的url
        imgUri = imgUri.split('data:image/octet-stream;base64,')[1];
        img_name = new Date().getTime() + '.png';

        //将base64转为png
        var trans = api.require('trans');
        trans.saveImage({
            base64Str: imgUri,
            imgPath: "fs://cache",
            imgName: img_name
        }, function (ret, err) {
            if (ret.status) {
                _loadingClose();
            }
        });

    });
}

// 分享到朋友圈 session（会话） timeline（朋友圈） favorite（收藏）
function _weixin(type) {
    var wx = api.require('wxPlus');
    // $('.share-wrap').hide();
    wx.shareImage({
        scene: type,
        contentUrl: 'fs://cache/' + img_name
    }, function (ret, err) {
        if (ret.status) {
            _msg('分享成功');
            _daily({
                name: 'fenxiang'
            });
            api.closeWin();
        }
    });
}

//  QQ分享 QZone：分享到 QQ 空间 QFriend：分享给好友、讨论组、群聊
function _qqshare(type) {
    var qq = api.require('QQPlus');
    qq.shareImage({
        type: type,
        imgPath: 'fs://cache/' + img_name
    }, function (ret, err) {
        if (ret.status) {
            _msg('分享成功');
            _daily({
                name: 'fenxiang'
            });
            api.closeWin();
        }
    });
}