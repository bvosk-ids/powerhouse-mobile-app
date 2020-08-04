function ProfileDataService(webSqlRepository){
    this.webSqlRepository = webSqlRepository;
}

ProfileDataService.prototype.GetProfile = function (){
    return this.webSqlRepository.PullData('Profiles', false);
};