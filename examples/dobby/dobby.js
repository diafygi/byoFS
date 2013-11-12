
// TOOD: Check if (window.File && window.FileReader && window.FileList && window.Blob)
var module = angular.module( "dobbyApp", [] );

module.service( 'Photo', [ '$rootScope', function( $rootScope ) {
  var service = {
    photos: [],
    db: null,
    
    setDatabase: function(db) {
      service.db = db;

      db.get('photos', function(data) {
        service.photos = data && data.length > 0 ? JSON.parse(data) : [];
        console.log(['Retrieved Data', data, service.photos]);
        $rootScope.$broadcast('connected');
        $rootScope.$broadcast('photos.update');
      });
    },

    update: function(photos) {
      service.db.post('photos', JSON.stringify(photos), function(worked) {
        if (worked) {
          service.photos = photos;
          // console.log(['Send Photos', JSON.stringify(photos)]);
          $rootScope.$broadcast('photos.update');
        }
      });
    },

    addPhoto: function (photo) {
      service.update(service.photos.concat(photo));
    },

    clearPhotos: function() {
      service.update([]);
    },

    removePhoto: function(photo) {
      var photos = service.photos.filter(function(_photo) {
        return _photo != photo;
      });

      service.update(photos);
    }
  }

  return service;
}]);

var ctrl = [ '$scope', 'Photo', function( $scope, Photo ) {
  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if (phase == '$apply' || phase == '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $scope.$on( 'connected', function() {
    $scope.safeApply(function() {
      $scope.connected = true;
    });
  });

  $scope.$on( 'photos.update', function(event) {
    $scope.safeApply(function() {
      $scope.photos = Photo.photos;
    })
  });

  $scope.clearPhotos = function() {
    if (confirm('Are you sure?')) {
      $scope.safeApply(function() {
        Photo.clearPhotos();
        $scope.photos = Photo.photos;
      });
    }
  }

  $scope.photos = Photo.photos;
}];

module.controller( "photos.list", ctrl );

module.directive( "addPhotoButton", [ 'Photo', function( Photo ) {
  return {
    restrict: "A",
    link: function( scope, element, attrs ) {
      element.bind("change", function(evt) {
        
        var files = evt.target.files;

        for (var i = 0, f; f = files[i]; i++) {

          // Only process image files.
          if (!f.type.match('image.*')) {
            continue;
          }

          var reader = new FileReader();

          // Closure to capture the file information.
          reader.onload = (function(theFile) {
            return function(e) {
              scope.$apply(function() {
                Photo.addPhoto( { title: theFile.name, data: e.target.result } );
              });
            };
          })(f);

          // Read in the image file as a data URL.
          reader.readAsDataURL(f);

          //
        }
      });
    }
  }
}]);

module.directive("removePhoto", [ 'Photo', function(Photo) {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      element.bind("click", function() {
        console.log(['Remove Photo', scope, element, attrs]);
        scope.$apply(function() {
          Photo.removePhoto(scope.photo);
        });
      });
    }
  }
}]);

module.directive("fileUpload", [ function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      element.bind("click", function() {
        document.getElementById(attrs.target).click();
      });
    }
  }
}]);

module.directive("byodWidget", [ 'Photo', function(Photo) {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      setTimeout(function() { // Dom readyness
        // Initialize BYOD
        BYOD.setWidget("#" + attrs.id, function(db) {
          scope.$apply(function() {
            Photo.setDatabase(db);
          });
        });
      });
    }
  }
}]);
