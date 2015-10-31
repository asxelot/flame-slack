angular.module('FlameSlackApp')
  .controller('ChannelCtrl', ChannelCtrl)  


function ChannelCtrl($rootScope, $scope, $stateParams, $location, channels, 
                     Messages, Title) {

  if (!$stateParams.channel || !channels.hasOwnProperty($stateParams.channel))
    return $location.path('channels/general')  
  
  $scope.msg = {}
  $rootScope.directWith = null
  $rootScope.channel = $stateParams.channel
  $scope.divider = $scope.user.lastReaded && 
                   $scope.user.lastReaded[$scope.channel]
  
  Title.set($scope.channel)

  $scope.addMessage = function() {
    if ($scope.msgForm.$invalid) return 

    $scope.msg.channel = $scope.channel
    $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP
    $scope.msg.author = {
      id: $scope.user.$id,
      username: $scope.user.username,
      avatar: $scope.user.avatar
    }

    $scope.messages[$scope.channel].$add($scope.msg)
    $scope.msg = {}
  }

  $scope.remove = function(msg) {
    $scope.messages[$scope.channel].$remove(msg)
  }

  // last readed messages
  $scope.$watchCollection('messages.' + $scope.channel, function(msgs) {
    $scope.user.lastReaded = $scope.user.lastReaded || {}
    $scope.user.lastReaded[$scope.channel] = msgs.length && 
                                             msgs[msgs.length-1].$id
    $scope.user.$save()
  })

  // mention
  $scope.$on('mention', function() {
    if (!$scope.isTabActive) Title.add('! ')
  })
}