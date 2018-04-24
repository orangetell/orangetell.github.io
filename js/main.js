var app = (function(){
    'use strict';

    if (!('fetch' in window)) {
        console.log('Fetch API not found, try including the polyfill');
        return;
    }

    function logError(error) {
        console.log('Looks like there was a problem: \n', error);
    }

    function fechJsonData(url) {
        return fetch(url)
            .then(response => {
                if (response.ok) {
                    return response;
                }
                throw Error(response.statusText);
            })
            .then(response => {
                return response.json();
            })
            .then(json => {
                return json;
            })
            .catch(logError);
    }

    // Load the latest news data and populate content
    function loadHomeData() {
        fechJsonData('data/test.json').then(result => {
            if (!result || !result.data || result.data.length < 1) {
                return;
            }
            var list = "";
            for (var i = 0; i < result.data.length; i++) {
                list += '<a href="./pages/content.html?id=' + result.data[i].id + '" class="weui-media-box weui-media-box_appmsg">'
                            + '<div class="weui-media-box__hd">' + '<img class="weui-media-box__thumb" src="' + result.data[i].img + '" alt=""></div>'
                            + '<div class="weui-media-box__bd">' + '<h4 class="weui-media-box__title">' + result.data[i].title + '</h4>'
                            + '<p class="weui-media-box__desc">' + result.data[i].desc + '</p></div>'
                            + '</a>';
            }
            document.getElementById('list').innerHTML = list;
        });
    }

    function loadDetails() {
        var id = findGetParameter("id");
        fechJsonData('/data/detail.json').then(result => {
            if (!result || !result.data || result.data.length < 1) {
                return;
            }
            var data = {};
            for (var i = 0; i < result.data.length; i ++) {
                if (id == result.data[i].id) {
                    data = result.data[i];
                    break;
                }
            }
            var content = '<article class="weui-article">' + '<h1>' + data.title +'</h1>'
                            + '<section><section><p>' + '<img src="' + data.img + '" alt="">' + '</p></section>'
                            + '<section><p>' + data.content + '</p><section></sectioin></article>';
            // Update the DOM with the data
            document.getElementById('content').innerHTML = content;
        });
    }

    // Get a value from the querystring
    function findGetParameter(parameterName) {
        var result = null;
        var tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    }

    return {
        loadHomeData: (loadHomeData),
        loadDetails: (loadDetails)
    };
})();