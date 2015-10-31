angular.module('FlameSlackApp')
  .controller('MainCtrl', MainCtrl)


function MainCtrl($scope, $rootScope, $state, Auth, Users, Usernames) {

  Auth.$onAuth(function(authData) {
    if (authData) {
      $rootScope.user = Users.getProfile(authData.uid)
      Users.setOnline(authData.uid)
      $rootScope.isAdmin = Users.isAdmin(authData.uid)
    } else {
      $rootScope.user = null
      $state.go('login')
    }
  })      

  $scope.$on('$stateChangeSuccess', function() {
    $rootScope.isLoadingHidden = true
  }) 
}