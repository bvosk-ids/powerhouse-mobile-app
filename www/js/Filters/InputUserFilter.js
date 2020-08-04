FMSApplication.filter('inputUser',function() {
   return function(input){
        if ( input == null || input == "" ){
            return "You";
        } else {
            return input;
        }
   };
});