angular.module('FlameSlackApp')
  .controller('ChannelCtrl', ChannelCtrl)  


function ChannelCtrl($rootScope, $scope, $state, channels, 
                     Messages, Title) {

  if (!$state.params.channel || !channels.hasOwnProperty($state.params.channel))
    return $state.go('messages.channel', { channel: 'general' }) 
  
  $scope.msg = {}
  $rootScope.directWith = null
  $rootScope.channel = $state.params.channel
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