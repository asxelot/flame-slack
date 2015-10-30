angular.module('FlameSlackApp')
  .controller('DirectCtrl', DirectCtrl)


function DirectCtrl($scope, $rootScope, $routeParams, $location, usernames,
                    isLogged, Channels, Users, Direct, FB) {
  if (!isLogged) 
    return $location.path('/login')

  if (!usernames.hasOwnProperty($routeParams.user))
    console.log('user not found')

  if (!$scope.users) $rootScope.users = Users.all
  if (!$scope.channels) $rootScope.channels = Channels
  if (!$scope.directNotify) 
    $rootScope.directNotify = Direct.notifications($scope.user.$id)

  $scope.msg = {}
  $scope.directWith = {
    $id: usernames[$routeParams.user],
    username: $routeParams.user
  }
  $scope.messages = Direct.messages($scope.user.$id, $scope.directWith.$id)

  Direct.removeNotifications($scope.user.$id, $scope.directWith.$id)

  $scope.addMessage = function() {
    if (!$scope.msg.text) return 

    $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP
    $scope.msg.author = {
      id: $scope.user.$id,
      username: $scope.user.username,
      avatar: $scope.user.avatar
    }

    $scope.messages.$add($scope.msg)
    Direct.notify($scope.user.$id, $scope.directWith.$id)
    $scope.msg = {}
  }
}