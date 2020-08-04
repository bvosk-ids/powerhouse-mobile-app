FMSApplication.controller('WorkOrderProofController',['$scope', 'localStorageDataService', 'workOrderDataService', '$location', '$filter', function($scope, localStorageDataService, workOrderDataService,$location,$filter) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    $scope.workOrderProofs = [];

    $scope.latestSignature = null;

    $scope.UpdateProofs = function() {
        workOrderDataService.GetProofs($scope.workOrder.PONumber).then(function(response)
        {
            $scope.workOrderProofs = response;

            //Merge local IVRs
            workOrderDataService.GetIvrs($scope.workOrder.PONumber).then(function(ivrResponse){
               if ( ivrResponse.length > 0 ) {
                   for(var i = 0; i < $scope.workOrderProofs.length; i++ ) {
                       var workOrderProof = $scope.workOrderProofs[i];
                       if ( workOrderProof.Code == Constants.ProofIVRKey ) {
                           workOrderProof.Status = true;
                       }
                   }
               }
            });

            //Merge local stamp & signature records
            workOrderDataService.GetDocuments($scope.workOrder.DispatchId,"dispatch").then(function(documentResponse){
                if ( documentResponse.length > 0 ) {
                    var stamps = documentResponse.filter(function(el){
                       return el.Type.toLowerCase() == "stamp";
                    });

                    if ( stamps.length > 0 ){
                        for(var i = 0; i < $scope.workOrderProofs.length; i++ ) {
                            var workOrderProof = $scope.workOrderProofs[i];
                            if ( workOrderProof.Code == Constants.ProofStampKey ) {
                                workOrderProof.Status = true;
                            }
                        }
                    }

                    var signatures = documentResponse.filter(function(el){
                       return el.Type.toLowerCase() == "signature";
                    });

                    if ( signatures.length > 0 ) {

                        var orderedSignatures = $filter("orderBy")(signatures,"-InputDate");
                        $scope.latestSignature = orderedSignatures[0];

                        for(var i = 0; i < $scope.workOrderProofs.length; i++ ) {
                            var workOrderProof = $scope.workOrderProofs[i];
                            if ( workOrderProof.Code == Constants.ProofSignatureKey ) {
                                workOrderProof.Status = true;
                            }
                        }
                    }
                }

                if ( $scope.latestSignature == null ) {
                    workOrderDataService.GetDocuments($scope.workOrder.OrderNumber).then(function(response){
                        var signatures = response.filter(function(el){
                            return el.Type.toLowerCase() == "signature";
                        });

                        if ( signatures.length > 0 ) {
                            var orderedSignatures = $filter("orderBy")(signatures,"-InputDate");
                            $scope.latestSignature = orderedSignatures[0];
                        }
                    });
                }


            });

            //Merge completion info records
            workOrderDataService.GetCompletionInformation($scope.workOrder.PONumber).then(function(completionResponse){
                if ( completionResponse != null && completionResponse !== "null"){
                    for(var i = 0; i < $scope.workOrderProofs.length; i++ ) {
                        var workOrderProof = $scope.workOrderProofs[i];
                        if ( workOrderProof.Code == Constants.ProofCompletionInfoKey ) {
                            workOrderProof.Status = true;
                        }
                    }
                }
            });

            window.RefreshListView("#proofs");
        });
    };
    $scope.UpdateProofs();



    $scope.gotoProofDetailPage = function(proof){
        var detailUrl;
        switch (proof.Code) {
            case Constants.ProofIVRKey:
                detailUrl = "/WorkOrderIVRs";
                break;
            case Constants.ProofSignatureKey:
                detailUrl = "/WorkOrderElectronicSignature"
                break;
            case Constants.ProofStampKey:
                detailUrl = "/WorkOrderStoreStamp"; 
                break;
            case Constants.ProofCompletionInfoKey:
                detailUrl = "/WorkOrderCompletionInfo"
                break;
            default:
                break;
        }

        if ( detailUrl != "") {
            $location.path(detailUrl);
        }

    }


}]);