angular.module('todo')

    .controller('HomeController', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate, $http, $ionicPopup, $ionicLoading) {
        $scope.totalprice = 0;

        $scope.data = {
            showDelete: false
        };

        $scope.edit = function(item) {
            this.editPopup(item);
        };

        $scope.moveItem = function(item, fromIndex, toIndex) {
            $scope.activeProject.tasks.splice(fromIndex, 1);
            $scope.activeProject.tasks.splice(toIndex, 0, item);
        };

        $scope.onItemDelete = function(item) {
            if(item.tasks != undefined){
                $scope.projects.splice($scope.projects.indexOf(item), 1);
                Projects.save($scope.projects);
                $scope.activeProject = $scope.projects[0];
            }else{
                $scope.activeProject.tasks.splice($scope.activeProject.tasks.indexOf(item), 1);
                Projects.save($scope.projects);
            }
        };

        var createProject = function(projectTitle) {
            var newProject = Projects.newProject(projectTitle);
            $scope.projects.push(newProject);
            Projects.save($scope.projects);
            $scope.selectProject(newProject, $scope.projects.length-1);
        };

        // Load or initialize projects
        $scope.projects = Projects.all();

        // Grab the last active, or the first project
        $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

        // Called to create a new project
        $scope.newDate = function() {
            this.newDatePopup();
        };

        // Called to select the given project
        $scope.selectProject = function(project, index) {
            $scope.activeProject = project;
            Projects.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft(false);
        };

        // Create our modal
        $ionicModal.fromTemplateUrl('new-measurement.html', function(modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope
        });

        $scope.createTask = function(task) {
            if(!$scope.activeProject || !task) {
                $ionicLoading.show({ template: 'May be the list is missing, try creating a new list', noBackdrop: true, duration: 3000 });
                return;
            }

            for(var attr in task) {
                if (!this.containsObject (attr, $scope.activeProject.tasks)) {
                    $scope.activeProject.tasks.push({
                        title: attr,
                        value: task[attr]
                    });
                }
            }

            $scope.taskModal.hide();

            // Inefficient, but save all the projects
            Projects.save($scope.projects);
        };

        $scope.inputMeasurements = function() {
            $scope.taskModal.show();
        };

        $scope.closeNewTask = function() {
            $scope.taskModal.hide();
        };

        $scope.toggleDate = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.containsObject = function(obj, list) {
            var i;
            for (i = 0; i < list.length; i++) {
                if (list[i].title === obj) {
                    return true;
                }
            }

            return false;
        };

        $scope.newDatePopup = function() {
            $scope.data = {};

            $ionicPopup.show({
                template: '<input type="date" ng-model="data.listName">',
                title: 'Select date',

                subTitle: '',
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Add</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.listName) {
                                e.preventDefault();
                            } else {
                                createProject($scope.data.listName);
                            }
                        }
                    },
                ]
            });
        };

        $scope.editPopup = function(item) {
            $scope.data = {};

            $ionicPopup.show({
                template: '<input type="text" ng-model="data.editName">',
                title: 'Enter New Measurement',
                subTitle: item.title,
                scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            if (!$scope.data.editName) {
                                e.preventDefault();
                            } else {
                                item.value = $scope.data.editName;
                                Projects.save($scope.projects);
                            }
                        }
                    },
                ]
            });
        };

        $scope.showLoading = function() {
            $scope.loadingIndicator = $ionicLoading.show({
                content: 'Loading...',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 500
            });

            $timeout(function(){
                $scope.loadingIndicator.hide();
            },25000);
        };

        $timeout(function() {
            if($scope.projects.length == 0) {
                $scope.newDatePopup();
            }
        });

    });