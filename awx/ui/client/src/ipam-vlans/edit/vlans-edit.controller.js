/*************************************************
 * Copyright (c) 2016 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/

import { N_ } from "../../i18n";

const status_options = [
	{value:1, label:'Active'}, 
	{value:2, label:'Reserved'}, 
	{value:3, label:'Deprecated'}
];

export default ['$scope', '$rootScope', '$stateParams', 'VLanForm', 'Rest',
    'ProcessErrors', 'GetBasePath', 'Wait', 'CreateSelect2',
    '$state', 'i18n',
    function($scope, $rootScope, $stateParams, VLanForm, Rest, ProcessErrors,
		GetBasePath, Wait, CreateSelect2, $state, i18n) {

        var form = VLanForm,
            master = {},
            id = $stateParams.vlan_id,
            defaultUrl = GetBasePath('ipam_vlans') + id;
        
        init();

        function init() {

            Rest.setUrl(defaultUrl);
            Wait('start');
            Rest.get(defaultUrl).then(({data}) => {
            		
                    $scope.vlan_id = id;
                    $scope.vlan_obj = data;
					$scope.name =  data.name;
					$scope.description =  data.description;
					$scope.vid = data.vid;
					var datacenter_value = data.datacenter;
					var status_value = data.status;

					//setScopeFields(data);
			        var datacenter_options = [];
					var datacenterLists = [];
			    	Rest.setUrl(GetBasePath('ipam_datacenters'));
			        Rest.get().then(({data}) => {
			        	datacenterLists = data.results;
			        	for (var i = 0; i < datacenterLists.length; i++) {
			        		datacenter_options.push({label:datacenterLists[i].name, value:datacenterLists[i].id});
			        	}
			        	$scope.datacenter_type_options = datacenter_options;
			            for (var i = 0; i < datacenter_options.length; i++) {
			                if (datacenter_options[i].value === datacenter_value) {
			                    $scope.datacenter = datacenter_options[i];
			                    break;
			                }
			            }
			            
			        })
			    	.catch(({data, status}) => {
			        	ProcessErrors($scope, data, status, form, { hdr: i18n._('Error!'), msg: i18n._('Failed to get Datacenters. Get returned status: ') + status });
					});

					$scope.status_type_options = status_options;
					$scope.status = status_options[0];
					for (var i = 0; i < status_options.length; i++) {
		                if (status_options[i].value === status_value) {
		                    $scope.status = status_options[i];
		                    break;
		                }
		            }
										
		            CreateSelect2({
		                element: '#vlan_datacenter',
		                multiple: false,
		            }); 

					CreateSelect2({
		                element: '#vlan_status',
		                multiple: false,
		            });
					//Set SelectBox End
	
                    Wait('stop');
                })
                .catch(({data, status}) => {
                    ProcessErrors($scope, data, status, null, {
                        hdr: i18n._('Error!'),
                        msg: i18n.sprintf(i18n._('Failed to retrieve VLan: %s. GET status: '), $stateParams.id) + status
                    });
                });

        }
        
		function setScopeFields(data) {
            _(data)
                .pick(function(value, key) {
                    return form.fields.hasOwnProperty(key) === true;
                })
                .forEach(function(value, key) {
                    $scope[key] = value;
                })
                .value();
            return;
        }

        // prepares a data payload for a PUT request to the API
        var processNewData = function(fields) {
            var data = {};
            _.forEach(fields, function(value, key) {
                if ($scope[key] !== '' && $scope[key] !== null && $scope[key] !== undefined) {
                    data[key] = $scope[key];
                }
            });
            
            data.datacenter = $scope.datacenter.value;
    		if($scope.vrf != null) data.vrf = $scope.vrf.value;
    		data.status = $scope.status.value;
            return data;
        };

        $scope.toggleForm = function(key) {
            $scope[key] = !$scope[key];
        };


        $scope.formCancel = function() {
            $state.go('ipamVlansList', null, { reload: true });
        };

        $scope.formSave = function() {
            $rootScope.flashMessage = null;
            if ($scope[form.name + '_form'].$valid) {
                Rest.setUrl(defaultUrl + '/');
                var data = processNewData(form.fields);
                Rest.put(data).then(() => {
                        $state.go($state.current, null, { reload: true });
                    })
                    .catch(({data, status}) => {
                        ProcessErrors($scope, data, status, null, {
                            hdr: i18n._('Error!'),
                            msg: i18n.sprintf(i18n._('Failed to retrieve VLan: %s. GET status: '), $stateParams.id) + status
                        });
                    });
            }
        };
    }
];
