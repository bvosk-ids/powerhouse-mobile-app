FMSApplication.controller('LoadingPageController',['$scope', '$location', 'userSessionDataService', function($scope, $location, userSessionDataService) {

    if ( userSessionDataService.IsUserLoggedIn()){
        $location.path("WorkOrders");
    } else {
        $location.path("LoginPage")
    }

}]);