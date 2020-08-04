function WebSqlRepository($q, appConfig, webApiRepository, networkUtility, userSessionDataService, $rootScope) {
    this.$q = $q;
    this.appConfig = appConfig;
    this.webApiRepository = webApiRepository;
    this.networkUtility = networkUtility;
    this.db = null;
    this.userSessionDataService = userSessionDataService;
    this.$rootScope = $rootScope;
}

WebSqlRepository.prototype.CreateDatabase = function (initCallback) {
    if (openDatabase) {
        // This browser has WebSQL built in
        this.db = openDatabase(this.appConfig.databaseName, "", 'DB', 2 * 1024 * 1024, initCallback);
    } else if (window.sqlitePlugin) {
        // The browser does not have WebSQL and we have the sqlitePlugin installed
        this.db = window.sqlitePlugin.openDatabase({
            name: this.appConfig.databaseName,
            location: 'default',
            androidDatabaseProvider: 'system'
        }, initCallback, function(err) {
            window.alert(JSON.stringify(err));
        });
    } else {
        // Fatal: We have no SQL DB available to us
        throw 'No compatible SQL storage API found'
    }
}

WebSqlRepository.prototype.GetDatabase = function () {
    return this.db;
}

WebSqlRepository.prototype.ExecuteSql = function (sql, parameters) {
    var deferred = this.$q.defer();

    var sqlRepo = this;
    if (this.db) {
        this.db.transaction(function (tx) {
            tx.executeSql(sql, parameters, function (tx, results) {
                deferred.resolve(results);
            }, function (tx, error) {
                deferred.reject(error);
                var errorMessage = error.message;
                var sessionData = "";
                if (sqlRepo.userSessionDataService.IsUserLoggedIn()) {
                    sessionData = angular.toJson(sqlRepo.userSessionDataService.GetUser());
                }
                var data = angular.toJson({
                    Message: errorMessage,
                    Code: error.code,
                    SQL: sql,
                    SessionData: sessionData,
                    Parameters: parameters
                });
    
                $.ajax({
                    type: "POST",
                    url: sqlRepo.appConfig.baseErrorLogUrl + 'WebSQLError',
                    contentType: "application/json",
                    data: data
                });
            });
        });
    } else {
        deferred.resolve();
    }
    

    return deferred.promise;
}

WebSqlRepository.prototype.GetPendingData = function (endPoint) {
    var deferred = this.$q.defer();

    var user = this.userSessionDataService.GetUser();

    var sqlRepo = this;
    var selectSql = String.format("SELECT * FROM PushHeaders WHERE URL = '{0}' AND ClientCode = ? AND UserName = ?", endPoint);
    if (sqlRepo) {
        sqlRepo.ExecuteSql(selectSql, [user.ClientCode, user.UserName]).then(function (selectSqlResult) {
            var data = [];
            for (var index = 0; index < selectSqlResult.rows.length; index++) {
                data.push(angular.fromJson(selectSqlResult.rows.item(index).Data));
            }
            deferred.resolve(data);
        });
    } else {
        deferred.resolve();
    }
    

    return deferred.promise;
}

WebSqlRepository.prototype.GetPendingDataCount = function (endPoint) {
    var deferred = this.$q.defer();

    var sqlRepo = this;
    var selectSql = String.format("SELECT * FROM PushHeaders WHERE PushedDateTime IS NULL", endPoint);
    if (sqlRepo) {
        sqlRepo.ExecuteSql(selectSql).then(function (selectSqlResult) {
            if (selectSqlResult) {
                deferred.resolve(selectSqlResult.rows.length);
            } else {
                deferred.resolve(0);
            }
        });
    } else {
        deferred.resolve();
    }
    

    return deferred.promise;
}

WebSqlRepository.prototype.DeletePushedData = function (endPoint) {
    return this.ExecuteSql("DELETE FROM PushHeaders WHERE URL LIKE ? AND PushedDateTime IS NOT NULL", [endPoint]);
}

WebSqlRepository.prototype.CacheData = function (endPoint, data, ) {
    var user = this.userSessionDataService.GetUser();
    return this.ExecuteSql("INSERT INTO PullHeaders (URL, PreferCache, TryCount, Data, ClientCode, UserName) VALUES (?, 0, 0, ?, ?, ?)", [endPoint, angular.toJson(data), user.ClientCode, user.UserName]);
}

WebSqlRepository.prototype.ClearCachedData = function (endPoint) {
    var user = this.userSessionDataService.GetUser();
    return this.ExecuteSql("DELETE FROM PullHeaders WHERE URL = ? AND ClientCode = ? AND UserName = ?", [endPoint, user.ClientCode, user.UserName]);
}

WebSqlRepository.prototype.GetCachedData = function (endPoint) {
    var deferred = this.$q.defer();
    var user = this.userSessionDataService.GetUser();
    this.ExecuteSql("SELECT * FROM PullHeaders WHERE URL = ? AND ClientCode = ? AND UserName = ?", [endPoint, user.ClientCode, user.UserName]).then(function (sqlResult) {
        var cachedData = [];
        if (sqlResult.rows.length > 0) {
            var row = sqlResult.rows.item(0);
            cachedData = angular.fromJson(row.Data);
        }
        deferred.resolve(cachedData);
    });
    return deferred.promise;
}

