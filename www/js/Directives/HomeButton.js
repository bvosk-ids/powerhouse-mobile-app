window.FMSApplication.directive("homeButton", function($compile, $route, $rootScope, $location) {
    return {
        restrict: 'AC',
        link: function($scope, el) {
               el.on('click', function(){
                   $location.path("WorkOrders");
                   $scope.$apply();
               });
        }
    };
});