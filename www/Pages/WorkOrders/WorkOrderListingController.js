FMSApplication.controller('WorkOrderListingController', ['$scope', 'workOrderDataService', 'localStorageDataService', '$location', 'networkUtility', 'webSqlRepository', 'otherWorkDataService', 'moment', '$rootScope', '$filter', 'geolocationUtility', function ($scope, workOrderDataService, localStorageDataService, $location, networkUtility, webSqlRepository, otherWorkDataService, moment, $rootScope, $filter, geolocationUtility) {

    $scope.canPullWOs = false;
    $scope.pullButtonText = "Refresh Work Order Data";
    $scope.canAddWOs = false;

    // Paging
    $scope.workOrders = [];
    $scope.workOrdersFiltered = [];
    $scope.workOrdersPage = [];
    $scope.currentPage = localStorageDataService.get(Constants.CurrentWoListPageKey) || 0;
    $scope.numPages = localStorageDataService.get(Constants.CurrentWoListNumPagesKey) || 1;
    $scope.pageSize = 20;
    $scope.GettingLocation = false;

    var refresh = $location.search().shouldRefresh;
    var POnumber = $location.search().POnum;

    $scope.filter = "";
    if (POnumber != null)
        $scope.filter = POnumber.replace(/\"/g, '');
    else if (localStorageDataService.get('LastUsedPoFilter') != null)
        $scope.filter = localStorageDataService.get('LastUsedPoFilter');

    $scope.$watch('filter',
        function (newValue, oldValue) {
            if (newValue != oldValue) {
                localStorageDataService.set('LastUsedPoFilter', newValue);
                $location.search("POnum", null);

                $scope.workOrdersFiltered = $filter('filter')($scope.workOrders, newValue);
                $scope.workOrdersPage = getCurrentPageWorkOrders($scope.workOrdersFiltered, $scope.pageSize, $scope.currentPage);
                $scope.numPages = getNumberOfPages($scope.workOrdersFiltered, $scope.pageSize);

                window.RefreshListView("#work-order-listview");
            }
        });

    $scope.$watch('numPages',
    function (newValue, oldValue) {
        if (newValue != oldValue) {
            localStorageDataService.set(Constants.CurrentWoListNumPagesKey, newValue);
            $scope.currentPage = 0;
        }
    });

    $scope.$watch('currentPage',
    function (newValue, oldValue) {
        if (newValue != oldValue) {
            localStorageDataService.set(Constants.CurrentWoListPageKey, newValue);
        }
    });

    function InitializeWorkOrderPullButtonState() {

        var savedAutoSyncState = localStorageDataService.get(Constants.AutoSyncKey);
        if (savedAutoSyncState == null) {
            savedAutoSyncState = true;
        }

        if (savedAutoSyncState) {
            $scope.pullButtonText = "Refresh Work Order Data";
            webSqlRepository.GetPendingDataCount().then(function (pendingDataCount) {
                if (networkUtility.IsOnline() && pendingDataCount <= 0) {
                    $scope.canPullWOs = true;
                }
            });
        } else {
            $scope.canPullWOs = true;
            $scope.pullButtonText = "Sync Data";
        }

        if (networkUtility.IsOnline()) {
            $scope.canAddWOs = true;
        }

    }
    InitializeWorkOrderPullButtonState();

    function getCurrentPageWorkOrders(workOrders, pageSize, currentPage) {
        return workOrders.slice(0 + (pageSize * currentPage), (pageSize * currentPage) + pageSize);
    }

    function getNumberOfPages(workOrders, pageSize) {
        return Math.ceil(workOrders.length / pageSize)
    }

    function GetWorkOrders(useCacheOnly) {
        $rootScope.$broadcast("loader_show");
        var start = window.performance.now();
        if (useCacheOnly == false) {
            otherWorkDataService.GetIvrStatus(useCacheOnly);
            workOrderDataService.GetNoteTypes(useCacheOnly);
            workOrderDataService.GetParts(useCacheOnly);
        }
        workOrderDataService.Get(useCacheOnly).then(function (response) {

            if (response && response.length > 0 && !refresh) {
                $location.search("shouldRefresh", null);
                $scope.workOrders = response;
                $scope.workOrdersFiltered = $filter('filter')($scope.workOrders, $scope.filter);
                $scope.numPages = getNumberOfPages($scope.workOrdersFiltered, $scope.pageSize);

                $scope.GettingLocation = true;
                geolocationUtility.GetUserLocation().then(function(location){
                    
                    if ( location != null && location.coords != null ) {
                        userLongitude = location.coords.longitude;
                        userLatitude = location.coords.latitude;

                        if (userLongitude != null && userLatitude != null) {

                            angular.forEach($scope.workOrdersFiltered, function(workOrder) {
                                if (workOrder.Latitude != 0 || workOrder.Longitude != 0) {
                                    var p = 0.017453292519943295;    // Math.PI / 180
                                    var c = Math.cos;
                                    var a = 0.5 - c((userLatitude - workOrder.Latitude) * p)/2 + 
                                            c(workOrder.Latitude * p) * c(userLatitude * p) * 
                                            (1 - c((userLongitude - workOrder.Longitude) * p))/2;
                    
                                    var kilometers = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
                    
                                    var miles = kilometers * 0.621371;
                                    workOrder.MilesFromLocation = miles.toFixed(2);

                                } else {
                                    workOrder.MilesFromLocation = "N/A";
                                }
                            });
                            
                            $scope.workOrdersFiltered = $filter("orderBy")($scope.workOrdersFiltered, ["MilesFromLocation","-VisitDate"]);
                        } else {
                            angular.forEach($scope.workOrdersFiltered, function(workOrder) {
                                workOrder.MilesFromLocation = "N/A";
                            });
                        }
                    } else {
                        angular.forEach($scope.workOrdersFiltered, function(workOrder) {
                            workOrder.MilesFromLocation = "N/A";
                        });
                    }
                    
                    $scope.workOrdersPage = getCurrentPageWorkOrders($scope.workOrdersFiltered, $scope.pageSize, $scope.currentPage);
                    $scope.GettingLocation = false;
                    window.RefreshListView("#work-order-listview");
                });
                
            }
            //This triggers if we tried a cache pull and had no results
            else if (useCacheOnly || refresh) {
                //Go ahead and do a live pull
                refresh = false;
                GetWorkOrders(false);
            } else {
                $scope.workOrders = [];
                window.RefreshListView("#work-order-listview");
            }
            $rootScope.$broadcast("loader_hide");
            var end = window.performance.now();
            $scope.loadTime = ((end - start)/1000).toFixed(2) + 's';
        });
    }

    GetWorkOrders(true);

    $scope.gotoWorkOrderDetail = function (workOrder) {
        localStorageDataService.set(Constants.WorkOrderKey, workOrder);
        $location.path("WorkOrderDetails");
    }

    setTimeout(function () {
        var $pullButton = $("#pull-lastest-wo-button");
        $pullButton.parent().trigger("create");
        $pullButton.click(function () {

            var savedAutoSyncState = localStorageDataService.get(Constants.AutoSyncKey);
            if (savedAutoSyncState == null) {
                savedAutoSyncState = true;
            }

            if (savedAutoSyncState) {
                GetWorkOrders(false);
            } else {
                $rootScope.$broadcast("startBackgroundOperations", true);
            }


        });
    }, 0);

    $rootScope.$on("singlePushComplete", function () {
        GetWorkOrders(false);
    });

    $scope.$on("setPullWOButtonStatus", function (e, isEnabled) {
        $scope.canPullWOs = isEnabled;
        $scope.canAddWOs = isEnabled;
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    });


    $scope.isEmergency = function (workOrder) {
        var priority = workOrder.Priority.toUpperCase();
        return priority.indexOf("EMER") > -1;
    }

    $scope.redirctToAddWork = function () {
        $location.path('/WorkOrderAddOrder');
    }

    $scope.incrementPage = function () {
        if ($scope.currentPage + 1 < $scope.numPages) {
            $rootScope.$broadcast("loader_show");
            $scope.currentPage++;
            $scope.workOrdersPage = getCurrentPageWorkOrders($scope.workOrders, $scope.pageSize, $scope.currentPage);
            window.RefreshListView("#work-order-listview");
            $rootScope.$broadcast("loader_hide");
        }
    }

    $scope.decrementPage = function () {
        if ($scope.currentPage > 0) {
            $rootScope.$broadcast("loader_show");
            $scope.currentPage--;
            $scope.workOrdersPage = getCurrentPageWorkOrders($scope.workOrders, $scope.pageSize, $scope.currentPage);
            window.RefreshListView("#work-order-listview");
            $rootScope.$broadcast("loader_hide");
        }
    }
}]);