
var elements = [];
var connections = [];
var allMarker = [];
var icons = [];
var focus;
var toBeEdited;
var focusedConnection;
var origin;
var nextId = 0;
var lineToDraw;
var startOfLine;
var tool;
var source = null;
var dirty = false;

function drawHubIcon(paper, w, h, s) {
	
	var items = [];
	
	with (paper) {
		var outerCircle = new Path.Circle(new Point(32 * s + w, 32 * s + h), 32 * s);
		outerCircle.fillColor = 'black';
		var innerCircle = new Path.Circle(new Point(32 * s + w, 32 * s + h), 12 * s);
		innerCircle.fillColor = 'white';
		
		items.push(innerCircle);
		items.push(outerCircle);
		
		var upperTriangle = new Path();
		upperTriangle.fillColor = 'white';
		upperTriangle.add(new Point(27 * s + w, 16 * s + h));
		upperTriangle.add(new Point(37 * s + w, 16 * s + h));
		upperTriangle.add(new Point(32 * s + w, 6 * s + h));
		upperTriangle.closed = true;
		
		items.push(upperTriangle);
		
		var rightTriangle = new Path();
		rightTriangle.fillColor = 'white';
		rightTriangle.add(new Point(48 * s + w, 27 * s + h));
		rightTriangle.add(new Point(58 * s + w, 32 * s + h));
		rightTriangle.add(new Point(48 * s + w, 37 * s + h));
		rightTriangle.closed = true;
		
		items.push(rightTriangle);
		
		var lowerTriangle = new Path();
		lowerTriangle.fillColor = 'white';
		lowerTriangle.add(new Point(27 * s + w, 48 * s + h));
		lowerTriangle.add(new Point(37 * s + w, 48 * s + h));
		lowerTriangle.add(new Point(32 * s + w, 58 * s + h));
		lowerTriangle.closed = true;
		
		items.push(lowerTriangle);
		
		var leftTriangle = new Path();
		leftTriangle.fillColor = 'white';
		leftTriangle.add(new Point(16 * s + w, 27 * s + h));
		leftTriangle.add(new Point(6 * s + w, 32 * s + h));
		leftTriangle.add(new Point(16 * s + w, 37 * s + h));
		leftTriangle.closed = true;
		
		items.push(leftTriangle);
		
		view.draw();
	}	
	
	return items;
}		

function drawLinkIcon(paper, w, h, s) {
	
	var items = [];
	
	with (paper) {
		var link1 = new Path();
		link1.strokeColor = 'black';
		link1.strokeWidth = 3 * s;
		link1.add(new Point(15 * s + w, 23 * s + h));
		link1.add(new Point(12 * s + w, 15 * s + h));
		link1.add(new Point(18 * s + w, 11 * s + h));
		link1.add(new Point(27 * s + w, 21 * s + h));
		link1.add(new Point(23 * s + w, 26 * s + h));
		link1.smooth();
		items.push(link1);
		
		var link2 = new Path();
		link2.strokeColor = 'black';
		link2.strokeWidth = 3 * s;
		link2.add(new Point(22 * s + w, 20 * s + h));
		link2.add(new Point(18 * s + w, 29 * s + h));
		link2.add(new Point(27 * s + w, 38 * s + h));
		link2.add(new Point(35 * s + w, 35 * s + h));
		link2.smooth();
		items.push(link2);
		
		var link3 = new Path();
		link3.strokeColor = 'black';
		link3.strokeWidth = 3 * s;
		link3.add(new Point(30 * s + w, 32 * s + h));
		link3.add(new Point(38 * s + w, 30 * s + h));
		link3.add(new Point(45 * s + w, 40 * s + h));
		link3.add(new Point(40 * s + w, 48 * s + h));
		link3.add(new Point(35 * s + w, 44 * s + h));
		link3.smooth();
		items.push(link3);
		
		view.draw();
	}
	
	return items;
}

