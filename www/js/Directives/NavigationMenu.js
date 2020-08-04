window.FMSApplication.directive("navigationMenu", function($compile, $route, $rootScope, userSessionDataService) {
    return {
        restrict: 'AC',
        link: function(scope, element, attr) {
            $rootScope.$on('$routeChangeSuccess', function(e, a, b) {
                if (!userSessionDataService.IsUserLoggedIn()){
                    element.hide();
                } else {
                    element.show();
                }
            });
        }
    };
});