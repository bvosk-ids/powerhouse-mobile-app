function NetworkUtility() {

}

NetworkUtility.prototype.IsOnline = function(){
    if ( typeof device === 'undefined' || (typeof device.cordova === 'undefined' || device.cordova == null) ) {
        return true;
    }
    return window.isOnline && navigator.connection.type != Connection.NONE;
}