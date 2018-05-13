(function() {
    'use strict';
    angular.module('miniApp', [])
        .controller('productCtrl', productCtrl)
        .directive('editImg', editImg)
        .directive('ngFileSelect', ngFileSelect)
        .factory('getImage', getImage)
        .factory('fileReader', fileReader);


    productCtrl.$inject = ['$scope', 'getImage'];
    ngFileSelect.$inject = ['fileReader', '$timeout'];
    fileReader.$inject = ['$q', '$log'];
    getImage.$inject = ['$http'];

    function productCtrl($scope, getImage) {
        $scope.editDialog = new EditImageModel();
        $scope.imageSrc = "";
        init();

        function init() {
            getImage.getData().then(function(response) {
                $scope.imgList = response.data;
            });
        }
    }
    var EditImageModel = function() {
        this.visible = false;
    };
    EditImageModel.prototype.open = function(img) {
        this.img = img;
        this.visible = true;
    };
    EditImageModel.prototype.close = function() {
        this.visible = false;
    };

    function editImg() {
        return {
            restrict: 'E',
            scope: {
                model: '=',
            },
            link: function(scope, element, attributes) {
                var modalElement = element.find('.modal');
                scope.$watch('model.visible', function(newValue) {
                    modalElement.removeData('bs.modal');
                    modalElement.modal(newValue ? 'show' : 'hide');
                });

                element.on('shown.bs.modal', function() {
                    scope.$apply(function() {
                        scope.model.visible = true;
                    });
                });

                element.on('hidden.bs.modal', function() {
                    scope.$apply(function() {
                        scope.model.visible = false;
                    });
                });
                scope.close = function() {
                    modalElement.modal('hide');
                }

            },
            templateUrl: './app/templates/edit-modal.html',
        };
    }

    function fileReader($q, $log) {
        var service = {
            onLoad: onLoad,
            readAsDataURL: readAsDataURL,
            getReader: getReader,
            onError: onError,
            onProgress: onProgress
        };
        return service;

        function onLoad(reader, deferred, scope) {
            return function() {
                scope.$apply(function() {
                    deferred.resolve(reader.result);
                });
            };
        }

        function getReader(deferred, scope) {
            var reader = new FileReader();
            reader.onload = onLoad(reader, deferred, scope);
            reader.onerror = onError(reader, deferred, scope);
            reader.onprogress = onProgress(reader, scope);
            return reader;
        }

        function readAsDataURL(file, scope) {
            var deferred = $q.defer();
            var reader = getReader(deferred, scope);
            reader.readAsDataURL(file);
            return deferred.promise;
        };

        function onError(reader, deferred, scope) {
            return function() {
                scope.$apply(function() {
                    deferred.reject(reader.result);
                });
            };
        };

        function onProgress(reader, scope) {
            return function(event) {
                scope.$broadcast("fileProgress", {
                    total: event.total,
                    loaded: event.loaded
                });
            };
        };
    }

    function ngFileSelect(fileReader, $timeout) {
        return {
            scope: {
                ngModel: '='
            },
            link: function($scope, el) {
                function getFile(file) {
                    fileReader.readAsDataURL(file, $scope)
                        .then(function(result) {
                            $timeout(function() {
                                $scope.ngModel = result;
                            });
                        });
                }
                el.bind("change", function(e) {
                    var file = (e.srcElement || e.target).files[0];
                    getFile(file);
                });
            }
        };
    }

    function getImage($http) {
        var service = {
            getData: getData
        };
        return service;
        delete $http.defaults.headers.common['X-Requested-With'];

        function getData() {
            return $http({
                method: 'GET',
                url: 'http://demo4126999.mockable.io/images'
            });
        }
    }
})();