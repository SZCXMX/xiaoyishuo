// 处理分享内容
function dealShareContent(ret) { // 上级函数返回值
    console.log(JSON.stringify(ret));
    var fx_data = {
        title: ret.title,
        description: ret.description || ret.content,
        url: ret.url || fx_url + "m/a/" + ret.id + '.html',
        img: '',
        img_dl: '',
    }
    if (!fx_data.title) {
        fx_data.title = fx_data.description
        if (!fx_data.title) {
            fx_data.title = fx_data.url
        }
    }
    if (ret.image) {
        fx_data.img = ret.image + '?vframe/jpg/offset/2/w/200/h/200';
    } else if (ret.images_list) {
        fx_data.img = ret.images_list[0] + '?vframe/jpg/offset/2/w/200/h/200';
    } else {
        fx_data.img = img_url + '/public/logo.png'
    }
    fx_data.img_dl = fx_data.img;
    if (fx_data.img) {
        fx_data.img = fx_data.img + "?imageView2/1/w/200/h/200";
    }

    if (!fx_data.description) {
        fx_data.description = func(ret.content);
        console.log(fx_data.description);
    }
    api.download({
        url: fx_data.img_dl,
    }, function (ret) {
        if (ret.state == 1) {
            var size = (ret.fileSize / 1024) > 32; // 因为微信分享要求本地路径（fs://、widget://）大小不能超过32K,需要路径包含图片格式后缀，否则如果原图片为非png格式，会分享失败
            var noPng = (!/\.(png|PNG)$/.test(ret.savePath)); //png :false
            console.log(noPng)
            if (!size && !noPng) {
                fx_data.img_dl = ret.savePath;
            } else {
                fx_data.img_dl = 'widget://image/logo.png';
            }
        } else {
            fx_data.img_dl = 'widget://image/logo.png';
        }
    })

    console.log(fx_data.img)
    api.imageCache({
        url: fx_data.img,
        thumbnail: false,
    }, function (ret, err) {
        if (ret) {
            if (ret.status) {
                fx_data.img = ret.url
                console.log(fx_data.img)
            }
            //console.log(JSON.stringify(ret)+JSON.stringify(err))
        }
    });
    console.log(JSON.stringify(fx_data))
    return fx_data;
}

