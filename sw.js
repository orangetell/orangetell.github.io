(function() {
    'use strict';

    var CACHE_NAME = 'cache-v2';

    //首次注册，或者是sw.js有更新，重新打开网页后，install事件会被触发，类似于application.onCreate
    self.addEventListener('install', event => {
        event.waitUntil(
            caches.open(CACHE_NAME)
            .then(cache => cache.addAll([
                './js/main.js',
                './js/zepto.min.js',
                './css/weui.css',
                './css/example.css',
                './data/test.json',
                './index.html',
                'pages/404.html',
                'pages/failed.html',
                'pages/content.html',
                "https://cdn.bootcss.com/weui/0.4.3/style/weui.css",
                "https://fonts.googleapis.com/css?family=Raleway|Merriweather"
            ]))
        );
    });

    //当sw.js有更新，网页关闭或者重新打开后，activate会被触发，类似于activity.onCreate
    self.addEventListener('activate', function(event) {
        var oldCacheList = ['cache-v1'];
        event.waitUntil(
            // 遍历caches所有缓存
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        if (oldCacheList.includes(cacheName)) {
                            // 删除失效的缓存文件
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        );
    });

    //处理缓存（取缓存，取到返回；否则，请求网络，数据获取成功，则缓存数据并返回；否则，返回404）
    self.addEventListener('fetch', event => {
        // //白名单过滤
        // var matched = matchUrl(whiteListUrls,  event.request.url);
        // var isGET = event.request.method === 'GET';
        // console.log('fetch request url: ' + event.request.url + ", matched: " + matched + ", isGET: " + isGET);
        // if (!matched || !isGET) {
        //     return;
        // }
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true })
            .then(response => {
                return response || fetchAndCache(event.request)
            })
        );
    });

    function fetchAndCache(request) {
        return fetchRequest(request)
            .then(response => {
                if (response.status === 404) {
                    return caches.match('pages/404.html');
                }
                if (!response.ok) {
                    throw Error("url: " + request.url + ", STATUS: " + response.status + " " + response.statusText + ", type = " + response.type);
                }
                return caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(request.url, response.clone());
                        return response;
                    });
            })
            .catch(error => {
                console.log('Request failed:', error);
                return caches.match('pages/failed.html');
            });
    }

    //初始化请求参数，添加跨域头
    var fetchInitParam = {
        mode: 'cors'
    };

    function fetchRequest(request) {
        console.log('fetch request url: ' + request.url);
        if (matchUrl(hostUrls, request.url)) {
            return fetch(request);
        }
        return fetch(request.url, fetchInitParam);
    }

    var hostUrls = [
        '//orangetell.github.io'
    ];

    var whiteListUrls = [
        '//orangetell.github.io'
    ];

    //匹配URL
    function matchUrl(urls, requestUrl) {
        if (urls && requestUrl) {
            var url = new URL(requestUrl);
            var protocol = url.href.substr(url.protocol.length);
            return protocol.startsWith(urls);
        }
        return false;
    }

})();