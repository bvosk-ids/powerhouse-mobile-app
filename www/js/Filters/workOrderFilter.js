FMSApplication.filter('workOrderFilter',['moment', function(moment) {
    return function(items, value) {
        var filtered = [];
        angular.forEach(items, function(el) {
            if (value == null || el.PONumber.toLowerCase().includes(value.toLowerCase()) || moment(el.InputDate).format('MM/DD/YYYY hh:mm A').toString().toLowerCase().includes(value.toLowerCase()) ||
                moment(el.VisitDate).format('MM/DD/YYYY hh:mm A').toString().toLowerCase().includes(value.toLowerCase()) || el.ClientPO.toLowerCase().includes(value.toLowerCase()) ||
                (el.Company + " #" + el.StoreNumber).toLowerCase().includes(value.toLowerCase()) || (el.City + ", " + el.State).toLowerCase().includes(value.toLowerCase()) ||
                el.Category.toLowerCase().includes(value.toLowerCase()) || el.OrderType.toLowerCase().includes(value.toLowerCase()) ||
                el.Priority.toLowerCase().includes(value.toLowerCase()) || el.Status.toLowerCase().includes(value.toLowerCase())) {
                filtered.push(el);
            }
        });
        return filtered;
    }
}]);