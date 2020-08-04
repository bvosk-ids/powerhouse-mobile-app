window.FMSApplication.directive('popup', function() {
    return {
        restrict: 'A',
        priority: -1,
        link: function(scope, el, attr) {
            el.popup();
            el.trigger("create");
        }
    }
})