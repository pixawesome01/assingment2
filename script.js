var vg1 = "vizzes/venue_capacity_bubble.json"
var vg2 = "vizzes/stadium_states_map.json"
var vg3 = "vizzes/stadium_type_map.json"
var vg4 = "vizzes/stadium_per_capita_map.json"
var vg5 = "vizzes/average_capacity_by_type.json"
var vg6 = "vizzes/afl_venue_timeline.json"
var vg7 = "vizzes/stadium_mix_by_state.json"
var vg8 = "vizzes/attendance_dot_plot.json"
var vg9 = "vizzes/stadium_type_donut.json"
var vg10 = "vizzes/stadium_type_sport_heatmap.json"
var embedOptions = {actions: false}

vegaEmbed("#vis1", vg9, embedOptions).catch(console.error);
vegaEmbed("#vis2", vg10, embedOptions).catch(console.error);
vegaEmbed("#vis3", vg5, embedOptions).catch(console.error);
vegaEmbed("#vis5", vg7, embedOptions).catch(console.error);
vegaEmbed("#vis6", vg2, embedOptions).catch(console.error);
vegaEmbed("#vis7", vg4, embedOptions).catch(console.error);
vegaEmbed("#vis8", vg1, embedOptions).catch(console.error);
vegaEmbed("#vis9", vg8, embedOptions).catch(console.error);
vegaEmbed("#vis10", vg6, embedOptions).catch(console.error);

vegaEmbed("#vis4", vg3, embedOptions).then(({view}) => {
	const mapSurface = document.querySelector("#vis4 canvas, #vis4 svg");
	if (!mapSurface) return;

	let dragStart;
	mapSurface.style.touchAction = "none";
	mapSurface.style.cursor = "grab";

	mapSurface.addEventListener("pointerdown", event => {
		if (event.button !== 0) return;
		const bounds = mapSurface.getBoundingClientRect();
		const marks = [
			...view.data("layer_0_marks"),
			...view.data("layer_1_marks")
		];
		const mapBounds = marks.reduce((result, mark) => ({
			x1: Math.min(result.x1, mark.bounds.x1),
			y1: Math.min(result.y1, mark.bounds.y1),
			x2: Math.max(result.x2, mark.bounds.x2),
			y2: Math.max(result.y2, mark.bounds.y2)
		}), {x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity});
		dragStart = {
			x: event.clientX,
			y: event.clientY,
			translate: view.signal("mapTranslate"),
			scaleX: view.width() / bounds.width,
			scaleY: view.height() / bounds.height,
			mapBounds,
			mapWidth: view.width(),
			mapHeight: view.height()
		};
		mapSurface.setPointerCapture(event.pointerId);
		mapSurface.style.cursor = "grabbing";
	});

	mapSurface.addEventListener("pointermove", event => {
		if (!dragStart) return;
		const deltaX = (event.clientX - dragStart.x) * dragStart.scaleX;
		const deltaY = (event.clientY - dragStart.y) * dragStart.scaleY;
		const clampPan = (delta, start, end, size) => {
			const fits = end - start <= size - 8;
			const min = fits ? 4 - start : size - 4 - end;
			const max = fits ? size - 4 - end : 4 - start;
			return Math.max(min, Math.min(max, delta));
		};
		const translate = [
			dragStart.translate[0] + clampPan(deltaX, dragStart.mapBounds.x1, dragStart.mapBounds.x2, dragStart.mapWidth),
			dragStart.translate[1] + clampPan(deltaY, dragStart.mapBounds.y1, dragStart.mapBounds.y2, dragStart.mapHeight)
		];
		view.signal("mapTranslate", translate).runAsync();
	});

	const stopDragging = () => {
		dragStart = undefined;
		mapSurface.style.cursor = "grab";
	};
	mapSurface.addEventListener("pointerup", stopDragging);
	mapSurface.addEventListener("pointercancel", stopDragging);
}).catch(console.error);
