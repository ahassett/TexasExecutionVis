function vis_dashboard(parentDOM, width, height, data) {

	function Time(dateString) {
		let arr = dateString.split("/")
		this.month = arr[0];
		this.date = arr[1];
		this.year = arr[2];
	}

	parentDOM.html("");

	const margin = {top: 10, right: 30, left: 40, bottom: 20}

	const chart = parentDOM.append("g")
		.attr("id", "dashboard")
		// .attr("transform", `translate(${margin.left}, ${margin.top})`);

	// legend
	const legend = chart.append("g")
		.attr("transform", `translate(${width - 50}, ${margin.top})`);

	const legend_line = legend.append("g")
		.attr("transform", `translate(0, ${margin.top})`);

	const legend_text = legend.append("g")
		.attr("transform", `translate(10, ${margin.top})`);

	// rows of charts
	const ROWS = {};

	// scale info
	const DOMAINS = {
		"Age": {
			"x": [20, 70],
			"y": [0, 35]
		},
		"Year": {
			"x": [1980, 2020],
			"y": [0, 35]
		},
		"Birth_Year": {
			"x": [1930, 1990],
			"y": [0, 35]
		}
	};

	let j = 0;
	function appendHistogram(param){

		ROWS[param] = chart.append("g")
			.attr("id", "dashboard_" + param)
			.attr("transform", `translate(${margin.left}, ${(j + 1) * margin.top + j * height})`);

		// width of each sub chart
		let sub_width = width / 3.5;

		let x_scale = d3.scaleLinear()
			.domain(DOMAINS[param]["x"])
			.range([0, sub_width]);

		let y_scale = d3.scaleLinear()
			.domain(DOMAINS[param]["y"])
			.range([height, 0]);

		let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
			.domain(["Hispanic", "Black", "White"]);

		nestedData = d3.nest()
			.key((d) => d["Race"])
			.map(data);

		var i = -1;
		nestedData.each(function(val, key) {
			if (key == "Other") return;

			i++;
			let histogram = d3.histogram()
				.value((d) => d[param])
				.domain(x_scale.domain())
				.thresholds(x_scale.ticks(30));

			let bins = histogram(val);

			let sub_chart = ROWS[param].append("g")
				.attr("transform", `translate(${width * i / 3}, ${0})`)
				.attr("id", param + "_" + key);

			let x_axis = sub_chart.append("g");
			let y_axis = sub_chart.append("g");

			const axis_labels = sub_chart.append("g");

			let cols = sub_chart.selectAll(".col")
				.data(bins);

			let newCols = cols.enter()
				.append("g")
				.classed("col", true)
				.classed("col_" + param, true)
				.classed("col_" + key, true)
				.attr("transform", (d) => `translate(${x_scale(d.x0)}, ${0})`);

			cols = cols.merge(newCols);

			let circles = cols.selectAll("circle")
				.data((d) => d);

			newCircles = circles.enter()
				.append("circle")
				.attr("class", (d)=>"exeid_"+d["Execution"])  // No idea why using "classed" function won't work for this line
				.classed("dot_" + param, true)
				.classed("dot_" + key, true)
				.attr("cx", sub_width / bins.length / 2)
				.attr("cy", (d, i) => y_scale(i + 1) + sub_width / bins.length / 5)
				.attr("r", 5)
				.style("fill", color_scale(key));

			circles = circles.merge(newCircles);

			x_axis.attr("transform", `translate(0, ${height})`) // adjust x axis with new x scale
			  .call(d3.axisBottom(x_scale))

			y_axis.call(d3.axisLeft(y_scale)); // adjust y axis with new y scale

			// axis labels
			axis_labels.append("text")
			  .attr("text-anchor", "middle")
			  .attr("transform", `translate(${sub_width/2}, ${height + 10 + margin.bottom})`)
			  .style("font-size", "10px")
			  .attr("font-family", "sans-serif")
			  .text(param);

			axis_labels.append("text")
			  .attr("text-anchor", "middle")
			  .attr("transform",  `translate(${-(3*margin.left/4)}, ${height/2})rotate(-90)`)
			  .style("font-size", "10px")
			  .text("Count");

			// horizontal brush
			let brush = d3.brushX().extent([[0,0], [sub_width, height]]);

			/* ----------
			Freaking brush
			------------*/
			brush.on("brush", function(){
				let extent = d3.event.selection;

				// synchronizing all brushes to brush
				if (d3.event.sourceEvent.type == "mousemove"){
					ROWS[param].selectAll(".brush").call(brush.move, extent);
				}

				if(extent != null){
					let x_extent = [extent[0], extent[1]].map(x_scale.invert);

					ROWS[param].selectAll(".col").classed("delighted", function(d){
				  		return (d.x0 < d3.min(x_extent) || d.x1 > d3.max(x_extent))
					});

					ROWS[param].selectAll(".col").classed("highlighted", function(d){
				  		return (d.x0 >= d3.min(x_extent) && d.x1 <= d3.max(x_extent))
					});



				} else {
					parentDOM.selectAll(".col").classed("delighted", false);
					parentDOM.selectAll(".col").classed("highlighted", false);
					parentDOM.selectAll(".col").classed("selected", false);
					parentDOM.selectAll(".col").classed("deselected", false);
					parentDOM.selectAll("circle").classed("delighted", false);
					parentDOM.selectAll("circle").classed("highlighted", false);
					parentDOM.selectAll("circle").classed("selected", false);
					parentDOM.selectAll("circle").classed("deselected", false);
				}
			});

			brush.on("end", function(d){

				if (d3.event.selection == null){
					sub_chart.selectAll(".rect_" + key).classed("deselected", false);
				} else {
					if (d3.event.sourceEvent.type === "mouseup") {
						console.log(d3.event)
						// select across column
						d3.selectAll(".delighted").selectAll("circle").each(function(){

							let classList = d3.select(this).attr("class").split(" ");
							for (let i = 0; i < classList.length; i++){
								if (classList[i].slice(0, 5) == "exeid")  {
									d3.selectAll("." + classList[i]).classed("deselected", true);
								}
							}

						});
					}
				}
			});

			brush.on("start", function(d){
				if (d3.event.sourceEvent.type === "mousedown"){
					d3.selectAll(".rect_" + key).classed("deselected", false);
					d3.selectAll(".brush").call(brush.move, null);
				}
			}); 

			// brush container
			let brush_g = sub_chart.append("g").classed("brush", true).call(brush);



		});

		j++;
	}


	appendHistogram("Age");
	appendHistogram("Year");
	appendHistogram("Birth_Year");




	return function(){};
}
