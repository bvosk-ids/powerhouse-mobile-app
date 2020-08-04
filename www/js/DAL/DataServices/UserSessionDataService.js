function UserSessionDataService(localStorageDataService){
    this.localStorageDataService = localStorageDataService;
}

UserSessionDataService.prototype.IsUserLoggedIn = function(){
    var userList = this.localStorageDataService.get(Constants.UserListKey);
    var legacyUser = this.localStorageDataService.get("User");
    return (userList && userList.length > 0)|| legacyUser;
}

UserSessionDataService.prototype.GetUserList = function(){
    var userList = this.localStorageDataService.get(Constants.UserListKey);
    userList = typeof userList !== 'undefined' ? userList : [];
    return userList;
}

UserSessionDataService.prototype.GetUser = function(){
    var activeUserIndex = this.localStorageDataService.get(Constants.ActiveUserIndexKey);
    var userList = this.localStorageDataService.get(Constants.UserListKey);

    if ( !(userList instanceof Array) ){
        var legacyUser = this.localStorageDataService.get("User");
        if ( legacyUser ) {
            userList = [legacyUser];
            activeUserIndex = 0;
            this.localStorageDataService.clear("User");
            this.localStorageDataService.set(Constants.UserListKey, userList);
            this.localStorageDataService.set(Constants.ActiveUserIndexKey, activeUserIndex);
        }
    }
    
    return userList[activeUserIndex];
}

UserSessionDataService.prototype.SwitchActiveUser = function(user){
    var userList = this.localStorageDataService.get(Constants.UserListKey);
    var userIndex = null;
    for ( var i = 0; i< userList.length; i++ ) {
        if ( user.UserName == userList[i].UserName && user.ClientCode == userList[i].ClientCode ) {
            userIndex = i;
            break;
        }
    }
    if ( userIndex != null ) {
        this.localStorageDataService.set(Constants.ActiveUserIndexKey, userIndex);
    }
}

UserSessionDataService.prototype.SetUser = function(authenticationToken, userName, clientCode){
    var user = {
        AuthenticationToken: authenticationToken,
        UserName: userName,
        ClientCode: clientCode
    };

    var usersList = this.localStorageDataService.get(Constants.UserListKey);
    usersList = usersList != null ? usersList : [];
    usersList.push(user);

    var activeUserIndex = usersList.length - 1;

    this.localStorageDataService.set(Constants.UserListKey, usersList);
    this.localStorageDataService.set(Constants.ActiveUserIndexKey, activeUserIndex);
}


UserSessionDataService.prototype.ClearUser = function(){
    var activeUserIndex = this.localStorageDataService.get(Constants.ActiveUserIndexKey);
    var userList = this.localStorageDataService.get(Constants.UserListKey);
    userList.splice(activeUserIndex, 1);

    this.localStorageDataService.set(Constants.UserListKey, userList);
    this.localStorageDataService.set(Constants.ActiveUserIndexKey, 0);
}