function drawSatelliteIcon(paper, w, h, s) {
	
	var items = [];
	
	with (paper) {
		
		var center = new Point(32 * s + w, 32 * s + h)
		var top = new Path();
		top.fillColor = 'black';
		top.add(new Point(28 * s + w, 8 * s + h));
		top.add(new Point(36 * s + w, 8 * s + h));
		top.add(new Point(36 * s + w, 28 * s + h));
		top.add(new Point(28 * s + w, 28 * s + h));
		top.closed = true;
		top.rotate(325, center);
		items.push(top);
		
		var core = new Path();
		core.fillColor = 'black';
		core.add(new Point(28 * s + w, 28 * s + h));
		core.add(new Point(36 * s + w, 28 * s + h));
		core.add(new Point(42 * s + w, 30 * s + h));
		core.add(new Point(48 * s + w, 40 * s + h));
		core.add(new Point(16 * s + w, 40 * s + h));
		core.add(new Point(24 * s + w, 30 * s + h));
		core.closed = true;
		core.smooth();
		core.rotate(325, center);
		items.push(core);
		
		var horizontalLeft = new Path();
		horizontalLeft.fillColor = 'black';
		horizontalLeft.add(new Point(16 * s + w, 16 * s + h));
		horizontalLeft.add(new Point(26 * s + w, 16 * s + h));
		horizontalLeft.add(new Point(26 * s + w, 20 * s + h));
		horizontalLeft.add(new Point(16 * s + w, 20 * s + h));
		horizontalLeft.closed = true;
		horizontalLeft.rotate(325, center);
		items.push(horizontalLeft);
		
		var horizontalRight = new Path();
		horizontalRight.fillColor = 'black';
		horizontalRight.add(new Point(38 * s + w, 16 * s + h));
		horizontalRight.add(new Point(48 * s + w, 16 * s + h));
		horizontalRight.add(new Point(48 * s + w, 20 * s + h));
		horizontalRight.add(new Point(38 * s + w, 20 * s + h));
		horizontalRight.closed = true;
		horizontalRight.rotate(325, center);
		items.push(horizontalRight);
		
		var vertical = new Path();
		vertical.fillColor = 'black';
		vertical.add(new Point(30 * s + w, 40 * s + h));
		vertical.add(new Point(34 * s + w, 40 * s + h));
		vertical.add(new Point(34 * s + w, 55 * s + h));
		vertical.add(new Point(30 * s + w, 55 * s + h));
		vertical.closed = true;
		vertical.rotate(325, center);
		items.push(vertical);
		
		view.draw();
	}
	
	return items;
}

function drawBridgeIcon(paper, w, h, s) {
	
	var items = [];
	
	with (paper) {
		
		var bridge = new Path();
		bridge.fillColor = 'black';
		bridge.add(new Point(0 * s + w, 32 * s + h));
		bridge.add(new Point(10 * s + w, 12 * s + h));
		bridge.add(new Point(54 * s + w, 12 * s + h));
		bridge.add(new Point(64 * s + w, 32 * s + h));
		bridge.add(new Point(44 * s + w, 32 * s + h));
		bridge.add(new Point(44 * s + w, 22 * s + h));
		bridge.add(new Point(20 * s + w, 22 * s + h));
		bridge.add(new Point(20 * s + w, 32 * s + h));
		bridge.closed = true;
		
		items.push(bridge);
		view.draw();
	}
	
	return items;
}

function drawReferenceIcon(paper, w, h, s) {
	
	var items = [];
	
	with (paper) {
		
		var outer = new Path();
		outer.strokeColor = 'black';
		outer.add(new Point(0 * s + w, 0 * s + h));
		outer.add(new Point(0 * s + w, 64 * s + h));
		outer.add(new Point(64 * s + w, 64 * s + h));
		outer.add(new Point(64 * s + w, 0 * s + h));
		outer.closed = true;
		
		items.push(outer);
		
		var left = new Path();
		left.fillColor = 'black';
		left.add(new Point(0 * s + w, 0 * s + h));
		left.add(new Point(0 * s + w, 64 * s + h));
		left.add(new Point(21 * s + w, 64 * s + h));
		left.add(new Point(21 * s + w, 0 * s + h));
		left.closed = true;
		
		items.push(left);
		
		var vertical = new Path();
		vertical.strokeColor = 'black';
		vertical.add(new Point(42 * s + w, 0 * s + h));
		vertical.add(new Point(42 * s + w, 64 * s + h));
		
		items.push(vertical);
		
		var h11 = new Path();
		h11.strokeColor = 'white';
		h11.add(new Point(0 * s + w, 16 * s + h));
		h11.add(new Point(21 * s + w, 16 * s + h));
		
		items.push(h11);
		
		var h12 = new Path();
		h12.strokeColor = 'black';
		h12.add(new Point(21 * s + w, 16 * s + h));
		h12.add(new Point(64 * s + w, 16 * s + h));
		
		items.push(h12);
		
		var h21 = new Path();
		h21.strokeColor = 'white';
		h21.add(new Point(0 * s + w, 32 * s + h));
		h21.add(new Point(21 * s + w, 32 * s + h));
		
		items.push(h21);
		
		var h22 = new Path();
		h22.strokeColor = 'black';
		h22.add(new Point(21 * s + w, 32 * s + h));
		h22.add(new Point(64 * s + w, 32 * s + h));
		
		items.push(h22);
		
		var h31 = new Path();
		h31.strokeColor = 'white';
		h31.add(new Point(0 * s + w, 48 * s + h));
		h31.add(new Point(21 * s + w, 48 * s + h));
		
		items.push(h31);
		
		var h32 = new Path();
		h32.strokeColor = 'black';
		h32.add(new Point(21 * s + w, 48 * s + h));
		h32.add(new Point(64 * s + w, 48 * s + h));
		
		items.push(h32);
		
		view.draw();
	}
	
	return items;
}

