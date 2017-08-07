angular.module('cartoview.viewer.editor').directive('geoformConfig', function (urlsHelper) {
    var fieldTypes = [{
        label: "Text",
        name: "text",
        allowedDataTypes: ["string"]
    }, {
        label: "Multi-line Text",
        name: "textarea",
        allowedDataTypes: ["string"]
    }, {
        label: "Number",
        name: "number",
        allowedDataTypes: ["number"]
    }, {
        label: "Checkbox",
        name: "chekbox",
        allowedDataTypes: ["number", "boolean"]
    }, {
        label: "Drop Down List",
        name: "select",
        allowedDataTypes: ["string", "number"]
    }, {
        label: "Checkbox List",
        name: "checkboxList",
        allowedDataTypes: ["string"]
    }, {
        label: "Radio Button List",
        name: "radioList",
        allowedDataTypes: ["string", "number"]
    }, {
        label: "Date",
        name: "datatime",
        allowedDataTypes: ["datatime"]
    }];
    var initialTypeMapping = {
        string: "text",
        double: "number",
        int: "number",
        long: "number",
        boolean: "checkbox",
        datetime: "datetime"
    };

    function getDataType(attribute) {
        return attribute.attribute_type.split(":").pop().toLowerCase();
    }

    function CSAttributeDialogController($scope, $mdDialog, attribute) {
        $scope.fieldTypes = fieldTypes
        $scope.attribute = attribute;
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.isMultibleChoice = function (t) {
            return ['select', 'checkboxList', 'radioList'].indexOf(t) != -1;
        };
        $scope.removeOption = function (index) {
            attribute.options.slice(index, index + 1)
        }
    }

    return {
        transclude: true,
        replace: true,
        templateUrl: urlsHelper.static + "cartoview_geoform/angular-templates/config-fields.html?" + new Date().getTime(),
        controller: function ($scope, dataService, $tastypieResource, $mdDialog) {
            $scope.attributes = new $tastypieResource("geonodelayerattribute");
            $scope.instanceObj = dataService.instanceObj;
            $scope.config =  $scope.instanceObj.config || {};
            $scope.config.attachments = $scope.config.attachments || {
                    enabled: false,
                    label: "Attachments",
                    multiple: false
                };
            delete $scope.instanceObj.config.featureList;

            $scope.mapLayers = [];
            $scope.layerAttributes = {};
            var layersDict = {};
            var initialized = false;
            var populateLayers = function () {
                $scope.mapLayers = [];
                if (dataService.selected.map) {
                    angular.forEach(dataService.selected.map.map_layers, function (layer) {
                        if (!layer.fixed) {
                            layer.params = JSON.parse(layer.layer_params);
                            layersDict[layer.name] = layer;
                            var layerInfo = {
                                name: layer.name,
                                title: layer.params.title
                            };
                            $scope.mapLayers.push(layerInfo);
                        }
                    });
                }

                if ($scope.config.layer && !$scope.config.attributes) {
                    initAttributes()
                }
            };
            dataService.onMapSelect(function () {
                $scope.config = $scope.instanceObj.config = {};
                populateLayers();
            });
            var initAttributes = function () {
                $scope.attributes.objects.$find({layer__typename: $scope.config.layer}).then(function () {
                    var attributes = [];
                    angular.forEach($scope.attributes.page.objects, function (a) {
                        if (a.attribute_type.indexOf("gml") == 0) {
                          $scope.config.geometryName = a.attribute;
                          return;
                        }
                        var dataType = getDataType(a);
                        attributes.push({
                            included: true,
                            name: a.attribute,
                            label: a.attribute_label || a.attribute,
                            placeholder: a.attribute_label || a.attribute,
                            helpText: "",
                            required: false,
                            defaultValue: null,
                            options: [],
                            dataType: dataType,
                            fieldType: initialTypeMapping[dataType] || "text"
                        });
                    });
                    $scope.config.attributes = attributes;
                });
            };

            $scope.changeLayer = function () {
                initAttributes();
            };
            $scope.isGeometryAttribute = function (attribute) {
                return attribute.attribute_type.indexOf("gml") == 0;
            };
            populateLayers();
            $scope.showAttributeSettings = function (ev, attribute) {
                $mdDialog.show({
                    controller: CSAttributeDialogController,
                    templateUrl: urlsHelper.static + 'cartoview_collector/angular-templates/attribute-settings-dialog.html?' + new Date().getTime(),
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    locals: {
                        attribute: attribute,
                        parentScope: $scope
                    }
                }).then(function (answer) {
                    $scope.status = 'You said the information was "' + answer + '".';
                }, function () {
                    $scope.status = 'You cancelled the dialog.';
                });


            }


        }
    }
});
