define(function (require) {
    var $ = require("jquery");
    var globalService = require("./globalService");
    var errorDialog = require("../util/dialog");
    var translate = require("../util/translate");
    var basicUrl="/migration";
    var param = "?sid="+globalService.searchURL("sid");
    function apiCall(opitions,successCallback,errorCallback){
        opitions.type = opitions.type || 'POST';
        opitions.headers = opitions.headers || {};
        opitions.url = basicUrl+opitions.url+ (opitions.url.indexOf("?")> -1 ? param.replace("?","&"):param);
        opitions.headers["Accept"] = opitions.headers["Accept"] || "application/json";
        opitions.contentType = opitions.contentType || 'application/json';
        if(opitions.contentType === "application/json") {
            opitions.data = JSON.stringify(opitions.data);
        }
        $.ajax(opitions).done(function(data, textStatus, jqXHR){
            if(data.code !== 0){
                if(data.msg){
                    errorDialog.alert(data.msg,true,function(){
                    },null,{buttonText:translate("sure")});
                }else{
                    errorDialog.alert(translate("apiNetWorkError"),true,function(){
                    },null,{buttonText:translate("sure")});
                }

            }else{
                (successCallback || $.noop)(data, textStatus, jqXHR);
            }

        }).fail(function(jqXHR, textStatus, errorThrown){
            if(jqXHR.status== 401){
                errorDialog.alert(translate("sessionError"),true,function(){
                window.location.href = "/webadmin";
                },null,{buttonText:translate("sure")});
            }else if(jqXHR.status>=500){
                errorDialog.alert(translate("apiNetWorkError"),true,function(){
                },null,{buttonText:translate("sure")});
            }
            if(typeof errorCallback=="function") {
                errorCallback(jqXHR, textStatus, errorThrown);
            }
        })
    }
    function call(options){
        var deferred = $.Deferred();
        apiCall(options,function(data){
            deferred.resolve(data);
        },function(jqXHR, textStatus, errorThrown){
            deferred.reject(jqXHR, textStatus, errorThrown);
        });
        return deferred.promise();
    }
    return {
        call:call
    }
});