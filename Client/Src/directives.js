angular.module('app.directives', [])

///
///http://microblog.anthonyestebe.com/2014-01-11/infinite-scroll-with-angular/
///
.directive('infiniteScroll', function ($window, $q) {
	return {
		link: function (scope, element, attrs) {
			var offset, scrolling;
			offset = parseInt(attrs.offset, 10) || 10;
			scrolling = false;
			return angular.element($window).bind("scroll", function() {
				var deferred, offsetParent;
				
				offsetParent = element[0].offsetParent;
				var offset;
				if(offsetParent) {
					offset = offsetParent.offsetTop;
				}
				else {
					offset = 0;
				}

				var offsetHeight = element[0].offsetHeight;

				var offset = offset + offsetHeight;

				var windowSize = $window.scrollY + $window.innerHeight;

				var reachedBottom = offset < windowSize;

				if(!scrolling && reachedBottom) {
					scrolling = true;
					deferred = $q.defer();
					scope[attrs.infiniteScroll](deferred);
					return deferred.promise.then(function () {
						return scrolling = false;
					});
				}
			});
		}
	};
});