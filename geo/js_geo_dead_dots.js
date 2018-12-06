
function vis_map(parentDOM, width, height, data) {
	console.log(data);

	const byCounty = d3.nest()
		.key((d) => d["County"])
		.map(data);

	let circle_g = parentDOM.append("g");
	let legend_g = parentDOM.append("g")
		.attr("transform", `translate(${10000}, ${500})`);


	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White"]);

	function getBoundingBoxCenter (selection) {
		// get the DOM element from a D3 selection
		// you could also use "this" inside .each()
		var element = selection.node();
		// use the native SVG interface to get the bounding box
		var bbox = element.getBBox();
		// randomly generate a point within path

		let newX = bbox.x + Math.floor(Math.random() * bbox.width);
		let newY = bbox.y + Math.floor(Math.random() * bbox.height);
		return [newX, newY];
	}

	data.forEach(function(d){
		that = d3.select("#" + d["County"].replace(" ", "_")) ;

		circle_g.append("circle")
			.attr("cx", getBoundingBoxCenter(that)[0])
			.attr("cy", getBoundingBoxCenter(that)[1])
			.attr("r", 40)
			.attr("fill", color_scale(d["Race"]))
			.classed("dot_" + d["Race"], true);

	});

	/*-------------
	Legend
	-------------*/

	let legend_circles = legend_g.selectAll("circle")
		.data(["White", "Hispanic", "Black"])

	new_circles = legend_circles.enter()
		.append("circle")
		.attr("cx", 5)
		.attr("cy", (d, i) => i * 500)
		.attr("r", 100)
		.attr("stroke-width", 50)
    	.attr("stroke", (d) => color_scale(d))
    	.attr("fill", (d)=> color_scale(d)) // initial circles are not filled
		.classed("selected", true);

	legend_circles = legend_circles.merge(new_circles);

	legend_g.selectAll("text")
	.data(["White", "Hispanic", "Black"])
	.enter()
	.append("text")
	.attr("x", 250)
	.attr("y", (d, i) => 100 + i * 500)
	.style("font-size", 300)
	.text((d)=> d)

	// event handler for legend
	legend_circles.on("click", function(d){

		// if deselected
		if (d3.select(this).classed("selected")){
			d3.select(this)
				.classed("selected", false)
				.attr("fill", "white");

			circle_g.selectAll(".dot_" + d).classed("hidden", true)
		}
		// if selected
		else{
			d3.select(this)
				.classed("selected", true)
				.attr("fill", color_scale(d));

			circle_g.selectAll(".dot_" + d).classed("hidden", false);
		}
	})






}
