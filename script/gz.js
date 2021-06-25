// 关注
function guanzhu(jgo, uid) {
    if(!_user){
        _login();
        return;
    }
    if(uid==_user.id){
        _msg('不可以关注自己')
        return;
    }
    _loading()
    var text=$(jgo).text();
    // 1关注 2取消关注
    var type = $(jgo).data('id')
    if (type == 1) {
        $(jgo).text('关注中');
        _ajax('api/member/guanzhu/',function(ret,err){
            _loadingClose()
            if(ret.ret){
                $(jgo).text('已关注')
                $(jgo).data('id', 2)
                $(jgo).addClass('guanzhuhovew')
            }else{
                $(jgo).text(text);
                _msg(ret.err)
            }
        },{gz_uid:uid})
    } else if (type == 2) {
        $(jgo).text('取消中');
        _ajax('api/member/guanzhuDel/',function(ret,err){
            _loadingClose()
            if(ret.ret){
                $(jgo).text('关注')
                $(jgo).data('id', 1)
                $(jgo).removeClass('guanzhuhovew');
            }else{
                $(jgo).text(text);
                _msg(ret.err)
            }
        },{gz_uid:uid})
    } 
}
// 赞
function pingZan_xia(obj, aid,num) {
    if(!_user){
        _login();
        return;
    }
    var type = $(obj).data('id');
    if (!type) {
        $(obj).addClass('pingZanColor');
        $(obj).data('id', '1');
        $(obj).html('<i class="aui-iconfont aui-icon-laud aui-margin-r-5"></i> ' + (num + 1))
        _ajax('api/member/zancai/',function(ret,err){
            if(ret){
                if(ret.err){
                    _msg(ret.err)
                }
            }
        },{aid:aid,type:1})
    } else {
        _msg('您已经赞过')
    }
}