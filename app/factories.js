angular.module('FlameSlackApp')

  .factory('Auth', function($firebaseAuth, FB) {
    return $firebaseAuth(new Firebase(FB))
  })

  .factory('Users', function($q, $firebaseArray, $firebaseObject, FB) {
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
            online.$add(true).then(function() {
              online.$ref().onDisconnect().remove()
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
      isAdmin: function(uid) {
        return $firebaseObject(new Firebase(FB).child('admins').child(uid))
      },
      all: users
    }
  })

  .factory('Usernames', function($firebaseObject, FB) {
    return $firebaseObject(new Firebase(FB + 'usernames'))
  })

  .factory('Channels', function($firebaseObject, FB) {
    return $firebaseObject(new Firebase(FB + 'channels'))
  })

  .factory('Messages', function($firebaseArray, FB) {
    var msgRef = new Firebase(FB + 'messages')

    return function(channel) {
      return $firebaseArray(msgRef.child(channel))
    }
  })

  .factory('Direct', function($firebaseArray, $firebaseObject, FB) {
    return {
      messages: function(uid1, uid2) {
        var path = uid1 < uid2 ? uid1 + '/' + uid2 : uid2 + '/' + uid1
        return $firebaseArray(new Firebase(FB).child('direct').child(path))
      },
      addNotify: function(from, to) {
        var ref = new Firebase(FB + 'directNotification').child(to).child(from)
        ref.transaction(function(val) {
          return val ? val + 1 : 1
        })
      },
      getNotify: function(uid) {
        return $firebaseObject(new Firebase(FB + 'directNotification').child(uid))
      },
      removeNotify: function(from, to) {
        new Firebase(FB + 'directNotification').child(from).child(to).remove()
      }
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