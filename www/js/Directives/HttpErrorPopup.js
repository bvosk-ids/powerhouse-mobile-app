window.FMSApplication.directive("httpErrorMessage", function ($rootScope) {
    return function ($scope, element, attrs) {
        return $scope.$on("http_error_message", function () {
            element.popup("open");
        });
    };
});