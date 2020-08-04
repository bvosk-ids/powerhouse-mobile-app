FMSApplication.controller('SettingsController', ['$scope', 'localStorageDataService', '$rootScope', function ($scope, localStorageDataService, $rootScope) {

    $scope.autoSyncOnFlag = null;

    $scope.initializeState = function() {
        var savedState = localStorageDataService.get(Constants.AutoSyncKey);
        if (savedState == null) {
            $scope.autoSyncOnFlag = true;
        } else {
            $scope.autoSyncOnFlag = savedState;
        }
    };
    $scope.initializeState();
    $scope.toggleAutoSync = function() {
        $scope.autoSyncOnFlag = !$scope.autoSyncOnFlag;
        localStorageDataService.set(Constants.AutoSyncKey, $scope.autoSyncOnFlag);


        $rootScope.$broadcast("auto-sync-toggled");


        if ($scope.autoSyncOnFlag) {
            setTimeout(function() {
                $rootScope.$broadcast("startBackgroundOperations");
            }, 6000);
        }

    };


}]);