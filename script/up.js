// 获取资源方式
function getSourceType(){
    var buttons = api.pageParam['type']=='video' ? ['录像','相册'] : ['拍照', '相册'];
    api.actionSheet({
        cancelTitle : '取消',
        buttons : buttons
    }, function(ret, err) {
        var index = ret.buttonIndex;
        if (index != 3) {
            var type = index == 1 ? 'camera' : 'album';
            getSource(type)
        }
    });
}

// 获取资源
function getSource(sourceType){
    var mediaValue = api.pageParam['type']=='video' ? 'video' : 'pic';
    api.getPicture({
        sourceType : sourceType,
        mediaValue : mediaValue,
        destinationType : 'url',
        encodingType:'jpg',
        quality : 40,
        targetWidth: 800,
        targetHeight: 800,
        videoQuality:'medium',
    }, function(ret, err) {
        console.log(JSON.stringify(ret))
        console.log(JSON.stringify(err))
        if (ret && ret.data && mediaValue=='video') {
            showVideo(ret.data);
            videoUpType = 0;
            
        }else if (ret && ret.data && mediaValue=='pic'){
            showImg(ret.data);
        }
    });
}

// 渲染图片
function showImg(url){
    var html = '';
    html += '<div class="aui-col-xs-3" id="iMg'+imagesI+'">';
    html += '<img src="'+url+'" data-src=0 />';
    html += '<p tapmode onclick="delImg('+imagesI+')">删除</p>';
    html += '</div>';
    $('#images').prepend(html);
    imagesI++;
}

// 移除图片
function delImg(id){
    $('#iMg'+id).remove();
}

// 处理图片
function dealImg(){
    var len = $('#images .aui-col-xs-3').length;
    var arr = [];
    _loading();
    for(var i=0;i<len;i++){
        var src = $('#images .aui-col-xs-3').eq(i).find('img').attr('data-src');
        if(src == 0){  // 该图片未上传
            var id = $('#images .aui-col-xs-3').eq(i).attr('id');
            var imgSrc = $('#images .aui-col-xs-3').eq(i).find('img').attr('src');
            upImg(imgSrc,function(ret, err, data){
                if (ret && ret.ret) {
                    $('#'+data.id+' img').attr('data-src', ret.ret);
                    arr.push(ret.ret);
                } else {
                    $('#'+data.id).remove();  // 上傳失敗，移除該圖片
                    _loadingClose();
                    _msg('部分图片上传失败，请重新发布');
                }
                imgStop++;
            }, {id:id})
        }else{
            arr.push(src);
        }
    }
    return arr;
}

// 上传图片
function upImg(image, callback, data) {
    if (!image) {
        _msg('图片地址出错')
        return;
    }
    console.log('正在上传：' + image);
    api.ajax({
        url: fx_url + 'api/member/imagesUpload',
        method: 'post',
        data: {
            values: {
                token: _token,
            },
            files: {
                image: image
            }
        },
    }, function (ret, err) {
        console.log(JSON.stringify(ret))
        console.log(JSON.stringify(err))
        callback(ret, err, data);
    });
}

// 渲染视频
function showVideo(url){
    
    if(videoOnOpen==0){
        videoPlayer.open({
            path: url,
            rect:{ x: 0, y: 210, w: api.winWidth, h: 250 },
            fixedOn:api.frameName
        }, function(ret, err) {
            if (ret.status) {
                videoOnOpen = 1;
            }
        });
    }else{
        // 设置新视频地址
        videoPlayer.setPath({ path: url });
        // 开始播放视频
        videoPlayer.start();
    }
    // 获取视频封面
    var videoScreenshots = api.require('videoScreenshots');
    videoScreenshots.screenshots({
        videoUrl: url,
        time:1,
        isAblum:true,
        name: '01'
    }, function(ret){
        videoUrl = url;  // 视频地址
        if(!url.match('.mp4')){
            var videoTool = api.require('videoTool');
            videoTool.compressVideo({
                directories:url,
                format:'mp4',
                presetName:1
            },function(rets,errs){
                console.log(JSON.stringify(rets));
                if(rets.state == 0){
                    videoUrl = rets.compressPath;
                }
            });
        }
        videoImgUrl = ret.path;  // 视频封面地址
    });
}
// 上传视频
function videoAjax(fn){
    if(videoUpType == 1){  // 已经上传过则无需再上传
        fn(videoUrl);
        return;
    }
    if(videoUrl.match('.mp4')){  // 非mp4不可上传
        api.ajax({
            url: fx_url+'api/member/videoUpload',
            method: 'post',
            timeout: 6000000,
            data: {
                values:{
                    token:_token,
                },
                files: {
                    video: videoUrl
                }
            },
        }, function(ret, err) {
            console.log(JSON.stringify(ret))
            console.log(JSON.stringify(err))
            if(ret && ret.ret){
                videoUpType = 1;
                fn(ret.ret);
            }else{
                _loadingClose();
                _msg(ret.err);
                videoUpType = 0;
                videoImgUrl = '';
                videoUrl = '';
            }
        })
    }else{
        _loadingClose();
        _msg('请选择mp4上传');
        videoUpType = 0;
        videoImgUrl = '';
        videoUrl = '';
    }
}
