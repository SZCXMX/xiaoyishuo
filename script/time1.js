// 改自 http://www.jq22.com/demo/time-141107173838/
// 2019-01-07 夏夜
// 用于可控制暂停及继续的 倒计时

var i = 0, j = 0, count = 0, MS = 0;
var MM = '00';
var SS = gameTime;
var totle = gameTime * 10;
var d = 180;

var showTime = function () {
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
};
var start1 = function () {
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
};

var countDown = function () {
    showTime();
    s = setInterval("showTime()", 100);
    start1();
    t1 = setInterval("start1()", 100);
}