function prepareCanvas(paper) {
	paper.setup('vaultCanvas');
	tool = new paper.Tool();
	
	tool.onMouseUp = function(event) {
		if(source) {
			var target = findFrame(event.point);
			if(target) {
				var test = checkConnection(source, target);
				
				if(test.status == "ok") {
					var conn = new paper.Path(getModelConnection(source, target));
					var icon = showMiddle(conn, paper, null);
					conn.strokeColor = 'black';
					
					connections.push({source:source, target:target, path:conn, icon:icon});
					dirty = true;
				}
				else alert(test.message);
			}
		}
		
		if(lineToDraw) lineToDraw.remove();
		source = null;
	}	
}

function showMiddle(path, paper, text) {
	var p = path.getLocationAt(path.length/2).point;
	var conn = getConnection(path);
	with(paper) {
		
		var icon;
		if(conn && conn.icon.content || text) {
			var icon = new PointText(p); 
			if(conn && conn.icon.content) icon.content = conn.icon.content; else icon.content = text;
		
			var x = icon.position.x - icon.bounds.width/2;
			var y = icon.position.y + icon.bounds.height;
			var p = new Point(x,y);
			icon.position = p;
		}
		else {
			var rectangle = new Rectangle(new Point(p.x-6, p.y-6), new Point(p.x + 6, p.y + 6));
			var icon = new Path.Rectangle(rectangle);
			icon.fillColor = '#e9e9ff';
		}
		
		icon.onDoubleClick = function(event) {
			showConnectionModal(path);
		}
		icons.push(icon);
		return icon;
	}
}

function getFrameById(id) {
	for(var i = 0; i < elements.length; i++) {
		if(elements[i].elementId == id) return elements[i].frame;
	}
	
	return null;
}

function loadView(aView, id) {
	
	for(var i = 0; i < elements.length; i++) {
		elements[i].frame.remove();
		elements[i].text.remove();
		
		for(var j = 0; j < elements[i].symbol.length; j++) elements[i].symbol[j].remove();
	}
	
	for(var i = 0; i < connections.length; i++) connections[i].path.remove();
	
	for(var i = 0; i < icons.length; i++) if(icons[i]) icons[i].remove();
	
	elements = [];
	connections = [];
	nextId = id;
	dirty = false;
	var drawing;
	
	for(var i = 0; i < aView.elements.length; i++) {
		var e = aView.elements[i];
		
		if(e.kind == "hub") drawing = drawHub(paper, e.x, e.y, e.text);
		else if(e.kind == "link") drawing = drawLink(paper, e.x, e.y, e.text);
		else drawing = drawSatellite(paper, e.x, e.y, e.text);
		
		if(e.reference) elements.push({elementId:e.elementId, kind:e.kind, x:e.x, y:e.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, configuration:e.configuration, reference:e.reference});
		else elements.push({elementId:e.elementId, kind:e.kind, x:e.x, y:e.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, configuration:e.configuration});
	}
	
	for(var i = 0; i < aView.connections.length; i++) {
		var source = getFrameById(aView.connections[i].source);
		var target = getFrameById(aView.connections[i].target);
		var conn = new paper.Path(getModelConnection(source, target));
		conn.strokeColor = 'black';
		var icon = showMiddle(conn, paper, aView.connections[i].label);
		paper.view.draw();
		connections.push({source:source, target:target, path:conn, icon:icon});
	}
	
	$('.viewHeader').removeClass('active');
	console.log("++++++" + aView.name);
	$('.viewHeader').filter(function(index){return $(this).text() == aView.name;}).addClass('active');
	
	$('.addSomething').prop('disabled', false);
}

