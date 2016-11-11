
var PEG = require("pegjs");

/*
 * use the following parser to parse function templates
 */

var parserCode = "term = businessKey / linkKey / field / literal / unaryOperation / binaryOperation / ternaryOperation;" +
"businessKey = 'bk';" +
"linkKey = 'lk';" +
"field = 'f';" +
"literal = \"'\" text:[a-z,A-Z,0-9,_,$,\,;\\t\\n\\r ]* \"'\" {return \"'\" + text.join('') + \"'\"};" +
"unaryOperator = 'trim' / 'lower' / 'upper' / 'hash' /'concat';" +
"unaryOperation = op:unaryOperator '(' t:term ')' {return {operator:op, operand:t}};" +
"binaryOperator = 'concat';" +
"integer 'integer' = digits:[0-9]+ { return parseInt(digits.join(''), 10); };" +
"ternaryOperator = 'replace';" +
"whiteSpace = [\\t\\n\\r]*;" +
"binaryOperation = op:binaryOperator '(' left:term whiteSpace ',' whiteSpace right:term whiteSpace ')' {return {operator:op, left:left, right:right}};" +
"ternaryOperation = op:ternaryOperator '(' whiteSpace first:term whiteSpace ',' whiteSpace second:term whiteSpace ',' whiteSpace third:term whiteSpace ')'  {return {operator:op, first:first, second:second, third:third}};";

var functionParser = PEG.generate(parserCode);

/*
 * use the following parser to create a parser for name transformations
 * 
 */

var nameParserCode = "name = word / unaryOperation / replace;" +
"unaryOperator = 'trim' / 'lower' / 'upper';" +
"unaryOperation = op:unaryOperator ws '('ws n:name ws')' {" +
	"if(op == 'lower') return n.toLowerCase();" +
    "else if(op == 'upper') return n.toUpperCase();" +
    "else return n.replace(/^\s+|\s+$/g, '');" +
"};" +
"word =  \"'\" ws text:[a-z,A-Z,0-9,_,$]+ ws \"'\" {return text.join('')};" +
"ws = [ \\t\\n\\r]*;" +
"replace = 'replace' ws '(' n:name ws ',' ws search:word ',' ws replaceWith:word ws ')'" +
	"{return n.replace(search, replaceWith);}";

var nameParser = PEG.generate(nameParserCode);

function smooth(text, toLower) {	
	if(text) {
		var result = text.toLowerCase().replace(" ", "_").replace("ä", "ae").replace("ü", "ue").replace("ö", "oe").replace("ß", "ss");
		if(!toLower) return result.toUpperCase(); else return result;
	}
	else return "";
}

function dtInstance(dt, p, s) {
	if(dt.indexOf("(n)") != -1 && p) return dt.replace("(n)", "(" + p + ")");
	else if(dt.indexOf("(p,s)") != -1 && p && s) return dt.replace("(p,s)", "(" + p + "," + s + ")");
	else return dt;
}

function commaList(list, functionOnItem) {
	var result = "";
	for(var i = 0; i < list.length; i++) {
		result = result + functionOnItem(list[i]);
		if(i < list.length - 1) result = result + ", ";
	}
	
	return result;
}

function connectedElements(views, element, kind) {
	var neighbours = [];
	for(var i = 0; i < views.length; i++) {
		for(var j = 0; j < views[i].connections.length; j++) {
			var index = -1;
			if(views[i].connections[j].source == element.elementId) index = views[i].connections[j].target;
			if(views[i].connections[j].target == element.elementId) index = views[i].connections[j].source;
			
			if(index >= 0) {
				for(var k = 0; k < views[i].elements.length; k++) {
					if(views[i].elements[k].elementId == index) {
						if((kind == "link" || kind == "satellite") && (views[i].elements[k].kind == "link" || views[i].elements[k].kind == "hub")) {
							neighbours.push(views[i].elements[k]);
						}
						break;
					}
				}
			}
		}
	}
	
	return neighbours.sort(function(a, b){return (a.text > b.text) - (a.text < b.text)});
}

