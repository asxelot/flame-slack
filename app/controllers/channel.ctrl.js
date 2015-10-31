angular.module('FlameSlackApp')
  .controller('ChannelCtrl', ChannelCtrl)  


function ChannelCtrl($scope, $rootScope, $routeParams, $location, channels, 
                      isLogged, Messages, Users, Title, Direct, FB) {
  if (!isLogged) 
    return $location.path('/login')

  if (!$routeParams.channel || !channels.hasOwnProperty($routeParams.channel))
    return $location.path('channels/general')  

  if (!$scope.channels) $rootScope.channels = channels
  if (!$scope.users) $rootScope.users = Users.all
  if (!$scope.directNotify) 
    $rootScope.directNotify = Direct.notifications($scope.user.$id)    

  $scope.channel = $routeParams.channel
  $scope.msg = {}
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

  $scope.createChannel = function() {
    if ($scope.newChannelForm.$invalid) return
      
    $scope.channels[$scope.newChannelName] = true
    $scope.channels.$save()
    $scope.messages[$scope.newChannelName] = Messages($scope.newChannelName)
    $scope.newChannelName = ''
    $scope.isNewChannelFormShowed = false
  }

  // load messages
  $scope.channels.$ref().on('child_added', function(snap) {
    if (!$scope.messages) $rootScope.messages = {}
    $scope.messages[snap.key()] = Messages(snap.key())
  }) 

  // last readed messages
  $scope.$watchCollection('messages.' + $scope.channel, function(msgs) {
    $scope.user.lastReaded = $scope.user.lastReaded || {}
    $scope.user.lastReaded[$scope.channel] = msgs.length && 
                                             msgs[msgs.length-1].$id
    $scope.user.$save()
  })

  // new message
  new Firebase(FB + 'messages/').on('child_changed', function() {
    if (!$scope.isTabActive) Title.add('* ')
  }) 

  // mention
  $scope.$on('mention', function() {
    if (!$scope.isTabActive) Title.add('! ')
  })

  $scope.directNotify.$ref().on('child_added', function(snap) {
    Title.add('! ')
  })

  $scope.$on('tab-active', function(e, active) {
    if (active) Title.remove()
  })
}