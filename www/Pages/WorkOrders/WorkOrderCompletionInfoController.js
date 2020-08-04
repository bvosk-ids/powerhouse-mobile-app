FMSApplication.controller('WorkOrderCompletionInfoController',['$scope', 'localStorageDataService', 'workOrderDataService', 'moment', 'geolocationUtility',function($scope, localStorageDataService, workOrderDataService, moment, geolocationUtility) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);

    $scope.completedDate = null;
    $scope.completedTime = null;
    $scope.completedComment = null;

    function UpdateCompletionInformation(){
        workOrderDataService.GetCompletionInformation($scope.workOrder.PONumber).then(function(response){
            if ( response == null || response === "null" )
            {
                return;
            }
            $scope.completedComment = response.PerformComment;
            $scope.completedDate = moment(response.DateCompleted).format("YYYY-MM-DD");
            $scope.completedTime = moment(response.DateCompleted).format("hh:mm");
        });
    }
    UpdateCompletionInformation();


    setTimeout(function(){
        $("#completion-info-form").validate({
            errorPlacement: function (error, element) {
                $(".error-message").html(error);
            },
            submitHandler: function(){

                geolocationUtility.GetUserLocation().then(function(location){
                    var userLongitude = null;
                    var userLatitude = null;

                    if ( location != null ){
                        userLongitude = location.coords.longitude;
                        userLatitude = location.coords.latitude;
                    }

                    workOrderDataService.SetCompletionInformation( $scope.workOrder.PONumber ,
                    {
                        DateCompleted: $scope.completedDate + " " + $scope.completedTime,
                        PerformComment: $scope.completedComment,
                        DispatchId: $scope.workOrder.DispatchId,
                        UserLongitude: userLongitude,
                        UserLatitude: userLatitude
                    }).then(function(){
                        window.history.back();
                    });
                });
            }
        });
    },0);


    $scope.setTimeToNow = function() {
        $scope.completedDate = moment().format("YYYY-MM-DD");
        $scope.completedTime = moment().format("HH:mm");
    }

    $scope.clearTime = function() {
        $scope.completedDate = "";
        $scope.completedTime = "";
    }

    $scope.submitForm = function(){
        $("#completion-info-form").submit();
    }

}]);