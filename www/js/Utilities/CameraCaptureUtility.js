function CameraCaptureUtility($q, $rootScope, $timeout) {
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$timeout = $timeout;
}

CameraCaptureUtility.prototype.Capture = function () {
    var deferred = this.$q.defer();
    var utility = this;

    if (!navigator.camera) {
        alert("Photo's are not supported on this device");
        return;
    }

    var cameraOptions = {
        quality: 40,
        targetWidth: 800,
        targetHeight: 600,
        destinationType: 1,
        sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Album
        encodingType: 0,     // 0=JPG 1=PNG
        saveToPhotoAlbum: true
    };


    function getFileContentAsBase64(path, callback) {

        function failure(e) {
            alert('Someting went wrong while trying to capture picture. Please try again!');
        }

        function gotFile(fileEntry) {
            fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    var content = this.result;
                    callback(content);
                };
                // The most important point, use the readAsDatURL Method from the file plugin
                reader.readAsDataURL(file);
            });
        }

        window.resolveLocalFileSystemURL(path, gotFile, failure);
    }


    navigator.camera.getPicture(function (imageURI) {

        getFileContentAsBase64(imageURI, function (imageData) {

            deferred.resolve(imageData.substring(imageData.indexOf(',') + 1));
            utility.$rootScope.$apply();

        });

    }, function (error) {
        window.originalSetTimeout(function () { window.onResume(); }, 1);
        //alert(error);
        deferred.reject(error);
        utility.$rootScope.$apply();
    }, cameraOptions);



    //navigator.camera.getPicture(function (imageUr) {
    //    //HACK: Unfortunately, Android fails without this condition below. Even worse, I have no idea why. - david g
    //    if (device.platform == 'Android') {
    //        window.originalSetTimeout(function () { window.onResume(); }, 1);
    //    }

    //    deferred.resolve(imageData);
    //    utility.$rootScope.$apply();
    //}, function (error) {
    //    window.originalSetTimeout(function () { window.onResume(); }, 1);
    //    //alert(error);
    //    deferred.reject(error);
    //    utility.$rootScope.$apply();
    //}, cameraOptions);
    return deferred.promise;
}