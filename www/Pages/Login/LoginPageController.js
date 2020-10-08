FMSApplication.controller('LoginPageController',['$scope', '$location', 'loginDataService', 'userSessionDataService', function($scope, $location, loginDataService, userSessionDataService) {

	$("#login-form").validate({
        errorPlacement: function (error, element) {
            element.parent().siblings(".error-message").html(error);
        },
        submitHandler: function (form) {
            // $scope.formData.clientCode = "Facil-IT";
            $scope.formData.clientCode = "fmportal";        
            // $scope.formData.clientCode = "svw";
            loginDataService.IsUserValid($scope.formData).then(function(response){
                userSessionDataService.SetUser(response, $scope.formData.userName, $scope.formData.clientCode);
                $location.path("WorkOrders");
            });
        }
    });

    $scope.formData = {};
}]);