FMSApplication.controller('WorkOrderDocumentsController',['$scope', 'localStorageDataService', 'workOrderDataService', '$filter', 'photoUploadDataService', 'appConfig' ,'userSessionDataService', 'networkUtility', 'alertUtility', 'cameraCaptureUtility', function($scope, localStorageDataService, workOrderDataService, $filter, photoUploadDataService, appConfig, userSessionDataService, networkUtility, alertUtility, cameraCaptureUtility) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    $scope.workOrderDocuments = [];

    $scope.UpdateDocuments = function() {
        workOrderDataService.GetDocuments($scope.workOrder.OrderNumber).then(function(orderDocs)
        {
            workOrderDataService.GetDocuments($scope.workOrder.DispatchId, "dispatch").then(function(dispatchDocs){
                bothDocs = orderDocs.concat(dispatchDocs);
                
                var workOrderDocuments = $filter("orderBy")(bothDocs, "-InputDate");
                workOrderDocuments = workOrderDocuments.filter(function(el){
                    return el.Type.toLowerCase() != "stamp" && el.Type.toLowerCase() != "signature";
                });

                $scope.workOrderDocuments = workOrderDocuments;
                window.RefreshListView("#work-order-docs-listview");
            });
        });
    };
    $scope.UpdateDocuments();


    $scope.capturePhoto = function() {
        cameraCaptureUtility.Capture().then(function(imageData){
            alertUtility.Prompt("Please Enter A Comment").then(function(response){
                photoUploadDataService.Upload(imageData, "PHOTO", $scope.workOrder.DispatchId, "dispatch", response)
                    .then(function(){
                        $scope.UpdateDocuments();
                    });
            });
        });
    }

}]);