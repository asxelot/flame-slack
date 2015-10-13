angular.module('FlameSlackApp')

  .factory('Auth', function($firebaseAuth, FB) {
    return $firebaseAuth(new Firebase(FB))
  })

  .factory('Users', function($firebaseArray, $firebaseObject, FB) {
    var usersRef = new Firebase(FB + 'users'),
        users = $firebaseArray(usersRef)

    return {
      getProfile: function(uid) {
        return $firebaseObject(usersRef.child(uid))
      }
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