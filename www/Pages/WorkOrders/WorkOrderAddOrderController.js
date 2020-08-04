FMSApplication.controller('WorkOrderAddOrderController',
    [
        '$scope', 'addworkOrderDataService', 'localStorageDataService', 'userSessionDataService', 'networkUtility', 'webSqlRepository', 'otherWorkDataService', 'moment', '$location', 'alertUtility',
        function ($scope, addworkOrderDataService, localStorageDataService, userSessionDataService, networkUtility, webSqlRepository, otherWorkDataService, moment, $location, alertUtility) {
            $scope.workOrder = localStorageDataService.get(Constants.AddWorkOrderKey);

            $scope.clients = [];
            $scope.locations = [];
            $scope.ordertypes = [];
            $scope.priorities = [];
            $scope.clientid = 0;
            $scope.location = null;
            $scope.category = "Snow/Ice";
            $scope.ordertype = null;
            $scope.priority = null;
            $scope.Caller = userSessionDataService.GetUser().UserName;
            $scope.inch = null;

            $scope.allowAdd = true;

            function InitializeWorkOrderAddState() {
                $scope.allowAdd = networkUtility.IsOnline();
            }

            $scope.$on("setPullWOButtonStatus",
                function (e, isEnabled) {
                    $scope.allowAdd = isEnabled;
                });

            InitializeWorkOrderAddState();

            function getClients()
            {
                addworkOrderDataService.GetClients().then(function (response) {
                    $scope.clients = response;
                });
            }

            getClients();

            $scope.$watch('clientid', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    $scope.location = "";
                    setTimeout(function() {
                        $("#new-location").selectmenu('refresh', true);
                    },500);
                    getLocations();
                }
            });

            function getLocations() {
                addworkOrderDataService.GetLocations($scope.clientid).then(function (response) {
                    $scope.locations = response;
                });
            }

            //function getCategories() {
            //    addworkOrderDataService.GetCategories($scope.clientid).then(function (response) {
            //        $scope.categories = response;
            //    });
            //}

            function getOrderTypes() {
                addworkOrderDataService.GetOrderTypes($scope.category).then(function (response) {
                    $scope.ordertypes = response;
                });
            }

            getOrderTypes();

            function getPriorities() {
                addworkOrderDataService.GetPriorities().then(function (response) {
                    $scope.priorities = response;
                });
            }

            getPriorities();

            setTimeout(function () {
                $("#new-order-form").validate({
                    errorPlacement: function (error, element) {
                        if(isNaN($scope.inch))
                            $(".error-message").html(error);
                    },
                    submitHandler: function () {
                        addworkOrderDataService.AddOrder({
                                Clientid: $scope.clientid,
                                Location: $scope.location,
                                category: $scope.category,
                                ordertype: $scope.ordertype,
                                priority: $scope.priority,
                                Caller: $scope.Caller,
                                inch: $scope.inch,
                                InputDate: moment().format("YYYY/MM/DD HH:mm:ss"),
                                InputBy: userSessionDataService.GetUser().UserName
                            }, userSessionDataService.GetUser().UserName, userSessionDataService.GetUser().ClientCode)
                            .then(function (result) {
                                $location.path('/WorkOrders/').search({ shouldRefresh: true, POnum: result });
                            });
                    }
                });
            }, 1);
        }
    ]);