(function() {
    'use strict';

    angular.module('myApp.controllers')
        .controller('DemoCtrl', ['$scope', 'd3Service',
            function($scope, d3Service) {

                $scope.nomaConfig = {

                    //initial Data


                };

                $scope.loadedData = 'titanic';

                $scope.onClick = function(item) {
                    $scope.$apply(function() {
                        if (!$scope.showDetailPanel)
                            $scope.showDetailPanel = true;
                        $scope.detailItem = item;
                    });
                };




                $scope.groups = [{
                    title: "Dynamic Group Header - 1",
                    content: "Dynamic Group Body - 1"
                }, {
                    title: "Dynamic Group Header - 2",
                    content: "Dynamic Group Body - 2"
                }];


                $scope.items = ['Item 1', 'Item 2', 'Item 3'];

                
                $scope.addItem = function() {
                    var newItemNo = $scope.items.length + 1;
                    $scope.items.push('Item ' + newItemNo);
                };


                $scope.changeActiveDataTitanic = function() {


                    $scope.activeData = 'Survivor of Titanic';
                    // $scope.setData();


                    d3Service.d3().then(function(d3) {
                        d3.tsv("data/Titanic.txt", function(error, tdata) {
                            var count = 0;

                            tdata.map(function(d) {
                                d.id = count;
                                count += 1;
                            })

                            $scope.nomaData = tdata;
                            $scope.nomaConfig.dims = d3.keys(tdata[0]);

                            var index = $scope.nomaConfig.dims.indexOf("id");
                            $scope.nomaConfig.dims.splice(index, 1);

                            $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                            $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                            $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];


                            $scope.$apply();



                        });
                    });



                }; //End  $scope.changeActiveDataTitanic()

                $scope.changeActiveDataTitanic();




                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                ///////////////////////////////////////////////////////////
                // change Active Data to the Bayesian Inference-Mammogram;

                $scope.changeActiveDataMammo = function() {

                    //Config settings
                    var numberOfEntity = 1000;
                    var numDiscreteVar = 60;

                    $scope.activeData = 'Bayesian Inference - Mammogram';
                    // $scope.nomaConfig.data.isMammo = true;
                    //  $scope.setData();

                    var data = [];

                    for (var count = 0; count < numberOfEntity; count++) {

                        var temp = new Object();

                        temp.id = count;

                        // temp.continous_variable1 = Math.random();
                        //temp.continous_variable2 = Math.random();
                        temp.discrete_variable = Math.round(Math.random() * (numDiscreteVar - 1));

                        if (Math.random() > 0.3) {
                            temp.nominal_variable = 'Male';
                        } else {
                            temp.nominal_variable = 'Female';
                        }

                        if (Math.random() > 0.99) {
                            temp.cancer = 'Cancer';

                            if (Math.random() > 0.8) {
                                temp.mamo = 'Negative Mamo';
                            } else {
                                temp.mamo = 'Positive Mamo';
                            }

                        } else {
                            temp.cancer = 'No Cancer';

                            if (Math.random() > 0.096) {
                                temp.mamo = 'Negative Mamo';
                            } else {
                                temp.mamo = 'Positive Mamo';
                            }
                        }

                        temp.descriptor = temp.cancer + ", " + temp.mamo;

                        // if (temp.continous_variable1 * temp.continous_variable2 > 0.7) {
                        //     temp.selection_variable = 'Group 1';

                        // } else if (temp.continous_variable1 * temp.continous_variable2 > 0.5) {
                        //     temp.selection_variable = 'Group 1 & 2';
                        // } else if (temp.continous_variable1 * temp.continous_variable2 > 0.3) {
                        //     temp.selection_variable = 'Group 2';
                        // } else {
                        //     temp.selection_variable = 'None';
                        // }


                        data.push(temp);
                    }

                    $scope.nomaData = data;
                    $scope.nomaConfig.dims = d3.keys(data[0]);

                    var index = $scope.nomaConfig.dims.indexOf("id");
                    $scope.nomaConfig.dims.splice(index, 1);

                    $scope.nomaConfig.xDim = $scope.nomaConfig.dims[0];
                    $scope.nomaConfig.yDim = $scope.nomaConfig.dims[1];
                    $scope.nomaConfig.colorDim = $scope.nomaConfig.dims[2];

                    // $scope.$apply();


                }; //End  $scope.changeActiveDataMammo()


                $scope.loadData = function() {


                    switch (this.loadedData) {

                        case 'titanic':
                            $scope.changeActiveDataTitanic();
                            break;
                        case 'mammo':
                            $scope.changeActiveDataMammo();
                            break;

                    }



                };



            }
        ]);



}());