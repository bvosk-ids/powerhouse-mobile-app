function WorkOrderDataService(webSqlRepository, userSessionDataService, $q) {
    this.webSqlRepository = webSqlRepository;
    this.userSessionDataService = userSessionDataService;
    this.$q = $q;
}

WorkOrderDataService.prototype.Get = function (useCacheOnly) {

    var deferred = this.$q.defer();
    var WorkOrderProofStatusesDeferred = this.$q.defer();
    var dataService = this;

    dataService.webSqlRepository.PullData("WoHeaders", useCacheOnly).then(function (uniqueWOHeaders) {
        dataService.webSqlRepository.ExecuteSql("SELECT * FROM WorkOrderDetailPulls").then(function (detailPulls) {
            //This will ultimately contain all of the API calls we need to make based on the uniquePoNumber list we have
            var endPoints = [];
            endPoints.push("WorkOrders");

            if (useCacheOnly == false) {
                //Get a list of all the api calls that should be made for a work order
                var detailPullUrls = [];
                for (var index = 0; index < detailPulls.rows.length; index++) {
                    var detailPull = detailPulls.rows.item(index);
                    detailPullUrls.push(detailPull.URL);
                }

                //Derive a list of unique WO Numbers from the PO Number list
                var uniqueWorkOrderNumbers = [];
                $.each(uniqueWOHeaders, function (i, el) {
                    var workOrderNumber = el.OrderNumber;
                    if ($.inArray(workOrderNumber, uniqueWorkOrderNumbers) === -1) uniqueWorkOrderNumbers.push(workOrderNumber);
                });

                //Derive a list of unique WO Numbers from the PO Number list
                var uniquePoNumbers = [];
                $.each(uniqueWOHeaders, function (i, el) {
                    var poNumber = el.PoNumber;
                    if ($.inArray(poNumber, uniquePoNumbers) === -1) uniquePoNumbers.push(poNumber);
                });

                angular.forEach(uniqueWorkOrderNumbers, function (workOrderNumber) {
                    angular.forEach(detailPullUrls, function (detailPullUrl) {
                        //If the detail pull is not for a poNumber, assume it's for a work order, add the WO #, and add it to our endPoints
                        if (detailPullUrl.indexOf("?poNumber=") == -1) {
                            endPoints.push(detailPullUrl + workOrderNumber);
                        }
                    });
                });

                angular.forEach(uniquePoNumbers, function (poNumber) {
                    angular.forEach(detailPullUrls, function (detailPullUrl) {
                        //If the detail pull is for a poNumber, add the po #, and add it to our endPoints
                        if (detailPullUrl.indexOf("?poNumber=") != -1) {
                            endPoints.push(detailPullUrl + poNumber);
                        }
                    });
                });
            }
            //Pull data on all of the end points we've derived.
            dataService.webSqlRepository.PullData(endPoints, useCacheOnly).then(function (endPointDataDictionary) {
                //Return data for the Work Order End Points
                deferred.resolve(endPointDataDictionary["WorkOrders"]);
            });
        });
    });

    // return this.$q.all(deferred.promise, WorkOrderProofStatusesDeferred.promise);
    return deferred.promise;
}


WorkOrderDataService.prototype.GetNotes = function (workOrderNumber) {
    return this.webSqlRepository.PullData("Notes?workOrderNumber=" + workOrderNumber);
}

WorkOrderDataService.prototype.GetDocuments = function (referenceNumber, referenceType, useOnlyCacheData) {
    useOnlyCacheData = typeof useCachedDataOnly !== 'undefined' ? useCachedDataOnly : true;
    referenceType = typeof referenceType !== 'undefined' ? referenceType : 'order';
    return this.webSqlRepository.PullData("Documents?referenceDocType=" + referenceType + "&referenceNumber=" + referenceNumber, useOnlyCacheData);
}

WorkOrderDataService.prototype.GetNoteTypes = function (useCacheOnly) {
    useCacheOnly = typeof useCacheOnly !== 'undefined' ? useCacheOnly : true;
    return this.webSqlRepository.PullData("NoteTypes", useCacheOnly);
}

WorkOrderDataService.prototype.GetParts = function (useCacheOnly) {
    useCacheOnly = typeof useCacheOnly !== 'undefined' ? useCacheOnly : true;
    return this.webSqlRepository.PullData("Parts", useCacheOnly);
}

WorkOrderDataService.prototype.GetPendingPartsIssue = function (workOrderNumber) {
    return this.webSqlRepository.GetPendingData("WorkOrderParts?poNumber=" + workOrderNumber);
}

WorkOrderDataService.prototype.GetCompletionInformation = function (poNumber) {
    return this.webSqlRepository.PullData("WorkOrderCompletionInformation?poNumber=" + poNumber);
}

WorkOrderDataService.prototype.SetCompletionInformation = function (poNumber, completionInfo) {
    completionInfo.InputBy = this.userSessionDataService.GetUser().UserName;
    return this.webSqlRepository.PushData("WorkOrderCompletionInformation?poNumber=" + poNumber, completionInfo);
}

WorkOrderDataService.prototype.AddNote = function (note, workOrderNumber) {
    return this.webSqlRepository.PushData("Notes?workOrderNumber=" + workOrderNumber, note);
}

WorkOrderDataService.prototype.GetIvrs = function (poNumber) {
    return this.webSqlRepository.PullData("IVRStatuses?poNumber=" + poNumber);
}

WorkOrderDataService.prototype.AddIvr = function (poNumber, ivr) {
    return this.webSqlRepository.PushData("IVRStatuses?poNumber=" + poNumber, ivr);
}

WorkOrderDataService.prototype.GetProofs = function (poNumber) {
    return this.webSqlRepository.PullData("WorkOrderProofStatuses?poNumber=" + poNumber);
}

WorkOrderDataService.prototype.GetOrderParts = function (workOrderNumber) {
    return this.webSqlRepository.PullData("WorkOrderParts?poNumber=" + workOrderNumber);
}

WorkOrderDataService.prototype.AddPart = function (workOrderNumber, part) {
    return this.webSqlRepository.PushData("WorkOrderParts?poNumber=" + workOrderNumber, part);
}
