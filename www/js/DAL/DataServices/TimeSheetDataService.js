function TimeSheetDataService(webSqlRepository) {
    this.webSqlRepository = webSqlRepository;
}

TimeSheetDataService.prototype.Get = function(beginDate, endDate, workType, useCachedOnly) {
    return this.webSqlRepository.PullData("TimeSheets?beginDate="+beginDate+"&endDate="+endDate+"&workType="+workType, useCachedOnly);
}

TimeSheetDataService.prototype.GetDetails = function(serviceDate, workType, useCachedDataOnly) {
    return this.webSqlRepository.PullData("TimeSheetDetails?serviceDate=" + serviceDate + "&workType=" + workType,useCachedDataOnly);
}

TimeSheetDataService.prototype.GetIvrHours = function(serviceDate, workType, useCachedDataOnly) {
    return this.webSqlRepository.PullData("TimeSheetIvrHours?serviceDate=" + serviceDate + "&workType=" + workType, useCachedDataOnly);
}