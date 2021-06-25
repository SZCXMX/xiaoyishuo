// 初始化group
function __groupInit(name, frameArr, topH, footerH, index, el, pageParam, data, fn) {
    data = data ? data : {};
    var scrollEnabled = data.scrollEnabled;
    var bounces = data.bounces;
    var cls = data.cls;
    var pre = data.pre || 0;
    var allowEditArr = data.allowEdit || [];
    var frames = [];
    for (var i = 0, len = frameArr.length; i < len; i++) {
        var frame = {};
        frame.name = name + '_' + i;
        if(frameArr[i].indexOf('http')==-1){
            // 非链接
            frame.url = html_win + frameArr[i] + '.html';
        }else{
            frame.url = frameArr[i];
        }
        frame.useWKWebView = true;
        if (allowEditArr.length > 0) {
            frame.allowEdit = allowEditArr[i] == 1 ? true : false;
        }
        if (pageParam && pageParam[i]) {
            frame.pageParam = pageParam[i];
        }
        frames.push(frame);
    }
    __openFrameGroup(name, topH, footerH, index, el, frames, scrollEnabled, bounces, cls, pre, fn)
}


// 打开frameGroup
function __openFrameGroup(name, topH, footerH, index, el, frames, scrollType, bounces, cls, pre, fn) {
    var scrollEnabled = scrollType == 0 ? false : true;
    api.openFrameGroup({
        name: name,
        scrollEnabled: scrollEnabled,
        bounces: bounces || true,
        rect: {
            x: 0,
            y: topH || 0,
            w: 'auto',
            // h: api.winHeight - topH - footerH,
            h: 'auto',
            marginBottom: footerH || 0
        },
        index: index || 0,
        frames: frames,
        preload: pre, // 预加载的 frame 个数，默认加载当前页后面一个
    }, function (ret, err) {
        console.log(JSON.stringify(ret))
        var index = ret.index;
        if (el) {
            __active(index, el, cls);
        }
        if (fn && typeof fn == 'function') {
            fn(ret.index);
        }
    });
}

// 点击样式
function __active(index, el, cls) {
    cls = cls ? cls : 'active';
    $(el).removeClass(cls);
    $(el).eq(index).addClass(cls);
}

// 导航栏
var NVNavigationBar;
function __showNavBar(y, h, items, selectedIndex, navId, clickFn, showFn, x, w) {
    NVNavigationBar = api.require('NVNavigationBar');
    console.log(JSON.stringify(items))
    w = w ? w : 0;
    NVNavigationBar.open({
        rect: {
            x: x || 0,
            y: y,
            w: api.frameWidth - w,
            h: h
        },
        styles: {
            orientation: 'horizontal',
            bg: '#fff',
            bgAlpha: 1,
            font: {
                size: 16,
                sizeSelected: 16,
                color: '#555555',
                colorSelected: '#e01200',
                alpha: 1
            },
            itemSize: {
                w: 50,
                h: h
            }
        },
        items: items,
        selectedIndex: selectedIndex,
        fixedOn: api.frameName,
        id: navId
    }, function (ret, err) {
        console.log(JSON.stringify(ret));
        if (ret.eventType == 'click') {
            if (typeof clickFn == 'function') {
                clickFn(ret.index);
            }
        }
        if (ret.eventType == 'show') {
            if (typeof showFn == 'function') {
                showFn();
            }
        }
    });
}