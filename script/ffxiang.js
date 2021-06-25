var fx_gurl = 'http://www.hkzbm.com';
var fx_url = fx_gurl + '/index.php/';
var img_url = fx_gurl;

var html_win = 'widget://html/';
var _token = $api.getStorage('token');
var _user = $api.getStorage('user');
var pauseT; // 暂停 倒计时
var _yejian;
var _config;
if (_yejian) {
	$api.addCls($api.dom('body'), 'fx-yejian');
}

if (!_token || !_user) {
	_uot();
}


/* 
请求
*/
// 封装ajax
// url 		请求地址
// callback 返回回调
// method	默认值get
// data 	字段
// dataType 返回格式 默认json
function _ajax(url, callback, data, notoken) {
	var type = '';
	if (data) {
		type = 'post';
	} else {
		type = 'get';
	}
	if (!notoken) {
		var token = $api.getStorage('token');
		if (token) {
			if (data) {
				var json = {};
				var json1 = data;
				var json2 = {
					token: token
				};
				json = eval('(' + (JSON.stringify(json1) + JSON.stringify(json2)).replace(/}{/, ',') + ')');
				data = json;
			} else {
				data = {
					token: token
				}
			}
			type = 'post';
		}
	}
	console.log(fx_url + url);
	if (data) {
		console.log(JSON.stringify(data));
	}
	api.ajax({
		url: fx_url + url,
		method: type,
		data: {
			values: data
		},
		cache: true,
	}, function (ret, err) {
		console.log(JSON.stringify(ret))
		console.log(JSON.stringify(err))
		if (typeof callback == 'function') {
			callback(ret, err);
		}
	});
}
// 不附带token
function _ajaxNT(url, callback, data) {
	_ajax(url, callback, data, 1);
}
// 上传文件
function _ajaxFile(url, callback, data, files) {
	var timeout = 6000;
	if (data && data.timeout) {
		timeout = data.timeout;
	}
	api.ajax({
		url: fx_url + url,
		method: 'post',
		timeout: timeout, // 秒
		data: {
			values: data,
			files: files
		},
		cache: true,
	}, function (ret, err) {
		console.log(JSON.stringify(ret))
		console.log(JSON.stringify(err))
		if (typeof callback == 'function') {
			callback(ret, err);
		}
	});
}


// 通用设置变量
var pagenum = 1;
var heigutgao = 0; //  禁止滚动 滚动执行 1执行  0不执行
var page_total = 0; // 数据总数
var page_per_page = 0; // 数据分页
// 封装输入列表数据
// url 请求地址  page分页
// loading 当使用上拉刷新，loading有值会执行api.refreshHeaderLoadDone();
function _lists(url, page, loading, data) {
	heigutgao = 0;
	_ajax(url + '?page=' + page, function (ret, err) {
		if (ret) {
			if (loading == 1) { // 上拉刷新时  初始化参数
				// 重置滚动统计
				pagenum = heigutgao = 1
				// 移除底部没有了
				$api.remove($api.dom('#loadingNo'));
				// 停止刷新
				api.refreshHeaderLoadDone();
			}
			ret.ios = $api.getStorage('app'); // 上架状态
			// 获取得到数据线删除底部加载提示
			$api.remove($api.dom('.fx-dibu_loading'));
			page_total = ret.total
			//渲染模版
			var evalData = doT.template($api.html($api.byId('fx-list')));

			if (loading == 1) { // 上拉刷新时 清空列表
				$api.html($api.byId('fx-view'), '');
			}
			$api.append($api.byId('fx-view'), evalData(ret));

			// 插入底部加载提示
			page_per_page = Math.ceil(page_total / ret.per_page);
			if (page_per_page <= page) {
				heigutgao = 0 //关闭滚动
				$api.append($api.byId('fx-view'), '<div id="loadingNo">已经到最底部啦~</div>')
			} else {
				$api.append($api.byId('fx-view'), '<div class="fx-dibu_loading load-container loadingdi"><div class="loader">加载中...</div></div>');
				// 数据插入成功 设置 heigutgao=1 滚动才能继续加载
				heigutgao = 1;
			}
			// 图片缓存本地
			_imageCache();
			api.parseTapmode();
		} else {
			$api.html($api.byId('fx-view'), "<div class='aui-text-center aui-margin-15'>" + err.msg + "</div>");
			api.refreshHeaderLoadDone();
		}
	}, data)
}





