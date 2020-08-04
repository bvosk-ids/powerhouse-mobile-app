FMSApplication.filter('boolean',function() {
   return function(input){
        if ( input == 'Y' || input == 'true' || input == true) {
            return "Yes";
        } else {
            return "No";
        }
   };
});