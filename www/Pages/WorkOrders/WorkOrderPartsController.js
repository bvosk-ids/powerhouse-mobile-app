FMSApplication.controller('WorkOrderPartsController',['$scope', '$location', '$filter','localStorageDataService', 'workOrderDataService', function($scope, $location, $filter, localStorageDataService, workOrderDataService) {
    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);

    $scope.workOrderParts =  [];

    $scope.UpdateParts = function() {

        workOrderDataService.GetOrderParts($scope.workOrder.PONumber).then(function (response) {
            //$scope.workOrderParts = response;

            var uniqueParts = [];
            angular.forEach(response, function(el){
                if ( uniqueParts.length == 0) {
                    uniqueParts.push(el);
                } else {
                    var elementID = el.ID;
                    var elementMobileReference = el.MobileReference;

                    var matchingElementInUniqueList = uniqueParts.filter(function(uniqueElement){
                        return (( elementID > 0) &&  elementID == uniqueElement.ID) ||( el.MobileReference != null && el.MobileReference.length && el.MobileReference==uniqueElement.MobileReference);
                    });
                    if ( matchingElementInUniqueList == null || matchingElementInUniqueList.length == 0 ) {
                        uniqueParts.push(el);
                    }
                }
            });

            angular.forEach(uniqueParts, function(value){

                var elementDispatchTime = moment(value);
                var PartsWithThisId = response.filter(function(el){
                    return (value.ID > 0 && el.ID == value.ID) || ( el.MobileReference != null && el.MobileReference.length && el.MobileReference==value.MobileReference) ;
                });

                var orderedPartsByThisDispatchTime = $filter("orderBy")(PartsWithThisId, "-InputDate");
                var latestPartInputDate = orderedPartsByThisDispatchTime[0];
                angular.forEach(orderedPartsByThisDispatchTime, function (item) {
                       response.splice(response.indexOf(item), 1);
                });
                if( latestPartInputDate.Qty > 0 ) {
                    response.push(latestPartInputDate);
                }
            });

            $scope.workOrderParts = response;
            window.RefreshListView("#parts-listview");
        });
    }
    $scope.UpdateParts();
    $scope.ClickPart = function(part) {
        localStorageDataService.set(Constants.WorkOrderPartKey, part);
        $location.path("WorkOrderAddPart");
    }

    $scope.OnAdd = function() {
        localStorageDataService.set(Constants.WorkOrderPartKey, null );
        $location.path("WorkOrderAddPart");
    }

}]);