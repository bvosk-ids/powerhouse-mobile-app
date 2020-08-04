STSApplication.controller('ForgotPasswordController',['$scope', '$location', 'loginDataService', function($scope, $location, loginDataService) {

    $scope.userName = null;
    $scope.email = null;


    $("#forgot-password-form").validate({
        errorPlacement: function (error, element) {
            element.parent().siblings(".error-message").html(error);
        },
        submitHandler: function(form){
            loginDataService.RequestForgottenPassword($scope.userName, $scope.email).then(function(){
                alert("Your request has been submitted, please check the email address you provided.");
            },
            function(error){
                if ( error.status == '401'){
                    alert("The information provided did not match any accounts on file.")
                }
            }
            );
        }
    });

}]);