/* 
窗口
*/

//打开窗口
// pageParam 传递参数
// url 打开文件名
// 默认读取html文件，若在文件在根目录读取html目录文件，需要填写第二个参数为空即可
function _url(pageParam, url, token) {
	if (token == true) {
		var userasd = $api.getStorage('user');
		if (!userasd) {
			_url({
				title: '会员登陆',
				url: 'login'
			})
			return;
		}
	}
	var animationType = 'push';
	if (pageParam && pageParam.animationType) {
		animationType = pageParam.animationType;
	}
	var nameUrl = url;
	if (!url) {
		url = 'win';
		nameUrl = pageParam.url;
		console.log(nameUrl)
	}
	var slidBackEnabled = pageParam.slidBackEnabled === 0 ? false : true;
	// 图集
	if (url == 'photo_browser') {
		animationType = 'fade';
	}
	api.openWin({
		name: nameUrl,
		url: html_win + url + '.html',
		pageParam: pageParam,
		reload: true,
		bounces: false,
		hideHomeIndicator: false,
		slidBackEnabled: slidBackEnabled,
		useWKWebView: true,
		animation: {
			type: animationType, //动画类型（详见动画类型常量）
			subType: "from_right", //动画子类型（详见动画子类型常量）
			duration: 500
		}
	});

}

// 统一服装调用 Frame页面
// url 页面文件命
// header 不填写默认读取顶部高度    填写1表示不显示header
// footer 不填写默认读取底部高度    填写1表示不显示footer
function _openFrame(url, header, footer, pageParam) {
	// 解析属性	消除点击300S 延时问题 tapmode
	api.parseTapmode();
	if (header == 1) {
		var headerh = 0;
	} else {
		$api.fixStatusBar($api.byId('fx-header'));
		var headerh = $api.offset($api.byId('fx-header')).h;
	}
	if (footer == 1) {
		var footerh = 0;
	} else {
		$api.fixTabBar($api.byId('fx-footer'))
		var footerh = $api.offset($api.byId('fx-footer')).h;
	}
	api.openFrame({
		name: url,
		url: html_win + url + '.html',
		reload: true,
		useWKWebView: true,
		rect: {
			x: 0,
			y: headerh,
			w: 'auto',
			// h: body_h - headerh - footerh,
			h: 'auto',
			marginBottom: footerh
		},
		pageParam: pageParam,
	})

}

// 打开背景透明的frame
function showDetail(url, data) {
	api.openFrame({
		name: url,
		url: html_win + url + '.html',
		bounces: false,
		rect: {
			x: 0,
			y: 0,
			w: 'auto',
			h: 'auto'
		},
		useWKWebView: true,
		bgColor: 'rgba(0,0,0,0)',
		animation: {
			type: "fade", //动画类型（详见动画类型常量）
			subType: "from_bottom", //动画子类型（详见动画子类型常量）
			duration: 300 //动画过渡时间，默认300毫秒
		},
		pageParam: data
	})
}

// 底部4个按钮跳转文件
// id 0首页 1视频 2关注 3我的
function _index_win(url) {
	api.openWin({
		name: url,
		url: html_win + url + '.html',
		useWKWebView: true,
		animation: {
			type: "none",
		},
		slidBackEnabled: false,
	});
	if (url == 'video_win' || url == 'weitoutiao_win') {
		_heibai(1)
	} else if (url == 'member_win') {
		_heibai()
	}
}

//返回上一页
function _close(heibai) {
	api.closeWin();
	_heibai(heibai)
}


// 关闭窗口
function timerWin(time, winName) {
	var t = time || 1000;
	if (winName) {
		setTimeout(function () {
			api.closeToWin({
				name: winName
			})
		}, t)
	} else {
		setTimeout(function () {
			_close();
		}, t)
	}
}

