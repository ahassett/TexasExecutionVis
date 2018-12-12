
function vis_map(parentDOM, width, height, data) {
	console.log(data);

	// nest data by county
	const byCounty = d3.nest()
		.key((d) => d["County"])
		.map(data);

	let circle_g = parentDOM.append("g"); // g-container for circles
	let legend_g = parentDOM.append("g") // g-container for legend
		.attr("transform", `translate(${10000}, ${-250})`);

	let color_scale = d3.scaleOrdinal(d3.schemeCategory10)
		.domain(["Hispanic", "Black", "White"]);

	// function to draw circles given filtered data
	function drawCircles(dataset) {
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

		// animation to remove all circles before switching a year
		circle_g.selectAll("circle")
			.transition()
			.attr("r", 10)
			.attr("opacity", 0)
			.duration(500)
			.remove();

		dataset.forEach(function(d){
			that = d3.select("#" + d["County"].replace(" ", "_")) ;

			// append the circles at the right positions
			circle_g.append("circle")
				.attr("cx", getBoundingBoxCenter(that)[0])
				.attr("cy", getBoundingBoxCenter(that)[1])
				.classed("dot_" + d["Race"], true)
				.attr("fill", color_scale(d["Race"]))
				.attr("r", 10)
				.attr("opacity", 0)
				.transition()
				.attr("r", 50)
				.attr("opacity", 1)
				.duration(600);
		});
	}

	// initial circle display
	drawCircles(data);



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
		.classed("selected", true)
		.classed("handpointer", true);

	legend_circles = legend_circles.merge(new_circles);

	legend_g.selectAll("text")
		.data(["White", "Hispanic", "Black"])
		.enter()
		.append("text")
		.attr("x", 250)
		.attr("y", (d, i) => 100 + i * 500)
		.style("font-size", "300px")
		.text((d)=> d)

	// event handler for legend circle as checkbox
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
	});

	/*------------
	* Freaking animation
	------------*/
	// g-container for play/pause button
	const trigger = parentDOM.append("g")
		.attr("transform", "translate(7000, -250)")
		.classed("handpointer", true);

	// g-container for stop button
	const detrigger = parentDOM.append("g")
		.attr("transform", "translate(8500, -250)")
		.classed("handpointer", true);

	// rectangle for play/pause button
	trigger.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 1200)
		.attr("height", 1000)
		.attr("fill", "black");

	// rectangle for stop button
	detrigger.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 1000)
		.attr("height", 1000)
		.attr("fill", "orange");

	// the text that alters between play and pause
	let indicator = trigger.append('text')
		.style("font-size", "350px")
		.attr("fill", "white")
		.attr("x", 200)
		.attr("y", 600)
		.text("Play")

	// "stop" text
	detrigger.append("text")
		.style("font-size", "350px")
		.attr("fill", "white")
		.attr("x", 200)
		.attr("y", 600)
		.text("Stop");

	// slider parameters
	// currVal is the current coordinate of the handle
	let slide_width = 6000;
	let startDate = new Date("01/01/1982");
	let endDate = new Date("12/31/2018");
	let moving = false;
	let currVal = 0;
	let targetVal = slide_width;
	let timer;

	// the scale for the slide
	let x_slide = d3.scaleTime()
		.domain([startDate, endDate])
		.range([0, slide_width])
		.clamp(true);

	// g-container for components of sliders
	let slider = parentDOM.append("g")
		.attr("class", "slider")
		.attr("transform", "translate(500, -300)");

	// the main slide
	// mainly copy-pasted from
	// https://bl.ocks.org/officeofjane/47d2b0bfeecfcb41d2212d06d095c763?fbclid=IwAR2SLniIdZRIONKoq55sPrDL38kXUsB8QoQiw26FmDvdf5L3pVF6vDk2ego
	slider.append("line")
		.attr("class", "track")
		.attr("x1", x_slide.range()[0])
		.attr("x2", x_slide.range()[1])
		.select(function(){return this.parentNode.appendChild(this.cloneNode(true));}) // what?
		.attr("class", "track-inset")
		.select(function(){return this.parentNode.appendChild(this.cloneNode(true));}) // what?
		.attr("class", "track-overlay")
		.call(d3.drag()
			.on("start.interrupt", function(){slider.interrupt();})
			.on("start drag", function(){
				currVal = d3.event.x;
				update(x_slide.invert(currVal));
			})
		);

	// the ticks of the slide
	slider.insert("g", ".track-overlay")
		.attr("class", "ticks")
		.attr("transform", "translate(0, 250)")
		.selectAll("text")
		.data(x_slide.ticks(11))
		.enter()
		.append("text")
		.attr("x", (d) => x_slide(d))
		.attr("y", -20)
		.attr("text-anchor", "middle")
		.style("font-size", "150px")
		.text(function(d){return formatDateIntoYear(d); })
		.style("font-size", "200px");

	// the handle of the slide
	let handle = slider.insert("circle", ".track-overlay")
		.attr("class", "handle")
		.attr("r", 150);

	// the label of the slide
	let label = slider.append("text")
		.attr("class", "label")
		.attr("text-anchor", "middle")
		.attr("x", 0)
		.attr("y", -170)
		.style("font-size", "200px")
		.text(formatDateIntoYear(startDate))

	/*
	* Update the visualization: slider and circles
	* that = current dateTime (e.g. Jan 2005)
	* that = previous dateTime (e.g. Dec 2004)
	* Slider is always updated
	* Circles are only updated when we switch from one year to another
	*/
	function update(that, thee) {
		// update position and text of label according to slider scale
		handle.attr("cx", x_slide(that));

		label.attr("x", x_slide(that))
		 	.text(formatDateIntoYear(that));

		// filter dataset and redraw plot
		let newData = data.filter(function(d){
			let year = formatDateIntoYear(d["date"]);
			let thisYear = formatDateIntoYear(that);
			let month = formatDateIntoMonth(d["date"]);
			let thisMonth = formatDateIntoMonth(that);
			return (year == thisYear);
		}); // keep an eye on how to get the Year of d["Date"]

		let thatYear = formatDateIntoYear(that);
		let theeYear = formatDateIntoYear(thee);
		if (thatYear != theeYear)
			drawCircles(newData);
	}

	/*
	* Each step of the interval
	* Each step takes 100ms
	* The whole animation takes 200 steps
	*/
	function step(){
		currVal = currVal + (targetVal / 200);

		let that = x_slide.invert(currVal);
		let thee = x_slide.invert(currVal - targetVal / 200)
		let thatYear = formatDateIntoYear(that);
		let theeYear = formatDateIntoYear(thee);

		// update visualization
		update(that, thee);

		// story 1: show "#tec1", 1983
		// and pause
		if (thatYear >= 1983 && theeYear < 1983){
			d3.selectAll(".texas_text")
				.classed("hidden", true)

			d3.select("#tec1")
				.classed("hidden", false)

			clearInterval(timer);
			indicator.text("Play");
		}

		// story 2: show "#tec2", 1998
		// and pause
		if (thatYear >= 1998 && theeYear < 1998){
			d3.selectAll(".texas_text")
				.classed("hidden", true)

			d3.select("#tec2")
				.classed("hidden", false)

			clearInterval(timer);
			indicator.text("Play");
		}

		// story 3: show "#tec3", 2005
		// and pause
		if (thatYear >= 2005 && theeYear < 2005){
			d3.selectAll(".texas_text")
				.classed("hidden", true)

			d3.select("#tec3")
				.classed("hidden", false)

			clearInterval(timer);
			indicator.text("Play");
		}

		// if the handle reaches the end of the slider, reset
		if (currVal > targetVal) {
			drawCircles(data); // draw all circles
			moving = false;
			currVal = 0;
			clearInterval(timer);
			indicator.text("Play");

			d3.selectAll(".texas_text")
				.classed("hidden", true);

			// ending story: show "#tec3", 2005
			d3.select("#tec4")
				.classed("hidden", false);
		}
	}


	// Animation starts upon clicking play button
	// pauses upon clicking pause button
	trigger.on("click", function(){
		if (indicator.text() == "Pause") {
			moving = false;
			clearInterval(timer);
			indicator.text("Play")
		} else {
			moving = true;
			timer = setInterval(step, 100);
			indicator.text("Pause");
			d3.selectAll(".texas_text").classed("hidden", true);
		}
	});

	// upon clicking stop button, everything is reset to be initial
	detrigger.on("click", function(){
		d3.selectAll(".texas_text").classed("hidden", true);
		d3.select("#tec0").classed("hidden", false);

		drawCircles(data);
		moving = false;
		currVal = 0;
		clearInterval(timer);
		indicator.text("Play");

		// reset label and handle to the left 
		handle.attr("cx", x_slide(startDate));

		label.attr("x", x_slide(startDate))
		 	.text(formatDateIntoYear(startDate));
	});


}
