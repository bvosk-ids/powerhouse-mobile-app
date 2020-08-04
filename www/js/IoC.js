window.FMSApplication
.factory('webApiRepository', function($rootScope, $http,$q, appConfig, userSessionDataService){
    return new WebAPIRepository($rootScope,$http,$q,appConfig,userSessionDataService);
})
.factory('webSqlRepository', function($q, appConfig, webApiRepository, networkUtility, userSessionDataService, $rootScope){
    return new WebSqlRepository($q, appConfig, webApiRepository,networkUtility, userSessionDataService, $rootScope);
})
.factory('loginDataService', function(webApiRepository){
    return new LoginDataService(webApiRepository);
})
.factory('workOrderDataService', function(webSqlRepository, userSessionDataService, $q){
    return new WorkOrderDataService(webSqlRepository, userSessionDataService, $q);
})
.factory('addworkOrderDataService', function (webSqlRepository, userSessionDataService, $q, webApiRepository) {
    return new AddWorkOrderDataService(webSqlRepository, userSessionDataService, $q, webApiRepository);
})
.factory('localStorageDataService', function(){
    return new LocalStorageDataService();
})
.factory('userSessionDataService', function(localStorageDataService){
    return new UserSessionDataService(localStorageDataService);
})
.factory('profileDataService', function(webSqlRepository){
    return new ProfileDataService(webSqlRepository);
})
.factory('otherWorkDataService', function(webSqlRepository, moment){
    return new OtherWorkDataService(webSqlRepository, moment);
})
.factory('timeSheetDataService', function(webSqlRepository){
    return new TimeSheetDataService(webSqlRepository);
})
.factory('informationDocumentDataService', function(webSqlRepository){
    return new InformationDocumentDataService(webSqlRepository);
})
.factory('networkUtility', function(){
    return new NetworkUtility();
})
.factory('photoUploadDataService', function(webSqlRepository, userSessionDataService, moment){
    return new PhotoUploadDataService(webSqlRepository, userSessionDataService, moment);
})
.factory('alertUtility', function($q){
    return new AlertUtility($q);
})
.factory('geolocationUtility', function($q){
    return new GeolocationUtility($q);
})
.factory('cameraCaptureUtility', function($q, $rootScope, $timeout){
    return new CameraCaptureUtility($q, $rootScope, $timeout);
})
.factory(
    "stacktraceService",
    function() {
        return({
            print: printStackTrace
        });
    }
)
.factory('moment', function(){
    return moment;
});