// 关闭窗口
function _closeToWin() {
	if (api.pageParam['winName']) {
		api.closeToWin({
			name: api.pageParam['winName']
		})
	} else {
		api.closeWin();
	}
}
// 跳到主页
function _hone() {
	_heibai();
	api.openWin({
		name: 'ffxiang_win',
		url: 'widget://html/ffxiang_win.html',
		useWKWebView: true,
		animation: {
			type: 'none',
		},
		slidBackEnabled: false
	})
}

// 会员登陆
function _login() {
	_url({
		url: 'login',
		title: '登陆'
	})
}


// 添加计费广告
// pay:0
function openMoneyAds(pageParam, url, token) {
	_ajax('api/index/adclick', function (ret, err) {
		console.log(JSON.stringify(ret))
		console.log(JSON.stringify(err))
	}, {
		dyid: pageParam.id
	})
	_url(pageParam, url, token);
}

// 打开倒计时窗口
function openCutDown(name, id) {
	var _user = $api.getStorage('user');
	_config = $api.getStorage('config');
	if (!_user || $api.getStorage('app') == 1) {
		return;
	}
	var shipin = 0;
	if (name == 'money_shipin') {
		if ($api.getStorage('shipin_cut') != _myDate()) {
			$api.setStorage('shipin_cut', _myDate());
			shipin = 1;
		} else {
			return;
		}
	}
	console.log(JSON.stringify(_config))
	var time = _config.yaoqing.money_news_time ? _config.yaoqing.money_news_time / 1000 : 20;
	api.openFrame({
		name: 'cutDown_frm',
		url: html_win + 'time.html',
		rect: {
			x: 300,
			y: 250,
			w: 'auto',
			h: 50
		},
		bgColor: 'rgba(0,0,0,0)',
		pageParam: {
			time: time,
			name: name,
			// shipin: shipin,
			shipin: 1,
			id: id
		}
	})
}





/* 
弹窗
*/

// 弹出提示
function _alert(title, functions, msg) {
	api.alert({
		msg: title,
		title: msg,
	}, functions)
}

// msg提示
function _msg(msg, duration, location) {
	if (!location) {
		location = 'middle';
	}
	if (!duration) {
		duration = 2000;
	}
	api.toast({
		msg: msg,
		duration: duration,
		location: location
	});
}

// 底部弹窗
function _action(title, buttons, callback) {
	api.actionSheet({
		title: title,
		buttons: buttons,
		style: {
			// layerColor:'',         //遮蔽层颜色，仅支持 rgba颜色，默认值：rgba（0, 0, 0, 0.4）
			// itemNormalColor:'',    //选项按钮正常状态背景颜色，支持#000、#000000、rgb、rgba，默认值：#F1F1F1
			// itemPressColor:'',     //选项按钮按下时背景颜色，支持#000、#000000、rgb、rgba，默认值：#E6E6E6
			// fontNormalColor: '#663DFB', //选项按钮正常状态文字颜色，支持#000、#663DFB、rgb、rgba，默认值：#007AFF
			// fontPressColor: '#663DFB', //选项按钮按下时文字颜色，支持#000、#000000、rgb、rgba，默认值：#0060F0
			// titleFontColor:''      //标题文字颜色，支持#000、#000000、rgb、rgba，默认值：#8F8F8F
		}
	}, function (ret, err) {
		callback(ret.buttonIndex);
	});
}
//loading层
function _loading(title) {
	if (!title) {
		title = '努力加载中...';
	}
	api.showProgress({
		title: title,
		text: '先喝杯茶...',
		modal: true,
		animationType: 'zoom',
	});
}

// 关闭 提示
function _loadingClose() {
	api.hideProgress();
	api.refreshHeaderLoadDone();
}
// 加载
function _UILoading() {
	$('.loading-bg').show();
}

// 关闭加载
function _UILoadingClose() {
	$('.loading-bg').hide();
}



/* 
公共
*/
var exitStatu;

