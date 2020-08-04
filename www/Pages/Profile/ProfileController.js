FMSApplication.controller('ProfileController' ,['$scope', 'profileDataService', function($scope,profileDataService) {

    $scope.profile = {};
    function GetProfile() {
        profileDataService.GetProfile().then(function(response){
            $scope.profile = response;
        });
    }
    GetProfile();

}]);