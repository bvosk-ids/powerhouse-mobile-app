window.FMSApplication.run(['webSqlRepository', 'moment', '$rootScope', 'webApiRepository', '$q', 'networkUtility', 'localStorageDataService', function (webSqlRepository, moment, $rootScope, webApiRepository, $q, networkUtility, localStorageDataService) {
    $rootScope.$on("startBackgroundOperations", function (e, runOnce) {
        runOnce = typeof runOnce !== 'undefined' ? runOnce : false;
        webSqlRepository.GetPendingDataCount().then(function (dataCount) {
            if (dataCount > 0) {
                $rootScope.$broadcast("pendingDataCountChange", false);
            }
        });


        var savedAutoSyncState = localStorageDataService.get(Constants.AutoSyncKey);
        if (savedAutoSyncState == null) {
            savedAutoSyncState = true;
        }

        if (savedAutoSyncState || runOnce) {
            webSqlRepository.ExecuteSql("SELECT * FROM BackgroundOperations").then(function (selectResults) {
                for (var index = 0; index < selectResults.rows.length; index++) {

                    var row = selectResults.rows.item(index);
                    var lastRunTime = row.LastRunDateTime;
                    var functionName = row.FunctionName;
                    var runIntervalInMilliseconds = row.RunInterval * 1000;

                    var timeSinceLastRun = moment().diff(moment(lastRunTime), 'seconds') * 1000;

                    if (timeSinceLastRun > runIntervalInMilliseconds) {
                        window[functionName](runIntervalInMilliseconds, webSqlRepository, moment, webApiRepository, $q, networkUtility, $rootScope, localStorageDataService, runOnce);
                    } else {
                        setTimeout(function () {
                            window[functionName](runIntervalInMilliseconds, webSqlRepository, moment, webApiRepository, $q, networkUtility, $rootScope, localStorageDataService, runOnce);
                        }, runIntervalInMilliseconds - timeSinceLastRun);

                    }
                }

                //If we had no background operations, check again in 5 milliseconds
                if (selectResults.rows.length == 0) {
                    setTimeout(function () { $rootScope.$broadcast("startBackgroundOperations"); }, 5);
                }

            });
        }



    });
}]);


function PushRecord(rowId, endPoint, data, webSqlRepository, webApiRepository, $q, moment, rowClientCode, rowUserName) {
    return webApiRepository.AuthenticatedPost(endPoint, data, rowClientCode, rowUserName)
    .then(
    function () {
        return webSqlRepository.ExecuteSql("DELETE FROM PushDetails WHERE PushHeaderId = ?", [rowId]);
    },
    function (error) {
        webSqlRepository.ExecuteSql("INSERT INTO PushDetails (PushHeaderId, ErrorMessage) VALUES (?,?)", [rowId, angular.toJson(error)]);
        return $q.reject(error);
    })
    .then(
    function () {
        return webSqlRepository.ExecuteSql("UPDATE PushHeaders SET PushedDateTime = ? WHERE Id = ?", [moment().format("YYYY-MM-DD"), rowId]);
    });
}

function DataPush(runInterval, webSqlRepository, moment, webApiRepository, $q, networkUtility, $rootScope, localStorageDataService, runOnce) {
    runOnce = typeof runOnce !== 'undefined' ? runOnce : false;
    try {
        if (networkUtility.IsOnline()) {
            webSqlRepository.ExecuteSql("SELECT * FROM PushHeaders WHERE PushedDateTime IS NULL ORDER BY Priority ASC, Id ASC")
                .then(function (sqlSelectResult) {
                    var rows = [];
                    for (var index = 0; index < sqlSelectResult.rows.length; index++) {
                        rows.push(sqlSelectResult.rows.item(index));
                    }

                    if (rows.length > 0) {
                        var defer = $q.defer();

                        var returnPromise = rows.reduce(function (previous, current) {
                            return previous.then(function () {
                                var rowId = current.Id;
                                var endPoint = current.URL;
                                var data = current.Data;
                                var rowClientCode = current.ClientCode;
                                var rowUserName = current.UserName;
                                return PushRecord(rowId, endPoint, data, webSqlRepository, webApiRepository, $q, moment, rowClientCode, rowUserName);
                            }, function () {
                                var rowId = current.Id;
                                var endPoint = current.URL;
                                var data = current.Data;
                                var rowClientCode = current.ClientCode;
                                var rowUserName = current.UserName;
                                return PushRecord(rowId, endPoint, data, webSqlRepository, webApiRepository, $q, moment, rowClientCode, rowUserName);
                            });
                        }, defer.promise);

                        defer.resolve();
                        return returnPromise;
                    }
                })
                .then(function () {
                    $rootScope.$broadcast("pendingDataCountChange", true);
                })
                .finally(function () {
                    webSqlRepository.ExecuteSql("UPDATE BackgroundOperations SET LastRunDateTime = ?", [moment().format("YYYY/MM/DD HH:mm:ss")])
                        .then(function () {
                            var savedAutoSyncState = localStorageDataService.get(Constants.AutoSyncKey);
                            if (savedAutoSyncState == null) {
                                savedAutoSyncState = true;
                            }
                            if (savedAutoSyncState) {
                                setTimeout(function () {
                                    DataPush(runInterval, webSqlRepository, moment, webApiRepository, $q, networkUtility, $rootScope, localStorageDataService);
                                }, runInterval);
                            }

                            if (runOnce) {
                                $rootScope.$broadcast("singlePushComplete");
                            }
                        });
                });

        }
        else {
            if (runOnce) {
                alert("Looks like you don't have internet, please try again later.");
            }
            var savedAutoSyncState = localStorageDataService.get(Constants.AutoSyncKey);
            if (savedAutoSyncState == null) {
                savedAutoSyncState = true;
            }
            if (savedAutoSyncState) {
                setTimeout(function () {
                    DataPush(runInterval, webSqlRepository, moment, webApiRepository, $q, networkUtility, $rootScope, localStorageDataService);
                }, runInterval);
            }
        }
    } catch (e) {
        if (runOnce) {
            alert("Looks like there was an error synchronizing data, please try again later.");
        }
        if (savedAutoSyncState == null) {
            savedAutoSyncState = true;
        }
        if (savedAutoSyncState) {
            setTimeout(function () {
                DataPush(runInterval, webSqlRepository, moment, webApiRepository, $q, networkUtility, $rootScope, localStorageDataService);
            }, runInterval);
        }
    }
}

