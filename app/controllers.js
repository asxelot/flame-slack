angular.module('FlameSlackApp')

  .controller('MainCtrl', function($scope, $rootScope, $location, 
                          Auth, Users, Usernames) {
    $scope.lightbox = function(src) {
      $scope.lightboxSrc = src
    }

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

    if (!$scope.channels) $rootScope.channels = channels
    if (!$scope.users) $rootScope.users = Users.all

    $scope.channel = $routeParams.channel
    $scope.msg = {}
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

  .controller('DirectCtrl', function($scope, $rootScope, $routeParams, $location,
                            usernames, isLogged, Channels, Users, Direct, FB) {
    if (!isLogged) 
      return $location.path('/login')

    if (!usernames.hasOwnProperty($routeParams.user))
      console.log('user not found')

    if (!$scope.users) $rootScope.users = Users.all
    if (!$scope.channels) $rootScope.channels = Channels
    if (!$scope.directNotify) $rootScope.directNotify = Direct.getNotify($scope.user.$id)

    $scope.msg = {}
    $scope.directWith = {
      $id: usernames[$routeParams.user],
      username: $routeParams.user
    }
    $scope.messages = Direct.messages($scope.user.$id, $scope.directWith.$id)

    Direct.removeNotify($scope.user.$id, $scope.directWith.$id)

    $scope.addMessage = function() {
      if (!$scope.msg.text) return 

      $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP
      $scope.msg.author = {
        id: $scope.user.$id,
        username: $scope.user.username,
        avatar: $scope.user.avatar
      }

      $scope.messages.$add($scope.msg)
      Direct.addNotify($scope.user.$id, $scope.directWith.$id)
      $scope.msg = {}
    }
  })

  .controller('RegisterCtrl', function($scope, $location, 
                              Auth, Users, usernames, isLogged) {
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
  })

  .controller('LoginCtrl', function($scope, $location, Auth, Users, isLogged) {
    $scope.newUser = {}

    if (isLogged) return $location.path('/channels')

    $scope.login = function() {
      Auth.$authWithPassword($scope.newUser)
        .then(function(authData) {
          Users.setOnline(authData.uid)
          $location.path('/channels')
        })
        .catch(console.error)
    }
  })
