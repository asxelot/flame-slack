angular.module('FlameSlackApp')
  .controller('DirectCtrl', DirectCtrl)


function DirectCtrl($scope, $rootScope, $stateParams, $location, usernames,
                    isLogged, Channels, Users, Direct, Title, FB) {

  if (!usernames.hasOwnProperty($stateParams.user))
    return console.log('user not found')

  $scope.msg = {}
  $rootScope.channel = null
  $rootScope.directWith = {
    $id: usernames[$stateParams.user],
    username: $stateParams.user
  }
  $scope.messages = Direct.messages($scope.user.$id, $scope.directWith.$id)

  Title.set($scope.directWith.username)
  Title.remove()
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

  $scope.remove = function(msg) {
    $scope.messages.$remove(msg)
  }
}