function saveElements() {
	var serialized = [];
	
	for(var i = 0; i < elements.length; i++) {
		if(elements[i].reference) serialized.push({elementId:elements[i].elementId, x:elements[i].frame.position.x - 90, y:elements[i].frame.position.y - 30, kind:elements[i].kind, text:elements[i].text.content, configuration:elements[i].configuration, reference:elements[i].reference });
		else serialized.push({elementId:elements[i].elementId, x:elements[i].frame.position.x - 90, y:elements[i].frame.position.y - 30, kind:elements[i].kind, text:elements[i].text.content, configuration:elements[i].configuration});
	}
	
	return serialized;
}

function saveConnections() {
	var serialized = [];
	
	for(var i = 0; i < connections.length; i++) {
		
		var text = "";
		if(connections[i].icon && connections[i].icon.content) text = connections[i].icon.content;
		
		serialized.push({source:getElement(connections[i].source).elementId, target:getElement(connections[i].target).elementId, label:text}); 
	}
	
	return serialized;
}

function addElement(paper, kind) {
	var place = findPlace();
	var text;
	var drawing;
	
	if(!place.status) {
		if(kind == "bridge") {
			var text = "BRIDGE " + nextId;
			var drawing = drawBridge(paper, place.x, place.y, text);
		}
		else if (kind == "reference") {
			var text = "REFERENCE " + nextId;
			var drawing = drawReference(paper, place.x, place.y, text);	
		}
				
		elements.push({elementId:nextId, kind:kind, x:place.x, y:place.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, configuration:{}});
		nextId++;
		dirty = true;
	}
}

function drawReference(paper, x, y, text) {
	with(paper) {
		var rectangle = new Rectangle(x, y, 180, 60);
		var path = new Path.Rectangle(rectangle);
		activateElement(path, paper, 'bridge');
		path.strokeColor = 'black';
		var symbol = drawReferenceIcon(paper, x + 9, y + 9, 0.66);
		var textElement = new PointText(path.position); 
		textElement.content = text;
		view.draw();
		
		return {symbol:symbol, frame:path, textElement:textElement};
	}
}

function drawBridge(paper, x, y, text) {
	with(paper) {
		var path = new CompoundPath('M8 0, L60 0, L172 0, A8, 8 0 0, 1 180,8L180 52, A8, 8 0 0, 1 172,60, L120 60, L105 45, L75 45, L60 60, L8 60, A8, 8 0 0, 1 0,52,L0 8, A8, 8 0 0, 1 8,0');
		path.strokeColor = 'black';
		path.position.x += x;
		path.position.y += y;
		activateElement(path, paper, 'link');
		var symbol = drawBridgeIcon(paper, x + 9, y + 9, 0.66);
		var textElement = new PointText(path.position); 
		textElement.content = text;
		view.draw();
		
		return {symbol:symbol, frame:path, textElement:textElement};
	}
}

function addHub(paper) {
	var place = findPlace();
	if(!place.status) {
		var text = "HUB " + nextId;
		var drawing = drawHub(paper, place.x, place.y, text);		
		elements.push({elementId:nextId, kind:"hub", x:place.x, y:place.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, configuration:{}});
		nextId++;
		dirty = true;
	}
}

function drawHub(paper, x, y, text) {
	with(paper) {
		var rectangle = new Rectangle(x, y, 180, 60);
		var path = new Path.Rectangle(rectangle);
		activateElement(path, paper, 'hub');
		path.strokeColor = 'black';
		var symbol = drawHubIcon(paper, x + 9, y + 9, 0.66);
		var textElement = new PointText(path.position); 
		textElement.content = text;
		textElement.position.x = textElement.position.x - textElement.bounds.width/3;
		
		view.draw();
		
		return {symbol:symbol, frame:path, textElement:textElement};
	}
}

function addLink(paper) {
	var place = findPlace();
	if(!place.status) {
		var text =	"LINK " + nextId;
		var drawing = drawLink(paper, place.x, place.y, text);
		elements.push({elementId:nextId, kind:"link", x:place.x, y:place.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, configuration:{}});
		nextId++;
		dirty = true;
	}
}

