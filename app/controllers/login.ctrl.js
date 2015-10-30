angular.module('FlameSlackApp')
  .controller('LoginCtrl', LoginCtrl)


function LoginCtrl($scope, $location, Auth, Users, isLogged) {
  $scope.newUser = {}

  if (isLogged) return $location.path('/channels')

  $scope.login = function() {
    Auth.$authWithPassword($scope.newUser)
      .then(function(authData) {
        Users.setOnline(authData.uid)
        $location.path('/channels')
      })
      .catch(console.error)
  }
}
