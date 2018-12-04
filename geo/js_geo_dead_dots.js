const SVG = d3.select(".texas")

d3.csv("http://127.0.0.1:8000/_data/Execution.csv").then(function(data){
	console.log(data);

	let current = null; //used in checkbox action listener

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
			// var pointInSvgPolygon = require("point-in-svg-polygon");
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
			.attr("fill", color_scale(d["Race"]))
			.classed("dot_" + d["Race"], true);

	})

	d3.selectAll(".cls-2").on("mouseover", function(){

		let state_name = d3.select(this).attr("id");
		const coord = [d3.event.pageX, d3.event.pageY] // coordinate of mouse
		d3.select("#county_name").text(state_name);
        d3.select("#number_executions").text(state_name.length);

		d3.select("#tooltip")
			.classed("hidden", false)
			.style("left", `${coord[0] + 25}px`)
			.style("top", `${coord[1] + 25}px`);
	});

	d3.selectAll(".cls-2").on("mouseout", function(){
		d3.select("#tooltip").classed("hidden", true);
	});

	// radio button action listener
	let numChecked = 0;
	d3.selectAll(".race_filter").on("change", function(){
		let race = d3.select(this).property("value");
		let checked = d3.select(this).property("checked");

		// if select
		if (checked) {
			// wipe everything out first when we select the first box
			if (numChecked == 0) {
				circle_g.selectAll("circle").classed("hidden", true);
			}

			numChecked++;

			current = circle_g.selectAll(".dot_" + d3.select(this).property("value")).classed("hidden", false);

			current.attr("opacity", 0)
				.transition()
				.attr("opacity", 1)
				.duration(500) // transition lasts for 500ms
				.delay((d, i) => i * 5); // the delay in ms before transition
		}

		// if deselect
		else {
			numChecked--;

			if (numChecked == 0) {
				current = circle_g.selectAll("circle").classed("hidden", false);

				current.attr("opacity", 0)
					.transition()
					.attr("opacity", 1)
					.duration(500)
					.delay((d, i) => i * 5);
			}

			else {
				circle_g.selectAll(".dot_" + race).classed("hidden", true);

			}

		}

	});

});