WebSqlRepository.prototype.PullData = function (endPoints, useCachedDataOnly) {
    if (endPoints instanceof Array) {
        return this.MultiplePulls(endPoints, useCachedDataOnly);
    } else {
        return this.SinglePull(endPoints, useCachedDataOnly);
    }
}

WebSqlRepository.prototype.MultiplePulls = function (endPoints, useCachedDataOnly) {
    var repo = this;
    useCachedDataOnly = typeof useCachedDataOnly !== 'undefined' ? useCachedDataOnly : false;

    //This inner function was created because their are multiple code paths that can lead to cached data being pulled. Therefore this function encapsulates that logic
    function PullCachedData(deferred) {
        //Either we were offline or constrained to only use cached data or ran into an error while pulling live data
        var cachePromises = [];
        var cacheResults = {};
        var initialDeferred = repo.$q.defer();
        cachePromises.push(initialDeferred.promise);

        // Get all of our cached data for each end point
        // angular.forEach(endPoints, function (endPoint) {
        //     var cachePromise = repo.GetCachedData(endPoint).then(function (cachedResult) {
        //         cacheResults[endPoint] = cachedResult;
        //     });
        //     cachePromises.push(cachePromise);
        // });


        var user = repo.userSessionDataService.GetUser();
        var endpointIndex = 0;
        if (repo.db) {
            repo.db.transaction(function (tx) {
                (
                    function nextRecord() {
                        if (endpointIndex < endPoints.length) {
                            var endPointName = endPoints[endpointIndex++];
                            var sql = "SELECT * FROM PullHeaders WHERE URL = ? AND ClientCode = ? AND UserName = ?";
                            var parameters = [endPointName, user.ClientCode, user.UserName];
    
                            tx.executeSql(sql, parameters, function (innerTx, results) {
                                if (results.rows.length > 0) {
                                    cacheResults[endPointName] = JSON.parse(results.rows.item(0).Data);
                                }
                                else {
                                    cacheResults[endPointName] = [];
                                }
    
                                nextRecord();
                            }, function (tx, error) {
                                initialDeferred.reject();
                            });
                        }
                        else {
                            initialDeferred.resolve();
                        }
                    }
                )();
            });
        } else {
            initialDeferred.resolve();
        }
        

        //Once all of our cached data requests have completed
        repo.$q.all(cachePromises).then(function () {
            //Merge each end point data with our pending data set
            for (var endPoint in cacheResults) {
                var pendingResult = pendingResults[endPoint];

                if ((pendingResult instanceof Array) && (cacheResults[endPoint] instanceof Array)) {
                    cacheResults[endPoint] = cacheResults[endPoint].concat(pendingResult);
                } else if (((cacheResults[endPoint] == null || cacheResults[endPoint] === "null") || !(cacheResults[endPoint] instanceof Array)) && pendingResult[0]) {
                    cacheResults[endPoint] = pendingResult[0];
                }
            }
            //Return our merged data
            deferred.resolve(cacheResults);
        });
    }

    var deferred = this.$q.defer();
    var initialDeferredPending = repo.$q.defer();
    var pendingPromises = [];
    var pendingResults = {};
    pendingPromises.push(initialDeferredPending.promise);
    //Get all of our pending data
    // angular.forEach(endPoints, function (endPoint) {
    //     var pendingPromise = repo.GetPendingData(endPoint).then(function (pendingResult) {
    //         pendingResults[endPoint] = pendingResult;
    //     });
    //     pendingPromises.push(pendingPromise);
    // });


    var user = repo.userSessionDataService.GetUser();
        var endpointIndexPending = 0;
        if (repo.db) {
            repo.db.transaction(function (tx) {
                (
                    function nextRecord() {
                        if (endpointIndexPending < endPoints.length) {
                            var endPointName = endPoints[endpointIndexPending++];
      
                            var sql = "SELECT * FROM PushHeaders WHERE URL = ? AND ClientCode = ? AND UserName = ?";
                            var parameters = [endPointName, user.ClientCode, user.UserName];
    
                            tx.executeSql(sql, parameters, function (innerTx, results) {
    
                                var data = [];
                                for (var index = 0; index < results.rows.length; index++) {
                                    data.push(angular.fromJson(results.rows.item(index).Data));
                                }
    
                                if (data.length > 0) {
                                    pendingResults[endPointName] = data;
                                }
                                else {
                                    pendingResults[endPointName] = [];
                                }
    
                                nextRecord();
                            }, function (tx, error) {
                                initialDeferredPending.reject();
                            });
                        }
                        else {
                            initialDeferredPending.resolve();
                        }
                    }
                )();
            });
        } else {
            initialDeferredPending.resolve();
        }

    //Once all of our pending data requests have completed
    this.$q.all(pendingPromises)
        .then(function () {
            //If we're online and not constrained to only use cached data
            if (!useCachedDataOnly && repo.networkUtility.IsOnline()) {

                var pullPromises = [];
                var pullResults = {};

                //Get all of our data from the web api
                angular.forEach(endPoints, function (endPoint) {
                    var pullPromise = repo.webApiRepository.AuthenticatedGet(endPoint).then(function (pullResult) {
                        pullResults[endPoint] = pullResult;
                    });
                    pullPromises.push(pullPromise);
                });

                //Once all of our data pulls have completed
                repo.$q.all(pullPromises).then(function () {
                    var cachePromises = [];
                    var initialDeferred = repo.$q.defer();
                    cachePromises.push(initialDeferred.promise);
                    //initialDeferred.resolve();


                    //Cache all of our results
                    // for(var endPoint in pullResults) {
                    //     (function(endPoint){
                    //         return function(){
                    //             //Clear the cache for this endpoint and cache the new data
                    //             var cachePromise = repo.ClearCachedData(endPoint).then(function(){
                    //                 return repo.CacheData(endPoint, pullResults[endPoint]);
                    //             });
                    //             cachePromises.push(cachePromise);
                    //         };
                    //     })(endPoint)();
                    // }

                    var keys = Object.keys(pullResults)
                    
                    var endpointIndex = 0;
                    if (repo.db) {
                        repo.db.transaction(function (tx) {
                            (
                                function nextRecord() {
    
    
                                    if (endpointIndex < keys.length) {
                                        var endPointName = keys[endpointIndex++];
    
    
                                        var sql = "DELETE FROM PullHeaders WHERE URL = ? AND ClientCode = ? AND UserName = ?";
                                        var parameters = [endPointName, user.ClientCode, user.UserName];
    
                                        tx.executeSql(sql, parameters, function (innerTx, results) {
                                            var endPointData = pullResults[endPointName];
                                            var cacheSql = "INSERT INTO PullHeaders (URL, PreferCache, TryCount, Data, ClientCode, UserName) VALUES (?, 0, 0, ?, ?, ?)";
                                            var cacheParams = [endPointName, angular.toJson(endPointData), user.ClientCode, user.UserName];
    
                                            innerTx.executeSql(cacheSql, cacheParams, function (finalTx, finalResult) {
                                                nextRecord();
                                            });
                                        }, function (tx, error) {
                                            initialDeferred.reject();
                                        });
                                    } else {
                                        initialDeferred.resolve();
                                    }
    
                                }
                            )();
                        });
                    } else {
                        initialDeferred.resolve();
                    }
                    
                    //initialDeferred.resolve();

                    //Once all of our cache requests are complete
                    repo.$q.all(cachePromises).then(function () {

                        //Delete all pushed pending data for each of our end points
                        var pushedDataDeletionPromises = [];
                        for (var endPoint in pullResults) {
                            (function (endPoint) {
                                return function () {
                                    var deletePushedDataPromise = repo.DeletePushedData(endPoint);
                                    pushedDataDeletionPromises.push(deletePushedDataPromise);
                                };
                            })(endPoint)();
                        }

                        //HACK! This should be fixed on the back end
                        //Unfortunately, we have a special case here: /Documents?refObjectType=dispatch
                        //This is only used as a work around so Chris can look up PO # based on dispatch id when adding signatures and store stamps.
                        //This end point will never actually be pulled, so we have to manually delete the pushed pending data at this end point
                        var hackDeletedPromise = repo.DeletePushedData("Documents?referenceDocType=dispatch%");
                        pushedDataDeletionPromises.push(hackDeletedPromise);

                        //Once all pushed pending data has been deleted
                        repo.$q.all(pushedDataDeletionPromises).then(function () {
                            //Return our data
                            deferred.resolve(pullResults);
                        });
                    });
                }, function () {
                    PullCachedData(deferred);
                });

            }
            else {
                PullCachedData(deferred);
            }
        })

    return deferred.promise;
}

WebSqlRepository.prototype.SinglePull = function (endPoint, useCachedDataOnly) {
    useCachedDataOnly = typeof useCachedDataOnly !== 'undefined' ? useCachedDataOnly : true;

    var deferred = this.$q.defer();

    this.MultiplePulls([endPoint], useCachedDataOnly).then(function (results) {
        deferred.resolve(results[endPoint]);
    });

    return deferred.promise;
}

WebSqlRepository.prototype.PushData = function (endPoint, data) {
    var deferred = this.$q.defer();

    var user = this.userSessionDataService.GetUser();

    var sqlRepo = this;
    var insertSql = String.format("INSERT INTO PushHeaders (URL, Data, ClientCode, UserName) VALUES ('{0}', ?, ?, ?)", endPoint);
    if (sqlRepo) {
        sqlRepo.ExecuteSql(insertSql, [angular.toJson(data), user.ClientCode, user.UserName]).then(function (insertSqlResult) {
            deferred.resolve();
            sqlRepo.$rootScope.$broadcast("pendingDataCountChange", false);
        });
    } else {
        deferred.resolve();
    }
    return deferred.promise;
}