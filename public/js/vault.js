 
var app = angular.module("vault", []).config(function($interpolateProvider){$interpolateProvider.startSymbol('({(').endSymbol(')})')});

app.controller("VaultController", function($scope, $http){
	$scope.actualModel;
	$scope.viewName = "";
	$scope.viewCheck = null;
	$scope.versionName = "";
	$scope.versionCheck = null;
	$scope.selectedVersion = null;
	$scope.selectedView = null;
	$scope.selectedField = null;
	$scope.otherElements = [];
	$scope.otherHubs = [];
	$scope.otherLinks = [];
	$scope.otherSatellites = [];
	$scope.elementConfiguration;
	
	$scope.checkView = function(){
		if($scope.viewName == null || $scope.viewName.length == 0) $scope.viewCheck = "The view name must not be empty";
		else {
			var alreadyExisting = false;
			
			for(var i = 0; i< $scope.actualModel.views.length; i++) {
				if($scope.actualModel.views[i].name == $scope.viewName) {
					alreadyExisting = true;
					break;
				}
			}
			
			if(alreadyExisting) $scope.viewCheck = "A view with this name already exists.";
			else $scope.viewCheck = null;
		}
		
		if($scope.viewCheck) {
			$('#alertViewName').text($scope.viewCheck);
			$('#alertViewName').removeClass("hidden");
			$('#saveViewButton').prop('disabled', true);
		}
		else {
			$('#alertViewName').addClass("hidden");
			$('#saveViewButton').prop('disabled', false);
		}
	};
	
	$scope.checkVersion = function(){
		if($scope.versionName == null || $scope.versionName.length == 0) $scope.versionCheck = "The version name must not be empty";
		else {
			var alreadyExisting = false;
			
			for(var i = 0; i< $scope.actualModel.versions.length; i++) {
				if($scope.actualModel.versions[i].name == $scope.versionName) {
					alreadyExisting = true;
					break;
				}
			}
			
			if(alreadyExisting) $scope.versionCheck = "A version with this name already exists.";
			else $scope.versionCheck = null;
		}
		
		if($scope.versionCheck) {
			$('#alertVersionName').text($scope.versionCheck);
			$('#alertVersionName').removeClass("hidden");
			$('#saveVersionButton').prop('disabled', true);
		}
		else {
			$('#alertVersionName').addClass("hidden");
			$('#saveVersionButton').prop('disabled', false);
		}
	};
	
	$scope.addView = function(){
		if(dirty) {
			var saveChanges = confirm("There are unsaved changes in this view. Doy yout want to save them?");
			if(saveChanges) $scope.saveView();
		}
		
		
		$scope.actualModel.views.push({name:$scope.viewName, elements:[], connections:[]});
		var newView = $scope.actualModel.views[$scope.actualModel.views.length - 1];
		
		$scope.selectedView = newView;
		selectView(newView);
				
		// set the view name back to the empty string as preparation for adding the next view
			
		$scope.viewName = "";
	};
	
	$scope.addVersion = function(){
		var timestamp = new Date();
		
		$http.post("/create/" + $scope.actualModel._id, {version:$scope.versionName, timestamp:timestamp}).then(function(result){
			console.log(result);
			$scope.actualModel.versions.push({name:$scope.versionName, timestamp:timestamp, artefacts:result.data});
			
			$scope.selectedVersion = $scope.actualModel.versions[$scope.actualModel.versions.length - 1];
			
			$('.versionHeader').removeClass('active');
			$('.versionHeader').filter(function(index){return $(this).attr('version') == $scope.versionName;}).addClass('active');
		});
		
	};
	
	$scope.selectVersion = function(version){
		if(version != $scope.selectedVersion) {
			$scope.selectedVersion = version;
		}
		
		$('.versionHeader').removeClass('active');
		$('.versionHeader').filter(function(index){return $(this).attr('version') == version.name;}).addClass('active');
	};
	
	$scope.downloadVersion = function(){
		window.open('/artefacts/' + $scope.actualModel._id + "/" + $scope.selectedVersion.name, 'Artefact List');
	}
	
	$scope.selectView = function(view){
		
		if(view != $scope.selectedView || $scope.actualModel.views.length == 1) {
			if(dirty) {
				var saveChanges = confirm("There are unsaved changes in this view. Doy yout want to save them?");
				if(saveChanges) $scope.saveView();
			}
			
			$scope.selectedView = view;
			selectView(view, $scope.actualModel.views);
			
			$scope.otherHubs = [];
			$scope.otherLinks = [];
			$scope.otherSatellites = [];
			
			for(var i = 0; i < $scope.actualModel.views.length; i++) {
				var v = $scope.actualModel.views[i];
				
				if(v != $scope.selectedView) {
					
					for(var j = 0; j < v.elements.length; j++) {
						var e = v.elements[j];
						if(!e.reference && e.kind == "hub") $scope.otherHubs.push({element:e, view:v.name});
						if(!e.reference && e.kind == "link") $scope.otherLinks.push({element:e, view:v.name});
						if(!e.reference && e.kind == "satellite") $scope.otherSatellites.push({element:e, view:v.name});
					}
				}
			}
		}
	};
	
	$scope.removeView = function(){
		if($scope.selectedView != null) {
			
			for(var i = 0; i < $scope.actualModel.views.length;i++){
				if($scope.actualModel.views[i] == $scope.selectedView) {
					$scope.actualModel.views.splice(i,1);
					break;
				}
			}
			
			$scope.selectedView = null;
		}
	};
	
	$scope.saveView = function(){
		$scope.selectedView.elements = saveElements();
		$scope.selectedView.connections = saveConnections();
		cleanView();
		
		for(var i = 0; i < $scope.actualModel.views.length; i++) {
			if($scope.actualModel.views[i].name == $scope.selectedView.name) {
				$scope.actualModel.views[i] = $scope.selectedView;
				break;
			}
		}
		
		$http.post("/model/" + $scope.actualModel._id, $scope.actualModel).then(function(result){
			if(result.data.status == "ok") alert('View was saved successfully');
			else alert("Error: " + result.data.status.error);
		});
		
	};
	
	$scope.addReference = function(e) {
		addReference(e);
	};
	
	$scope.addField = function() {
		$scope.elementConfiguration.fields.push({name:null, precision:null, scale:null, notNull:false, dataTypes:$scope.actualModel.properties.dataTypes});
	};
	
	$scope.selectField = function(f) {
		$('.fieldEditor').removeClass('info');
		$('.fieldEditor').filter(function(index){return $(this).children('.fieldNameInput').val() == f.name;}).addClass('info');
		$scope.selectedField = f;
	};
	
	$scope.chooseDatatype = function(dt) {
		$scope.selectedField.dataType = dt.dataType;
		
		if(dt.scale) $scope.selectedField.scaleVisible = true;
		else $scope.selectedField.scaleVisible = false;
		
		if(dt.length || dt.precision) $scope.selectedField.precisionVisible = true;
		else $scope.selectedField.precisionVisible = false;
	};
	
	$scope.removeField = function() {
		for(var i = 0; i < $scope.elementConfiguration.fields.length; i++) {
			if($scope.elementConfiguration.fields[i]== $scope.selectedField) {
				$scope.elementConfiguration.fields.splice(i,1);
				$scope.selectedField = null;
				break;
			}
		}
	};
	
	$scope.prepareReference = function(kind) {
		if(kind == "hub") $scope.otherElements = $scope.otherHubs;
		else if(kind == "link") $scope.otherElements = $scope.otherLinks;
		else $scope.otherElements = $scope.otherSatellites;
	}
	
	$http.get("/model").then(function(result){
		$scope.actualModel = result.data;
		if($scope.actualModel.views.length > 0) {
			$scope.selectedView = $scope.actualModel.views[0];
			$scope.selectedView.active = true;
			selectView($scope.actualModel.views[0], $scope.actualModel.views);
		}
	});  
});

function selectView(aView, views) {
	var id = nextFreeId(views);
	loadView(aView, id);
}

function nextFreeId(views) {
	var id = 0;
	for(var i = 0; i < views.length; i++) {
		for(var j = 0; j < views[i].elements.length; j++) {
			if(views[i].elements[j].elementId > id) id = views[i].elements[j].elementId;
		}
	}
	
	id++;
	
	return id;
}