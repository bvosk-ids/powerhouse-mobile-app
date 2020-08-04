FMSApplication.controller('WorkOrderAddNoteController',['$scope', 'localStorageDataService', 'workOrderDataService', 'moment', 'userSessionDataService', function($scope, localStorageDataService, workOrderDataService, moment, userSessionDataService) {
    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);

    $scope.noteTypes = [];
    $scope.noteContent = "";
    $scope.newNoteType = null;


    setTimeout(function(){
        $("#new-note-form").validate({
            errorPlacement: function (error, element) {
               $(".error-message").html(error);
            },
            submitHandler: function(){
                workOrderDataService.AddNote({
                    Id: null,
                    NoteType: $scope.newNoteType,
                    Content: $scope.noteContent,
                    InputDate: moment().format("YYYY/MM/DD HH:mm:ss"),
                    InputBy: userSessionDataService.GetUser().UserName,
                    ReferenceObject: "order"
                }, $scope.workOrder.OrderNumber)
                .then(function(){
                    history.back();
                });
            }
        });
    },1);

    function UpdateNoteTypes(){
        workOrderDataService.GetNoteTypes().then(function(response){
           $scope.noteTypes = response;
        });
    }
    UpdateNoteTypes();
}]);