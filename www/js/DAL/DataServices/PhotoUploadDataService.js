function PhotoUploadDataService(webSqlRepository, userSessionDataService, moment){
    this.webSqlRepository = webSqlRepository;
    this.userSessionDataService = userSessionDataService;
    this.moment = moment;

}

PhotoUploadDataService.prototype.Upload = function(imageData, documentType, referenceNumber, referenceObjectType, comment, fileExtension) {
    fileExtension = typeof fileExtension !== 'undefined' ? fileExtension : "jpg";

    var document = {
        Type: documentType,
        ImageData: encodeURIComponent(imageData),
        FileName: "photo_" + this.moment().format("YYYYMMDDHHmmSS"),
        InputBy: this.userSessionDataService.GetUser().UserName,
        InputDate: this.moment().toDate(),
        FileExtension: fileExtension,
        Comment: comment
    }
    return this.webSqlRepository.PushData("Documents?referenceDocType=" + referenceObjectType + "&referenceNumber=" + referenceNumber,document);
}
