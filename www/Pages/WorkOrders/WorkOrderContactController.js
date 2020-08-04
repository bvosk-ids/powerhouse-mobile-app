FMSApplication.controller('WorkOrderContactController',['$scope', 'localStorageDataService', function($scope, localStorageDataService) {
    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
}]);