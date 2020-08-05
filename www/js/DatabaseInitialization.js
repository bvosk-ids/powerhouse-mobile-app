window.dbInit = function (callback, injectedWebSqlRepository, injectedUserSessionDataService) {
    var webSqlRepository = injectedWebSqlRepository || angular.element(document.body).injector().get("webSqlRepository");
    var userSessionDataService = injectedUserSessionDataService || angular.element(document.body).injector().get("userSessionDataService");

    function UpdateDBStaticData() {
        webSqlRepository.ExecuteSql("DELETE FROM WorkOrderDetailPulls").then(function () {
            webSqlRepository.ExecuteSql("INSERT INTO WorkOrderDetailPulls (URL) VALUES('Notes?workOrderNumber=')");
            webSqlRepository.ExecuteSql("INSERT INTO WorkOrderDetailPulls (URL) VALUES('Documents?referenceDocType=order&referenceNumber=')");
            webSqlRepository.ExecuteSql("INSERT INTO WorkOrderDetailPulls (URL) VALUES('IVRStatuses?poNumber=')");
            webSqlRepository.ExecuteSql("INSERT INTO WorkOrderDetailPulls (URL) VALUES('WorkOrderProofStatuses?poNumber=')");
            webSqlRepository.ExecuteSql("INSERT INTO WorkOrderDetailPulls (URL) VALUES('WorkOrderCompletionInformation?poNumber=')");
            webSqlRepository.ExecuteSql("INSERT INTO WorkOrderDetailPulls (URL) VALUES('WorkOrderParts?poNumber=')");
        }, function () {
            UpdateDBStaticData();
        });

        webSqlRepository.ExecuteSql("DELETE FROM BackgroundOperations").then(function () {
            webSqlRepository.ExecuteSql("INSERT INTO BackgroundOperations (FunctionName, RunInterval) VALUES('DataPush', 1)");
        });
    }

    var lines = [];
    lines.push('CREATE TABLE IF NOT EXISTS PullHeaders (Id INTEGER PRIMARY KEY ASC, URL TEXT, Data TEXT, PreferCache INTEGER, TryCount INTEGER, ExpirationDate DATETIME)');
    lines.push('CREATE TABLE IF NOT EXISTS PullDetails (Id INTEGER PRIMARY KEY ASC, PullHeaderId INTEGER, ErrorMessage TEXT, FOREIGN KEY(PullHeaderId) REFERENCES PullHeaders(Id))');
    lines.push('CREATE TABLE IF NOT EXISTS PushHeaders (Id INTEGER PRIMARY KEY ASC, URL TEXT, Data TEXT, Priority INTEGER)');
    lines.push('CREATE TABLE IF NOT EXISTS PushDetails (Id INTEGER PRIMARY KEY ASC, PushHeaderId INTEGER, ErrorMessage TEXT, FOREIGN KEY(PushHeaderId) REFERENCES PushHeaders(Id))');
    lines.push('CREATE TABLE IF NOT EXISTS BackgroundOperations (Id INTEGER PRIMARY KEY ASC, FunctionName TEXT, RunInterval INTEGER, LastRunDateTime DATETIME)');
    lines.push('CREATE TABLE IF NOT EXISTS WorkOrderDetailPulls (Id INTEGER PRIMARY KEY ASC, URL TEXT)');

    webSqlRepository.CreateDatabase(function (db) {
        db.transaction(function (tx) {
            // alert('createDatabase transaction');
            angular.forEach(lines, function (value) {
                tx.executeSql(value, [], function (tx, result) {}, function (tx, err) {
                    alert(JSON.stringify(err));
                });
            });
        }, function (error) {
            alert(error);
        })
    });

    // alert('createDatabase callback');
    var db = webSqlRepository.GetDatabase();
    // alert('createDatabase GetDatabase done');
    var M = new Migrator(db);
    M.setDebugLevel(Migrator.DEBUG_NONE);
    M.migration(1, function (t) {
        // alert('migration 1 start');
        t.executeSql("ALTER TABLE PushHeaders ADD PushedDateTime DATETIME NULL ");
        // alert('migration 1 end');
    });
    M.migration(2, function (t) {
        t.executeSql("ALTER TABLE PullHeaders ADD ClientCode TEXT NULL ", [], function (tx, results) {
            if (userSessionDataService.IsUserLoggedIn()) {
                var user = userSessionDataService.GetUser();
                tx.executeSql("UPDATE PullHeaders SET ClientCode = ?", [user.ClientCode]);
            }
        });
    });
    M.migration(3, function (t) {


        t.executeSql("ALTER TABLE PushHeaders ADD ClientCode TEXT NULL ", [], function (tx, results) {
            if (userSessionDataService.IsUserLoggedIn()) {
                var user = userSessionDataService.GetUser();
                tx.executeSql("UPDATE PushHeaders SET ClientCode = ?", [user.ClientCode]);
            }
        });
    });

    M.migration(4, function (t) {


        t.executeSql("ALTER TABLE PushHeaders ADD UserName TEXT NULL ", [], function (tx, results) {
            if (userSessionDataService.IsUserLoggedIn()) {

                var user = userSessionDataService.GetUser();
                tx.executeSql("UPDATE PushHeaders SET UserName = ?", [user.UserName], function (tx, results) {

                }, function (a, b, c) {


                });
            }

            t.executeSql("ALTER TABLE PullHeaders ADD UserName TEXT NULL ", [], function (tx, results) {
                if (userSessionDataService.IsUserLoggedIn()) {
                    var user = userSessionDataService.GetUser();

                    tx.executeSql("UPDATE PullHeaders SET UserName = ?", [user.UserName], function (tx, results) {

                    }, function (a, b, c) {

                        ;
                    });
                }
            });

        }, function (a, b, c) {


        });
    });

    // alert('register migration callbacks');

    M.whenDone(UpdateDBStaticData)
    M.whenDone(callback);

    // alert('migration execute start');
    M.execute();
    // alert('migration execute end');
}

// If we are not using Cordova and WebSQL is built in, initialize the DB now
if (!window.cordova && openDatabase) {
    window.FMSApplication.run(['appConfig', 'webSqlRepository', 'userSessionDataService', function (appConfig, webSqlRepository, userSessionDataService) {
        window.dbInit(null, webSqlRepository, userSessionDataService);
    }]);
}