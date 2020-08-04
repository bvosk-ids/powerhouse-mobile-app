window.FMSApplication.directive("backButton", function($compile, $route, $rootScope) {
    return {
        restrict: 'AC',
        link: function($scope, el) {
               el.on('click', function() {
                   window.history.back();
               });
        }
    };
});