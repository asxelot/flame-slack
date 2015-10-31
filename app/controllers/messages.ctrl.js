angular.module('FlameSlackApp')
  .controller('MessagesCtrl', MessagesCtrl)  
 
 
function MessagesCtrl($rootScope, $scope, $stateParams, $location, Auth,
                      isLogged, Messages, Users, Title, Direct, FB, channels) {

  if (!isLogged)
    return $location.path('/login')

  $rootScope.users = Users.all
  $rootScope.channels = channels
  $scope.directNotify = Direct.notifications($scope.user.$id)    

  $scope.createChannel = function() {
    if ($scope.newChannelForm.$invalid) return
      
    $scope.channels[$scope.newChannelName] = true
    $scope.channels.$save()
    $scope.messages[$scope.newChannelName] = Messages($scope.newChannelName)
    $scope.newChannelName = ''
    $scope.isNewChannelFormShowed = false
  }
  
  $scope.lightbox = function(src) {
    $scope.lightboxSrc = src
  }

  $scope.logout = function() {
    Users.setOffline($scope.user.$id)
    Auth.$unauth()
  }   

  // load messages
  $scope.channels.$ref().on('child_added', function(snap) {
    if (!$scope.messages) $rootScope.messages = {}
    $scope.messages[snap.key()] = Messages(snap.key())
  }) 

  // new message
  new Firebase(FB + 'messages/').on('child_changed', function() {
    if (!$scope.isTabActive) Title.add('* ')
  }) 

  $scope.directNotify.$ref().on('child_added', function(snap) {
    Title.add('! ')
  })

  $scope.$on('tab-active', function(e, active) {
    if (active) Title.remove()
  })  

  $scope.directNotify.$ref().on('child_added', function(snap) {
    Title.add('! ')
  })   
}