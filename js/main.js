require.config({
    paths : {
        'jquery'              : './components/jquery/jq/jquery',
        'handlebars'          : './components/handlebars/handlebars',
        'text'                : './components/requirejs-text/text',
        'webuploader'         : './components/upload/webuploader',
        'jquery.serializejson': './components/jquery.serializejson'
    }
});
require(["jquery"],function ($) {
   var templateType= $("#templateType").data("page");
    if(templateType){
        require(["./modules/main/"+templateType]);
    }
});


