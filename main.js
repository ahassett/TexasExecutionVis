
const SVG = d3.select("#vis_area");
const TEXAS = d3.select("#Layer_1");

const HEIGHT = 800;
const WIDTH = 800;

const margin = {
	top: 10,
	right: 30,
	left: 40,
	bottom: 20
}

SVG.attr("width", WIDTH + margin.left + margin.right)
	.attr("height", HEIGHT + margin.top + margin.bottom);



d3.csv("http://127.0.0.1:8000/_data/Execution.csv").then(function(data){
	console.log(data);

	const vis_funcs = {
		"step1": {
			"f": vis_overview,
			"width": 400,
			"height": 400,
			"prtDOM": SVG
		},
		"step2": {
			"f": vis_map,
			"width": 800,
			"height": 800,
			"prtDOM": TEXAS
		},
		"step3": {
			"f": vis_dashboard,
			"width": 700,
			"height": 300,
			"prtDOM": SVG
		}
	}

	// initial display
	switchStep("step1");
	switchAnnotation("step1");
	switchVis("step1");

	/*--------------
	* Stepper
	---------------*/
	function switchStep(newStep) {
		d3.selectAll(".step_link").classed("active", false);
		d3.selectAll("#" + newStep).classed("active", true);
	}

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

	function switchVis(newStep) {
		let that = vis_funcs[newStep];
		d3.selectAll("svg").classed("hidden", true);
		that["prtDOM"].classed("hidden", false);
		that["f"](that["prtDOM"], that["width"], that["height"], data);
	}

	d3.selectAll(".step_link").on("click", function(d){
		let clickedStep = d3.select(this).attr("id");
		switchStep(clickedStep);
		switchAnnotation(clickedStep);
		switchVis(clickedStep);
		return false;
	});

	$("#test").load("http://127.0.0.1:8000/geo/texas.html #race-checkbox"); 


});
