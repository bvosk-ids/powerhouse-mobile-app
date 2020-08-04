FMSApplication.controller('OtherWorkController', ['$scope', 'otherWorkDataService', 'alertUtility', function($scope, otherWorkDataService, alertUtility) {

    $scope.CheckedInWorkType = "";
    $scope.CheckedInPoNumber = "";
    $scope.otherWorkIvrStatus = null;

    function CheckOtherWorkIvrStatus(useOnlyCachedData){

        otherWorkDataService.GetIvrStatus(useOnlyCachedData).then(function(response){
            if (response.length > 0) {
                var otherWorkIvrStatus = response[response.length-1];
                $scope.otherWorkIvrStatus = otherWorkIvrStatus;

                if ( !(otherWorkIvrStatus.hasOwnProperty('Type') && otherWorkIvrStatus.Type == "CheckOut")) {
                    $scope.CheckedInWorkType = otherWorkIvrStatus.WorkType;
                    if ( otherWorkIvrStatus.PoNumber != "" ) {
                        $scope.CheckedInWorkType = "po";
                        $scope.CheckedInPoNumber = otherWorkIvrStatus.PoNumber;
                    }
                } else {
                    $scope.CheckedInWorkType = "";
                    $scope.CheckedInPoNumber = "";
                }

            }
        });

    }
    CheckOtherWorkIvrStatus(false);

    $scope.IsCheckedIntoPO = function(){
        return $scope.CheckedInWorkType == "po";
    }

    $scope.IsCheckedIntoAnything = function() {
        return $scope.CheckedInWorkType != "";
    }

    $scope.ShouldButtonBeDisabled = function(workType) {
        if ( $scope.CheckedInWorkType == "") {
            return false;
        }
        return workType != $scope.CheckedInWorkType;
    }

    $scope.CheckIntoOtherWork = function(workType) {


        alertUtility.Prompt("Please enter a comment").then(function(comment){
            if ( $scope.IsCheckedIntoAnything() ) {
                otherWorkDataService.SetIvrStatus('CheckOut',workType, comment).then(function(){
                    CheckOtherWorkIvrStatus(true);
                });
            } else {
                otherWorkDataService.SetIvrStatus('CheckIn', workType, comment).then(function(){
                    CheckOtherWorkIvrStatus(true);
                });
            }
        });

    }

}]);