function makeTerm(json, fields) {
	if(json.operator && json.operand) {
		if(json.operator == 'lower') return "LOWER(" + makeTerm(json.operand, fields) + ")";
		else if (json.operator == 'upper') return "UPPER(" + makeTerm(json.operand, fields) + ")";
		else if (json.operator == 'trim') return "TRIM(' ' FROM " + makeTerm(json.operand, fields) + ")";
		else if (json.operator == 'hash') return "HASH(" + makeTerm(json.operand, fields) + ")";
		else if (json.operator == 'concat') {
			var result = "";
			for(var i = 0; i < fields.length; i++) {
				result = result + makeTerm(json.operand, fields).replace("-", smooth(fields[i].name, true));
				if(i < fields.length - 1) result = result + " || ";
			}
			
			return result;
		}
		else return json;
	}
	else if(json.operator && json.left && json.right) {
		return makeTerm(json.left, fields) + "||" + makeTerm(json.right, fields);	
	}
	else if(json.operator && json.first && json.second && json.third) {
		return "REPLACE(" + makeTerm(json.first, fields) + "," + makeTerm(json.second, fields) + "," + makeTerm(json.third, fields) + ")";
	}
	else if(json == 'lk' || json == 'bk' || json == 'f') {
		return "-";
	}
	else return json;
}

exports.parseTemplate = function(source) {

	try {
		return functionParser.parse(source.replace(' ', ''));
	}
	catch(exeption) {
		return {exception:exeption};
	}	
};

function parseTypes(system, dataTypes, splitIt) {
	var result = [];
	
	for(var i = 0; i < dataTypes.length; i++) {
		var index = dataTypes[i].indexOf("(");
		
		if(index > 0 && splitIt) {
			var dt = dataTypes[i].substr(0, index);
			var remainder = dataTypes[i].substr(index);
			
			if(remainder.indexOf("s") > 0) result.push({"system":system, "dataType":dt, "precision":"--", "scale":"--"});
			else if(remainder.indexOf("p") > 0) result.push({"system":system, "dataType":dt, "precision":"--"});
			else result.push({"system":system, "dataType":dt, "length":"--"});
			
		}
		else result.push({"system":system, "dataType":dataTypes[i]});
	}
	
	return result;
}

exports.improveModel = function(model, configuration) {
	
	if(model.properties.targetSystem && !model.properties.dataTypes) {
		
		if(model.properties.targetSystem == "sapHana") model.properties.dataTypes = parseTypes("sapHana", model.properties.hana.dataTypes, true);
		
		for(var i = 0; i< configuration.targetSystems.length; i++) {
		 	if(configuration.targetSystems[i].id == model.properties.targetSystem) {
		 		if(model.properties.targetSystem != "sapHana") model.properties.dataTypes = parseTypes(configuration.targetSystems[i].id, configuration.targetSystems[i].dataTypes, true);
		 		model.properties.hubTemplate = configuration.targetSystems[i].hubTemplate;
		 		model.properties.linkTemplate = configuration.targetSystems[i].linkTemplate;
		 		model.properties.satelliteTemplate = configuration.targetSystems[i].satelliteTemplate;
		 		model.properties.headerTemplate = configuration.targetSystems[i].headerTemplate;
		 		model.properties.footerTemplate = configuration.targetSystems[i].footerTemplate;
		 		model.properties.functionTemplate = configuration.targetSystems[i].functionTemplate;
		 		break;
		 	}
		}
	}
	
	return model;
}

exports.getDataTypes = function(configuration) {
	var result = [];
	
	for(var i = 0; i< configuration.targetSystems.length; i++) {
		if( configuration.targetSystems[i].dataTypes) {
			Array.prototype.push.apply(result, parseTypes(configuration.targetSystems[i].id, configuration.targetSystems[i].dataTypes, false));
		}
	}
	
	return result;
}