function newsShare(fx_data, article, arr) {
    // var userasd = $api.getStorage('user');
    // if (!userasd) {
    //     _url({
    //         title: '会员登陆',
    //         url: 'login'
    //     })
    //     return;
    // }
    console.log(JSON.stringify(fx_data))
    console.log(JSON.stringify(article))
    if (article) {
        _url({
            data: article
        }, 'share');
        return;
    }
    if (!arr) {
        // arr = ['朋友圈', '好友', 'QQ', '空间', '系统', '短信', '邮件', '复制'];
        arr = ['朋友圈', '好友', '系统', '短信', '邮件', '复制'];
        if (article) {
            arr = ['朋友圈', '好友', '系统', '短信', '邮件', '复制', '举报'];
        }
        if ($api.getStorage('user') && article && (article.weitoutiao != 0)) {
            if (!article.uid) {
                article.uid = 0;
            }
            if ($api.getStorage('user').id == article.uid) {
                arr = ['朋友圈', '好友', '系统', '短信', '邮件', '复制', '举报', '删除'];
            }
        }
    }
    var col = 5;
    if (arr.length < 9) {
        col = 4;
    }
    var shareObj = returnItems(arr);
    var items = shareObj.itemArr;
    var shareIndex = shareObj.itemIndex;
    var MNActionButton = api.require('MNActionButton');
    MNActionButton.open({
        layout: {
            row: 2,
            col: col,
            offset: 0
        },
        animation: false,
        autoHide: true,
        styles: {
            maskBg: 'rgba(0,0,0,0.3)',
            bg: '#F8F8F8',
            indicator: {
                color: '#c4c4c4',
                highlight: '#9e9e9e'
            },
        },
        items: items
    }, function (ret) {
        console.log(JSON.stringify(fx_data));
        if (ret.eventType == "click") {
            var index = ret.index;
            if (index == shareIndex.pyqIndex) {
                _weixin('timeline', fx_data)
            } else if (index == shareIndex.wxIndex) {
                _weixin('session', fx_data)
            } else if (index == shareIndex.qFriendIndex) {
                _qq('QZone', fx_data)
            } else if (index == shareIndex.qqIndex) {
                _qq('QFriend', fx_data)
            } else if (index == shareIndex.sysIndex) { // 系统
                var sharedModule = api.require('shareAction');
                sharedModule.share({
                    text: fx_data.title + fx_data.description + fx_data.url,
                    type: 'text'
                });
            } else if (index == shareIndex.msgIndex) { // 短信
                api.sms({
                    numbers: [],
                    text: fx_data.title + fx_data.url
                }, function (ret, err) {
                    if (ret && ret.status) {
                        _msg('已发送')
                    }
                });
            } else if (index == shareIndex.emailIndex) { // 邮件
                api.mail({
                    recipients: [],
                    subject: fx_data.title,
                    body: fx_data.description + fx_data.url,
                }, function (ret, err) {
                    if (ret && ret.status) {
                        _msg('已发送')
                    }
                });
            } else if (index == shareIndex.copyIndex) { // 复制
                var clipBoard = api.require('clipBoard');
                clipBoard.set({
                    value: fx_data.url
                }, function (ret, err) {
                    if (ret) {
                        _msg('复制成功，把链接分享给朋友吧！')
                    }
                });
            } else if (index == shareIndex.jubaoIndex) { //举报
                if (!_user) {
                    _alert('请先登陆', function (ret, err) {
                        _login();
                    })
                    return;
                }
                var buttons = ['广告', '重复、旧闻', '低俗', '标题夸张', '与事实不符', '内容质量差', '疑似抄袭', '其他问题，我要吐槽 > '];
                jubao(buttons, article)

            } else if (index == shareIndex.delIndex) {
                // 删除微头条
                api.actionSheet({
                    cancelTitle: '取消',
                    destructiveTitle: '确认要删除吗？',
                }, function (ret, err) {
                    var index = ret.buttonIndex;
                    if (index == 1) {
                        _loading('正在删除')
                        _ajax('api/member/weitoutiaoDel/', function (ret, err) {
                            console.log(JSON.stringify(ret))
                            console.log(JSON.stringify(err))
                            if (ret) {
                                _loadingClose()
                                if (ret.ret) {
                                    // 更新微头条
                                    var view = 'view();';
                                    api.execScript({
                                        name: 'weitoutiao_win',
                                        frameName: 'weitoutiao',
                                        script: view
                                    });
                                    // 窗口提示返回
                                    _alert(ret.ret, function (ret, err) {
                                        _close(1)
                                    })
                                } else {
                                    _msg(ret.err)
                                }
                            }
                        }, {
                            aid: article.id
                        })
                    }
                });
            } else {
                _msg(index)
                return;
            }
        }
    });
}

