FMSApplication.controller('TimeSheetWeekController' ,['$scope', 'moment', 'timeSheetDataService', '$q', function($scope, moment, timeSheetDataService, $q) {

    $scope.weekType = "";
    $scope.timeSheets = [];
    $scope.ivrHours = [];
    $scope.timeSheetDetails = [];

    $scope.$on("RefreshData", function(){
        $scope.ivrHours = [];
        $scope.timeSheetDetails = [];
        $scope.loadData($scope.weekType, false);
    });

    function GetTimeSheets(startDate, endDate, useCachedDataOnly){
        $scope.GetTimeSheets(useCachedDataOnly, startDate, endDate, 'order').then(function(response){
            if ( response.length == 0 && useCachedDataOnly ) {
                GetTimeSheets(startDate,endDate,false);
            } else {
                $scope.timeSheets = response;

                var promises = [];

                angular.forEach($scope.timeSheets, function(timeSheet){
                    promises.push(timeSheetDataService.GetIvrHours(timeSheet.ServiceDate,"order", useCachedDataOnly).then(function(response){
                        $scope.ivrHours = $scope.ivrHours.concat(response);
                    }));
                    promises.push(timeSheetDataService.GetDetails(timeSheet.ServiceDate,"order", useCachedDataOnly).then(function(response){
                        $scope.timeSheetDetails = $scope.timeSheetDetails.concat(response);
                    }));
                });
            }

            $q.all(promises).then(function(){
                window.RefreshListView("ul[data-role='listview']");
            });

        });
    }

    $scope.loadData = function(weekType, useCachedDataOnly){
        $scope.weekType = weekType;
        var startDate;
        var endDate;
        if ( weekType == 'currentWeek') {
            startDate = moment().day(0).format("YYYY-MM-DD");
            endDate = moment().day(6).format("YYYY-MM-DD");
        } else {
            startDate = moment().day(-6).format("YYYY-MM-DD");
            endDate = moment().day(-1).format("YYYY-MM-DD");
        }

        GetTimeSheets(startDate, endDate, useCachedDataOnly);
    }

}]);