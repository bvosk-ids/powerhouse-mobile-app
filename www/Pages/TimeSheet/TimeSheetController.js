FMSApplication.controller('TimeSheetController' ,['$scope', '$location', 'timeSheetDataService', 'localStorageDataService',function($scope, $location, timeSheetDataService, localStorageDataService) {

    $scope.shouldShowCurrentWeek = true;

    $scope.showCurrentWeek = function(){
        $scope.shouldShowCurrentWeek = true;
    }

    $scope.showPastWeek = function(){
        $scope.shouldShowCurrentWeek = false;
    }

    $scope.gotoDetail = function(timeSheet, ivrHours, timeSheetDetails) {
        localStorageDataService.set(Constants.TimeSheetKey,timeSheet);
        localStorageDataService.set(Constants.TimeSheetIvrHoursKey,ivrHours);
        localStorageDataService.set(Constants.TimeSheetDetailsKey,timeSheetDetails);
        $location.path("/TimeSheetDetail");
    }

    $scope.GetTimeSheets = function(useCachedOnly, beginDate, endDate, workType) {
        return timeSheetDataService.Get(beginDate, endDate, workType,useCachedOnly);
    }

    $scope.RefreshData = function() {
        $scope.$broadcast("RefreshData");
    }

}]);