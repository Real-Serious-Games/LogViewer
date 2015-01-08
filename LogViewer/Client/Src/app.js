
//
// Define the 'app' module.
//
angular.module('app', [])

//
// Application controller.
//
.controller('AppCtrl', function AppCtrl($scope) {
    
    //
    // Setup the application data-model.
    //
    $scope.dataBindingTest = "Hello World";

})