function conditional(line, properties) {
	var pattern = /\{\{#if (\w+)\}\}(.+)\{\{\/#if\}\}/;
	
	if(line.match(pattern)) {
		if(properties[RegExp.$1]) return line.replace(pattern, RegExp.$2);
		else return line.replace(pattern, '');
	}
	else return line;
}

function name(kind, whichName, properties, element) {
	var result;
	if(kind == "hub") {
		if(whichName == "table") result = properties.hubName;
		else result = properties.hubHashKey;
	}
	else if(kind == "link") {
		if(whichName == "table") result = properties.linkName;
		else result = properties.linkHashKey;
	}
	else result = properties.satelliteName;
	
	result = smooth(result.replace("<name>", element.text), true);
	
	try {
		return nameParser.parse(result);
	}
	catch(ex) {
		console.log(ex);
		return result;
	}
}

function replacePattern (line, properties, element) {
	var pattern = /\{\{([^\{\}]+)\}\}/;
	if(line) {
		while(line.match(pattern)) {
			line = line.replace(pattern, function(match, $1) {
				if(properties[$1]) return properties[$1];
				else if($1 == "tableName") return name(element.kind, "table", properties, element);
				else if($1 == "hashKeyName") return name(element.kind, "hashKey", properties, element);
				else if($1 == "tableProperties") {
					if(properties.targetSystem == "oracle") return properties.oracle.tableProperties;
					else return "";
				}
				else return $1;
			});
		}
		
		return line;
	}
	else return "";
} 

function processLine(line, properties, element) {
	return replacePattern(conditional(line, properties), properties, element);
}

function processField(line, field, properties) {
	var l = conditional(line, field);
	if(!l) l = conditional(line, properties);
	if(l) {
		var pattern = /\{\{([^\{\}]+)\}\}/;
		while(l.match(pattern)) {
			l = l.replace(pattern, function(match, $1) {
				if(field[$1] && $1 == "name") return smooth(field[$1], false);
				if(field[$1]) return field[$1];
			});
		}
		
		return l;
	}
	else return "";
}

function each(line, element, properties, views) {
	var lines = [];
	var pattern = /\{\{#each (\w+)\}\}(.+)\{\{\/#each\}\}/;
	
	if(line.match(pattern) && RegExp.$1 == "field" && element.configuration.fields) {
		var innerPart = RegExp.$2;
		for(var i = 0; i < element.configuration.fields.length; i++) {
			lines.push(processField(innerPart, element.configuration.fields[i], properties));
		}
	}
	else if(line.match(pattern) && RegExp.$1 == "businessKey" && element.configuration && element.configuration.businessKey) {
		var innerPart = RegExp.$2;
		for(var i = 0; i < element.configuration.businessKey.length; i++) {
			lines.push(processField(innerPart, element.configuration.businessKey[i], properties));
		}
	}
	else if(line.match(pattern) && RegExp.$1 == "reference" && (element.kind == 'link' || element.kind == 'satellite')) {
		var innerPart = RegExp.$2;
		var neighbours = connectedElements(views, element, element.kind).map(function(e){return {name:name(e.kind, "hashKey", properties, e), dataType:e.dataType};});
		var items = [];
		for(var i = 0; i < neighbours.length; i++) {
			items.push(processField(innerPart, neighbours[i], properties));
		}
		
		var help = line.replace(pattern, commaList(items, function(x){return x;}).replace(',','\n'));
		
		lines.push(processLine(help, properties, element));
	}
	else {
		lines.push(processLine(line, properties, element));
	}
		
	return lines;
}

function createDDL(element, properties, views) {
	var template;
	var result = [];
	
	if(element.kind == "hub") template = properties.hubTemplate;
	else if(element.kind == "link") template = properties.linkTemplate;
	else template = properties.satelliteTemplate;
	
	var lines = template.split("\n");
	for(var i = 0; i < lines.length; i++) {
		var someLines = each(lines[i], element, properties, views);
		for(var j = 0; j < someLines.length; j++) result.push(someLines[j]);
	}
	
	return result.join("\n").replace("\n\n", "\n");
}

function createFunctionLine (line, properties, termTemplate, fields, element) {
	var pattern = /\{\{([^\{\}]+)\}\}/;
	if(line) {
		while(line.match(pattern)) {
			
			if(RegExp.$1 == "term") {
				line = line.replace(pattern, makeTerm(functionParser.parse(termTemplate), fields));
			}
			else if(RegExp.$1 == "field") {
				line = line.replace(pattern, commaList(fields, function(x){return "IN " + x.name.toLowerCase() + " " + hanaFunctionDataType(x.dataType)}));
				
			}
			else if(RegExp.$1 == "tableName") {
				if(element.kind == "satellite") line = line.replace(pattern, element.text.toLowerCase() + "_hashdiff");
				else line = line.replace(pattern, element.text.toLowerCase() + "_hashkey");
			}
			else {
				if(properties[RegExp.$1]) line = line.replace(pattern, properties[RegExp.$1]);
				else line = line.replace(pattern, 'doof');
			}
		}
	
		return line;
	}
	else return "";
} 

function hanaFunctionDataType(dataType) {
	return dataType.replace("String", "VARCHAR").replace("Binary", "VARBINARY").replace("Int64", "BIGINT").replace("Integer", "INTEGER");
}

function createHashFunction(element, properties, views) {
	var functionTemplate = properties.functionTemplate;
	var termTemplate;
	var fields;
	
	if(properties.targetSystem == "sapHana") {
		properties.context = properties.hana.context;
		properties.schema = properties.hana.schema;
		properties.namespace = properties.hana.namespace;
		properties.hashKeyReturn = hanaFunctionDataType(dtInstance(properties.hashKeyDataType, properties.hashKeyDataTypePrecision, properties.hashKeyDataTypeScale));
	}
	else if(properties.targetSystem == "oracle") {
		properties.schema = properties.oracle.schema;
	}
	
	if(element.kind == "hub") {
		termTemplate = properties.businessKeyTemplate;
		if(element.configuration && element.configuration.businessKey) fields = element.configuration.businessKey; else fields = [];
	}
	else if(element.kind == "link") {
		termTemplate = properties.linkKeyTemplate;
		fields = connectedElements(views, element, element.kind).map(function(e){return {name: name(e.kind, "hashKey", properties, e), dataType:dtInstance(properties.hashKeyDataType, properties.hashKeyDataTypePrecision, properties.hashKeyDataTypeScale)};});
	}
	else {
		termTemplate = properties.hashDiffTemplate;
		if(element.configuration && element.configuration.fields) fields = element.configuration.fields; else fields = [];
	}
	
	var lines = functionTemplate.split("\n");
	var result = [];
	for(var i = 0; i < lines.length; i++) result.push(createFunctionLine (lines[i], properties, termTemplate, fields, element));
	
	var hashFunction = result.join("\n");
	
	if(properties.targetSystem == "sapHana") {
		if(properties.hashFunction == "sha1") hashFunction = hashFunction.replace("HASH", "HASH_SHA256");
		else hashFunction = hashFunction.replace("HASH", "HASH_MD5");
	}
	else if(properties.targetSystem == "oracle") hashFunction.replace("HASH", "VAULT_HASH");
	
	var suffix = "_hashkey";
	if(element.kind == "satellite") suffix = "_hashdiff";
	
	return {name: smooth(element.text, true) + suffix + ".hdbscalarfunction", f: hashFunction};
}

function createFrame(properties, isHeader, information) {
	var result = [];
	var lines = properties.headerTemplate.split("\n");
	if(!isHeader) lines = properties.footerTemplate.split("\n");
	
	var p = {};
	if(properties.targetSystem == "sapHana")  p = properties.hana;
	else if(properties.targetSystem == "oracle")  p = properties.oracle;
	else if(properties.targetSystem == "sql") p = properties.sql;
	else if(properties.targetSystem == "sqlServer") p = properties.sqlServer;
	
	p.modelName = properties.name;
	p.generationDate = information.timestamp;
	p.hashKeyDataType = dtInstance(properties.hashKeyDataType, properties.hashKeyDataTypePrecision, properties.hashKeyDataTypeScale);
	p.loadDateDataType = dtInstance(properties.loadDateDataType, properties.loadDateDataTypePrecision, properties.loadDateDataTypeScale);
	p.recordSourceDataType = dtInstance(properties.recordSourceDataType, properties.recordSourceDataTypePrecision, properties.recordSourceDataTypeScale);
	p.lastSeenDataType = dtInstance(properties.lastSeenDataType, properties.lastSeenDataTypePrecision, properties.lastSeenDataTypeScale);
	
	for(var i = 0; i < lines.length; i++) {
		var someLines = each(lines[i], null, p);
		for(var j = 0; j < someLines.length; j++) result.push(someLines[j]);
	}
	
	return result.join("\n");
}

exports.createRelease = function(model, info) {
	var result = [];
	var hashFunctions = [];
	
	for(var i = 0; i < model.views.length; i++) {
		for(var j = 0; j < model.views[i].elements.length; j++) {
			var e = model.views[i].elements[j];
			if(!e.reference) {
				result.push(createDDL(e, model.properties, model.views));
				if(model.properties.targetSystem != "sql")hashFunctions.push(createHashFunction(e, model.properties, model.views));
			}
		}
	}
		
	model.versions.push({name:info.version, timestamp:info.timestamp, header:createFrame(model.properties, true, info), footer:createFrame(model.properties, false, info), 
		                 artefacts:result, hashFunctions:hashFunctions});
	return {model:model, latest:result};
}

exports.fileName = function(model) {
	var suffix = ".sql";
	
	if(model.properties.targetSystem == "sapHana" && model.properties.hana.xs == "classic") suffix = ".hdbdd";
	if(model.properties.targetSystem == "sapHana" && model.properties.hana.xs == "advanced") suffix = ".hdbcds";
	
	return smooth(model.properties.name, true) + suffix;
}