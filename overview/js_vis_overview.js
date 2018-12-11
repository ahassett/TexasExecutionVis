// http://www.txexecutions.org/history.asp

function vis_overview(parentDOM, width, height, data) {

	parentDOM.html("");

	const margin = {top: 10, right: 30, left: 40, bottom: 20}

	const chart = parentDOM.append("g")
		.attr("id", "overview")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const axis_labels = chart.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	const legend = chart.append("g")
		.attr("transform", `translate(${width - 50}, ${margin.top})`);

	const legend_line = legend.append("g")
		.attr("transform", `translate(0, ${margin.top})`);

	const legend_text = legend.append("g")
		.attr("transform", `translate(10, ${margin.top})`);

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
				return t.year;
			}),
			d3.max(data, function(d){
				let t = new Time(d["Date"]);
				return t.year;
			})
		])
		.range([0, width]);

	let y_scale = d3.scaleLinear()
		.range([height, 0])
		.domain([0, 70]); // Needs better solution!!!!!

	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White", "Other"]);

	let x_axis = chart.append("g");
	let y_axis = chart.append("g");

	nestedData = d3.nest()
		.key((d) => d["Race"])
		.map(data);


	nestedData.each(function(val, key) {
		if (key == "Other") return;

		let histogram = d3.histogram()
			.value((d) => {
				let t = new Time(d["Date"]);
				return t.year;
			})
			.domain(x_scale.domain())
			// .thresholds(x_scale.ticks(30)) // bin number

		let bins = histogram(val);

		var lineFunc = d3.line()
			.x(function(d){
				return (x_scale(d.x0) + x_scale(d.x1)) / 2;
			})
			.y(function(d){
				return y_scale(d.length);
			})
			.curve(d3.curveMonotoneX)

		chart.append("path")
			.datum(bins)
			.attr("d", lineFunc)
			.attr("fill", "none")
			.attr("stroke", color_scale(key))
			.attr("stroke-width", 4)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round");

		x_scale.range([0, width]) // adjust x scale
          .domain([d3.min(data, function(d){
			  let t = new Time(d["Date"]);
			  return t.year;
		  }), d3.max(data, function(d){
			  let t = new Time(d["Date"]);
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

	// create legend
	legend_line.selectAll("rect")
		.data(["White", "Black", "Hispanic", "Other"])
		.enter()
		.append("rect")
		.attr("fill", (d) => color_scale(d))
		.attr("x", 0)
		.attr("y", (d, i) => i * 30)
		.attr("width", 40)
		.attr("height", 3);

	legend_text.selectAll("text")
		.data(["White", "Black", "Hispanic", "Other"])
		.enter()
		.append("text")
		.attr("x", 35)
		.attr("y", (d, i) => i * 30 + 5)
		.text((d) => d);

	// Creating grid lines
	function make_h_gridlines() {
		return d3.axisBottom(x_scale).ticks(5);
	}

	function make_v_gridlines() {
		return d3.axisLeft(y_scale).ticks(5);
	}
	/*
	// add horizontal grid lines
	parentDOM.append("g")
		.attr("class", "grid")
		.attr("transform", `translate(${margin.left}, ${margin.top + height})`)
		.call(make_h_gridlines()
			.tickSize(-height)
			.tickFormat("")
		);

	// add vertical grid lines
	parentDOM.append("g")
		.attr("class", "grid")
		.attr("transform", `translate(${margin.left}, ${margin.top})`)
		.call(make_v_gridlines()
			.tickSize(-width)
			.tickFormat("")
		);
	*/

	/*---------------
	* Freaking scroll
	----------------*/
	const aux = parentDOM.append("g")
		.attr("transform", `translate(${margin.left}, ${margin.top})`);

	yearArray = [1983, 1992, 1995, 1999, 1998, 2000, 2005, 2018]

	// construct all lines
	for (let i = 0; i < yearArray.length; i++){
		aux.append("line")
			.attr("y1", 0)
			.attr("y2", height)
			.attr("x1", x_scale(yearArray[i]))
			.attr("x2", x_scale(yearArray[i]))
			.attr("stroke", "black")
			.attr("stroke-width", 5)
			.classed("boundary_line", true)
			.classed("opaque", true)
			.attr("id", "line_" + yearArray[i])
			.style("stroke-dasharray", ("6, 5"));
	}

	aux.append("rect")
		.attr("x", x_scale(1983))
		.attr("y", 0)
		.attr("width", x_scale(1992) - x_scale(1983))
		.attr("height", height)
		.attr("fill", "#FF3F00")
		.attr("opacity", 0.2)
		.attr("id", "rect1")

	const scr1 = function(){
		console.log("scr1")

		aux.select("#line_1983")
			.classed("opaque", false)

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(1983))
			.attr("y", 0)
			.attr("width", x_scale(1992) - x_scale(1983))
			.attr("height", height)
			.duration(500);
	}

	const scr2 = function(){
		console.log("scr2")

		// set all lines opaque again
		aux.selectAll(".boundary_line")
			.classed("opaque", true)

		aux.select("#line_1995")
			.classed("opaque", false)
			.attr("fill", "#A59006")

		aux.select("#rect1")
			.transition()
			.attr("x",  x_scale(1992))
			.attr("y", 0)
			.attr("width", x_scale(1999) - x_scale(1992))
			.attr("height", height)
			.duration(500);
	}

	const scr3 = function(){
		console.log("scr3")
	}
	const scr4 = function(){
		console.log("scr4")
	}
	const scr5 = function(){
		console.log("scr5")
	}
	const scr6 = function(){
		console.log("scr6")
	}
	const scr7 = function(){
		console.log("scr7")
	}

	let vis_scrolls = [scr1, scr2, scr3, scr4, scr5, scr6, scr7];
/*
	// What the hell is going on here?
	const gs = d3.graphScroll()
		.container(d3.select("#vis_container"))
		.graph(d3.select("#vis_canvas"))
		.eventId('sec1_id')
		.sections(d3.selectAll("#step1_annotation section"))
		.on("active", function(i){
			console.log(i);
			vis_scrolls[i]();
		});
*/

	/*
	* Try for annotation step1
	*/
	scr1();

	d3.selectAll(".step1_click").on("click", function(){
		targetID = d3.select(this).attr("href");
		d3.selectAll(".step1_section").classed("hidden", true);
		d3.select(targetID).classed("hidden", false);

		let index = +targetID.slice(4)
		vis_scrolls[index - 1]();
	});


	return function(){};


}
