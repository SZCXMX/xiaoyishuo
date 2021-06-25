// 改自 http://www.jq22.com/demo/time-141107173838/
// 2019-01-07 夏夜

function countDown(gameTime) {   // 传入倒计时秒数
    var totle = gameTime * 10;
    var i = 0;
    var count = 0;
    var d = 0;
    var SS = gameTime;
    var MS = 0,
        MM = 0;
    var t1 = setInterval(function () {
        i = i + 360 / ((gameTime) * 10);
        count = count + 1;
        if (count <= (gameTime / 2 * 10)) {
            $(".pie1").css("-o-transform", "rotate(" + i + "deg)");
            $(".pie1").css("-moz-transform", "rotate(" + i + "deg)");
            $(".pie1").css("-webkit-transform", "rotate(" + i + "deg)");
        } else {
            $(".pie2").css("backgroundColor", "#d13c36");
            $(".pie2").css("-o-transform", "rotate(" + i + "deg)");
            $(".pie2").css("-moz-transform", "rotate(" + i + "deg)");
            $(".pie2").css("-webkit-transform", "rotate(" + i + "deg)");
        }
    }, 100);
    var s = setInterval(function () {
        totle = totle - 1;
        if (totle == 0) {
            clearInterval(s);
            clearInterval(t1);
            $(".pie2").css("-o-transform", "rotate(" + d + "deg)");
            $(".pie2").css("-moz-transform", "rotate(" + d + "deg)");
            $(".pie2").css("-webkit-transform", "rotate(" + d + "deg)");
        } else {
            if (totle > 0 && MS > 0) {
                MS = MS - 1;
                if (MS < 10) {
                    MS = "0" + MS
                };
            };
            if (MS == 0 && SS > 0) {
                MS = 10;
                SS = SS - 1;
                if (SS < 10) {
                    SS = "0" + SS
                };
            };
            if (SS == 0 && MM > 0) {
                SS = 60;
                MM = MM - 1;
                if (MM < 10) {
                    MM = "0" + MM
                };
            };
        };
        $(".time").html(SS + "s");
    }, 100);
}