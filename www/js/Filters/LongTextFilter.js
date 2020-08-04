FMSApplication.filter('longtext',function() {
    return function(input, maxLength){
        if ( input.length > maxLength) {
            return input.substring(0,maxLength-3) + "...";
        } else {
            return input;
        }
    };
});