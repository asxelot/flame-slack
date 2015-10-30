angular.module('FlameSlackApp')
  .controller('LoginCtrl', LoginCtrl)


function LoginCtrl($scope, $rootScope, $location, Auth, Users, isLogged) {
  $scope.newUser = {}

  if (isLogged) return $location.path('/channels')

  $scope.login = function() {
    $rootScope.isLoadingHidden = false

    Auth.$authWithPassword($scope.newUser)
      .then(function(authData) {
        Users.setOnline(authData.uid)
        $location.path('/channels')
      })
      .catch(console.error)
  }
}
