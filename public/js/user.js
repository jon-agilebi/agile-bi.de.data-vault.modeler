 
var userApp = angular.module("user", []).config(function($interpolateProvider){$interpolateProvider.startSymbol('({(').endSymbol(')})')});

userApp.controller("UserController", function($scope, $http){
	$scope.user;
	$scope.groups;
	$scope.selectedUser = "";
	$scope.selectedMember = "";
	$scope.selectedGroup;
	$scope.groupName = "";
	
	$scope.addGroup = function(){
		$http.get("/create/group/" + $scope.groupName).then(function(result){
			$scope.groups.push({name:$scope.groupName, member:[]});
		});
	};
	
	$scope.removeGroup = function(){
		for(var i = 0; i < $scope.groups.length; i++) {
			if($scope.groups[i] == $scope.selectedGroup) {
				var groupIndex = i;
				$http.get("/remove/group/" + $scope.groups[i].name).then(function(result){
					$scope.groups.splice(groupIndex,1);
				});
			}
		}
	};
	
	$scope.selectGroup = function(group){
		$scope.selectedGroup = group;
		
		$('.memberOverview').removeClass('alert');
		$('.memberOverview').removeClass('alert-info');
		$('.memberOverview').filter(function(index){return $(this).attr('marker') == group.name;}).addClass('alert');
		$('.memberOverview').filter(function(index){return $(this).attr('marker') == group.name;}).addClass('alert-info');
	};
	
	$scope.addToGroup = function(){
		if($scope.selectedUser && $scope.selectedGroup) {
			for(var i = 0; i < $scope.groups.length; i++) {
				if($scope.groups[i] == $scope.selectedGroup && $scope.groups[i].member.indexOf($scope.selectedUser) < 0) {
					var index = i;
					$http.get("/member/add/" + $scope.selectedUser.user + "/" + $scope.selectedGroup.name).then(function(result){
						$scope.groups[index].member.push({user:$scope.selectedUser.user, role:"simple"});
						
					});
				}
			}
		}
	};
	
	$scope.removeFromGroup = function(){
		if($scope.selectedMember) {
			for(var i = 0; i < $scope.groups.length; i++) {
				for(var j = 0; j < $scope.groups[i].member.length; j++) {
					if($scope.groups[i].member[j] == $scope.selectedMember) {
						var groupIndex = i;
						var memberIndex = j;
						$http.get("/member/remove/" + $scope.selectedMember.user + "/" + $scope.groups[i].name).then(function(result){
							$scope.groups[groupIndex].member.splice(memberIndex, 1);
						});
						break;
					}	
				}
			}
		}
		
	};
	
	$scope.selectUser = function(user){
		$scope.selectedUser = user;
		$('.userItem').removeClass('active');
		$('.userItem').filter(function(index){return $(this).text() == user.user;}).addClass('active');
	};
	
	$scope.selectMember = function(member){
		$scope.selectedMember = member;
		$('.memberItem').removeClass('active');
		$('.memberItem').filter(function(index){return $(this).text() == member.user;}).addClass('active');
	};
	
	$scope.changeRole = function(){
		if($scope.selectedMember) {
			for(var i = 0; i < $scope.groups.length; i++) {
				for(var j = 0; j < $scope.groups[i].member.length; j++) {
					if($scope.groups[i].member[j] == $scope.selectedMember) {
						var groupIndex = i;
						var memberIndex = j;
						$http.get("/member/change/" + $scope.selectedMember.user + "/" + $scope.groups[i].name).then(function(result){
							if($scope.selectedMember.role == "simple") {
								$scope.selectedMember.role ="advanced"; 
								$scope.selectedMember.icon ="glyphicon-king";
							}
							else {
								$scope.selectedMember.role ="simple"; 
								$scope.selectedMember.icon ="glyphicon-pawn";
							}
						});
						break;
					}	
				}
			}
		}
	};
	
	$http.get("/user/data").then(function(result){
		$scope.user = result.data.user;
		$scope.groups = result.data.groups;
	});  
});