function drawLink(paper, x, y, text) {
	with(paper) {
		var path = new CompoundPath('M8 0, L60 0, L75 15, L105 15, L120 0, L172 0, A8, 8 0 0, 1 180,8L180 52, A8, 8 0 0, 1 172,60, L120 60, L105 45, L75 45, L60 60, L8 60, A8, 8 0 0, 1 0,52,L0 8, A8, 8 0 0, 1 8,0');
		path.strokeColor = 'black';
		path.position.x += x;
		path.position.y += y;
		activateElement(path, paper, 'link');
		var symbol = drawLinkIcon(paper, x + 9, y + 9, 0.66);
		var textElement = new PointText(path.position); 
		textElement.content = text;
		textElement.position.x = textElement.position.x - textElement.bounds.width/3;
		view.draw();
		
		return {symbol:symbol, frame:path, textElement:textElement};
	}
}
	
function addSatellite(paper) {
	var place = findPlace();
	if(!place.status) {
		var text ="SATELLITE " + nextId;
		var drawing = drawSatellite(paper, place.x, place.y, text);
		elements.push({elementId:nextId, kind:"satellite", x:place.x, y:place.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, configuration:{}});
		nextId++;
		dirty = true;
	}
}

function drawSatellite(paper, x, y, text) {
	with(paper) {
		var path = new CompoundPath('M30 0, L180 0, L180 60, L30 60, A30, 30 0 0, 1 30,0');
		path.strokeColor = 'black';
		path.position.x += x;
		path.position.y += y;
		activateElement(path, paper, 'satellite');
		var symbol = drawSatelliteIcon(paper, x + 9, y + 9, 0.66);
		var textElement = new PointText(path.position); 
		textElement.content = text;
		textElement.position.x = textElement.position.x - textElement.bounds.width/3;
		view.draw();
			
		return {symbol:symbol, frame:path, textElement:textElement};
	}
}

function findPlace() {
	for(var i = 0; i < 10; i++) {
		for(var j = 0; j < 4; j++) {
			var collision = false;
			
			for(var k = 0; k < elements.length;k++) {
				var element = elements[k].frame.position;
				
				if(element.x >= 25 + j * 190 && element.x < 25 + (j+1) * 190 && element.y >= 25 + i * 70 && element.y < 25 + (i+1) * 70) {
					collision = true;
					break;
				}
			}
			
			if(!collision) return {x:25 + j * 190, y:25 + i * 70};
		}
	}
	
	return {status:"noSpace" };
}

function activateElement(element, paper, kind) {
	element.onMouseEnter = function(event) {
		var e = getElement(element);
		if(e.reference) this.fillColor = 'lightgray'; else this.fillColor = 'turquoise';
		addMarker(paper, this.position.x-90, this.position.y);
		addMarker(paper, this.position.x+90, this.position.y);
		var yOffset = 30;
		if(kind == 'link') yOffset = 15;
		addMarker(paper, this.position.x, this.position.y-yOffset);
		addMarker(paper, this.position.x, this.position.y+yOffset);
		
		focus = this;
	};
	
	element.onMouseLeave = function(event) {
		leaveFocus();
	}
	
	element.onMouseDrag = function(event) {
		this.position.x += event.delta.x;
		this.position.y += event.delta.y;
		moveDependents(paper, this, event.delta.x, event.delta.y);
		leaveFocus();
		dirty = true;
	}
	
	element.onDoubleClick = function(event) {
		toBeEdited = element;
		showModal(element);
	}
}

function addMarker(paper, x, y) {
	with(paper) {
		var rectangle = new Rectangle(new Point(x-6, y-6), new Point(x + 6, y + 6));
		var marker = new Path.Rectangle(rectangle);
		marker.fillColor = '#e9e9ff';
		
		marker.onMouseDown = function(event) {
			startOfLine = event.point;
			lineToDraw = new Path.Line(startOfLine, event.point);
			lineToDraw.strokeColor = 'black';
			source = focus;
		};
		
		marker.onMouseDrag = function(event) {
			lineToDraw.remove();
			lineToDraw = new Path(startOfLine, event.point);
			lineToDraw.strokeColor = 'black';
			dirty = true;
		};
		
		
		allMarker.push(marker);
	}
}


function leaveFocus() {
	for(var i = 0; i < allMarker.length;i++) {
		allMarker[i].remove();
	}
	
	allMarker = [];
	
	if(focus) focus.fillColor = 'white';
	
	for(var i = 0; i < elements.length;i++) {
		if(elements[i].frame == focus) {
			elements[i].x = elements[i].frame.position.x;
			elements[i].y = elements[i].frame.position.y;
			
			for(var j = 0; j < connections.length; j++) {
				if(connections[j].source == elements[i] || connections[j].target == elements[i]) {
			        connections[j].icon.remove();
			        connections[j].icon = showMiddle(p, paper, null);
				}
			}
			
			break;
		}	
	}
}