function keyback() {
	if (!exitStatu) {
		exitStatu = 1;
		api.toast({
			msg: "再按一次返回键退出"
		});
		setTimeout(function () {
			exitStatu = null;
		}, 2000)
	} else if (exitStatu == 1) {
		api.closeWidget({
			silent: true
		});
	}
}

// 上拉
function _shangla(functions, refreshHeaderLoading) {
	// 上拉滚动参数统一设置
	var textDown = '下拉刷新...',
		textUp = '松开刷新...',
		bgColor = '#fff',
		textColor = '#000',
		loadingImg = '';

	api.parseTapmode();
	api.setRefreshHeaderInfo({
		visible: true,
		loadingImg: loadingImg,
		bgColor: bgColor,
		textColor: textColor,
		textDown: textDown,
		textUp: textUp,
		showTime: true,

	}, functions);
	// 第一次打开APP，自动执行刷新
	if (!refreshHeaderLoading) {
		api.refreshHeaderLoading();
	}
}
var threshold = 100;
// 滚动到底部
function _scrollToBottom(callback) {
	//设置距离底部多少距离时触发，默认值为0，数字类型

	api.addEventListener({
		name: 'scrollToBottom',
		extra: {
			threshold: threshold
		}
	}, function () {
		if (typeof callback != 'function') return;
		callback();
	})
}


// 监听
function _send(name, data) {
	api.sendEvent({
		name: name,
		extra: data
	})
}

function _listener(name, callback) {
	api.addEventListener({
		name: name
	}, function (ret) {
		callback(ret);
	})
}

// 图片缓存本地
function _imageCache(thumbnail) {
	if (!thumbnail) {
		thumbnail = false;
	}
	var srcs = $("img#ffxiangImgCache");
	if (srcs.length > 0) {
		for (var i = 0; i < srcs.length; i++) {
			(function (imgObj) {
				var imgUrl = imgObj.attr("ffxiang-src");
				// imgObj.attr("src", imgUrl);
				// imgObj.removeAttr('id')
				// imgObj.removeAttr('ffxiang-src')
				api.imageCache({
					url: imgUrl,
					thumbnail: thumbnail,
				}, function (ret, err) {
					if (ret) {
						if (!ret.status) {
							ret.url = imgUrl
						}
						imgObj.attr("src", ret.url);
						imgObj.removeAttr('id')
						imgObj.removeAttr('ffxiang-src')
					}
				});
			})($(srcs[i]));
		}
	}
}

// 黑白状态 type 0白字 1黑字
function _heibai(type) {
	// 因ios 无法设置手机栏背景色 故不进行设置
	if (!type) {
		api.setStatusBarStyle({
			style: 'light',
		});
	} else {
		api.setStatusBarStyle({
			style: 'dark',
		});
	}
}

// 验证手机号码
function _isMobile(mobile) {
	if (mobile == "") {
		return false;
	} else {
		var valid_rule = /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/; // 手机号码校验规则
		if (!valid_rule.test(mobile)) {
			return false;
		}
		return true;
	}
}

// 清除所有HTML
function html(s) {
	if (!s) {
		return s;
	}
	var dd = s.replace(/<\/?.+?>/g, "");
	var dds = dd.replace(/  /g, "");
	return dds;
}

function func(s, n) {
	if (!s) {
		return s;
	}
	s = html(s)
	n = 100;
	return s.slice(0, n).replace(/([^x00-xff])/g, "$1a").slice(0, n).replace(/([^x00-xff])a/g, "$1");
}

// 分割成数组
function splitArr(str) {
	if (!str) {
		return [];
	}
	var arr = str.split(',');
	return arr;
}


/*
 *camera               //相机/拍照/录像
 *contacts             //写入/读取通讯录
 *microphone           //麦克风/录制音频
 *photos               //相册/本地存储。Android上等同storage权限
 *location             //定位
 *locationAlways       //后台定位，只支持iOS
 *notification         //状态栏通知
 *calendar             //日历读写，只支持Android
 *phone                //直接拨打电话/获取手机号码、IMEI（设备标识），只支持Android
 *sensor               //传感器，只支持Android
 *sms                  //后台发送短信，只支持Android
 *storage              //存储空间，读取相册，多媒体，本地存储相关，只支持Android
 */
