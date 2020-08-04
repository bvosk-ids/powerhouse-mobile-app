function LocalStorageDataService(){

}

LocalStorageDataService.prototype.set = function(key, value){
    window.localStorage.setItem(key, JSON.stringify(value));
}

LocalStorageDataService.prototype.get = function(key){
    return JSON.parse(window.localStorage.getItem(key));
}

LocalStorageDataService.prototype.clear = function(key){
    window.localStorage.removeItem(key);
}