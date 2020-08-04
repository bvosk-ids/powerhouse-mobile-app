FMSApplication.controller('WorkOrderIVRController',['$scope', 'localStorageDataService', 'workOrderDataService', '$filter', 'moment', 'userSessionDataService', 'geolocationUtility', 'otherWorkDataService', '$location', 'alertUtility', '$q', function($scope, localStorageDataService, workOrderDataService, $filter, moment, userSessionDataService, geolocationUtility, otherWorkDataService, $location, alertUtility, $q) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    $scope.workOrderIvrs = [];
    $scope.shouldShowCheckOutForm = false;

    $scope.isCheckedIntoOtherWork = false;

    $scope.nextStatusAction = {
        Label: 'Accept Dispatch',
        Type: 'dispatch',
        Action: AddIVR
    }

    $scope.shouldCheckIntoStandByNext = false;
    $scope.checkOutOption = 1;

    $scope.UpdateIvrs = function() {
        otherWorkDataService.GetIvrStatus(true).then(function(response){

            if ( response.length > 0 ) {
                var otherWorkIvrStatus = response[response.length-1];
                if (!(otherWorkIvrStatus.hasOwnProperty('Type') && otherWorkIvrStatus.Type == "CheckOut") && otherWorkIvrStatus.PoNumber == "") {
                    $scope.isCheckedIntoOtherWork = true;
                }
            }

            workOrderDataService.GetIvrs($scope.workOrder.PONumber).then(function(response)
            {
                var uniqueIvrDispatchTimes = [];
                angular.forEach(response, function(el){
                    var dispatchTime = el.DispatchTime;
                    if ( uniqueIvrDispatchTimes.length == 0) {
                        uniqueIvrDispatchTimes.push(dispatchTime);
                    } else {

                        var elementDispatchTime = moment(dispatchTime);

                        var matchingElementInUniqueList = uniqueIvrDispatchTimes.filter(function(uniqueElement){
                            return moment(uniqueElement).isSame(elementDispatchTime);
                        });
                        if ( matchingElementInUniqueList == null || matchingElementInUniqueList.length == 0 ) {
                            uniqueIvrDispatchTimes.push(dispatchTime);
                        }
                    }
                });

                angular.forEach(uniqueIvrDispatchTimes, function(value){

                    var elementDispatchTime = moment(value);
                    var ivrsWithThisDispatchTime = response.filter(function(el){
                        return moment(el.DispatchTime).isSame(elementDispatchTime);
                    });

                    var orderedIvrsByThisDispatchTime = $filter("orderBy")(ivrsWithThisDispatchTime, ["-InputDate","Type"]);
                    var latestIvrByInputDate = orderedIvrsByThisDispatchTime[0];
                    angular.forEach(ivrsWithThisDispatchTime, function(item){
                        response.splice(response.indexOf(item),1);
                    });
                    response.push(latestIvrByInputDate);

                });


                var orderedIvrList = $filter("orderBy")(response,"-InputDate");
                if (orderedIvrList == undefined){
                    orderedIvrList = [];
                }

                $scope.workOrderIvrs = orderedIvrList;
                window.RefreshListView("#ivr-listview");

                if ($scope.isCheckedIntoOtherWork) {
                    $scope.nextStatusAction = {
                        Label: 'Check Out Of Other Work',
                        Action: function() {
                            $location.path("/OtherWork");
                        }
                    }
                }
                else if ( orderedIvrList.length > 0 ){
                    var latestIvr = orderedIvrList[0];

                    if ( IsValidDate(latestIvr.CheckInTime) ) {
                        $scope.nextStatusAction = {
                            Label: 'Check In',
                            Type: 'checkin',
                            Action: AddIVR,
                            LatestIvr: latestIvr
                        }
                    }
                    else if ( IsValidDate(latestIvr.CheckOutTime) ) {
                        $scope.nextStatusAction = {
                            Label: 'Check Out',
                            Type: 'checkout',
                            Action: ShowCheckOutForm,
                            LatestIvr: latestIvr
                        }
                    }
                    else {
                        $scope.nextStatusAction = {
                            Label: 'Accept Dispatch',
                            Type: 'dispatch',
                            Action: AddIVR
                        }
                    }
                }
            });

        });
    };
    $scope.UpdateIvrs();


    function AddIVR(checkOutOption){
        checkOutOption = typeof checkOutOption !== 'undefined' ? checkOutOption : null;

        var deferred = $q.defer();

        geolocationUtility.GetUserLocation().then(function(location){
            var userLongitude = null;
            var userLatitude = null;

            if ( location != null ){
                userLongitude = location.coords.longitude;
                userLatitude = location.coords.latitude;
            }

            var ivrType = $scope.nextStatusAction.Type;
            var ivrStatus = {};

            var user = userSessionDataService.GetUser();
            var now = moment().utc().format();

            if ( ivrType == "dispatch") {
                ivrStatus = {
                    Id: GenerateGUID(),
                    DispatchTime: now,
                    CheckInTime: null,
                    CheckOutTime: null,
                    InputBy: user.UserName
                }
                ivrStatus.DispatchId = $scope.workOrder.DispatchId;
                ivrStatus.Type = ivrType;
                ivrStatus.InputDate = moment().toDate();
                ivrStatus.UserLongitude = userLongitude;
                ivrStatus.UserLatitude = userLatitude;
                ivrStatus.CheckOutOption = checkOutOption;


                alertUtility.Prompt("Please enter a comment").then(function(comment){
                    ivrStatus.Comment = comment;
                    workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                        deferred.resolve();
                        $scope.UpdateIvrs();
                    });
            });
            } else {
                angular.extend(ivrStatus, $scope.nextStatusAction.LatestIvr);
                if ( ivrType == "checkin" ) {
                    ivrStatus.CheckInTime = now;
                    GetTechs().then(function(techsno) {
                        ivrStatus.NumTechs = techsno;
                        ivrStatus.DispatchId = $scope.workOrder.DispatchId;
                        ivrStatus.Type = ivrType;
                        ivrStatus.InputDate = moment().toDate();
                        ivrStatus.UserLongitude = userLongitude;
                        ivrStatus.UserLatitude = userLatitude;
                        ivrStatus.CheckOutOption = checkOutOption;
            
            
                        alertUtility.Prompt("Please enter a comment").then(function(comment){
                            ivrStatus.Comment = comment;
                            workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                                deferred.resolve();
                                $scope.UpdateIvrs();
                            });
                        });



                    });

                }
                else if ( ivrType == "checkout" ) {
                    ivrStatus.CheckOutTime = now;
                    
                    ivrStatus.DispatchId = $scope.workOrder.DispatchId;
                    ivrStatus.Type = ivrType;
                    ivrStatus.InputDate = moment().toDate();
                    ivrStatus.UserLongitude = userLongitude;
                    ivrStatus.UserLatitude = userLatitude;
                    ivrStatus.CheckOutOption = checkOutOption;


                    alertUtility.Prompt("Please enter a comment").then(function(comment){
                        ivrStatus.Comment = comment;
                        workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                            deferred.resolve();
                            $scope.UpdateIvrs();
                        });
                    });
                }
            }

            
        });

        return deferred.promise;
    }

    $scope.CheckOut = function(){
        AddIVR($scope.checkOutOption).then(function(){
            if ( $scope.shouldCheckIntoStandByNext ) {
                otherWorkDataService.SetIvrStatus('CheckIn','Stand By', '').then(function(){
                    $scope.UpdateIvrs();
                });
            }
            $scope.shouldShowCheckOutForm = false;
        });
    };

    $scope.CloseCheckOutForm = function() {
        $scope.shouldShowCheckOutForm = false;
    }

    function ShowCheckOutForm() {
        $scope.shouldShowCheckOutForm = true;
    }

    function IsValidDate(date) {
        return (moment(date).year() == 1) || date == null;
    }

    function GenerateGUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    function GetTechs() {
        var deferred = $q.defer();

        alertUtility.Prompt("Please enter no.of techs").then(function(techsno) {                   
            if (techsno == null || techsno == "") {
                alert("Num of techs is required");
                deferred.reject();
            } else if (isNaN(techsno)) {
                techsno = null;
                alert("Num of techs is a number. Please input number");
                deferred.reject();
            } else {
                deferred.resolve(techsno);
            }
        });
        return deferred.promise;
    }

}]);