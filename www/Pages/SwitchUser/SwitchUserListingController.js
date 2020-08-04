FMSApplication.controller('SwitchUserListingController' ,['$scope', 'userSessionDataService', '$location', 'localStorageDataService', function($scope, userSessionDataService, $location, localStorageDataService) {

    $scope.users = [];

    function GetUserList(){
       $scope.users = userSessionDataService.GetUserList();
    }
    GetUserList();


    $scope.addUser = function(){
        $location.path("/LoginPage");
    }

    $scope.setActiveUser = function(user) {
        userSessionDataService.SwitchActiveUser(user);
        $location.path("/WorkOrders");
        localStorageDataService.clear(Constants.CurrentWoListPageKey);
        localStorageDataService.clear(Constants.CurrentWoListNumPagesKey);
    }

}]);