// 获取相应权限 ios 可通过返回状态判断是否设置了永不询问 安卓无该返回值，故若无权限时，需弹出弹窗询问用户是否设置，再请求该权限
function getPermission(perArr, callback) {
	var sys = api.systemType;
	var defaultArr = ['camera', 'photos', 'location', 'notification'];
	if (!perArr) {
		perArr = defaultArr;
		if (sys != 'ios') {
			perArr.unshift('storage');
		}
	};


	var list = perArr;
	var result = api.hasPermission({
		list: list
	});

	var noP = []; // 未获取 但可请求 的权限 ios / 安卓需获取的权限[不知晓是否能进行请求]
	var limitArr = []; // 未获取 且禁止请求 的权限 ios
	if (sys == 'ios') {
		for (var i = 0, len = result.length; i < len; i++) {
			if (!result[i].granted) {
				if (result[i].undetermined) { // 可请求
					noP.push(result[i].name);
				} else { // 不可请求
					limitArr.push(result[i].name)
				}

			}
		}
	} else {
		// 仍未被允许的权限 安卓
		for (var i = 0, len = result.length; i < len; i++) {
			if (!result[i].granted) {
				limitArr.push(result[i].name);
			}
		}
	}

	if (noP.length != 0) {
		// 只有ios 会直接请求权限
		askPermis(noP, function (c, arr) {
			noP = arr;
			var _perArr = noP.concat(limitArr);
			if (_perArr.length == 0) {
				// 请求的权限都已开启
				if (typeof callback == 'function') {
					callback(0);
				}
			} else {
				requireQuanXian(_perArr, function (code) {
					if (typeof callback == 'function') {
						callback(code);
					}
				});
			}
		})

	} else {
		var _perArr = limitArr;
		console.log(JSON.stringify(_perArr))
		if (_perArr.length == 0) {
			// 请求的权限都已开启
			if (typeof callback == 'function') {
				callback(0);
			}

		} else {
			requireQuanXian(_perArr, function (code) {
				if (typeof callback == 'function') {
					callback(code);
				}
			});
		}
	}

}

// 权限弹窗
function requireQuanXian(arr, callback) {
	console.log(JSON.stringify(arr))
	var msg = '该操作需要使用到你的';
	var perObj = {
		camera: '相机', //相机/拍照/录像
		microphone: '麦克风', //麦克风/录制音频
		photos: '相册/存储', //相册/本地存储。Android上等同storage权限
		location: '定位', //定位
		notification: '通知', //状态栏通知
		storage: '存储', //存储空间，读取相册，多媒体，本地存储相关，只支持Android
	}
	var brr = [];
	for (var i = 0, len = arr.length; i < len; i++) {
		brr.push(perObj[arr[i]]);
	}
	msg = msg + brr.join('/') + '权限';
	var obj = {
		msg: msg,
		btn: ['立即设置', '稍后再去']
	}
	api.confirm({
		title: '提示',
		msg: obj.msg,
		buttons: obj.btn
	}, function (ret, err) {
		if (ret.buttonIndex == 1) {
			askPermis(arr, callback)
		} else {
			if (typeof callback == 'function') {
				callback(1);
			}
		}
	});

}
// 请求权限
function askPermis(noP, callback) {
	if (noP.length == 0) {
		if (typeof callback == 'function') {
			callback(0, noP);
		}
		return;
	}

	api.requestPermission({
		list: noP,
		code: 100001
	}, function (ret, err) {
		console.log(JSON.stringify(ret))
		console.log(JSON.stringify(err))
		var noPer = 0;
		var arr = [];
		for (var j = 0, jlen = ret.list.length; j < jlen; j++) {
			if (!ret.list[j].granted) {
				noPer = 1;
				arr.push(ret.list[j].name)
			}
		}
		// 有权限未开启 返回1
		if (typeof callback == 'function') {
			callback(noPer, arr);
		}
	});
}



