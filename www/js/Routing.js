window.FMSApplication.config(function($routeProvider){
    $routeProvider.when("/", {templateUrl: 'Pages/LoadingPage/LoadingPage.html', controller: 'LoadingPageController'});
    $routeProvider.when("/LoginPage", {templateUrl: 'Pages/Login/LoginPage.html', controller: 'LoginPageController'});
    $routeProvider.when("/SwitchUser", {templateUrl: 'Pages/SwitchUser/SwitchUserListingPage.html', controller: 'SwitchUserListingController', showBackButton: true});

    $routeProvider.when("/LandingPage", {templateUrl: 'Pages/LandingPage/LandingPage.html', controller: 'LandingPageController'});
    $routeProvider.when("/WorkOrders", { templateUrl: 'Pages/WorkOrders/WorkOrderListingPage.html', controller: 'WorkOrderListingController', showFooter: true, showSettingsButton: true });
    $routeProvider.when("/WorkOrderAddOrder", { templateUrl: 'Pages/WorkOrders/WorkOrderAddOrderPage.html', controller: 'WorkOrderAddOrderController', showBackButton: true, showHeader: true });
    $routeProvider.when("/WorkOrderDetails", {templateUrl: 'Pages/WorkOrders/WorkOrderDetailsPage.html', controller: 'WorkOrderDetailsController', showBackButton: true, showFooter: true});
    $routeProvider.when("/WorkOrderNotes", {templateUrl: 'Pages/WorkOrders/WorkOrderNotesPage.html', controller: 'WorkOrderNotesController', showBackButton: true});
    $routeProvider.when("/WorkOrderDocuments", {templateUrl: 'Pages/WorkOrders/WorkOrderDocumentsPage.html', controller: 'WorkOrderDocumentsController', showBackButton: true});
    $routeProvider.when("/WorkOrderIVRs", {templateUrl: 'Pages/WorkOrders/WorkOrderIVRPage.html', controller: 'WorkOrderIVRController', showBackButton: true});
    $routeProvider.when("/WorkOrderAddNote", {templateUrl: 'Pages/WorkOrders/WorkOrderAddNotePage.html', controller: 'WorkOrderAddNoteController', showBackButton: true});
    $routeProvider.when("/WorkOrderProofs", {templateUrl: 'Pages/WorkOrders/WorkOrderProofPage.html', controller: 'WorkOrderProofController', showBackButton: true});
    $routeProvider.when("/WorkOrderElectronicSignature", {templateUrl: 'Pages/WorkOrders/WorkOrderElectronicSignaturePage.html', controller: 'WorkOrderElectronicSignatureController', showHeader: false});
    $routeProvider.when("/WorkOrderStoreStamp", {templateUrl: 'Pages/WorkOrders/WorkOrderStoreStampPage.html', controller: 'WorkOrderStoreStampController', showBackButton: true});
    $routeProvider.when("/WorkOrderCompletionInfo", {templateUrl: 'Pages/WorkOrders/WorkOrderCompletionInfoPage.html', controller: 'WorkOrderCompletionInfoController', showBackButton: true, showFooter: true});
    $routeProvider.when("/WorkOrderContactInfo", {templateUrl: 'Pages/WorkOrders/WorkOrderContactPage.html', controller: 'WorkOrderContactController', showBackButton: true});
    $routeProvider.when("/WorkOrderLocationMap", {templateUrl: 'Pages/WorkOrders/WorkOrderLocationMapPage.html', controller: 'WorkOrderLocationMapController', showBackButton: true});
    $routeProvider.when("/WorkOrderParts", {templateUrl: 'Pages/WorkOrders/WorkOrderPartsPage.html', controller: 'WorkOrderPartsController', showBackButton: true, showFooter: true});
    $routeProvider.when("/WorkOrderAddPart", {templateUrl: 'Pages/WorkOrders/WorkOrderAddPartPage.html', controller: 'WorkOrderAddPartController', showBackButton: true, showFooter: true});
    $routeProvider.when("/Settings", {templateUrl: 'Pages/Settings/SettingsPage.html', controller: 'SettingsController'});
    $routeProvider.when("/Profile", {templateUrl: 'Pages/Profile/ProfilePage.html', controller: 'ProfileController', showBackButton: true});
    $routeProvider.when("/Information", {templateUrl: 'Pages/Information/InformationPage.html', controller: 'InformationController'});
    $routeProvider.when("/About", {templateUrl: 'Pages/About/AboutPage.html', controller: 'AboutPageController'});
    $routeProvider.when("/OtherWork", {templateUrl: 'Pages/OtherWork/OtherWorkPage.html', controller: 'OtherWorkController'});
    $routeProvider.when("/TimeSheet", {templateUrl: 'Pages/TimeSheet/TimeSheetPage.html', controller: 'TimeSheetController', showFooter: true});
    $routeProvider.when("/TimeSheetDetail", {templateUrl: 'Pages/TimeSheet/TimeSheetDetailsPage.html', controller: 'TimeSheetDetailsController', showBackButton: true, showFooter: true});
    $routeProvider.when("/TimeSheetEmailCorrection", {templateUrl: 'Pages/TimeSheet/TimeSheetEmailCorrectionPage.html', controller: 'TimeSheetEmailCorrectionController', showBackButton: true});
    $routeProvider.when("/GPSInfo", {templateUrl: 'Pages/GPSInfo/GPSInfoPage.html', controller: 'GPSInfoController', showBackButton: true});
    $routeProvider.when("/SignOut", {template: ' ', controller: 'SignOutController'});
})
.run(function ($templateCache, $route, $http) {
    var url;
    for(var i in $route.routes)
    {
        if (url = $route.routes[i].templateUrl)
        {
            $http.get(url, {cache: $templateCache});
        }
    }
});