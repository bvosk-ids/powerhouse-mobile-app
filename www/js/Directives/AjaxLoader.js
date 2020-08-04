window.FMSApplication.directive("loader", function ($rootScope) {
    $rootScope.InstanceCount = 0;
    return function ($scope, element, attrs) {
        element.hide();
        $scope.$on("loader_show", function () {
            if (window.device) {
                window.plugins.insomnia.keepAwake();
            }

            $rootScope.InstanceCount++;
            return element.show();
        });
        // $scope.$on("loader_hide_state", function() {
        //     $rootScope.InstanceCount--;
        //     return true;
        // });
        return $scope.$on("loader_hide", function () {
            if (--$rootScope.InstanceCount <= 0) {
                if (window.device) {
                    window.plugins.insomnia.allowSleepAgain();
                }
                
                $rootScope.InstanceCount = 0;
                return element.hide();
            }
        });
    };
});