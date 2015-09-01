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
				var deferred, _ref;
				_ref = element[0].offsetParent;
				var offset;
				if(_ref) {
					offset = _ref.offsetTop;
				}
				else {
					offset = 0;
				}

				var extraOffset = element[0].offsetHeight;

				var offset = offset + extraOffset;

				var windowSize = $window.scrollY + $window.innerHeight;

				var check = offset < windowSize;

				if(!scrolling && check) {
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