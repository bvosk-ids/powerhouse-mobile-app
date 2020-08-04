function AddWorkOrderDataService(webSqlRepository, userSessionDataService, $q, webApiRepository) {
    this.webSqlRepository = webSqlRepository;
    this.userSessionDataService = userSessionDataService;
    this.$q = $q;
    this.webApiRepository = webApiRepository;
}

AddWorkOrderDataService.prototype.GetClients = function() {
    return this.webSqlRepository.PullData("Clients", false);
}

AddWorkOrderDataService.prototype.GetLocations = function (ClientID) {
    return this.webSqlRepository.PullData("Locations?clientid=" + ClientID, false);
}

//AddWorkOrderDataService.prototype.GetCategories = function (ClientID) {
//    return this.webSqlRepository.PullData("Categories?clientid=" + ClientID, false);
//}

AddWorkOrderDataService.prototype.GetPriorities = function () {
    return this.webSqlRepository.PullData("Priority", false);
}

AddWorkOrderDataService.prototype.GetOrderTypes = function (Category) {
    return this.webSqlRepository.PullData("OrderTypes?category=" + Category, false);
}

AddWorkOrderDataService.prototype.AddOrder = function(order, username, clientcode) {
    return this.webApiRepository.AuthenticatedPost("AddOrder",
        angular.toJson(order), clientcode, username );
}