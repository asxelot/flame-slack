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
      },
      all: users
    }
  })

  .factory('Channels', function($firebaseArray, FB) {
    return $firebaseArray(new Firebase(FB + 'channels'))
  })

  .factory('Messages', function($firebaseArray, FB) {
    return function(channel) {
      return $firebaseArray(new Firebase(FB + 'messages/' + channel))
    }
  })