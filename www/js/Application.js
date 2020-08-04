window.originalSetTimeout=window.setTimeout;
window.originalClearTimeout=window.clearTimeout;
window.timers = [];

window.setTimeout = function(func,delay)
{
    var timeout = window.originalSetTimeout(func, delay);
    window.timers.push(timeout);
    return timeout;
};

window.clearTimeout = function(timerID, removeFromArray)
{
    removeFromArray = typeof removeFromArray !== 'undefined' ? removeFromArray : true;

    if ( removeFromArray ){
        window.timers.splice(window.timers.indexOf(timerID),1);
    }
    window.originalClearTimeout(timerID);
};

window.clearAllTimers = function() {
    for (var index = 0; index < window.timers.length; index++ ) {
        window.clearTimeout(window.timers[index], false);
    }
    window.timers = [];
}

var app = {
    onDeviceReady: function() {
        if (navigator.notification) { // Override default HTML alert with native dialog
            window.alert = function (message) {
                navigator.notification.alert(
                    message,    // message
                    null,       // callback
                    "POWERHOUSE", // title
                    'OK'        // buttonName
                );
            };
        }

        window.isOnline = navigator.connection.type != Connection.NONE;

        if (window.StatusBar) {
            window.StatusBar.overlaysWebView(false);
        }

        if (window.cordova && window.cordova.InAppBrowser) {
            window.open = cordova.InAppBrowser.open;
        }

        window.dbInit(function() {
            document.addEventListener("online", toggleCon, false);
            document.addEventListener("offline", toggleCon, false);
            document.addEventListener("pause", window.onPause, false);
            document.addEventListener("resume", window.onResume, false);
        });
    }
};