// 打开相册
function openPic(callback, media) {
	var buttons = ['相机', '相册'];
	var typeArr = ['camera', 'album'];
	var qArr = [100, 100];
	var sys = api.systemType;
	console.log(media)
	var _m = media == 'video' ? 'video' : 'pic';
	var text = media == 'video' ? '选择视频来源' : '选择图片来源';
	_action(text, buttons, function (bIndex) {
		if (bIndex != (buttons.length + 1)) {
			var perArr = sys != 'ios' ? ['camera', 'photos', 'storage'] : ['camera', 'photos'] // 相机 相册 存储
			getPermission(perArr, function (code) {
				// 1权限未开启 0权限已开启
				if (code != 0) {
					_msg('请先开启相关权限');
				} else {
					api.getPicture({
						sourceType: typeArr[bIndex - 1],
						encodingType: 'png',
						mediaValue: _m,
						destinationType: 'url',
						quality: qArr[bIndex - 1],
						videoQuality: 'high',
						saveToPhotoAlbum: false,
					}, function (ret, err) {
						if (ret && ret.data) {
							if (_m == 'video' && !ret.data.match('.mp4')) {
								// 视频 且非mp4格式
								if (sys == 'ios') {
									// 修改视频格式
									changeVideoType(ret.data, function (img) {
										if (typeof callback == 'function') {
											callback({
												data: img
											});
										}
									})
								} else {
									// 安卓无法修改视频格式
									_msg('请选择mp4上传');
									return;
								}
							} else {
								if (typeof callback == 'function') {
									callback(ret)
								}
							}
						} else {
							_msg('没有进行选择');
						}
					});
				}
			})
		}
	})
}

/* 自定义 */


// 退出登录
function _uot() {
	$api.rmStorage('token')
	$api.rmStorage('user')
	_user = ''
	_token = '';
}


// 夜间
function _yejians() {
	console.log(_yejian)
	if (_yejian) {
		// $api.rmStorage('yejian')
		$api.removeCls($api.dom('body'), 'fx-yejian')
		_yejian = 0;

	} else {
		$api.addCls($api.dom('body'), 'fx-yejian')
		_yejian = 1;

	}
	$api.setStorage(_yejian);
	_heibai()
}



