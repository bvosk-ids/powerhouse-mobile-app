FMSApplication.controller('SignOutController',['$scope', '$location', 'userSessionDataService', function($scope, $location, userSessionDataService) {

    userSessionDataService.ClearUser();

    var userList = userSessionDataService.GetUserList();
    if ( userList.length >= 1 ) {
        $location.path("/SwitchUser")
    } else {
        $location.path("/LoginPage");
    }
}]);