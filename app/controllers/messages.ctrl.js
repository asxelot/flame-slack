angular.module('FlameSlackApp')
  .controller('MessagesCtrl', MessagesCtrl)  
 
 
function MessagesCtrl($scope, $state, Auth, Messages, Users,
                      Title, Direct, FB,isLogged, channels) {

  if (!isLogged) return $state.go('login')
  if ($state.is('messages')) $state.go('messages.channel')

  $scope.messages = {}
  $scope.users = Users.all
  $scope.channels = channels
  $scope.directNotify = Direct.notifications($scope.user.$id)    

  $scope.createChannel = function() {
    if ($scope.newChannelForm.$invalid) return
      
    $scope.channels[$scope.newChannelName] = true
    $scope.channels.$save()
    $scope.messages[$scope.newChannelName] = Messages($scope.newChannelName)
    $scope.newChannelName = ''
    $scope.isNewChannelFormShowed = false
  }

  $scope.logout = function() {
    Users.setOffline($scope.user.$id)
    Auth.$unauth()
  }   

  // load messages for new channel
  $scope.channels.$ref().on('child_added', function(snap) {
    $scope.messages[snap.key()] = Messages(snap.key())
  }) 

  // new message notification
  angular.forEach($scope.messages, function(channel) {
    channel.$ref().on('child_added', function() {
      if (!$scope.isTabActive) Title.add('* ')
    })
  })

  $scope.directNotify.$ref().on('child_added', function(snap) {
    Title.add('! ')
  })

  $scope.$on('tab-active', function(e, active) {
    if (active) Title.remove()
  }) 
}