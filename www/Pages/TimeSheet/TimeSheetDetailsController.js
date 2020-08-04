FMSApplication.controller('TimeSheetDetailsController' ,['$scope', '$location', 'timeSheetDataService', 'localStorageDataService', 'moment', function($scope, $location, timeSheetDataService, localStorageDataService, moment) {

    $scope.timeSheet = localStorageDataService.get(Constants.TimeSheetKey);
    $scope.ivrHours = localStorageDataService.get(Constants.TimeSheetIvrHoursKey);
    $scope.timeSheetDetails = localStorageDataService.get(Constants.TimeSheetDetailsKey);


    $scope.isSameServiceDate = function(detail){
        return moment(detail.DispatchDate).format("YYYY-MM-DD") == moment($scope.timeSheet.ServiceDate).format("YYYY-MM-DD");
    }

}]);