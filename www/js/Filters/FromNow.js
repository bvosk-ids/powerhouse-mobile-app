FMSApplication.filter('fromNow', ['moment', function(moment) {
    return function(date, shouldShowSuffix) {
        shouldShowSuffix = typeof shouldShowSuffix !== 'undefined' ? shouldShowSuffix: false;
        return moment(date).fromNow(shouldShowSuffix);
    }
}]);