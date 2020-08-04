function InformationDocumentDataService(webSqlRepository){
    this.webSqlRepository = webSqlRepository;
}

InformationDocumentDataService.prototype.Get = function() {
    return this.webSqlRepository.PullData("InformationDocuments", false);
}