function showConnectionModal(connectionPath) {
	focusedConnection = getConnection(connectionPath);
	if(focusedConnection.icon && focusedConnection.icon.content) $('#connectionNameInput').val(focusedConnection.icon.content);
	else $('#connectionNameInput').val("");
		
	$('#connectionNameModal').modal('show');
}

function saveConnectionName(paper) {
	with(paper) {
		var icon = new PointText(focusedConnection.path.getLocationAt(path.length/2).point); 
		icon.content = $('#connectionNameInput').val();
		var x = focusedConnection.icon.position.x - icon.bounds.width/2;
		var y = focusedConnection.icon.position.y + icon.bounds.height;
		var p = new Point(x,y);
		icon.position = p;
		focusedConnection.icon.remove();
		focusedConnection.icon = icon;
		
		for(var i = 0; i < connections.length; i++) {
			if(connections[i] == focusedConnection) {
		        connections[i].icon == icon;
		        break;
			}
		}
	}
}

function deleteConnection() {
	
	for(var i = 0; i < connections.length;i++) {
		if(connections[i] == focusedConnection) {
			connections.splice(i, 1);
			break;
		}
	}
	
	focusedConnection.path.remove();
	focusedConnection.icon.remove();
	focusedConnection = null;
}

function showModal(frame) {

	$('.referenceVisible').hide();
	
	var e = getElement(frame);
	
	if(e) {
			
		var $scope = angular.element('#canvasMain').scope();
			
		if(e.reference) {
			$('.linkVisible').hide();
			$('.satelliteVisible').hide();
			$('.hubVisible').hide();
			$('.lastSeenVisible').hide();
			$('.referenceVisible').show();
			$('#referenceHint').text("This element is just a reference of the element " + e.text.content + " in view " + e.reference.view);
		}
		else {
			
			var c = e.configuration;
			$scope.elementConfiguration = c;
			if(!$scope.elementConfiguration.fields) $scope.elementConfiguration.fields = [];
			
			if(e.kind == "hub"){
				$('.linkVisible').hide();
				$('.satelliteVisible').hide();
				$('.hubVisible').show();
				if($scope.actualModel.properties.lastSeenOption == "depends") $('.lastSeenVisible').show(); else $('.lastSeenVisible').hide();
				
					
				if(c.addLastSeen) $('#addLastSeen').attr("checked", "checked");
				if(c.businessKey) $scope.elementConfiguration.fields = prepareFields(c.businessKey, $scope.actualModel.properties.dataTypes);
				
			}
			else if (e.kind == "link"){
				$('.hubVisible').hide();
				$('.satelliteVisible').hide();
				$('.linkVisible').show();
				if($scope.actualModel.properties.lastSeenOption == "depends") $('.lastSeenVisible').show(); else $('.lastSeenVisible').hide();
					
				var candidates = getConnectedElements(frame);
				$('#generatingHubsList').empty();
				for(var j = 0; j < elements.length;j++) {
					if(candidates[j] != null && candidates[j].kind  == "hub"){
						$('#generatingHubsList').append("<tr><td>" + candidates[j].text.content + "</td><td><input class='spanInput' candidate='" + candidates[j].text.content + "' type='checkbox'/></td></tr>");
						if(c.span && c.span.indexOf(candidates[j].text.content) >= 0) $(".spanInput[candidate='" + candidates[j].text.content +"']").attr('checked', 'checked');
					} 
				}
				
				if(c.addLastSeen) $('#addLastSeen').attr("checked", "checked");
				if(c.linkType) {
					$('#linkTypeDisplay').attr('linkType', c.linkType);
					$('#linkTypeDisplay').text(c.linkType);
				}
			}
			else {
				$('.hubVisible').hide();
				$('.linkVisible').hide();
				$('.satelliteVisible').show();
				$('.lastSeenVisible').hide();
				
				if(c.satelliteType) {
					$('#satelliteTypeDisplay').attr('satelliteType', c.satelliteType);
					$('#satelliteTypeDisplay').text(c.satelliteType);
				}
				
				if(c.fields) $scope.elementConfiguration.fields = prepareFields(c.fields, $scope.actualModel.properties.dataTypes);
			}
			
			$scope.$apply();
			$('#detailModal').modal('show');
			$('#elementName').val(e.text.content);
		}
	}
}

