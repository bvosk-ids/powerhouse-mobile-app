function LoginDataService(webAPIRepository){
    this.webAPIRepository = webAPIRepository;
}

LoginDataService.prototype.IsUserValid = function(userCredentials){
    if (window.device) {
        if ( device.uuid == null ) {
            userCredentials.DeviceUDID = "Unknown";
        } else {
            userCredentials.DeviceUDID = device.uuid;
        }
    } else {
        userCredentials.DeviceUDID = "Unknown";
    }

    return this.webAPIRepository.Post('Devices', {ClientCode:userCredentials.clientCode, UserName:userCredentials.userName, Password:userCredentials.password, DeviceUDID:userCredentials.DeviceUDID });
}

LoginDataService.prototype.IsEmployeeNew = function(employeeNumber, lastFourSSN) {
    return this.webAPIRepository.Post('EmployeeRegistration', {EmployeePersonNumber: employeeNumber, LastFourSSN: lastFourSSN});
}


LoginDataService.prototype.RegisterEmployee = function(clientCode, userName, password, vendorNumber, pinNumber, uuid) {
    return this.webAPIRepository.Post('Users', {ClientCode: clientCode, UserName: userName, Password: password, RegistrationId: vendorNumber, RegistrationPin: pinNumber, DeviceUDID: uuid});
}

LoginDataService.prototype.RequestForgottenPassword = function (userName, eMail){
    return this.webAPIRepository.Post('ForgotPasswordRequest', {Username: userName, Email: eMail});
};