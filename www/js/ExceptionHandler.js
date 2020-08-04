//Courtesy of Ben Nadel
//http://www.bennadel.com/blog/2542-Logging-Client-Side-Errors-With-AngularJS-And-Stacktrace-js.htm
window.FMSApplication.provider("$exceptionHandler", {
    $get: function( errorLogService ) {
        return( errorLogService );
    }
}
).factory("errorLogService",
    function( $log, $window, stacktraceService, appConfig, userSessionDataService ) {
        function log( exception, cause ) {
            $log.error.apply( $log, arguments );
            try {

                var errorMessage = exception.toString();
                var stackTrace = stacktraceService.print({ e: exception });
                var sessionData = "";
                if ( userSessionDataService.IsUserLoggedIn() ) {
                    sessionData = angular.toJson(userSessionDataService.GetUser());
                }
                var data = angular.toJson({
                    PageUrl: $window.location.href,
                    ErrorMessage: errorMessage,
                    StackTrace: stackTrace,
                    Cause: ( cause || "" ),
                    SessionData: sessionData
                });

                $.ajax({
                    type: "POST",
                    url: appConfig.baseErrorLogUrl + 'JavaScriptError',
                    contentType: "application/json",
                    data: data
                });

            } catch ( loggingError ) {
                $log.warn( "Error logging failed" );
                $log.log( loggingError );
            }
        }
        return log;
    }
);