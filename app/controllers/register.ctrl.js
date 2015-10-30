angular.module('FlameSlackApp')
  .controller('RegisterCtrl', RegisterCtrl)


function RegisterCtrl($scope, $location, Auth, Users, usernames, isLogged) {
  $scope.usernames = usernames
  $scope.newUser = {}
  
  if (isLogged) return $location.path('/channels')

  $scope.register = function() {
    if ($scope.RegisterForm.$invalid) return
    if ($scope.usernames[$scope.newUser.username])
      return console.log('this username already exists')

    Auth.$createUser($scope.newUser)
      .then(function(authData) {
        return Auth.$authWithPassword($scope.newUser)
      })
      .then(function(authData) {
        Users.setOnline(authData.uid)
        var profile = Users.getProfile(authData.uid)

        $scope.usernames[$scope.newUser.username] = authData.uid
        $scope.usernames.$save()
        profile.username = $scope.newUser.username
        profile.avatar = authData.password.profileImageURL
        profile.$save()
        Users.all.$save()
        $location.path('/channels')
      })
  }
}