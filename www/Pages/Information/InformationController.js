FMSApplication.controller('InformationController',['$scope', 'informationDocumentDataService', '$filter', function($scope, informationDocumentDataService, $filter) {
    $scope.operationDocuments = [];
    $scope.executiveDocuments = [];
    $scope.humanResourceDocuments = [];
    $scope.accountingDocuments = [];


    function GetDocuments() {
        informationDocumentDataService.Get().then(function(response){
            var operationDocumentsUnsorted = $filter('filter')(response, {Group: "Operations"});
            $scope.operationDocuments = $filter('orderBy')(operationDocumentsUnsorted,"Order");

            var executiveDocumentsUnsorted = $filter('filter')(response, {Group: "Executive"});
            $scope.executiveDocuments = $filter('orderBy')(executiveDocumentsUnsorted,"Order");

            var humanResourceDocumentsUnsorted = $filter('filter')(response, {Group: "Human Resources"});
            $scope.humanResourceDocuments = $filter('orderBy')(humanResourceDocumentsUnsorted,"Order");

            var accountingDocumentsUnsorted = $filter('filter')(response, {Group: "Accounting"});
            $scope.accountingDocuments = $filter('orderBy')(accountingDocumentsUnsorted,"Order");

            window.RefreshListView("ul[data-role='listview']");
        });
    }
    GetDocuments();
}]);