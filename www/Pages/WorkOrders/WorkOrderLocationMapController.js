FMSApplication.controller('WorkOrderLocationMapController',['$scope', 'localStorageDataService', function($scope, localStorageDataService) {
    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);

    setTimeout(function(){
        //showMap("location-map", $scope.workOrder.Latitude, $scope.workOrder.Longitude);
        initialize();

        var address = $scope.workOrder.Address1;
        if ( $scope.workOrder.Address2 != "") {
            address += " " + $scope.workOrder.Address2;
        }
        address += " " + $scope.workOrder.City;
        address += ", " + $scope.workOrder.State;
        address += " " + $scope.workOrder.Zip;
        codeAddress(address);
    },1);


}]);