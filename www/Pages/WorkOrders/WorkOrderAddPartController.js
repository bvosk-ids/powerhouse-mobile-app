FMSApplication.controller('WorkOrderAddPartController',['$scope', '$filter', 'localStorageDataService', 'workOrderDataService', 'moment', 'userSessionDataService', 'alertUtility', function($scope, $filter, localStorageDataService, workOrderDataService, moment, userSessionDataService, alertUtility) {
    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    $scope.workOrderPart = localStorageDataService.get(Constants.WorkOrderPartKey);

    $scope.Parts = [];
    $scope.newPart;
    $scope.qtyContent;
    $scope.MaxQty = 0;

    $scope.Delete = function(){

        alertUtility.Confirm("Are you sure you want to delete part from work order?").then(function(index) {
            var PartID = 0;
            var ID = 0;
            var Qty = 0;
            var WHID = 0;
            var Price = 0;
            var PartDesc = '';
            var Partnum = '';
            var MobileReference = '';
            var part = $scope.Parts.filter(function (el) {
                return el.ID == $scope.newPart;
            });
            if (part.length > 0) {
                PartID = part[0].ID;
                Price = part[0].Price;
                WHID = part[0].WHID;
                PartDesc = part[0].PartDesc;
                Partnum = part[0].Partnum;
            }
            else {
                event.preventDefault();
                return false;
            }

            if ($scope.workOrderPart != null) {
                MobileReference = $scope.workOrderPart.MobileReference;
                ID = $scope.workOrderPart.ID;
            }

            workOrderDataService.AddPart($scope.workOrder.PONumber, {
                ID: ID,
                PartID: PartID,
                Qty: 0,
                UnitPrice: Price,
                WHID: WHID,
                PartDesc: PartDesc,
                Partnum: Partnum,
                InputBy: userSessionDataService.GetUser().UserName,
                MobileReference: MobileReference,
                InputDate: moment().toDate(),
                oldQty: $scope.workOrderPart.Qty
            })
                .then(function () {
                    localStorageDataService.set(Constants.WorkOrderPartKey, null);
                    history.back();
                });
        }, "Confirmation", ['Yes', 'No' ])
    }

    setTimeout(function(){
        $("#new-part-form").validate({
            errorPlacement: function (error, element) {
               $(".error-message").html(error);
            },
            submitHandler: function(form, event){

                var PartID = 0;
                var ID = 0;
                var Qty = 0;
                var WHID = 0;
                var Price = 0;
                var PartDesc = '';
                var Partnum = '';
                var MobileReference = '';
                var part = $scope.Parts.filter(function(el){return el.ID == $scope.newPart;});
                if( part.length > 0 )
                {
                    PartID = part[0].ID;
                    Price = part[0].Price;
                    WHID = part[0].WHID;
                    PartDesc = part[0].PartDesc;
                    Partnum = part[0].Partnum;
                    if( ($scope.qtyContent > $scope.MaxQty ) )
                    {
                        alert("You do not have that many parts in your inventory.");
                        event.preventDefault();
                        return false;
                    }
                    if( ($scope.qtyContent <= 0 ) )
                    {
                        alert("You cannot enter a number that is 0 or less .");
                        event.preventDefault();
                        return false;
                    }
                }
                else{
                    event.preventDefault();
                    return false;
                }

                if($scope.workOrderPart!=null) {
                    MobileReference = $scope.workOrderPart.MobileReference;
                    ID = $scope.workOrderPart.ID;
                }else{
                    MobileReference = GenerateGUID();
                }

                workOrderDataService.AddPart($scope.workOrder.PONumber,{
                    ID: ID,
                    PartID: PartID,
                    Qty: $scope.qtyContent,
                    UnitPrice: Price,
                    WHID: WHID,
                    PartDesc : PartDesc,
                    Partnum: Partnum,
                    InputBy: userSessionDataService.GetUser().UserName,
                    MobileReference: MobileReference,
                    InputDate :moment().toDate()
                })
                .then(function(){
                    localStorageDataService.set(Constants.WorkOrderPartKey, null);
                    history.back();
                });
            }
        });
    },1);


    $scope.partChange = function()  {
        workOrderDataService.GetPendingPartsIssue($scope.workOrder.PONumber).then( function(response) {
            var pendingQty = 0;
            var removedpendingQty = 0;
            var part = $scope.Parts.filter(function (el) {
                return el.ID == $scope.newPart;
            });
            var pengindparts = response.filter(function (el) {
                return el.PartID == part[0].ID;
            });
            var uniqueParts = [];
            angular.forEach(pengindparts, function(el){
                if ( uniqueParts.length == 0) {
                    uniqueParts.push(el);
                } else {
                    var elementID = el.ID;
                    var elementMobileReference = el.MobileReference;

                    var matchingElementInUniqueList = uniqueParts.filter(function(uniqueElement){
                        return (elementID > 0 && elementID == uniqueElement.ID) ||( el.MobileReference != null && el.MobileReference.length && el.MobileReference==uniqueElement.MobileReference);
                    });
                    if ( matchingElementInUniqueList == null || matchingElementInUniqueList.length == 0 ) {
                        uniqueParts.push(el);
                    }
                }
            });

            angular.forEach(uniqueParts, function(value){

                var elementDispatchTime = moment(value);
                var PartsWithThisId = pengindparts.filter(function(el){
                    return (value.ID > 0 && el.ID == value.ID) || ( el.MobileReference != null && el.MobileReference.length && el.MobileReference==value.MobileReference) ;
                });

                var orderedPartsByThisDispatchTime = $filter("orderBy")(PartsWithThisId, "-InputDate");
                var latestPartInputDate = orderedPartsByThisDispatchTime[0];

                angular.forEach(orderedPartsByThisDispatchTime, function (item) {
                        pengindparts.splice(pengindparts.indexOf(item), 1);
                });
                if( latestPartInputDate.Qty > 0 ) {
                    pengindparts.push(latestPartInputDate);
                }else {
                    removedpendingQty += latestPartInputDate.oldQty;
                }
            });

            for( i = 0; i < pengindparts.length; i++) {
                pendingQty += pengindparts[i].Qty;
            }
            if (part.length > 0) {
                part[0].Qty -= pendingQty;

                if (part[0].Qty < 0)
                    part[0].Qty = 0;

                $scope.MaxQty = part[0].Qty ;
                if( $scope.workOrderPart == null ) {
                    $scope.qtyContent = part[0].Qty;
                }else{
                    $scope.MaxQty+=$scope.workOrderPart.Qty+ removedpendingQty;
                }

                $("#inventoryMaxID").text( "You have "  + $scope.MaxQty + " left in your inventory.");
            }
        });
    }

    function UpdateParts(useCache){
        $scope.workOrderPart = localStorageDataService.get(Constants.WorkOrderPartKey);

            workOrderDataService.GetParts(useCache).then(function (response) {
                $scope.Parts = response;
                if ($scope.workOrderPart != null) {
                    setTimeout(function () {
                        $("#new-part").val($scope.workOrderPart.PartID);
                        $scope.newPart = $scope.workOrderPart.PartID;
                        $("#new-part").selectmenu('refresh');
                        $("#new-part").attr("disabled", true);
                        $("#delete-button").show();
                        $scope.qtyContent = $scope.workOrderPart.Qty;
                        $scope.partChange();
                    }, 1);
                } else {
                    $("#new-part").val('');
                    $("#new-part").selectmenu('refresh');
                    $("#new-part").removeAttr("disabled");
                    $("#delete-button").closest('.ui-btn').hide();
                    $scope.MaxQty = 0;
                }
            });
    }
    UpdateParts(true);
}]);