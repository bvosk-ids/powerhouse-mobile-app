FMSApplication.controller('WorkOrderNotesController',['$scope', 'localStorageDataService', 'workOrderDataService', '$filter', function($scope, localStorageDataService, workOrderDataService, $filter) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    $scope.workOrderNotes = [];

    $scope.UpdateNotes = function() {
        workOrderDataService.GetNotes($scope.workOrder.OrderNumber).then(function(response)
        {
            $scope.workOrderNotes = $filter("orderBy")(response,"-InputDate");

            window.RefreshListView("#work-order-notes-listview");
        });
    };
    $scope.UpdateNotes();


}]);