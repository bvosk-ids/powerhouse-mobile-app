function AlertUtility($q){
    this.$q = $q;
}

AlertUtility.prototype.Prompt = function(message){
    var deferred = this.$q.defer();

    if ( window.device && window.device.uuid != null ) {

        navigator.notification.prompt(message, function(results){
            if ( results.buttonIndex == 1 ){
                deferred.resolve(results.input1);
            } else {
                deferred.reject();
            }
        }, "POWERHOUSE", ['Ok', 'Cancel']);
    } else {
        setTimeout(function(){
            var response = window.prompt(message);
            if ( response == null ){
                deferred.reject();
            } else {
                deferred.resolve(response);
            }
        },1);
    }

    return deferred.promise;
}

AlertUtility.prototype.Confirm = function(message){
    var deferred = this.$q.defer();

    if ( window.device.uuid != null ) {

        navigator.notification.confirm(message, function(results){
            if ( results.buttonIndex == 1 ){
                deferred.resolve(results.input1);
            } else {
                deferred.reject();
            }
        }, "Facil-ITy", ['Ok', 'Cancel']);
    } else {
        setTimeout(function(){
            var response = window.confirm(message);
            if ( response == null ){
                deferred.reject();
            } else {
                deferred.resolve(response);
            }
        },1);
    }

    return deferred.promise;
}

