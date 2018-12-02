const SVG = d3.select(".texas")

d3.csv("http://127.0.0.1:80/_data/Execution.csv").then(function(data){
	console.log(data);

	const byCounty = d3.nest()
		.key((d) => d["County"])
		.map(data);

	let circle_g = SVG.append("g");

	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White"]);

	function getBoundingBoxCenter (selection) {
		// get the DOM element from a D3 selection
		// you could also use "this" inside .each()
		var element = selection.node();
		// use the native SVG interface to get the bounding box
		var bbox = element.getBBox();
		// randomly generate a point within path
		let passed = false, newX = 0, newY = 0;

		while(!passed) {
			var pointInSvgPolygon = require("point-in-svg-polygon");
			/*
			// See the path specification for the correct format
			// https://developer.mozilla.org/en/docs/Web/SVG/Tutorial/Paths
			var pathString = selection.attr("d");
			// Parse the string

			for (i = 0; i < pathString.length; i++){
				if (pathString[i] != "M" && pathString[i].toLowerCase() != pathString[i].toUpperCase()){
					pathString = pathString.slice(0, i) + " " + pathString.slice(i);
					i++;
				}
			}*/
			newX = bbox.x + Math.floor(Math.random() * bbox.width);
			newY = bbox.y + Math.floor(Math.random() * bbox.height);

			// passed = pointInSvgPolygon.isInside([newX, newY], pathString);
			passed = true;
		}

		return [newX, newY];

	}

	data.forEach(function(d){
		that = d3.select("#" + d["County"].replace(" ", "_")) ;

		circle_g.append("circle")
			.attr("cx", getBoundingBoxCenter(that)[0])
			.attr("cy", getBoundingBoxCenter(that)[1])
			.attr("r", 50)
			.attr("fill", color_scale(d["Race"]));

	})





});
