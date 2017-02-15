define(function (require) {
    var handlebars = require("handlebars");
    var translate= require("./translate");
    handlebars.registerHelper('i18n', function(key) {
       return translate(key)
    });

    handlebars.registerHelper('orgStatus', function (context,options) {
       if(context == false){
           return translate("notOpenMigration");
       }else if(context == true){
          return translate("openMigration");
       }
    });

    handlebars.registerHelper('orgHandle', function (context,options) {
        if(context == false){
            return translate("o-openMigration");
        }else if(context == true){
            return translate("viewMigrationStatus");
        }
    });

    handlebars.registerHelper('migrationStatus', function (context,options) {
    switch (context){
        case 0:
            return translate("m_tomove");
            break;
        case 1:
        case 4:
        case 401:
        case 402:
        case 403:
        case 404:
            return translate("m_ing");
            break;
        case 3:
            return translate("m_closed");
            break;
        case 400:
            return translate("m_failed");
            break;
        case 2:
            return translate("m_over");
            break;
    }
    });
    return handlebars
});
