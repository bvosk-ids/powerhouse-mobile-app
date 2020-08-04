function OtherWorkDataService(webSqlRepository, moment) {
    this.webSqlRepository = webSqlRepository;
    this.moment = moment;
}

OtherWorkDataService.prototype.GetIvrStatus = function(useOnlyCachedData) {
    return this.webSqlRepository.PullData('OtherWorkIvr', useOnlyCachedData);
}

OtherWorkDataService.prototype.SetIvrStatus = function(type, workType, comment) {
    var ivrStatusDTO = {
        Type: type,
        WorkType: workType,
        WorkTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        PoNumber: '',
        Comment: comment
    };
    return this.webSqlRepository.PushData('OtherWorkIvr', ivrStatusDTO);
}