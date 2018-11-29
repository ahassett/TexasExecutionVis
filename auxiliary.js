function vis_overview(parentDOM, width, height, data) {

	const margin = {top: 10, right: 30, left: 40, bottom: 20}

	const chart = parentDOM.append("g")
		.attr("id", "overview")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const axis_labels = parentDOM.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	function Time(dateString) {
		let arr = dateString.split("/")
		this.month = arr[0];
		this.date = arr[1];
		this.year = arr[2];
	}

	let x_scale = d3.scaleLinear()
		.domain([
			d3.min(data, function(d){
				let t = new Time(d["Date"]);
				//console.log(+t.year);
				return t.year;
			}),
			d3.max(data, function(d){
				let t = new Time(d["Date"]);
				//console.log(+t.year);
				return t.year;
			})
		])
		.range([0, width]);

	let y_scale = d3.scaleLinear()
		.range([height, 0])
		.domain([0, 70]); // Needs better solution!!!!!

	let x_axis = chart.append("g");
	let y_axis = chart.append("g");

	nestedData = d3.nest()
		.key((d) => d["Race"])
		.map(data);

	console.log(nestedData);

	nestedData.each(function(val, key) {
		let histogram = d3.histogram()
			.value((d) => {
				let t = new Time(d["Date"]);
				return t.year;
			})
			.domain(x_scale.domain())
			// .thresholds(x_scale.ticks(30)) // bin number

		let bins = histogram(val);
		console.log(bins);

		var lineFunc = d3.line()
			.x(function(d){
				console.log("I'm x" + x_scale(d.x0))
				return (x_scale(d.x0) + x_scale(d.x1)) / 2;
			})
			.y(function(d){
				console.log(y_scale(d.length))
				return y_scale(d.length);
			})
			.curve(d3.curveMonotoneX)

		chart.append("path")
			.datum(bins)
			.attr("d", lineFunc)
			.attr("fill", "none")
			.attr("stroke", "black")
			.attr("stroke-width", 4)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round");

		x_scale.range([0, width]) // adjust x scale
          .domain([d3.min(data, function(d){
			  let t = new Time(d["Date"]);
			  //console.log(+t.year);
			  return t.year;
		  }), d3.max(data, function(d){
			  let t = new Time(d["Date"]);
			  //console.log(+t.year);
			  return t.year;
		  })]);

        y_scale.range([height, 0]) // adjust y scale
          .domain([0, 70]); // adjust to scale to max

        x_axis.attr("transform", `translate(0, ${height})`) // adjust x axis with new x scale
          .call(d3.axisBottom(x_scale))

        y_axis.call(d3.axisLeft(y_scale)); // adjust y axis with new y scale

		// axis labels
		axis_labels.append("text")
			.attr("text-anchor", "middle")
			.attr("transform", `translate(${width/2}, ${height + margin.bottom})`)
			.style("font-size", "10px")
			.attr("font-family", "sans-serif")
			.text("Year");

		axis_labels.append("text")
			.attr("text-anchor", "middle")
			.attr("transform",  `translate(${-(3*margin.left/4)}, ${height/2})rotate(-90)`)
			.style("font-size", "10px")
			.text("Count");
	})
	/*
	let histogram = d3.histogram()
		.value((d))
	*/

	return function(){};

}