function dtPart(dt, kind) {
	if(dt) {
		var index = dt.indexOf("(");
		
		if(index > 0) {
			if(kind == "dataType") return dt.substr(0, index);
			else {
				var remainder = dt.substr(index);
				var index2 = remainder.indexOf(",");
				if(index2 > 0) {
					if(kind == "scale") return remainder.substr(index2 + 1, remainder.length - index2 - 2);
					else return remainder.substr(1, remainder.length - index2 - 1);
				}
				else {
					if(kind == "precision") return remainder.substr(1, remainder.length - 2);
					else return "";
				}
			}	
		}
		else {
			if(kind == "dataType") return dt;
			else return "";
		}	
	}
	else return "";
}

function dtVisible(dt, dts, forScale) {
	for(var i = 0; i < dts.length; i++) {
		if(dts[i].dataType == dtPart(dt, 'dataType')) {
			if(dts[i].scale) return true;
			if((dts[i].precision || dts[i].length) && !forScale) return true;
		} 
	}
	
	return false;
}

function prepareFields(fields, dts) {
	return fields.map(function(f){
		return {name:f.name, dataType:dtPart(f.dataType, 'dataType'), 
				precision:dtPart(f.dataType, 'precision'), scale:dtPart(f.dataType, 'scale'), precisionVisible:dtVisible(f.dataType, dts, false) ,scaleVisible:dtVisible(f.dataType, dts, true) , notNull:f.notNull, dataTypes:dts};
	});
}

function smoothFields(fields) {
	return fields.map(function(f){
		if(f.scale) return {name:f.name, dataType:f.dataType + "(" + f.precision + "," + f.scale + ")", notNull:f.notNull};
		else if(f.precision) return {name:f.name, dataType:f.dataType + "(" + f.precision +  ")", notNull:f.notNull};
		else if(f.length) return {name:f.name, dataType:f.dataType + "(" + f.length +  ")", notNull:f.notNull};
		else return {name:f.name, dataType:f.dataType, notNull:f.notNull};
	});
}

function saveDetails() {
	var e = getElement(toBeEdited);
	e.text.content = $('#elementName').val();
	var conf = {};
	var $scope = angular.element('#canvasMain').scope();
	
	if(e.kind == "hub" || e.kind == "hub") {
		if($scope.actualModel.properties.lastSeenOption == "never") conf.addLastSeen = false;
		else if($scope.actualModel.properties.lastSeenOption == "always") conf.addLastSeen = true;
		else {
			if($('#addLastSeen:checked')) conf.addLastSeen = true; else conf.addLastSeen = false;
		}
	}

	if(e.kind == "hub") {
		conf.businessKey = smoothFields($scope.elementConfiguration.fields);
		if(conf.fields) delete conf.fields;
	}
	else if(e.kind == "link") {
		conf.linkType = $('#linkTypeDisplay').attr('linkType');
		
		var span = [];
		$('.spanInput:checked').each(function(index, item){
			span.push(item.getAttribute('candidate'));
		});
		conf.span = span;
	}
	else {
		conf.satelliteType = $('#satelliteTypeDisplay').attr('satelliteType');
		conf.fields = smoothFields($scope.elementConfiguration.fields);
	}
	
	e.configuration = conf;
	$scope.elementConfiguration = conf;
	
	dirty = true;
}

function deleteElement() {
	var e = getElement(focus);
	
	for(var i = 0; i < elements.length;i++) {
		if(elements[i].frame == toBeEdited) {
			elements[i].text.remove();
			
			for(var j = 0; j < elements[i].symbol.length;j++) {
				elements[i].symbol[j].remove();
			}
			
			elements.splice(i,1);
			dirty = true;
			toBeEdited.remove();
			
			toBeEdited = null;
			break;
		}
	}
}

function moveDependents(paper, element, x, y) {
	for(var i = 0; i < elements.length;i++) {
		if(elements[i].frame == element) {
		   elements[i].text.position.x += x;
		   elements[i].text.position.y += y;
		   
		   for(var j = 0; j < elements[i].symbol.length;j++) {
			   elements[i].symbol[j].position.x += x;
			   elements[i].symbol[j].position.y += y;
		   }
		   
		   break;
		}
	}
	
	for(var i = 0; i < connections.length;i++) {
		if(connections[i].source == element || connections[i].target == element) {
			connections[i].path.remove();
            var p = new paper.Path(getModelConnection(connections[i].source, connections[i].target));
            p.strokeColor = 'black';
			connections[i].path = p;
			connections[i].icon.remove();
            connections[i].icon = showMiddle(p, paper, null);
		}
	}
	
	paper.view.draw();
}

