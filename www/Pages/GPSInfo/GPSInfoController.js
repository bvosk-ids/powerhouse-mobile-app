FMSApplication.controller('GPSInfoController' ,['$scope', 'geolocationUtility', function($scope, geolocationUtility) {

    $scope.IsAvailable;
    $scope.Message = "";

    geolocationUtility.IsGPSAvailable().then(function(response){
        $scope.IsAvailable = response.IsAvailable;
        $scope.Message = response.ErrorMessage
    })

}]);