angular.module('FlameSlackApp', [
    'ngRoute', 
    'firebase', 
    'ngSanitize'  
  ])  

  .constant('FB', 'https://flame-slack.firebaseio.com/')

  .config(router)

function router($routeProvider) {
  $routeProvider
    .when('/login', {
      controller: 'LoginCtrl',
      templateUrl: 'views/login.html',
      resolve: {
        isLogged: function(Auth) {
          return Auth.$waitForAuth()
        }
      }
    })
    .when('/register', {
      controller: 'RegisterCtrl',
      templateUrl: 'views/register.html',
      resolve: {
        usernames: function(Usernames) {
          return Usernames.$loaded()
        },
        isLogged: function(Auth) {
          return Auth.$waitForAuth()
        }
      }
    })
    .when('/channels/:channel?', {
      controller: 'ChannelCtrl',
      templateUrl: 'views/chat.html',
      resolve: {
        channels: function(Channels) {
          return Channels.$loaded()
        },
        isLogged: function(Auth) {
          return Auth.$waitForAuth()
        }
      }
    })
    .when('/messages/:user', {
      controller: 'DirectCtrl',
      templateUrl: 'views/chat.html',
      resolve: {
        usernames: function(Usernames) {
          return Usernames.$loaded()
        },
        isLogged: function(Auth) {
          return Auth.$waitForAuth()
        }
      }
    })
}
angular.module('FlameSlackApp')

  .directive('ngAutoscroll', function() {
    function link($scope, $el) {
      var el = $el[0],
          isScrolled = true,
          scrolledPosition = 0,
          fullscreenchange = 'webkitfullscreenchange mozfullscreenchange fullscreenchange'

      function scrollToBottom() {
        if (isScrolled) el.scrollTop = el.scrollHeight
      }

      $el.on('DOMSubtreeModified', scrollToBottom)

      // chrome scroll fix
      angular.element(document).on(fullscreenchange, function(e) {
        if (e.target != document) {
          scrolledPosition = e.target.parentElement.offsetTop
        } else if (scrolledPosition) {
          el.scrollTop = scrolledPosition
        }
      })

      $el.on('scroll', function() {
        isScrolled = el.scrollTop == el.scrollHeight - el.offsetHeight
      })

      $scope.$on('dividerTop', function(e, top) {
        el.scrollTop = top
      })
    }

    return {
      link: link
    }
  })

  .directive('ngFocus', function() {
    function link($scope, $el) {
      $el[0].focus()
    }

    return {
      link: link
    }
  })

  .directive('divider', function() {
    function link($scope, $el) {
      angular.element(document.getElementById('chat'))
        .one('DOMSubtreeModified', function() {
          $scope.$emit('dividerTop', $el[0].offsetTop - 150)
        })
    }

    return {
      link: link
    }
  })

  .directive('ngTabActive', function($window, $rootScope,  Title) {
    function link() {
      angular.element($window)
        .on('focus', function() {
          $rootScope.isTabActive = true
          $rootScope.$broadcast('tab-active', true)
        })
        .on('blur', function() {
          $rootScope.isTabActive = false
          $rootScope.$broadcast('tab-active', false)
        })
    }

    return {
      link: link
    }
  })

  .directive('uniqueUsername', function() {
    function link($scope, $el, $attrs, ngModel) {
      ngModel.$validators.uniqueUsername = function(val) {
        return !$scope.usernames.hasOwnProperty(val)
      }
    }

    return {
      require: 'ngModel',
      link: link
    }
  })

  .directive('ngEnter', function() {
    function link($scope, $el) {
      $el.on('input', function() {
        if ($el[0].offsetHeight < 170) 
          $el.css('height', $el[0].scrollHeight + 2 + 'px')
      })

      $el.on('keydown', function(e) {
        if (e.keyCode == 13 && !e.shiftKey) {
          $scope.ngEnter()
          $el.css('height', '34px')
          e.preventDefault()
        }
      })
    }

    return {
      scope: {
        ngEnter: '&'
      },
      link: link
    }
  })
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
      notify: function(from, to) {
        var ref = new Firebase(FB + 'directNotification').child(to).child(from)
        ref.transaction(function(val) {
          return (val || 0) + 1
        })
      },
      notifications: function(uid) {
        return $firebaseObject(new Firebase(FB + 'directNotification').child(uid))
      },
      removeNotifications: function(to, from) {
        new Firebase(FB + 'directNotification').child(to).child(from).remove()
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
angular.module('FlameSlackApp')

  .filter('escape', function() {
    return function(text) {
      return (text||'').replace(/</g, '&lt;')
    }
  })

  .filter('code', function() {
    return function(text) {
      return (text||'').replace(/```([^`]+)```/g, '<pre>$1</pre>')
                       .replace(/`([^`]+)`/g, '<code>$1</code>')
    }
  })

  .filter('quote', function() {
    return function(text) {
      return (text||'').replace(/^>([^\n]+)$\n?/gm, '<blockquote>$1</blockquote>')
    }
  })

  .filter('link', function($http) {
    var linkRegExp = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})\/([\/\w\.\-=?]*)*\/?/gi
    var imageRegExp = /\.(jpg|jpeg|png|gif)/
    var youtubeRegExp = /(https?:\/\/)(www\.)?youtu\.?be(\.com)?\/(watch\?v=)?([\w\-_]+)(\?t=)?(\w+)?/i
    var vimeoRegExp = /https?:\/\/vimeo\.com\/(\d+)/i


    return function(text, scope) {
      return (text||'').replace(linkRegExp, function(link, protocol) {
        var html = '<a href="' + (protocol ? '' : 'http://') + 
                    link + '" target="_blank">' + link + '</a>'

        if (imageRegExp.test(link) && !scope.image) 
          scope.image = { src: link }

        if (youtubeRegExp.test(link) && !scope.youtube) 
          scope.youtube = { id: link.match(youtubeRegExp)[5] }

        if (vimeoRegExp.test(link) && !scope.vimeo) {
          var vimeoId = link.match(vimeoRegExp)[1]
          scope.vimeo = { id: vimeoId }

          $http
            .jsonp('https://vimeo.com/api/v2/video/' + 
                    vimeoId + '.json?callback=JSON_CALLBACK')
            .success(function(data) {
              scope.vimeo.preview = data[0].thumbnail_large
            })
        }

        return html
      })
    }
  })

  .filter('username', function($rootScope) {
    return function(text) {
      var users = $rootScope.users.map(function(user) {return user.username})

      return (text||'').replace(/@(\w+)/, function(match, username) {
        var currentUser = $rootScope.user.username == username

        if (~users.indexOf(username)) {
          if (currentUser) $rootScope.$broadcast('mention')

          return '<a href="#/user/' + username + '"' +
                 (currentUser ? 'class="mention"' : '') +
                 '>' + match + '</a>'
        } else {
          return match
        }
      })
    }
  })

  .filter('channel', function($rootScope) {
    return function(text) {
      return (text||'').replace(/#(\w+)/gi, function(match, channel) {
        if ($rootScope.channels.hasOwnProperty(channel))
          return '<a href="#/channels/' + channel + '">' + match + '</a>'
        else
          return match
      })
    }
  })

  .filter('trustAsHtml', function($sce){
    return $sce.trustAsHtml
  })

  .filter('trustAsResourceUrl', function($sce) {
    return $sce.trustAsResourceUrl
  })



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

  $scope.$on('tab-active', function(e, active) {
    if (active) Title.remove()
  })
}
angular.module('FlameSlackApp')
  .controller('DirectCtrl', DirectCtrl)


