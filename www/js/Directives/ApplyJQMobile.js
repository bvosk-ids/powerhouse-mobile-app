window.FMSApplication.directive("applyJqMobile", function($compile, $route, $rootScope) {
    return {
        restrict: 'AC',
        link: function($scope, el) {
            el.hide();
            setTimeout(function(){
                $scope.$on('$viewContentLoaded', el.trigger("create"));
                el.show();
            },1);
        }
    };
}).directive("refreshJqmList", function($compile, $route, $rootScope) {
    return {
        restrict: 'AC',
        link: function($scope, el) {
            el.closest(':jqmData(role=listview)').listview('refresh');
        }
    };
});