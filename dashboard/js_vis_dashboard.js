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

	const chart_age = chart.append("g")
		.attr("id", "dashboard_age")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	/* Don't delete
	const chart_birth = chart.append("g")
		.attr("id", "dashboard_birth")
		.attr("tramsform", `translate(${margin.left}, ${2 * margin.top + height})`);
	*/

	const legend_age = chart_age.append("g")
		.attr("transform", `translate(${width - 50}, ${margin.top})`);

	const legend_age_line = legend_age.append("g")
		.attr("transform", `translate(0, ${margin.top})`);

	const legend_age_text = legend_age.append("g")
		.attr("transform", `translate(10, ${margin.top})`);

	let sub_width = width / 3.5;

	let x_scale = d3.scaleLinear()
		.domain([20, 70])
		.range([0, sub_width]);

	let y_scale = d3.scaleLinear()
		.range([height, 0])
		.domain([0, 70])

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
			.value((d) => d["Age"])
			.domain(x_scale.domain());

		let bins = histogram(val);

		console.log(bins);



		let sub_chart = chart_age.append("g")
			.attr("transform", `translate(${width * i / 3}, ${0})`);

		let x_axis = sub_chart.append("g");
		let y_axis = sub_chart.append("g");

		const axis_labels = sub_chart.append("g");

		sub_chart.selectAll("rect")
			.data(bins)
			.enter()
			.append("rect")
			.classed("rect_" + key, true)
			.attr("x", (d) => x_scale(d.x0))
			.attr("y", (d) => y_scale(d.length))
			.attr("width", (d) => x_scale(d.x1) - x_scale(d.x0))
			.attr("height", (d) => height - y_scale(d.length))
			.attr("fill", color_scale(key));

		x_axis.attr("transform", `translate(0, ${height})`) // adjust x axis with new x scale
		  .call(d3.axisBottom(x_scale))

		y_axis.call(d3.axisLeft(y_scale)); // adjust y axis with new y scale

		// axis labels
		axis_labels.append("text")
		  .attr("text-anchor", "middle")
		  .attr("transform", `translate(${sub_width/2}, ${height + 10 + margin.bottom})`)
		  .style("font-size", "10px")
		  .attr("font-family", "sans-serif")
		  .text("Age");

		axis_labels.append("text")
		  .attr("text-anchor", "middle")
		  .attr("transform",  `translate(${-(3*margin.left/4)}, ${height/2})rotate(-90)`)
		  .style("font-size", "10px")
		  .text("Count");

		// horizontal brush
		let brush = d3.brushX().extent([[0,0], [sub_width, height]]);

		// brush event handler
		brush.on("brush", function(d){
			let extent = d3.event.selection;

			if(extent != null){
				let x_extent = [extent[0], extent[1]].map(x_scale.invert);

				sub_chart.selectAll(".rect_" + key).classed("deselected", function(d){
			  		return (d.x0 < d3.min(x_extent) || d.x1 > d3.max(x_extent))
				});
			}
		});

		brush.on("end", function(d){
			if (d3.event.selection == null){
				sub_chart.selectAll(".rect_" + key).classed("deselected", false);
			}
		})

		brush.on("start", function(d){
			if (d3.event.sourceEvent.type === "mousedown"){
				d3.selectAll(".rect_" + key).classed("deselected", false);
				d3.selectAll(".brush").call(brush.move, null);
			}
		})
		// brush container
		let brush_g = sub_chart.append("g").classed("brush", true).call(brush);



	});


	return function(){};
}
