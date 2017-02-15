define(function (require) {
    var view =require("text!../../../template/openMove/openMove.tpl.html");
    var tableView =require("text!../../../template/openMove/table.tpl.html");
    var tableNavView =require("text!../../../template/openMove/tablePageNavTpl.html");
    var migrationProess =require("text!../../../template/openMove/migrationProess.html");
    var $ = require("jquery");
    var moveRender = require("./moveRender");

    var obj ={
        moduleDom:{
            main:view,
            table:tableView,
            tableNav :tableNavView,
            migrationProess:migrationProess
        },
        rootDom: $("#openMove")
    };
    new  moveRender(obj)
});
