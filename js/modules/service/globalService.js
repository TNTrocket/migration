define(function (require) {
    function setCookie(name,value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    }
    function getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

        if(arr=document.cookie.match(reg)) {
            return unescape(arr[2]);
        }
        else {
            return null;
        }
    }
    function getLocalStorage(key) {
     return window.localStorage.getItem(key);
    }
    function setLocalStorage(key,val) {
        window.localStorage.setItem(key,val);
    }
    function isEmptyObject(obj){
        for(var n in obj){
            return false
        }
        return true;
    }
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };
    function searchURL(opt){
        var search = location.search;
        if(search){
            search =search.split("?")[1].split("&");
            for(var a =0;a<search.length;a++){
                var tmp =search[a].split("=");
                if(opt === tmp[0]){
                    return tmp[1]
                }
            }
        }

    }
    function removeLoaclStorage(opt){
        window.localStorage.removeItem(opt)
    }
    return{
        setCookie:setCookie,
        getCookie:getCookie,
        getLocalStorage:getLocalStorage,
        setLocalStorage:setLocalStorage,
        isEmptyObject:isEmptyObject,
        searchURL:searchURL,
        removeLoaclStorage:removeLoaclStorage
    }
})
