angular.module('FlameSlackApp')
  .controller('MainCtrl', MainCtrl)


function MainCtrl($scope, $rootScope, $location, Auth, Users, Usernames) {

  Auth.$onAuth(function(authData) {
    if (authData) {
      $rootScope.user = Users.getProfile(authData.uid)
      Users.setOnline(authData.uid)
      $rootScope.isAdmin = Users.isAdmin(authData.uid)
    } else {
      $rootScope.user = null
      $location.path('/login')
    }
  })  
  
  $scope.lightbox = function(src) {
    $scope.lightboxSrc = src
  }

  $scope.logout = function() {
    Users.setOffline($scope.user.$id)
    Auth.$unauth()
  }     

  $scope.$on('$routeChangeSuccess', function() {
    $rootScope.isLoadingHidden = true
  }) 
}