FMSApplication.controller('WorkOrderStoreStampController',['$scope', 'localStorageDataService', 'workOrderDataService', 'photoUploadDataService', 'cameraCaptureUtility', function($scope, localStorageDataService, workOrderDataService, photoUploadDataService, cameraCaptureUtility) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);

    $scope.poStoreStamps = [];
    $scope.workOrderStoreStamps = [];

    function UpdateStoreStamps(){
        workOrderDataService.GetDocuments($scope.workOrder.OrderNumber).then(function(response){
            workOrderDataService.GetDocuments($scope.workOrder.DispatchId, "dispatch").then(function(localImages){

                localImages = localImages.filter(function(el){
                    return el.Type.toLowerCase() == "stamp";
                });

                $scope.workOrderStoreStamps = response.filter(function(el){
                   return el.Type.toLowerCase() == "stamp";
                });
                $scope.workOrderStoreStamps = $scope.workOrderStoreStamps.concat(localImages);


                var poStamps = response.filter(function(el){
                    return el.Type.toLowerCase() == "stamp" && el.PONumber == $scope.workOrder.PONumber;
                });
                $scope.poStoreStamps = poStamps.concat(localImages);


                if(!$scope.$$phase) {
                    $scope.$apply();
                }
                window.RefreshListView("#store-stamp-list-view");
            });
        });
    };
    UpdateStoreStamps();


    $scope.capturePhoto = function() {
        cameraCaptureUtility.Capture().then(function(imageData){
            window.originalSetTimeout(function(){
                photoUploadDataService.Upload(imageData, "stamp", $scope.workOrder.DispatchId, "dispatch", "")
                    .then(function(){
                        UpdateStoreStamps();
                    });
            }, 1);
        });
    }
}]);