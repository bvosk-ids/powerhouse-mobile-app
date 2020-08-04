FMSApplication.controller('WorkOrderElectronicSignatureController',['$scope', 'localStorageDataService', 'photoUploadDataService', 'workOrderDataService', '$filter', 'appConfig', 'userSessionDataService', 'alertUtility', function($scope, localStorageDataService, photoUploadDataService, workOrderDataService, $filter, appConfig, userSessionDataService, alertUtility) {

    $scope.workOrder = localStorageDataService.get(Constants.WorkOrderKey);
    $scope.latestSignature = null;


    function LoadLatestSignature(documents){
        var signatures = documents.filter(function(el){
            return el.Type.toLowerCase() == "signature";
        });

        if ( signatures.length > 0 ) {
            var signaturesOrderedByDate = $filter("orderBy")(signatures,"-InputDate");
            var latestSignature = signaturesOrderedByDate[0];

            //This rotation logic is all thanks to: http://stackoverflow.com/a/23346764/3582127
            var img= new Image();
            img.onload = function() {
                var canvas = document.createElement("canvas");
                canvas.width = img.height;
                canvas.height = img.width;
                var ctx = canvas.getContext("2d");
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(Math.PI / 2);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
                var rotatedData = canvas.toDataURL();


                var rotatedImage = new Image();
                rotatedImage.onload = function(){
                    var signatureCanvas  = $("canvas")[0];
                    var context = signatureCanvas.getContext("2d");
                    context.drawImage(rotatedImage,0 ,0);
                }
                rotatedImage.src = rotatedData;


            };

            var imgSrc = null;
            var user = userSessionDataService.GetUser();
            if ( latestSignature.ImageData == undefined ) {
                imgSrc = appConfig.baseDocumentWithoutRedirectUrl + "?id=" + latestSignature.SequenceNumber + "&clientCode=" + user.ClientCode;
            } else {
                imgSrc = "data:image/png;base64," + latestSignature.ImageData;
            }
            img.src = imgSrc;
        }
    }

    function UpdateSignature() {
        workOrderDataService.GetDocuments($scope.workOrder.OrderNumber, "order").then(function(response){

            response = response.filter(function(el){
               return el.Type.toLowerCase() == "signature";
            });

            workOrderDataService.GetDocuments($scope.workOrder.DispatchId, "dispatch").then(function(localImages){

                localImages = localImages.filter(function(el){
                    return el.Type.toLowerCase() == "signature";
                });
                
                if ( localImages.length > 0 ) {
                    $scope.latestSignature = localImages;
                } else if ( response.length > 0 ) {
                    $scope.latestSignature = response;
                }

                if ( $scope.latestSignature != null ) {
                    LoadLatestSignature($scope.latestSignature);
                }
            });
        });
    }
    UpdateSignature();



    $scope.goBack = function() {
        window.history.back();
    }

    $scope.clearSignature = function() {
        $("#signature").jSignature("clear");
    }

    $scope.saveSignature = function() {
        var $signature = $("#signature");
        var signatureData = $signature.jSignature("getData");

        //This rotation logic is all thanks to: http://stackoverflow.com/a/23346764/3582127
        var img= new Image();
        img.onload = function() {
            var canvas = document.createElement("canvas");
            canvas.width = img.height;
            canvas.height = img.width;
            var ctx = canvas.getContext("2d");
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-(Math.PI / 2));
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            var rotatedData = canvas.toDataURL();
            rotatedData = rotatedData.substr(22);

            alertUtility.Prompt("Please Type Your Name").then(function(response){
                if ( response == "" ) {
                    alert("You must provide your typed name");
                    return;
                }
                photoUploadDataService.Upload(rotatedData, "SIGNATURE", $scope.workOrder.DispatchId, "dispatch", response, "png").then(function(){
                    window.history.back();
                });
            });
        };
        img.src = signatureData;
    }

    $scope.resetSignature = function() {
        $scope.latestSignature = null;
        $scope.clearSignature();
    }

    setTimeout(function(){

        var sigPadHeight = window.innerHeight - 10;
        $("#signature").jSignature({'width':200, 'height': sigPadHeight, color:'#000'});

        var $controlButtons = $("#control-buttons");
        $controlButtons.css("top", (sigPadHeight/2) -  40);

    },0);

}]);