angular.module('FlameSlackApp')

  .controller('MainCtrl', function($scope, $rootScope, $location, 
                          Auth, Users, Usernames) {
    Auth.$onAuth(function(authData) {
      if (authData) {
        $rootScope.user = Users.getProfile(authData.uid)
        Users.setOnline(authData.uid)
        $rootScope.isAdmin = Users.isAdmin(authData.uid)
      } else {
        $rootScope.user = null
        $location.path('/login')
      }
    })  

    $scope.logout = function() {
      Users.setOffline($scope.user.$id)
      Auth.$unauth()
    }      
  })

  .controller('ChannelCtrl', function($scope, $rootScope, $routeParams, 
                              $location, channels, isLogged, Messages, Users, 
                              Title, FB) {
    if (!isLogged) 
      return $location.path('/login')

    if (!$routeParams.channel || !channels.hasOwnProperty($routeParams.channel))
      return $location.path('channels/general')  

    $scope.channel = $routeParams.channel
    $scope.channels = channels
    $scope.msg = {}
    $rootScope.users = Users.all
    $scope.divider = $scope.user.lastReaded && 
                     $scope.user.lastReaded[$scope.channel]
    
    Title.set($scope.channel)

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

    $scope.$on('tab-active', function(e, active) {
      if (active) Title.remove()
    })

    $scope.addMessage = function() {
      if (!$scope.msg.text) return 

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
  })  

  .controller('RegisterCtrl', function($scope, $location, 
                              Auth, Users, usernames) {
    $scope.usernames = usernames
    $scope.newUser = {}

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

          usernames[$scope.newUser.username] = true
          profile.username = $scope.newUser.username
          profile.avatar = authData.password.profileImageURL
          profile.$save()
          usernames.$save()
          Users.all.$save()
          $location.path('/channels')
        })
    }
  })

  .controller('LoginCtrl', function($scope, $location, Auth, Users) {
    $scope.newUser = {}

    $scope.login = function() {
      Auth.$authWithPassword($scope.newUser)
        .then(function(authData) {
          Users.setOnline(authData.uid)
          $location.path('/channels')
        })
        .catch(console.error)
    }
  })
