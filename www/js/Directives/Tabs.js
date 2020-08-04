window.FMSApplication.directive("tabLink", [function() {
        return {
            restrict: 'A',
            link: function($scope, el, attr) {
                var tabId = el.attr('href');

                if ( attr.tabLink == "default" ){
                    $(tabId).show();
                    el.addClass("ui-btn-active");
                }
                el.on('click',function(event){
                   event.preventDefault();
                   $(".tab").hide();
                   $(tabId).show();
                });
            }
        };
    }]);