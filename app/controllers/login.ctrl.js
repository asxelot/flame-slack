angular.module('FlameSlackApp')
  .controller('LoginCtrl', LoginCtrl)


function LoginCtrl($scope, $rootScope, $state, Auth, Users, isLogged) {
  $scope.newUser = {}

  if (isLogged) return $state.go('messages.channel')

  $scope.login = function() {
    $rootScope.isLoadingHidden = false

    Auth.$authWithPassword($scope.newUser)
      .then(function(authData) {
        Users.setOnline(authData.uid)
        $state.go('messages.channel')
      })
      .catch(console.error)
  }
}
