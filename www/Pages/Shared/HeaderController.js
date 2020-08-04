FMSApplication.controller('HeaderController', ['$scope', 'localStorageDataService', '$rootScope', function ($scope, localStorageDataService, $rootScope) {

    $scope.autoSyncOnFlag = null;

    $scope.initializeState = function () {
        var savedState = localStorageDataService.get(Constants.AutoSyncKey);
        if (savedState == null) {
            $scope.autoSyncOnFlag = true;
            localStorageDataService.set(Constants.AutoSyncKey, $scope.autoSyncOnFlag);
        } else {
            $scope.autoSyncOnFlag = savedState;
        }
    };
    $scope.initializeState();


    $rootScope.$on("auto-sync-toggled", function() {
        $scope.initializeState();
    });


}]);