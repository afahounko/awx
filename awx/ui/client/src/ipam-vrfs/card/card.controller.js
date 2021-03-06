/*************************************************
 * Copyright (c) 2015 Ansible, Inc.
 *
 * All Rights Reserved
 *************************************************/


export default
	['Wait', 'CreateDialog', 'GetBasePath', 'Rest', 'ProcessErrors', '$rootScope', '$state',
		'$scope', '$filter', 'CreateSelect2', 'i18n', '$transitions', 'Prompt',
		function (Wait, CreateDialog, GetBasePath, Rest, ProcessErrors, $rootScope, $state,
			$scope, $filter, CreateSelect2, i18n, $transitions, Prompt, qs) {

			var defaultUrl = GetBasePath('ipam_vrfs');
			// var datacenter_id;
			$scope.edit_id = 0;

			//Variable for Alerting Fill in
			$scope.nameDirty = false;

			$scope.tabId = 1;
			$scope.searchExamples = ["id:>10", "created:>=2000-01-01T00:00:00Z", "created:<2000-01-01", "name:foobar"];
			$scope.keyFields = ["name", "description", "site", "location", "facility", "physical_address", "shipping_address", "contact_name", "contact_phone", "contact_email", "comments"];
			$scope.pageSize = 20;

			var getIpamVrfs = function () {
				console.log("getIpamVrfs called");
				Rest.setUrl(defaultUrl + "?order_by=name");
				Rest.get()
					.then(({ data }) => {
						$scope.apidataLists = data.results;
						console.log("getIpamVrfs called then");
						Wait('stop');
						
					    CreateSelect2({
	                        element: '#vrfs_datacenter_type',
	                        multiple: false
	                    });
					})
					.catch(({ data, status }) => {
						ProcessErrors($scope, data, status, null, {
							hdr: i18n._('Error!'),
							msg: i18n.sprintf(i18n._('Call to %s failed. Return status: %d'), (defaultUrl === undefined) ? "undefined" : defaultUrl, status)
						});
					});
			};

			$scope.loadDatacenter = function() {
				Rest.setUrl(GetBasePath('ipam_datacenters') + "?order_by=name");
				Rest.get()
					.then(({ data }) => {
						$scope.VRFDatacenters = data.results;
						console.log($scope.VRFDatacenters);

						Wait('stop');
					})
					.catch(({ data, status }) => {
						ProcessErrors($scope, data, status, null, {
							hdr: i18n._('Error!'),
							msg: i18n.sprintf(i18n._('Call to %s failed. Return status: %d'), (defaultUrl === undefined) ? "undefined" : defaultUrl, status)
						});
					});
			};
			getIpamVrfs();
			$scope.loadDatacenter();

			$scope.showKeyPane = false;
			/* Pane variables  (Title, Button Name, ...)*/
			$scope.showPane = false;

			$scope.toggleKeyPane = function () {
				$scope.showKeyPane = !$scope.showKeyPane;
			};

			$scope.selected1 = "is-selected";
			$scope.TabClick = function (tabId) {
				$scope.tabId = tabId;
				if (tabId == 1) {
					$scope.selected1 = "is-selected";
					$scope.selected2 = "";
					$scope.selected3 = "";
				}
				else if (tabId == 2) {
					$scope.selected1 = "";
					$scope.selected2 = "is-selected";
					$scope.selected3 = "";

				}
				else if (tabId == 3) {
					$scope.selected1 = "";
					$scope.selected2 = "";
					$scope.selected3 = "is-selected";
				}
			};

			$scope.formCancel = function () {
				resetUi();
				$scope.showPane = false;
			};

			var resetUi = function () {

				$scope.TabClick(1);

				$scope.vrfs_name = "";
				$scope.description = "";
				$scope.rd = "";
				$scope.enforce_unique = false;
				$scope.vrfs = "";
				$scope.datacenter = "";
				$scope.edit_id = 0;
				$scope.loadDatacenter();
			}

			$scope.formCreate = function () {
				$scope.paneType = 1;	//Set as New

				$scope.paneTitle = "New VRF";

				resetUi();

				$scope.submitTitle = "Create a New";
				$scope.showPane = true;
				console.log($scope.apidataLists);
			}

			$scope.editClick = function (param) {
				$scope.paneType = 2;	//Set as Edit
				$scope.edit_id = param;

				Rest.setUrl(defaultUrl + $scope.edit_id + '/');
				console.log("Url = " + defaultUrl + $scope.edit_id + '/');
				Rest.get()
					.then(({ data }) => {

						$scope.paneTitle = "Edit VRF / " + data.name;

						$scope.vrfs_name =  data.name;
						$scope.description =  data.description;
						$scope.rd =  data.rd;
						$scope.enforce_unique =  data.enforce_unique;
						$scope.vrfs =  data.vrfs;
						// $scope.datacenter = "" + data.datacenter;
						if(data.datacenter > 0) $scope.datacenter = data.datacenter.toString();
						console.log("Edit DataID = " + $scope.datacenter);

						$scope.submitTitle = "Update";
						$scope.editselected = "List-editButton--selected";
						$scope.showPane = true;

						Wait('stop');
					})
					.catch(({ data, status }) => {
						ProcessErrors($scope, data, status, null, {
							hdr: i18n._('Error!'),
							msg: i18n.sprintf(i18n._('Call to %s failed. Return status: %d'), (defaultUrl === undefined) ? "undefined" : defaultUrl, status)
						});
					});

			}

			/* Include all function as New, Update*/
			$scope.formSubmit = function () {
				console.log($scope.vrfs_name);
				if ($scope.vrfs_name) {
					if ($scope.paneType == 1) {
						//Create New Event
						var vrfs = {
							'name': $scope.vrfs_name, 'description': $scope.description, 'rd': $scope.rd, 'enforce_unique': $scope.enforce_unique, 'datacenter': $scope.datacenter
						};

						Rest.setUrl(defaultUrl);
						Rest.post(vrfs)
							.then(({ data }) => {
								getIpamVrfs();
								resetUi();
								$scope.showPane = false;
							})
							.catch(({ data, status }) => {
								ProcessErrors($scope, data, status, null, {
									hdr: i18n._('Error!'),
									msg: i18n.sprintf(i18n._('Call to %s failed. Return status: %d'), (defaultUrl === undefined) ? "undefined" : defaultUrl, status)
								});
							});


					}
					else {
						//Edit Submit (Update) Event.
						var vrfs = {
							'name': $scope.vrfs_name, 'description': $scope.description, 'rd': $scope.rd, 'enforce_unique': $scope.enforce_unique, 'datacenter': $scope.datacenter
						};

						Rest.setUrl(defaultUrl + $scope.edit_id + '/');
						Rest.put(vrfs)
							.then(({ data }) => {
								getIpamVrfs();
								resetUi();
								$scope.showPane = false;
							})
							.catch(({ data, status }) => {
								ProcessErrors($scope, data, status, null, {
									hdr: i18n._('Error!'),
									msg: i18n.sprintf(i18n._('Call to %s failed. Return status: %d'), (defaultUrl === undefined) ? "undefined" : defaultUrl, status)
								});
							});
					}
				}
				else {
					$scope.TabClick(1);
				}
			}

			var deleteId;
			$scope.showModal = false;

			$scope.modal_cancel = function () {
				$scope.showModal = false;
			}

			$scope.deletevrfs = function (id, name) {
				var action = function () {
					$('#prompt-modal').modal('hide');
					Wait('start');
					Rest.setUrl(defaultUrl + id + '/');
					Rest.destroy()
						.then(() => {
							getIpamVrfs();
						});
				}
				Prompt({
					hdr: i18n._('Delete'),
					resourceName: $filter('sanitize')(name),
					body: '<div class="Prompt-bodyQuery">' + i18n._('Are you sure you want to delete this vrfs?') + '</div>',
					action: action,
					actionText: i18n._('DELETE')
				});
			}

			$scope.sortColumn = "name";
			$scope.reverseSort = false;

			$scope.sortData = function (column) {
				$scope.reverseSort = ($scope.sortColumn == column) ? !$scope.reverseSort : false;
				$scope.sortColumn = column;
			}

			$scope.getSortClass = function (column) {
				if ($scope.sortColumn == column) {
					return $scope.reverseSort ? 'fa-sort-down' : 'fa-sort-up';
				}
				return 'fa-sort';
			}

			$scope.searchList = [];
			$scope.filterString = "{name:'1'}";
			$scope.addTerms = function (searchTerm) {
				$scope.filterString = "{name:'test'}";
				if (searchTerm != undefined && $scope.searchList.indexOf(searchTerm) === -1) {
					$scope.searchTags = true;
					if (searchTerm.indexOf(':') === -1)
					{
						$scope.filterString = "{name:'" + searchTerm + "'}";
					}
					else
					{
						$scope.filterString = searchTerm.split(':')[0] + ":'" + searchTerm.split(':')[1] + "'";
					}
					$scope.searchList.push(searchTerm);
					//console.log($scope.searchTags);
				}
				console.log($scope.filterString);
				console.log($scope.searchList);
			}
			$scope.removeTerm = function (index) {
				$scope.searchList.splice(index,1);
				if($scope.searchList.length === 0)
					$scope.searchTags = true;
			}
			$scope.clearAllTerms = function () {
				$scope.searchList.splice(0, $scope.searchList.length);
				$scope.searchTags = false;
			}
			$scope.showList = function(item) {
				return $scope.searchList.indexOf(item.name) !== -1;
			}
		}
	];
