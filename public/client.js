
LabsJS.define(function(require) {
if(window.__history_load) {
    return;
}
window.__history_load = true;    
var $ = require("jquery-1.6.1");
var API_HOST = 'http://taohistory.cnodejs.net';
var API_HOST = 'http://dev.tlabs';

function getNick() {
    var defNick = '', trackNick = getCookie('tracknick'),
       nick = getCookie('_nk_') || trackNick, // 用户昵称，Session 内有效
       //uc1 = getCookie('uc1'), // user cookie 用户的配置信息
       isLogin = getCookie('_l_g_') && nick || getCookie('ck1') && trackNick; // 用户是否已经登录。注意：必须同时判断 nick 值，因为 _nk_ 和 _l_g_ 有时不同步
    nick = isLogin ? escapeHTML(unescape(nick.replace(/\\u/g, '%u'))) : defNick;
    if(!nick) {
        nick = $('a.user-nick').text();
    }
    return nick;
}
     
//将字符串参数变成dict参数
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

function formatItems(data) {
    var html = '';
    for(var i = 0, l = data.items.length; i < l; i++) {
        var item = data.items[i];
        var title = item.title;
        if(title.length > 14) {
            title = title.substring(0, 12) + '...';
        }
        html += '<li><a href="' + item.detail_url + '" target="_blank" title="' + item.title + '">' 
              + '<img src="' + item.pic_url + '_160x160.jpg" /><br/>' + title + '</a>'
              + '<br/><span></span></li>'; 
    }
    if(!html){
        return html;
    }
    
    html = $(html).css({
        "float": 'left',
        "margin": '3px',
        "background-color": '#121212',
        "border": '1px solid #292929',
        "border-radius": "5px",
        "padding": "5px",
        "width": "160px"
    });
    html.find('img').css({
        'width': '160px',
        'height': '160px'
    });
    return html;
}

function showHistories() {
    var url = API_HOST + '/history?callback=?';
    var nick = getNick();
    
    $.getJSON(url, {user: nick}, function(data) {
        var name = decodeURI("%E6%B5%8F%E8%A7%88%E5%8E%86%E5%8F%B2");
        var moredata = decodeURI("%E6%9F%A5%E7%9C%8B%E6%9B%B4%E5%A4%9A%E5%8E%86%E5%8F%B2%E6%95%B0%E6%8D%AE");
        $('#site-nav-bd p.login-info').append('<a id="btn_taohistory" href="javascript:;">' + name + '(' + data.count + ')</a>');
        var $history = $('<div id="taohistory"><ul></ul>' 
            + '<div style="clear: both; text-align:center; width: 100%;"><span id="taohistory_more_loading" style="display:none;">Loading...</span><a id="btn_taohistory_more" href="javascript:;" style="border-right: 1px solid white;padding-right:10px;margin-right:10px;">' + moredata + '</a><a id="btn_taohistory_close" href="javascript:;">Close</a></div>'
            + '</div>'), top = $('#site-nav').height();
        $history.css({
            "position": 'absolute',
            "z-index": 10000,
            "top": top,
            "left": 0,
            "padding": '20px 0 20px 0',
            "width": '100%',
            "color": 'white',
            "display": "none",
            "background-color": '#333'
        }).find('ul').append(formatItems(data));
        $('#btn_taohistory').mouseenter(function() {
            $('#taohistory').show().mouseenter(function() {
                $(this).show();
            }).mouseleave(function() {
                $(this).hide();
            });
        });
        $(document.body).append($history);
        
        $('#btn_taohistory_more').click(function() {
            var $btn = $(this), page = parseInt($btn.attr('page') || 1) + 1;
            $('#taohistory_more_loading').show();
            $btn.hide();
            $.getJSON(url, {user: nick, page: page}, function(data) {
                $('#taohistory_more_loading').hide();
                var html = formatItems(data);
                if(!html) {
                    return;
                };
                $btn.show();
                $btn.attr('page', page);
                $('#taohistory ul').append(html);
            });
        });
        $('#btn_taohistory_close').click(function() {
            $('#taohistory').hide();
        });
    });
};

function saveHistory() {
    var current_url = window.location.href;
    if(current_url.indexOf('item.') < 0) {
        return;
    }
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
               //#J_ImgBooth
               var pic_url = $('#J_ImgBooth').attr('src');
               if(pic_url) {
                   var i = pic_url.lastIndexOf('_310x');
                   if(i > 0) {
                       pic_url = pic_url.substring(0, i);
                   }
                   data.pic_url = pic_url;
               }
               console.log('no item data');
           }
           data.user = nick;
           var url = API_HOST + '/history/save?callback=?';
           $.getJSON(url, data, function(result) {
//               console.log(data, result);
           });
        });
    }
    
};

showHistories();
saveHistory();

});