angular.module('FlameSlackApp')

  .factory('Auth', function($firebaseAuth, FB) {
    return $firebaseAuth(new Firebase(FB))
  })

  .factory('Users', function($firebaseArray, $firebaseObject, FB) {
    var usersRef = new Firebase(FB + 'users'),
        connectedRef = new Firebase(FB + '.info/connected'),
        users = $firebaseArray(usersRef)

    return {
      getProfile: function(uid) {
        return $firebaseObject(usersRef.child(uid))
      },
      setOnline: function(uid) {
        var connected = $firebaseObject(connectedRef)
            online = $firebaseArray(usersRef.child(uid + '/online'))

        connected.$watch(function() {
          if (connected.$value === true) {
            online.$add(true).then(function(connectedRef) {
              connectedRef.onDisconnect().remove()
            })
          }
        })

        usersRef.child(uid + '/lastOnline')
          .onDisconnect().set(Firebase.ServerValue.TIMESTAMP)
      },
      setOffline: function(uid) {
        usersRef.child(uid + '/online').remove()
        usersRef.child(uid + '/lastOnline').set(Firebase.ServerValue.TIMESTAMP)
      },
      all: users
    }
  })

  .factory('Channels', function($firebaseArray, FB) {
    return $firebaseArray(new Firebase(FB + 'channels'))
  })

  .factory('Messages', function($firebaseArray, FB) {
    var msgRef = new Firebase(FB + 'messages/')

    return function(channel) {
      return $firebaseArray(msgRef.child(channel))
    }
  })

  .factory('Title', function($rootScope, FB) {
    var Title = {
      set: function(channel) {
        $rootScope.title = channel + ' | Flame Slack'
      },
      add: function(s) {
        if (!~$rootScope.title.indexOf(s))
          $rootScope.title = s + $rootScope.title
      },
      remove: function(s) {
        if (!s)
          $rootScope.title = $rootScope.title.replace(/[\!\*] /g, '')
        else if (~$rootScope.title.indexOf(s))
          $rootScope.title = $rootScope.title.replace(s, '')
      }
    }

    return Title
  })