function DirectCtrl($scope, $rootScope, $routeParams, $location, usernames,
                    isLogged, Channels, Users, Direct, FB) {
  if (!isLogged) 
    return $location.path('/login')

  if (!usernames.hasOwnProperty($routeParams.user))
    console.log('user not found')

  if (!$scope.users) $rootScope.users = Users.all
  if (!$scope.channels) $rootScope.channels = Channels
  if (!$scope.directNotify) 
    $rootScope.directNotify = Direct.notifications($scope.user.$id)

  $scope.msg = {}
  $scope.directWith = {
    $id: usernames[$routeParams.user],
    username: $routeParams.user
  }
  $scope.messages = Direct.messages($scope.user.$id, $scope.directWith.$id)

  Direct.removeNotifications($scope.user.$id, $scope.directWith.$id)

  $scope.addMessage = function() {
    if (!$scope.msg.text) return 

    $scope.msg.timestamp = Firebase.ServerValue.TIMESTAMP
    $scope.msg.author = {
      id: $scope.user.$id,
      username: $scope.user.username,
      avatar: $scope.user.avatar
    }

    $scope.messages.$add($scope.msg)
    Direct.notify($scope.user.$id, $scope.directWith.$id)
    $scope.msg = {}
  }
}
angular.module('FlameSlackApp')
  .controller('LoginCtrl', LoginCtrl)


function LoginCtrl($scope, $rootScope, $location, Auth, Users, isLogged) {
  $scope.newUser = {}

  if (isLogged) return $location.path('/channels')

  $scope.login = function() {
    $rootScope.isLoadingHidden = false

    Auth.$authWithPassword($scope.newUser)
      .then(function(authData) {
        Users.setOnline(authData.uid)
        $location.path('/channels')
      })
      .catch(console.error)
  }
}

angular.module('FlameSlackApp')
  .controller('MainCtrl', MainCtrl)


function MainCtrl($scope, $rootScope, $location, Auth, Users, Usernames) {

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
  
  $scope.lightbox = function(src) {
    $scope.lightboxSrc = src
  }

  $scope.logout = function() {
    Users.setOffline($scope.user.$id)
    Auth.$unauth()
  }     

  $scope.$on('$routeChangeSuccess', function() {
    $rootScope.isLoadingHidden = true
  }) 
}
angular.module('FlameSlackApp')
  .controller('RegisterCtrl', RegisterCtrl)


function RegisterCtrl($scope, $rootScope, $location, Auth, Users, 
                      usernames, isLogged) {
  $scope.usernames = usernames
  $scope.newUser = {}
  
  if (isLogged) return $location.path('/channels')

  $scope.register = function() {
    if ($scope.RegisterForm.$invalid) return
    if ($scope.usernames[$scope.newUser.username])
      return console.log('this username already exists')

    $rootScope.isLoadingHidden = false

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
}