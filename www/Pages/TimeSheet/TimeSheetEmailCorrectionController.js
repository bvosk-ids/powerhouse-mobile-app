FMSApplication.controller('TimeSheetEmailCorrectionController' ,['$scope', 'localStorageDataService', 'workOrderDataService', 'userSessionDataService', function($scope, localStorageDataService, workOrderDataService, userSessionDataService) {

    $scope.timeSheet = localStorageDataService.get(Constants.TimeSheetKey);
    $scope.ivrHours = localStorageDataService.get(Constants.TimeSheetIvrHoursKey);
    $scope.poNumber = "";
    $scope.correctionNote = "";

    setTimeout(function(){
       $("#submit-correction-button").click(Submit);
    },1);

    $scope.$watch('poNumber', function(newValue, oldValue){
        var ivrHoursForPo = $scope.ivrHours.filter(function(hour){
           return hour.PoNumber == newValue;
        });
        var correctionNoteText = "IVR Times:";
        angular.forEach(ivrHoursForPo, function(hour){
           var correctionLine = "DI: " + hour.DispatchTime + " CI: " + hour.CheckInTime + " CO: " + hour.CheckOutTime;
            correctionNoteText += "\n";
            correctionNoteText += correctionLine;
        });

        $scope.correctionNote = correctionNoteText + "\n\n";

    });


    var allTimeSheetDetails = localStorageDataService.get(Constants.TimeSheetDetailsKey);
    $scope.timeSheetDetails = allTimeSheetDetails.filter(function(detail){
        return moment(detail.DispatchDate).format("YYYY-MM-DD") == moment($scope.timeSheet.ServiceDate).format("YYYY-MM-DD");
    });

    $scope.poNumber = $scope.timeSheetDetails[0].PoNumber;

    function Submit() {
        var ivrHourForPo = $scope.ivrHours.filter(function(hour){
           return hour.PoNumber == $scope.poNumber;
        });
        var woNumber = ivrHourForPo[0].OrderNumber;
        workOrderDataService.AddNote({
            NoteType: 'TimeSheet Correction',
            Content: $scope.correctionNote,
            InputBy: userSessionDataService.GetUser().UserName
        }, woNumber);
        window.history.back();
    }

}]);