// 每日奖励
//'title'					=>		'每名徒弟奖励8元了，马上收徒',		// 我的  标题
//'msg'						=>		'徒弟每天阅读，都能向您进贡金币',	// 我的  提示
//'fenxiang_title'			=>		'分享标题',
//'fenxiang_content'		=>		'分享描述',
//'money_yaoqing'			=>		'0.50',			// 徒弟邀请成功奖励
//'money_yaoqing_s1'		=>		'0.30',			// 师傅邀请成功奖励
//'money_login'				=>		'0.10',			// 徒弟每日登录奖励
//'money_login_s1'			=>		'0.10',			// 师傅每日登录奖励
//'money_news'				=>		'0.10',			// 徒弟每日浏览5篇内容奖励
//'money_news_s1'			=>		'0.10',			// 师傅每日浏览5篇内容奖励
//'money_add'				=>		'0.10',			// 徒弟每日发布微头条奖励
//'money_add_s1'			=>		'0.10',			// 师傅每日发布微头条奖励
//'money_mobile'			=>		'0.50',			// 徒弟绑定手机奖励人民币
//'money_mobile_s1'			=>		'0.30',			// 师傅绑定手机奖励人民币
//'money_fenxiang_1'		=>		'0.20',			// 徒弟邀请师徒页面每日分享奖励
//'money_fenxiang_1_s1'		=>		'0.10',			// 师傅邀请师徒页面每日分享奖励
//'money_fenxiang_2'		=>		'0.20',			// 徒弟每日分享文章奖励
//'money_fenxiang_2_s1'		=>		'0.20',			// 师傅师傅每日分享文章奖励
//'shouxufei'				=>		'1%',			// 提现手续费
function _daily(data) {
	console.log('data.name：' + data.name)
	var yaoqing = $api.getStorage('config').yaoqing;
	//配置里的邀请信息，非用户填写的邀请码
	if (!yaoqing) {
		return;
	}
	// 未登录 / 无奖励 / 无奖励名称
	if (!$api.getStorage('user') || !data || !data.name) {
		return;
	}
	// 上架状态
	if ($api.getStorage('app') == 1) {
		return;
	}

	_user = $api.getStorage('user');
	console.log(JSON.stringify(_user));

	//根据获取奖励的类型 获取奖励的日期 判断是否能获取奖励
	// 现因后台会做相应的判断，故前端无需限制
	var getName = $api.getStorage(data.name);
	// if (getName && getName == _myDate()) {

	// 	console.log(data.name + ':停止');
	// 	return;
	// }

	// 登录奖励
	// if (data.name == 'money_login') {
	// 	if (!yaoqing.money_login && !yaoqing.money_login_s1) {
	// 		return;
	// 	}
	// 	//		if(getName && getName == _myDate()){
	// 	//			console.log(data.name+':停止')
	// 	//			return;
	// 	//		}
	// }
	// 阅读奖励
	// if (data.name == 'money_news') {
	// 	if (!yaoqing.money_news_num) {
	// 		return;
	// 	}
	// 	if (!yaoqing.money_news && !yaoqing.money_news_s1) {
	// 		return;
	// 	}
	// 	if(getName && getName == _myDate()){
	// 		console.log(data.name+':停止')
	// 		return;
	// 	}
	// }
	// 视频奖励
	// if (data.name == 'money_shipin') {
	// 	if (!yaoqing.money_shipin_num) {
	// 		return;
	// 	}
	// 	if (!yaoqing.money_shipin && !yaoqing.money_shipin_s1) {
	// 		return;
	// 	}


	// 	if(getName && getName == _myDate()){  //已经领过一次奖励
	// 		if(_user.vip){  //是vip
	// 			var shipinCiShu = $api.getStorage('shipinCiShu');
	// 			console.log(data.name+':vip停止');
	// 		}else{
	// 			console.log(data.name+':普通用户停止');
	// 			return;
	// 		}
	// 	}else{
	// 		$api.setStorage('shipinCiShu', 0);
	// 	}

	// }
	var obj = {
		type: data.name,
	}
	if (data.id) {
		obj.aid = data.id;
	}
	console.log(JSON.stringify(obj));
	_ajax('api/yaoqing/daily', function (ret, err) {
		console.log(JSON.stringify(ret))
		console.log(JSON.stringify(err))
		if (ret && ret.ret) {
			$api.setStorage(data.name, _myDate());
			// if(data.name == 'money_shipin'){
			// 	if(_user.vip){
			// 		$api.setStorage('shipinCiShu', _myDate()+1);
			// 	}
			// }
			showDetail('hongbao', ret.ret);
		} else {
			console.log(JSON.stringify(err))
		}
	}, obj)
}

// 获取时间
function _myDate() {
	var myDate = new Date(); //获取系统当前时间
	var myTime = myDate.getFullYear() + (myDate.getMonth() + 1) + myDate.getDate();
	console.log('myTime:' + myTime)
	return myTime;
}


// 删除微头条
function del(id) {
	api.actionSheet({
		cancelTitle: '取消',
		destructiveTitle: '确认要删除吗？',
	}, function (ret, err) {
		var index = ret.buttonIndex;
		if (index == 1) {
			_loading('正在删除')
			_ajax('api/member/weitoutiaoDel/', function (ret, err) {
				if (ret) {
					_loadingClose()
					_msg(ret.ret ? ret.ret : ret.err)
					if (ret.ret) {
						$('#id' + id).remove();
					}
				}
			}, {
				aid: id
			})
		}
	});
}

// 微头条内容处理
function returnWtt(str) {
	var s = html(str);
	s = s.substr(0, 100);
	s = s + '<a>...[查看全文]</a>';
	return s;
}

// 上架
function showIOS() {
	var ios = $api.getStorage('app');
	if (ios == 1) {
		$('.ios').hide();
		$('.iosShow').show();
	} else {
		$('.iosShow').hide();
		$('.ios').show();
	}
}