// 微信分享
// type session（会话） timeline（朋友圈） favorite（收藏）
function _weixin(type, data) {
    var userasd = $api.getStorage('user');
    if (!userasd) {
        _url({
            title: '会员登陆',
            url: 'login'
        })
        return;
    }

    var wx = api.require('wxPlus');
    var dd = (data.description || '').replace(/<\/?.+?>/g, "");
    var dds = dd.replace(/ /g, '');
    var ddn = dds.replace(/&nbsp;/ig, ""); //ddn为得到后的内容
    if (ddn.length > 50) {
        ddn = ddn.substring(0, 50);
        ddn += '...';
    }
    wx.shareWebpage({
        scene: type,
        title: data.title,
        description: ddn,
        thumb: data.img_dl || 'widget://image/logo.png',
        contentUrl: data.url
    }, function (ret, err) {
        if (ret.status) {
            _msg('分享成功');
            _daily({
                name: 'money_fenxiang_2'
            });
        } else {
            _msg('分享失败');
        }
    });
}
// QQ分享
// type 分享内容到好友或空间，取值范围：QZone、QFriend
function _qq(type, data) {
    console.log(JSON.stringify(data));
    var userasd = $api.getStorage('user');
    if (!userasd) {
        _url({
            title: '会员登陆',
            url: 'login'
        })
        return;
    }
    var obj = api.require('QQPlus');
    var dd = (data.description || '').replace(/<\/?.+?>/g, "");
    var dds = dd.replace(/ /g, '');
    var ddn = dds.replace(/&nbsp;/ig, ""); //ddn为得到后的内容
    obj.shareNews({
        url: data.url,
        title: data.title,
        description: ddn,
        imgUrl: data.img || img_url + '/public/logo.png',
        type: type,
    }, function (ret, err) {
        if (ret.status) {
            _msg('分享成功');
            _daily({
                name: 'money_fenxiang_2'
            });
        } else {
            _msg('分享失败');
        }
    });
}
// 微博分享
function _weibo(type, data) {
    var weibo = api.require('weibo');
    weibo.shareWebPage({
        text: data.title,
        title: data.title,
        description: data.description,
        thumb: data.img,
        contentUrl: data.url
    }, function (ret, err) {
        if (ret.status) {
            _msg('分享成功');
            _daily({
                name: 'money_fenxiang_2'
            });
        }
    });
}


//举报
function jubao(buttons, article) {
    buttons = buttons;
    api.actionSheet({
        title: '举报内容问题',
        cancelTitle: '取消举报',
        buttons: buttons
    }, function (ret, err) {
        var index = ret.buttonIndex;
        var content = '';
        if (index == 8) {
            _url({
                aid: article.id,
                url: 'member/jubaoadd',
                title: '举报内容'
            })
            return;
        }
        if (index != 9) {
            content = '文章标题为 《' + article.title + "》 的投诉内容：" + buttons[index - 1];
            _ajax('api/member/jubao', function (ret, err) {
                if (ret) {
                    if (ret.ret) {
                        _msg(ret.ret)
                    } else {
                        _msg(ret.err)
                    }
                } else {
                    _msg('出错啦，等会再试吧');
                    console.log(JSON.stringify(err));
                }
            }, {
                content: content,
                aid: article.id
            })
        }
    });
}

// 处理选项
function returnItems(arr) {

    var itemArr = [];
    var itemIndex = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        var item;
        switch (arr[i]) {
            case '朋友圈':
                item = {
                    icon: 'widget://image/share/1.png',
                    title: '朋友圈'
                };
                itemIndex.pyqIndex = i;
                break;
            case '好友':
                item = {
                    icon: 'widget://image/share/2.png',
                    title: '好友'
                };
                itemIndex.wxIndex = i;
                break;
            case 'QQ':
                item = {
                    icon: 'widget://image/share/3.png',
                    title: 'QQ'
                };
                itemIndex.qqIndex = i;
                break;
            case '空间':
                item = {
                    icon: 'widget://image/share/4.png',
                    title: '空间'
                };
                itemIndex.qFriendIndex = i;
                break;
            case '系统':
                item = {
                    icon: 'widget://image/share/101.png',
                    title: '系统'
                }
                itemIndex.sysIndex = i;
                break;
            case '短信':
                item = {
                    icon: 'widget://image/share/102.png',
                    title: '短信'
                };
                itemIndex.msgIndex = i;
                break;
            case '邮件':
                item = {
                    icon: 'widget://image/share/103.png',
                    title: '邮件'
                };
                itemIndex.emailIndex = i;
                break;
            case '复制':
                item = {
                    icon: 'widget://image/share/104.png',
                    title: '复制'
                };
                itemIndex.copyIndex = i;
                break;
            case '举报':
                item = {
                    icon: 'widget://image/share/105.png',
                    title: '举报'
                };
                itemIndex.jubaoIndex = i;
                break;
            case '删除':
                item = {
                    icon: 'widget://image/share/del.png',
                    title: '删除'
                };
                itemIndex.delIndex = i;
                break;
            default:
                break;
        }
        itemArr.push(item);
    }

    return {
        itemArr: itemArr,
        itemIndex: itemIndex
    };
}