d3.csv("http://127.0.0.1:80/_data/Execution.csv").then(function(data){
	console.log(data);

	const byCounty = d3.nest()
		.key((d) => d["County"])
		.map(data);


	console.log(byCounty);

	color_scale = d3.scaleQuantize()
		.range(colorbrewer.YlGnBu[9])
		.domain([minCount(byCounty), maxCount(byCounty)]);

	// color by criminal count
	byCounty.each(function(val, key){
		let county_name = key;

		if (d3.select("#" + key)["_groups"][0][0] == null) county_name = key.replace(" ", "_");

		d3.select("#" + county_name)
		 	.style("fill", color_scale(val.length));
	});

	// hover: add tooltip
	d3.selectAll(".cls-2").on("mouseover", function() {
		let coord = [d3.event.pageX, d3.event.pageY];

		d3.select("#tooltip") // select tooltip
			.classed("hidden", false)
			.style("left", (coord[0]) + 25 + "px")
			.style("top", (coord[1]) + 25 + "px");

		d3.select("#county_name").text(d3.select(this).attr("id"));
		d3.select("#number_executions").text(byCounty.get(d3.select(this).attr("id")).length);
	});

	// mouseout: hide tooltip
	d3.selectAll(".cls-2").on("mouseout", function(){
		d3.select("#tooltip").classed("hidden", true);
	})


});
