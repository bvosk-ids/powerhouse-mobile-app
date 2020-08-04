function WebAPIRepository($rootScope, $http, $q, appConfig, userSessionDataService){
    this.$http = $http;
    this.appConfig = appConfig;
    this.$q = $q;
    this.userSessionDataService = userSessionDataService;
    this.$rootScope = $rootScope;
}


WebAPIRepository.prototype.MakeRequest = function(type, endPointUrl, data, headers){

    var $q = this.$q;
    if ( headers ) {
        headers["Content-Type"] =  "application/json";
    }
    return this.$http({method: type, url:this.appConfig.baseApiUrl + endPointUrl, data:data, headers: headers})
        .then(function(response){
            return response.data;
        },function(rejectionReason){
            return $q.reject(rejectionReason);
        });
}

WebAPIRepository.prototype.Post = function(endPointUrl, data){
    return this.MakeRequest("POST", endPointUrl, data, null);
}

WebAPIRepository.prototype.GetAuthenticatedHeaders = function(clientCode, userName){
    clientCode = typeof clientCode !== 'undefined' ? clientCode : "";
    userName = typeof userName !== 'undefined' ? userName : "";

    var userList = this.userSessionDataService.GetUserList();
    var userToUse = null;
    for(var i = 0; i < userList.length; i++ ){
        var user = userList[i];
        if ( user.ClientCode == clientCode && user.UserName == userName ) {
            userToUse = user;
            break;
        }
    }
    if ( userToUse == null ) {
        userToUse =this.userSessionDataService.GetUser();
    }

    return {'AuthToken': userToUse.AuthenticationToken, "UserName": userToUse.UserName, "ClientCode": userToUse.ClientCode};
}

WebAPIRepository.prototype.AuthenticatedGet = function(endPointUrl){
    var headers = this.GetAuthenticatedHeaders();
    return this.MakeRequest("GET", endPointUrl, null, headers);
}

WebAPIRepository.prototype.AuthenticatedPost = function(endPointUrl, data, clientCode, userName){
    var headers = this.GetAuthenticatedHeaders(clientCode, userName);
    return this.MakeRequest("POST", endPointUrl, data, headers );
}

WebAPIRepository.prototype.AuthenticatedPut = function(endPointUrl, data){
    var headers = this.GetAuthenticatedHeaders();
    return this.MakeRequest("PUT", endPointUrl, data, headers );
}

WebAPIRepository.prototype.AuthenticatedDelete = function(endPointUrl, data){
    var headers = this.GetAuthenticatedHeaders();
    return this.MakeRequest("DELETE", endPointUrl, data, headers );
}


WebAPIRepository.prototype.AuthenticatedFileUpload = function(fileUri, endPointUrl, additionalHeaders) {
    var deferred = this.$q.defer();
    var headers = this.GetAuthenticatedHeaders();

    angular.extend(headers, additionalHeaders);

    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName= fileUri.substr(fileUri.lastIndexOf('/')+1);
    options.mimeType="text/plain";
    options.headers = headers;

    var rootScope = this.$rootScope;
    rootScope.$broadcast("loader_show");
    var fileTransfer = new FileTransfer();
    fileTransfer.upload(fileUri, encodeURI(this.appConfig.baseApiUrl + endPointUrl),
        function(response){
            rootScope.$apply(function(scope){
                scope.$broadcast("loader_hide");
            });
            deferred.resolve(response);
        },
        function(error){
            rootScope.$apply(function(scope){
                scope.$broadcast("loader_hide");
            });
            deferred.reject(error);
        },
        options
    );

    return deferred.promise;
}