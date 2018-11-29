
const SVG = d3.select("#vis_area");

const HEIGHT = 600;
const WIDTH = 600;

const margin = {
	top: 10,
	right: 30,
	left: 40,
	bottom: 20
}

SVG.attr("width", WIDTH + margin.left + margin.right)
	.attr("height", HEIGHT + margin.top + margin.bottom);



d3.csv("http://127.0.0.1/Execution.csv").then(function(data){
	console.log(data);

	const sec1 = vis_overview(SVG, HEIGHT, WIDTH, data);

	sec1(SVG, 600, 600, data); 


});
