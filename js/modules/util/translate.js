define(function (require) {
    var zh_CN = require("../i18n/zh_CN");
    var en_US = require("../i18n/en_US");
    var globalService = require("../service/globalService");
    var locale = globalService.getCookie("locale") || "zh_CN";
    function initTranslate(key) {
        if(locale === "zh_CN"){
            return zh_CN[key];
        }
        else if(locale === "en_US"){
            return en_US[key]
        }
        else{
            return zh_CN[key];
        }
    }
    function toTranslate(key,option) {
        if(locale === "zh_CN"){
            return zh_CN[option][key];
        }
        else{
            return en_US[option][key]
        }
    }
    function translate(key,option) {
    return option == null ?  initTranslate(key) : toTranslate(key,option)
    }
    return translate
});