var FMSApplication = angular.module('FMSApplication', ['ngRoute', 'jcs.angular-http-batch']).run(['$rootScope', '$timeout', 'appConfig', 'userSessionDataService', 'networkUtility', function($rootScope, $timeout, appConfig, userSessionDataService, networkUtility){

    $("#navigation-menu a").click(function(){
        $("#navigation-menu").panel("close");
    });

    $rootScope.showAlert = function(msg){
        alert(msg);
    };

    $rootScope.showDocument = function(document){
        var user = userSessionDataService.GetUser();
        var documentUrl = appConfig.baseDocumentUrl + "?id=" + document.SequenceNumber + "&clientCode=" + user.ClientCode;

        if(device.platform == 'Android' && (document.FileExtension.toLowerCase().indexOf("pdf") != -1 || document.FileName.toLowerCase().indexOf(".pdf") != -1) )
        {
            if ( !networkUtility.IsOnline() ) {
                alert("This image cannot be viewed while offline");
                return;
            }
            window.open('https://docs.google.com/viewer?url=' + encodeURIComponent(documentUrl) + '&embedded=true', '_blank', 'location=no');
        }
        else if ( document.ImageData == undefined )
        {
            if ( !networkUtility.IsOnline() ) {
                alert("This image cannot be viewed while offline");
                return;
            }
            window.open(documentUrl, '_blank', 'EnableViewPortScale=yes,location=no');
        } else
        {
            var urlDecodedData = decodeURIComponent(document.ImageData);
            var imageSrc = "data:image/jpeg;base64," + urlDecodedData;


            var img = new Image();
            img.src = imageSrc;
            img.onload = function() {
                var originalWidth = img.width;
                var originalHeight = img.height;
                var $previewImage = $("#image");
                $previewImage.attr("src", imageSrc);

                if ( originalHeight > originalWidth ) {
                    var height = window.innerWidth * (originalHeight/originalWidth);
                    $previewImage.width(window.innerWidth).height(height);
                } else {
                    var screenHeight = window.innerHeight - 100;
                    var width = screenHeight * (originalWidth/originalHeight);


                    if ( width > window.innerWidth ){

                        var scaledHeight = window.innerWidth * (screenHeight/width);
                        $previewImage.height(scaledHeight).width(window.innerWidth);
                    } else {
                        $previewImage.height(screenHeight).width(width);
                    }
                }
                $("#image-preview").show();
            }
        }
    };

    $rootScope.getThumbnailImageData = function(document) {

        var imageSrc;
        if ( document.ImageData != null ) {
            var urlDecodedData = decodeURIComponent(document.ImageData);
            imageSrc = "data:image/jpeg;base64," + urlDecodedData;
        } else {

            if ( networkUtility.IsOnline() ) {
                var user = userSessionDataService.GetUser();
                var baseUrl = appConfig.baseThumbnailDocumentUrl;
                imageSrc = baseUrl + "?id=" + document.SequenceNumber + "&clientCode=" + user.ClientCode;
            } else {
                imageSrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAAYNJREFUeNrs2t2ygyAMRlHD+P6PzNfbM4zyYwjl2J2btg6gLpNRsJZzNklHSkkHMRwp5wyeI0zCzpWBEAAIIIAAEgACCCCABIAAAgggASCAAAJIAAgggAASAAK4d5wTxypfMFvA8Spo3C0AS7SIk7VfLWH9+VSxXcV2NfofHf2v9nH3e6sMHCk/3WRt2fYuk1XJeq3K5BScca2DNufJfb2kz0A4ewjtvVCvuYl426ujjVW2l/0VkbXffg6U80K8LgNHs0+O50dv/zknwR8smcoBCCCABIAAArjTg/hIO0UDarNZgMjAtfPtfzGV080E/ipraut8upj8l+PVVrpbq0E9q0VDU8PZ70Ss8b23nY7x1wOtPuX4qlzo7n2nBaVlD0rRAkrbIva9ajVGG/dxjXEuwrPKAfaUjSbsJ+QmlR5eFQWXfXQVaGUGzlr4HIWd3cc67sLD58qCKnNhAAEEkAAQQAABJAAEEEAACQABBBBAAkAAAQSQABBAAAEkAAQQwLfGZwC0lneQWMB4bAAAAABJRU5ErkJggg==";
            }

        }

        return imageSrc;
    }

    $rootScope.$on('$routeChangeSuccess', function(e, current, prev){
        var $backButton = $("#navigation-back-button");
        if ( current.showBackButton ){
            $timeout(function(){$backButton.show();},0);
        } else {
            $timeout(function(){$backButton.hide();},0);
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(e, current, prev){
        var $settingsButton = $("#navigation-settings-button");
        if ( current.showSettingsButton ){
            $timeout(function(){$settingsButton.show();},0);
        } else {
            $timeout(function(){$settingsButton.hide();},0);
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(e, current, prev){
        var $footer = $("#footer-scroll-helper");
        if ( current.showFooter ){
            $timeout(function(){$footer.show();},0);
        } else {
            $timeout(function(){$footer.hide();},0);
        }
    });

    $rootScope.$on('$routeChangeSuccess', function(e, current, prev){
        var $headerScrollHelper = $("#header-scroll-helper");
        var $header = $("#header");
        if ( current.showHeader === false ){
            $timeout(function(){$headerScrollHelper.hide();$header.hide();},0);
        } else {
            $timeout(function(){$headerScrollHelper.show();$header.show();},0);
        }
    });

    $rootScope.$on('pendingDataCountChange', function(e, dataWasCleared){
        var $homeButton = $("#navigation-home-button");
        if ( dataWasCleared && networkUtility.IsOnline() ){
            $homeButton.removeClass("yellowIcon");
            $homeButton.removeClass("redIcon");
            $homeButton.addClass("greenIcon");
            $rootScope.$broadcast("setPullWOButtonStatus", true);
        } else {
            $rootScope.$broadcast("setPullWOButtonStatus", false);
            if ( dataWasCleared && !networkUtility.IsOnline() ) {
                var $homeButton = $("#navigation-home-button");
                $homeButton.removeClass("yellowIcon");
                $homeButton.removeClass("greenIcon");
                $homeButton.addClass("redIcon");

            } else if ( !dataWasCleared && networkUtility.IsOnline() ) {
                $homeButton.removeClass("redIcon");
                $homeButton.removeClass("greenIcon");
                $homeButton.addClass("yellowIcon");
            } else if ( !dataWasCleared && !networkUtility.IsOnline() ){
                $homeButton.removeClass("yellowIcon");
                $homeButton.removeClass("greenIcon");
                $homeButton.addClass("redIcon");
            }
        }

    });


}])
.config(['$locationProvider', 'httpBatchConfigProvider','appConfig',function($locationProvider, httpBatchConfigProvider,appConfig){
    // $locationProvider.html5Mode(true);

    httpBatchConfigProvider.setAllowedBatchEndpoint(
    // root endpoint url
    appConfig.baseApiUrl,

    // endpoint batch address
    appConfig.baseApiUrl + 'batch',

    // optional configuration parameters
    {
        maxBatchedRequestPerCall: 100
    });

}]);

window.onPause = function() {
    window.clearAllTimers();
}

window.onResume = function() {
    var $rootScope = angular.element(document.body).scope();
    window.clearAllTimers();
    $rootScope.$broadcast("startBackgroundOperations");
}

function toggleCon(e) {

    var $rootScope = angular.element(document.body).scope();

    var sqlRepo = angular.element(document.body).injector().get("webSqlRepository");
    sqlRepo.GetPendingDataCount().then(function(dataCount){
        var $homeButton = $("#navigation-home-button");

        if(e.type == "offline") {
            window.isOnline = false;
            alert("We've detected you're offline, some applications features may not be available.");
            $homeButton.removeClass("greenIcon");
            $homeButton.removeClass("yellowIcon");
            $homeButton.addClass("redIcon");
            $rootScope.$broadcast("setPullWOButtonStatus", false);

        } else if (e.type != "offline" && !window.isOnline) {
            window.isOnline = true;

            if (dataCount > 0 ) {
                $homeButton.removeClass("redIcon");
                $homeButton.removeClass("greenIcon");
                $homeButton.addClass("yellowIcon");
                $rootScope.$broadcast("setPullWOButtonStatus", false);
            } else {
                $homeButton.removeClass("redIcon");
                $homeButton.removeClass("yellowIcon");
                $homeButton.addClass("greenIcon");
                $rootScope.$broadcast("setPullWOButtonStatus", true);
            }

            alert("We've detected you're back online!");
        }
    });


}


window.RefreshListView = function(elementId) {
    setTimeout(function(){
        var element = $(elementId);
        element.listview("refresh");
        element.show();
    },1);
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.format = function () {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }
    return s;
};

//http://stackoverflow.com/a/18936797
Array.prototype.where = function (filter) {

    var collection = this;

    switch (typeof filter) {

        case 'function':
            return $.grep(collection, filter);

        case 'object':
            for (var property in filter) {
                if (!filter.hasOwnProperty(property))
                    continue; // ignore inherited properties

                collection = $.grep(collection, function (item) {
                    return item[property] === filter[property];
                });
            }
            return collection.slice(0); // copy the array
            // (in case of empty object filter)

        default:
            throw new TypeError('func must be either a' +
            'function or an object of properties and values to filter by');
    }
};

function GenerateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
