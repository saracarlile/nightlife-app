app.controller('mainController', function ($scope, $http, $location, $rootScope, $cookies) {
    $scope.location = "";
    $scope.bars = "";
     $scope.authSearchDone = false; // non-authenticated searches cannot RSVP

    $scope.getPreviousSearch = function () {  //gets previous search saved into cookie using $cookies

         $scope.authSearchDone = true; //authenticated search done

        var prevSearch = $cookies.get('search');
        var Indata = { 'location': prevSearch, 'seeker': $rootScope.displayName };
        $http.post('/bars/search', Indata).
            then(function (data, status) {
                $scope.bars = data.data;

            },
            function errorCallback(error) {
                $scope.alert = 'Search failed';
                console.log(error);
            });

    }

     $scope.triggerChangeWithApply = function () {
            setTimeout(function () {
                $scope.$apply(function () {
                delete $scope.bars;
                }
                )
            }, 10);
        };


    $scope.getLocalBusinesses = function (location) {

        if ($scope.location === "") { return; }

        var Indata = { 'location': $scope.location, 'seeker': $rootScope.displayName };
        var location = $scope.location;

        if ($rootScope.isLoggedIn === true) {  // if user is authenticated
            
            $scope.authSearchDone = true;

            $http.post('/bars/search', Indata).  //authenticated search - bars saved to DB
                then(function (data, status) {
                    console.log(data.data);
                    $scope.bars = data.data;
                    var now = new Date();
                    var exp = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                    $cookies.put('search', $scope.location, {
                        expires: exp  // this will set the expiration to 12 months
                    });
                    $cookies.put('seeker', $rootScope.displayName, {
                        expires: exp  // this will set the expiration to 12 months
                    });
                    $rootScope.hasSearched = $cookies.get('search');

                },
                function errorCallback(error) {
                    $scope.alert = 'Search failed';
                    console.log(error);
                });
        }
        else {
            
            $scope.authSearchDone = false;

            $http.post('/bars/search/nonauth', Indata).  //unauthenticated search
                then(function (data, status) {
                    $scope.bars = data.data["businesses"];
                },
                function errorCallback(error) {
                    $scope.alert = 'Search failed';
                    console.log(error);
                });
        }
    }

   

    $scope.addGoing = function (barName) {
        $http({
            method: 'POST',
            url: '/join',
            data: {
                user: $rootScope.displayName,
                barname: barName
            }
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            let index = $scope.bars.map(function (el) {  // map function to sort through $scope.bars array to get index of bar.name using indexOf
                return el.name;
            }).indexOf(barName);
            $scope.bars[index]["users"] = response.data.users;

        }, function errorCallback(response) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log(response);
        });
    }


});


app.controller('LoginCtrl', [
    '$scope',
    '$facebook',
    '$http',
    '$rootScope',
    '$cookies',
    function ($scope, $facebook, $http, $rootScope, $cookies) {
        $rootScope.isLoggedIn = false;
        $scope.login = function () {
            $facebook.login().then(function () {
                refresh();
            });
        }
        $scope.logout = function () {
            $facebook.logout().then(function () {
                $rootScope.isLoggedIn = false;
                $rootScope.displayName = '';
                $scope.welcomeMsg = "Please log in";
            });
        }


        function refresh() {
            $facebook.api("/me").then(
                function (response) {
                    $scope.welcomeMsg = "Welcome " + response.name;
                    $rootScope.displayName = response.name;
                    var username = response.name;
                    $rootScope.isLoggedIn = true;
                    $http({
                        method: 'POST',
                        url: '/saveuser',
                        data: { user: username }
                    }).then(function successCallback(response) {
                        // this callback will be called asynchronously
                        // when the response is available
                        console.log(response);
                        var searcher = $cookies.get('seeker');
                        if (searcher === $rootScope.displayName) {
                            $rootScope.hasSearched = $cookies.get('search');
                        }

                    }, function errorCallback(response) {
                        // called asynchronously if an error occurs
                        // or server returns response with an error status.
                        console.log(response);
                    });
                },
                function (err) {
                    $scope.welcomeMsg = "Please log in";
                });
        }
        refresh();
    }]);

