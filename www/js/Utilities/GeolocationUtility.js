function GeolocationUtility($q){
    this.$q = $q;
}

GeolocationUtility.prototype.GetUserLocation = function(){
    var deferred = this.$q.defer();
    navigator.geolocation.getCurrentPosition(
        function(position){
            deferred.resolve(position);
        },
        function(error){
            deferred.resolve(null);
        },
        {maximumAge: 0, timeout: 10000, enableHighAccuracy: true}
    );
    return deferred.promise;
}


GeolocationUtility.prototype.IsGPSAvailable = function(){
    var deferred = this.$q.defer();
    navigator.geolocation.getCurrentPosition(
        function(position){
            deferred.resolve({
                IsAvailable: true,
                ErrorMessage: ''
            });
        },
        function(error){
            var errorMessage;
            switch (error.code) {
                case 3:
                    errorMessage = "Timeout";
                    break;
                case 2:
                    errorMessage = "Position Unavailable";
                    break;
                case 1:
                    errorMessage = "Permission Denied";
                    break;
            }

            deferred.resolve({
                IsAvailable: false,
                ErrorMessage: errorMessage
            })
        },
        {timeout: 40000, enableHighAccuracy: false}
    );
    return deferred.promise;
}