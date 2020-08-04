window.FMSApplication.directive("settingsButton", function($compile, $route, $rootScope, $location) {
    return {
        restrict: 'AC',
        link: function($scope, el) {
               el.on('click', function(){
                   $location.path("Settings");
                   $scope.$apply();
               });
        }
    };
});