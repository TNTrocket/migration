define(function (require) {
    var handlebars= require("../util/helpers");
    var service = require("../service/xhr");
    var globalService = require("../service/globalService");
    var $ = require("jquery");
    var template = handlebars.compile($("#tableTpl").html());
    var renderData ={};
    if(globalService.searchURL("migrationAgain") === "true"){
        var orgId = globalService.searchURL("orgId");
        var sid = globalService.searchURL("sid");
        service.call({
            url:"/getDomainsByOrgId.do",
            data:{
                withOpenStatus:true,
                orgId: orgId,
                async:false
            }
        }).then(function(data){
          if(data.data.list.length>1){
              renderData.list=data.data.list;
              renderData.migrationAgain = true;
              $("#orgSelect").html(template(renderData));
              $("[data-open]").click(function(){
                  var openStatus = $(this).data("open");
                  var domain = $(this).data("domain");
                  window.location.href ="./openStep.html?sid="+sid+"&paramDomainName="+domain+"&orgId="+orgId+"&migrationAgain=true#/stepTwo";
                });
            }else{
              var singleDomainName = data.data.list[0].domainName;
              window.location.href ="./openStep.html?sid="+sid+"&paramDomainName="+singleDomainName+"&orgId="+orgId+"&migrationAgain=true#/stepTwo"
         }
        });
    }else{

        service.call({
            url:"/getOrgList.do"
        }).then(function(data){
            if(data.code==0){
                renderData.list=data.data.list;
                renderData.migrationAgain = false;
                $("#orgSelect").html(template(renderData));
                $("[data-open]").click(function(){
                    var openStatus = $(this).data("open");
                    if(openStatus === false){
                        window.location.href="./openStep.html?sid="+globalService.searchURL("sid")+"&orgId="+$(this).data('orgid');
                    }
                    else{
                        window.location.href="./openMove.html?sid="+globalService.searchURL("sid")+"&orgId="+$(this).data('orgid');
                    }
                });

            }
        });
    }


})