function getModelConnection(source, target) {
	
	 var bb1 = source.bounds,
	     bb2 = target.bounds,
	     p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
	     {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
	     {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
	     {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
	     {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
	     {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
	     {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
	     {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
	     d = {}, dis = [];

	 for (var i = 0; i < 4; i++) {
	    for (var j = 4; j < 8; j++) {
	        var dx = Math.abs(p[i].x - p[j].x),
	            dy = Math.abs(p[i].y - p[j].y);
	        if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
	            dis.push(dx + dy);
	            d[dis[dis.length - 1]] = [i, j];
	        }
	    }
	 }
	 
	 if (dis.length == 0) {
	    var res = [0, 4];
	 } else {
	    res = d[Math.min.apply(Math, dis)];
	 }
	 
	 var x1 = p[res[0]].x,
	     y1 = p[res[0]].y,
	     x4 = p[res[1]].x,
	     y4 = p[res[1]].y;
	 dx = Math.max(Math.abs(x1 - x4) / 2, 10);
	 dy = Math.max(Math.abs(y1 - y4) / 2, 10);
	 var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
	     y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
	     x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
	     y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);

	 return path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");	
}

function findFrame(point) {
	for(var i = 0; i < elements.length;i++) {
		if(elements[i].frame.contains(point)) return elements[i].frame;
	}
	
	return null;
}

function getConnectedElements(frame) {
	var elms = [];
	for(var i = 0; i < connections.length;i++) {
		if(connections[i].source == frame) elms.push(getElement(connections[i].target));
		if(connections[i].target == frame) elms.push(getElement(connections[i].source));
	}
	
	return elms;
}

function getElement(frame) {
	for(var i = 0; i < elements.length;i++) {
		if(elements[i].frame == frame) {
			return elements[i];
		}
	}
	
	return null;
}

function getConnection(path) {
	for(var i = 0; i < connections.length;i++) {
		if(connections[i].path == path) return connections[i];
	}
	
	return null;
}

function checkConnection(source, target) {
	var correct = true;
	var message;
	
	if(source == target) {
		correct = false;
		message = "Self References are not allowed!";
	}
	else {
		var s = getElement(source);
		var t = getElement(target);
		
		if(s.kind == "hub" && t.kind == "hub") {
			correct = false;
			message = "Two hubs cannot be connected!";
		}
		
		if(s.kind == "satellite" && t.kind == "satellite") {
			correct = false;
			message = "Two satellites cannot be connected!";
		}
		
		if((s.kind == "satellite" && getConnectedElements(source).length > 0) || (t.kind == "satellite" && getConnectedElements(target).length > 0)) {
			correct = false;
			message = "A satellite must have exactly one connection!";
		}
	}
	
	if(correct) return {status:"ok"};
	else return {status:"failed", message:message};
}

function addReference(reference) {
	var place = findPlace();
	if(!place.status) {
		var text = reference.element.text;
		var drawing;
		
		if(reference.element.kind == "hub") drawing = drawHub(paper, place.x, place.y, text);
		else if(reference.element.kind == "link") drawing = drawLink(paper, place.x, place.y, text);
		else drawing = drawSatellite(paper, place.x, place.y, text);
		
		elements.push({elementId:nextId, kind:reference.element.kind, x:place.x, y:place.y, text:drawing.textElement, symbol:drawing.symbol, frame:drawing.frame, reference:{elementId:reference.element.elementId, view:reference.view}});
		nextId++;
	}
}

function cleanView() {
	dirty = false;
}

function checkElement(frame) {
	var e = getElement(frame);
	var messages = [];
	
	for(var i = 0; i < elements.length; i++) {
		if(elements[i] != e && elements[i].text.content == $('#elementName').val() && elements[i].kind == e.kind) messages.push("An element of this kind and with this name already exists.");
	}
	
	console.log(messages[0]);
	
	// Datentypen vorhanden
	
	if(messages.length > 0) {
		$('#alertElementName').text(messages.join("; "));
		$('#alertElementName').removeClass("hidden");
		$('#saveDetailsButton').prop('disabled', true);
	}
	else {
		$('#alertElementName').addClass("hidden");
		$('#saveDetailsButton').prop('disabled', false);
	}
}