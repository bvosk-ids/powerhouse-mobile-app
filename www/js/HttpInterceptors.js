window.FMSApplication
.factory('ajaxLoadingInterceptor', function ($q, $rootScope, $log) {
    var numLoadings = 0;
    var hideLoaderTimer = -1;


    function HideLoader() {
        // $rootScope.$broadcast("loader_hide_state");
        // hideLoaderTimer = setTimeout(function(){
            $rootScope.$broadcast("loader_hide");
            // hideLoaderTimer = -1;
        // }, 750);
    };

    // function CancelHideLoader() {
    //     clearTimeout(hideLoaderTimer);
    //     hideLoaderTimer = -1;
    // };

    return {
        request: function (config) {
            if ( config.method == "GET") {
                $("ul[data-role='listview']").hide();
            }

            if (config.url.substring(0, 5) != "Pages") {
                numLoadings++;

                if ( hideLoaderTimer > 0 ) {
                    CancelHideLoader();
                }
                else {
                    // Show loader
                    $rootScope.$broadcast("loader_show");
                }
            }

            return config || $q.when(config);
        },
        response: function (response) {

            if (response.config.url.substring(0, 5) != "Pages") {
                // if ((--numLoadings) === 0) {
                    HideLoader();
                // }
            }


            return response || $q.when(response);
        },
        responseError: function (response) {
            if (response.config.url.substring(0, 5) != "Pages") {
                // if (!(--numLoadings)) {
                    HideLoader();
                // }
            }
            return $q.reject(response);
        }
    };
})
.factory('errorHandlingAjaxInterceptor', function ($q, $location, $rootScope, userSessionDataService, appConfig) {
    return {
        responseError: function (response) {


            if ( response.status < 500 && response.data != "") {

                if ( response.status == 401 )
                {
                    if ( response.config.url.endsWith('Devices') ) {
                        alert(JSON.stringify(response.data));
                    }
                } else {
                    alert(JSON.stringify(response.data));
                }

            }
            if (response.status == '500' ){
                $rootScope.$broadcast("http_error_message");
            }

            var sessionData = "";
            if ( userSessionDataService.IsUserLoggedIn() ) {
                sessionData = angular.toJson(userSessionDataService.GetUser());
            }

            var data = angular.toJson({
                RequestObject: angular.toJson(response),
                SessionData: sessionData
            });

            $.ajax({
                type: "POST",
                url: appConfig.baseErrorLogUrl + 'HttpError',
                contentType: "application/json",
                data: data
            });

            return $q.reject(response);
        }
    };
})
.config(function ($httpProvider) {
    $httpProvider.interceptors.push('ajaxLoadingInterceptor');
    $httpProvider.interceptors.push('errorHandlingAjaxInterceptor');
});
