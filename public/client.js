
LabsJS.define(function(require) {
    
var $ = require("jquery-1.6.1");
var API_HOST = 'http://taohistory.cnodejs.net';
//var API_HOST = 'http://dev.tlabs';

function getNick() {
    var defNick = '', trackNick = getCookie('tracknick'),
       nick = getCookie('_nk_') || trackNick, // 用户昵称，Session 内有效
       uc1 = getCookie('uc1'), // user cookie 用户的配置信息
       isLogin = getCookie('_l_g_') && nick || getCookie('ck1') && trackNick; // 用户是否已经登录。注意：必须同时判断 nick 值，因为 _nk_ 和 _l_g_ 有时不同步
    return isLogin ? escapeHTML(unescape(nick.replace(/\\u/g, '%u'))) : defNick;
}
     
//将字符串参数变成dict参数
//form: oauth_token_secret=a26e895ca88d3ddbb5ec4d9d1780964b&oauth_token=b7cbcc0dc5056509a6b85967639924df
//支持完整url
function decodeForm(form) {
 var index = form.indexOf('?');
 if(index > -1) {
     form = form.substring(index+1);
 }
 var d = {};
 var nvps = form.split('&');
 for (var n = 0; n < nvps.length; ++n) {
     var nvp = nvps[n];
     if (nvp == '') {
         continue;
     }
     var equals = nvp.indexOf('=');
     if (equals < 0) {
         d[nvp] = null;
     } else {
         d[nvp.substring(0, equals)] = decodeURIComponent(nvp.substring(equals + 1));
     }
 }
 return d;
}

function getCookie(name) {
    var m = document.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
    return (m && m[1]) ? decodeURIComponent(m[1]) : '';
}
     
function escapeHTML(str) {
    var div = document.createElement('div'), text = document.createTextNode(str);
    div.appendChild(text);
    return div.innerHTML;
}

function showHistories() {
    var url = API_HOST + '/history?callback=?';
    var nick = getNick();
    $.getJSON(url, {user: nick}, function(data) {
        console.log('histories', data);
    });
};

setTimeout(function() {

    var params = decodeForm(window.location.search);
    if(params.id) {
        var nick = getNick();
        var apiurl = 'http://apiproxy.labs.taobao.com/proxy?taobao_nick=' 
            + encodeURIComponent(nick) 
            + '&feature_id=145&method=taobao.item.get&user_nick=' 
            + encodeURIComponent(nick) 
            + '&num_iid=' + params.id
            + '&fields=num_iid,title,price,detail_url,created,location,pic_url,num&callback=?';
        $.getJSON(apiurl, function(data) {
           data = data.item_get_response;
           if(data && data.item) {
               data = data.item;
           }
           if(!data) {
               var url = window.location.href;
               data = {
                   detail_url: url,
                   num_iid: params.id,
                   title: document.title
               };
               var index = data.title.lastIndexOf('-');
               if(index > 0) {
                   data.title = data.title.substring(0, index);
               }
               console.log('no item data');
           }
           data.user = nick;
           var url = API_HOST + '/history/save?callback=?';
           $.getJSON(url, data, function(result) {
               console.log(data, result);
           });
        });
    }
    
}, 1000);

showHistories();

});