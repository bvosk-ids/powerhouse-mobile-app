FMSApplication.controller('LandingPageController', ['$scope', 'localStorageDataService', '$rootScope', function ($scope, localStorageDataService, $rootScope) {

    // var elem = document.getElementById('mySwipe');
    // var mySwipe = new Swipe(elem, {
    //     startSlide: 0,
    //     auto: 2000,
    //     continuous: true
    //     // disableScroll: true,
    //     // stopPropagation: true,
    //     // callback: function(index, element) {},
    //     // transitionEnd: function(index, element) {}
    // });
    // mySwipe.setup();

    $scope.autoSyncOnFlag = null;

    // $scope.initializeState = function () {
    //     var savedState = localStorageDataService.get(Constants.AutoSyncKey);
    //     if (savedState == null) {
    //         $scope.autoSyncOnFlag = true;
    //     } else {
    //         $scope.autoSyncOnFlag = savedState;
    //     }

    //     setTimeout(function() {
    //         if ($scope.autoSyncOnFlag) {
    //             $("#landing-page-image").attr("src", "images/powerhouse.png");
    //         } else {
    //             $("#landing-page-image").attr("src", "images/powerhouse_a.png");
    //         }
    //     }, 100);
        

    // };
    // $scope.initializeState();


    $rootScope.$on("auto-sync-toggled", function () {
        $scope.initializeState();
    });

}]);