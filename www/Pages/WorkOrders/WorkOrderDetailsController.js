FMSApplication.controller('WorkOrderDetailsController',['$scope', 'localStorageDataService', 'workOrderDataService', 'moment', '$filter', '$location', 'geolocationUtility', 'alertUtility', '$q', 'userSessionDataService', 'otherWorkDataService', function($scope, localStorageDataService, workOrderDataService, moment, $filter, $location, geolocationUtility, alertUtility, $q, userSessionDataService, otherWorkDataService) {
    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    // this.moment = moment;
    $scope.nextAction = {
        Label: '',
        Type: '',
        Action: null
    }
    $scope.showSkipSignOff = false;
    $scope.checkOutOption = 1;
    $scope.NotesAndPhotosDisabled = true;

    $scope.ShouldShowStandBy = false;
    if ($scope.workOrder.Employee) {
        $scope.ShouldShowStandBy = true;
    }

    function GetDetailCounts(){
        workOrderDataService.GetNotes($scope.workOrder.OrderNumber).then(function(response){
            $scope.notes = response;
        });
        workOrderDataService.GetIvrs($scope.workOrder.PONumber).then(function(response){
            $scope.ivr = response;
        });
        workOrderDataService.GetDocuments($scope.workOrder.OrderNumber).then(function(response){
            $scope.documents  = response.filter(function(el){
                return el.Type.toLowerCase() != "stamp" && el.Type.toLowerCase() != "signature";
            });
        });
    }
    GetDetailCounts();

    // Enable/disable survey button
    if ($scope.workOrder.SurveyUrl) {
        $('#surveyButton').removeClass('ui-state-disabled');
    } else {
        $('#surveyButton').addClass('ui-state-disabled');
    }

    $scope.onSurveyClick = function() {
        window.open($scope.workOrder.SurveyUrl, '_system');
    }

    function IsValidDate(date) {
        return (moment(date).year() == 1) || date == null;
    }

    $scope.CheckOut = function(){
        AddIVR($scope.checkOutOption).then(function(){
            if ( $scope.shouldCheckIntoStandByNext ) {
                otherWorkDataService.SetIvrStatus('CheckIn','Stand By', '').then(function(){
                    $scope.UpdateNextAction();
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

    function UpdateNextAction() {
        //General work flow of this button is
        //Dispatch (if not recurring) -> Check In -> Add Photos -> Sign Off -> Check Out
        //If it is recurring, Dispatch is sent at the same time the Check In is sent
        //"Add Photos" is skipped if photos already exist that have the same input date as the current day  
        //POW-1144 for full ticket
        //Check IVR to see if PO is checked in
        workOrderDataService.GetIvrs($scope.workOrder.PONumber).then(function(ivrResponse){
            var uniqueIvrDispatchTimes = [];
                angular.forEach(ivrResponse, function(el){
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
                    var ivrsWithThisDispatchTime = ivrResponse.filter(function(el){
                        return moment(el.DispatchTime).isSame(elementDispatchTime);
                    });

                    var orderedIvrsByThisDispatchTime = $filter("orderBy")(ivrsWithThisDispatchTime, ["-InputDate","Type"]);
                    var latestIvrByInputDate = orderedIvrsByThisDispatchTime[0];
                    angular.forEach(ivrsWithThisDispatchTime, function(item){
                        ivrResponse.splice(ivrResponse.indexOf(item),1);
                    });
                    ivrResponse.push(latestIvrByInputDate);

                });


                var orderedIvrList = $filter("orderBy")(ivrResponse,"-InputDate");
                if (orderedIvrList == undefined){
                    orderedIvrList = [];
                    $scope.NotesAndPhotosDisabled = true;
                }
                else if ( orderedIvrList.length > 0 ){
                    var latestIvr = orderedIvrList[0];

                    $scope.NotesAndPhotosDisabled = true;
                    //Dispatched, Not checked in
                    if ( IsValidDate(latestIvr.CheckInTime) ) {
                        $scope.nextAction = {
                            Label: 'Check In',
                            Type: 'checkin',
                            Action: AddIVR,
                            LatestIvr: latestIvr
                        }
                    }
                    else if ( IsValidDate(latestIvr.CheckOutTime) ) {
                        //checked in, photos & signoff check
                        $scope.NotesAndPhotosDisabled = false;
                        workOrderDataService.GetDocuments($scope.workOrder.OrderNumber).then(function(docResponse){
                            var currentDate = new Date(moment().toDate());
                            currentDate.setHours(0,0,0,0);
                            var todaysDocs  = docResponse.filter(function(el){
                                var inputDate = new Date(el.InputDate);
                                inputDate.setHours(0,0,0,0);
                                //direct date comparison doesn't work, need to compare via getTime();
                                return inputDate.getTime() == currentDate.getTime();
                            });
                            //if docs were put in today, skip proccing for photos
                            if (todaysDocs.length > 0) {

                                workOrderDataService.GetDocuments($scope.workOrder.OrderNumber, "order").then(function(orderDocResponse){

                                    orderDocResponse = orderDocResponse.filter(function(el){
                                       return el.Type.toLowerCase() == "signature";
                                    });
                        
                                    workOrderDataService.GetDocuments($scope.workOrder.DispatchId, "dispatch").then(function(dispatchDocs){
                        
                                        signatures = dispatchDocs.filter(function(el){
                                            return el.Type.toLowerCase() == "signature";
                                        });
                                        
                                        otherDispatchDocs = dispatchDocs.filter(function(el){
                                            return el.Type.toLowerCase() != "signature";
                                        });

                                        otherDocs = orderDocResponse.concat(otherDispatchDocs);
                                        
                                        //electronic signature exists, signoff satisfied
                                        if ( signatures.length > 0 || otherDocs.length > 0) {
                                            $scope.nextAction = {
                                                Label: 'Check Out',
                                                Type: 'checkout',
                                                Action: ShowCheckOutForm,
                                                LatestIvr: latestIvr
                                            }
                                        } else {
                                            
                                            var localStamps = signatures.filter(function(el){
                                                return el.Type.toLowerCase() == "stamp";
                                            });
                            
                                            var docStamps = orderDocResponse.filter(function(el){
                                               return el.Type.toLowerCase() == "stamp" && el.PONumber == $scope.workOrder.PONumber;
                                            });
                                            
                                            var stamps = localStamps.concat(docStamps);

                                            //stamp exists, signoff satisfied
                                            if (stamps.length > 0) {
                                                $scope.nextAction = {
                                                    Label: 'Check Out',
                                                    Type: 'checkout',
                                                    Action: ShowCheckOutForm,
                                                    LatestIvr: latestIvr
                                                }
                                            } else {
                                                $scope.nextAction = {
                                                    Label: 'Sign Off',
                                                    Type: 'signoff',
                                                    Action: function() {
                                                        $location.path("/WorkOrderProofs");
                                                    },
                                                    LatestIvr: latestIvr
                                                }

                                                $scope.showSkipSignOff = true;
                                            }
                                        }
                                    });
                                });
                            } else {
                                $scope.nextAction = {
                                    Label: 'Add Photo',
                                    Type: 'photos',
                                    Action: function() {
                                        $location.path("/WorkOrderDocuments");
                                    },
                                    LatestIvr: latestIvr
                                }
                            }
                        });
                    }
                    else {
                        $scope.NotesAndPhotosDisabled = true;
                        if ($scope.workOrder.Recurring) {
                            $scope.nextAction = {
                                Label: 'Check In',
                                Type: 'recurringcheckin',
                                Action: AddIVR,
                                LatestIvr: latestIvr
                            }
                        } else {
                            $scope.nextAction = {
                                Label: 'Accept Dispatch',
                                Type: 'dispatch',
                                Action: AddIVR,
                                LatestIvr: latestIvr
                            }
                        }
                        
                    }
                } else {
                    $scope.NotesAndPhotosDisabled = true;
                        if ($scope.workOrder.Recurring) {
                            $scope.nextAction = {
                                Label: 'Check In',
                                Type: 'recurringcheckin',
                                Action: AddIVR
                            }
                        } else {
                            $scope.nextAction = {
                                Label: 'Accept Dispatch',
                                Type: 'dispatch',
                                Action: AddIVR
                            }
                        }
                }
        });
    }
    UpdateNextAction();
    

    $scope.SkipSignOffClicked = function() {

        $scope.nextAction = {
            Label: 'Check Out',
            Type: 'checkout',
            Action: ShowCheckOutForm,
            LatestIvr: $scope.nextAction.LatestIvr
        }

        $scope.showSkipSignOff = false;
    }

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

            var ivrType = $scope.nextAction.Type;
            var ivrStatus = {};

            var user = userSessionDataService.GetUser();
            var now = moment().utc().format();

            if (ivrType == "recurringcheckin") {
                ivrStatus = {
                    Id: GenerateGUID(),
                    DispatchTime: now,
                    CheckInTime: null,
                    CheckOutTime: null,
                    InputBy: user.UserName
                }
                ivrStatus.DispatchId = $scope.workOrder.DispatchId;
                ivrStatus.Type = "dispatch";
                ivrStatus.InputDate = moment().toDate();
                ivrStatus.UserLongitude = userLongitude;
                ivrStatus.UserLatitude = userLatitude;
                ivrStatus.CheckOutOption = checkOutOption;
                ivrStatus.Comment = "";

                workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                    ivrStatus.CheckInTime = now;
                    GetTechs().then(function(techsno) {
                        ivrStatus.NumTechs = techsno;
                        ivrStatus.Type = "checkin";
                        ivrStatus.InputDate = moment().toDate();
                        workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                            deferred.resolve();
                            UpdateNextAction();
                        });
                    });
                    
                });
            }
            else if ( ivrType == "dispatch") {
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
                ivrStatus.Comment = "";

                workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                    deferred.resolve();
                    UpdateNextAction();
                });

            } else {
                angular.extend(ivrStatus, $scope.nextAction.LatestIvr);
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
                        ivrStatus.Comment = "";
                        workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                            deferred.resolve();
                            UpdateNextAction();
                        });
                    });
                }
                else if ( ivrType == "checkout" ) {
                    ivrStatus.CheckOutTime = now;
                    
                    ivrStatus.DispatchId = $scope.workOrder.DispatchId;
                    ivrStatus.Type = ivrType;
                    ivrStatus.InputDate = moment().toDate();
                    ivrStatus.InputBy =  userSessionDataService.GetUser().UserName;
                    ivrStatus.UserLongitude = userLongitude;
                    ivrStatus.UserLatitude = userLatitude;
                    ivrStatus.CheckOutOption = checkOutOption;
                    ivrStatus.Comment = "";
                    if (checkOutOption == 1) {
                        workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                            deferred.resolve();
                            UpdateNextAction();
                        });
                    } else {
                        alertUtility.Prompt("Please enter a comment").then(function(comment){
                            if (comment == null || comment == "") {
                                alert("check out comment required");
                                deferred.resolve();
                            } else {
                                workOrderDataService.AddNote({
                                    Id: null,
                                    NoteType: "Check Out",
                                    Content: comment,
                                    InputDate: moment().format("YYYY/MM/DD HH:mm:ss"),
                                    InputBy: userSessionDataService.GetUser().UserName,
                                    ReferenceObject: "order"
                                }, $scope.workOrder.OrderNumber)
                                .then(function(){
                                    ivrStatus.Comment = "";
                                    workOrderDataService.AddIvr($scope.workOrder.PONumber,ivrStatus).then(function(){
                                        deferred.resolve();
                                        UpdateNextAction();
                                    });
                                });
                            }
                        });
                    }
                }
            }
        });

        return deferred.promise;
    }

}]);