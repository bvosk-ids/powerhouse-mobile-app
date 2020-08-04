window.FMSApplication
.directive("sectionPlaceholder", function($compile, $route, $rootScope) {
    return {
        restrict: 'AC',
        link: function(scope, element, attr) {
            // Store the placeholder element for later use
            $rootScope["placeholder_" + attr.sectionPlaceholder] = element[0];

            // Clear the placeholder when navigating
            $rootScope.$on('$routeChangeSuccess', function(e, a, b) {
                if (!$rootScope["placeholder_prevent_reset_" + attr.sectionPlaceholder])
                {
                    element.html('');
                }

                $rootScope["placeholder_prevent_reset_" + attr.sectionPlaceholder] = false;
            });
        }
    };
})
.directive("sectionContent", function($compile, $route, $rootScope) {
    return {
        restrict: 'AC',
        link: function(scope, element, attr) {
            // Locate the placeholder element
            var targetElement = $rootScope["placeholder_" + attr.sectionContent];

            $rootScope["placeholder_prevent_reset_" + attr.sectionContent] = true;

            element.children().removeAttr('ng-non-bindable');

            if(element.attr("section-compile") == "false"){
                $(targetElement).html(element.html());  
            }else{
                // Compile the template and bind it to the current scope, and inject it into the placeholder
                $(targetElement).html($compile(element.contents())(scope));
            }            
        }
    };
});