// Size of SVG
const HEIGHT = 900;
const WIDTH = 700;

const margin = {
	top: 10,
	right: 30,
	left: 40,
	bottom: 20
}

// some time objects and functions
let formatDateIntoYear = d3.timeFormat("%Y");
let formatDateIntoMonth = d3.timeFormat("%m");
let formatDate = d3.timeFormat("%b %Y");
let parseDate = d3.timeParse("%m/%d/%Y");

// preparing a new column. The new "date" attribute is a datetime object
function prepare(d) {
	d["date"] = parseDate(d["Date"]);
	return d;
}

Promise.all([
	d3.csv("_data/Execution.csv", prepare),
	d3.svg("geo/Texas_map.html")
]).then(function(DATA){
	data = DATA;
	console.log(data[0]);
	console.log(data[1]);

	// parameters of each functions
	/*
	* f: the function that update the visualization
	* width: width of the actual chart (in step3: it is the width of a row)
	* height: height of the actual chart (in step3: it is the height of a row)
	* DOMs: the html elements to be appended in "#vis_canvas"
	* prtDOMid: the id of the parent svg in each visualization
	*/
	const vis_funcs = {
		"step1": {
			"f": vis_overview,
			"width": 600,
			"height": 400,
			"DOMs": [
				$('<svg id="vis_area"></svg>')
			],
			"prtDOMid": "#vis_area"
		},
		"step2": {
			"f": vis_map,
			"width": 400,
			"height": 400,
			"DOMs": [
				data[1].querySelector("svg").outerHTML
			],
			"prtDOMid": "#Layer_1"
		},
		"step3": {
			"f": vis_dashboard,
			"width": 750,
			"height": 260,
			"DOMs": [
				$('<svg id="vis_area"></svg>')
			],
			"prtDOMid": "#vis_area"
		}
	}

	// initial display
	switchStep("step1");
	switchAnnotation("step1");
	switchVis("step1");

	// Click another step button and highlight that
	function switchStep(newStep) {
		d3.selectAll(".step_link").classed("active", false);
		d3.selectAll("#" + newStep).classed("active", true);
	}

	// Switch annotation according to the new step
	function switchAnnotation(newStep) {
		d3.selectAll(".step_annotation")
			.style("display", "none")
			.style("opacity", 0);

		d3.select("#" + newStep + "_annotation")
			.style("display", "block")
			.transition()
			.delay(300).duration(500)
			.style("opacity", 1);
	}

	// Switch visualization according to the new step
	function switchVis(newStep) {
		let that = vis_funcs[newStep];  // obtain the configuration object
		let vis = $("#vis_canvas");

		vis.html(''); // clear everything in "#vis_canvas"
		for (let i = 0; i < that["DOMs"].length; i++) {
			vis.append(that["DOMs"][i])  // append all the DOMs needed in "#vis_area" for this step
		}
		let prtDOM  = d3.select(that["prtDOMid"]); // prtDOM is the parent SVG

		prtDOM.attr("width", WIDTH + margin.left + margin.right)
			.attr("height", HEIGHT + margin.top + margin.bottom);

		 // call the update visualization function located in .js files in different folders
		that["f"](prtDOM, that["width"], that["height"], data[0]);
	}

	// event listener for switching step
	d3.selectAll(".step_link").on("click", function(d){
		let clickedStep = d3.select(this).attr("id");
		switchStep(clickedStep);
		switchAnnotation(clickedStep);
		switchVis(clickedStep);
		return false;
	});


});
