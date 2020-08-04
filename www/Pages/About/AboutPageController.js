FMSApplication.controller('AboutPageController' ,['$scope','moment', function($scope,moment) {

    $scope.openBrowser = function(url) {
        window.open(url, '_blank', 'location=yes');
    }

    $scope.year = moment().format('YYYY');
}]);