var vg1 = "vizzes/afl_games_by_state.json"
var vg2 = "vizzes/stadium_states_map.json"
var vg3 = "vizzes/stadium_type_map.json"
var vg4 = "vizzes/stadium_per_capita_map.json"
var vg5 = "vizzes/average_capacity_by_type.json"

vegaEmbed("#vis1", vg1).catch(console.error);
vegaEmbed("#vis2", vg2).catch(console.error);
vegaEmbed("#vis4", vg4).catch(console.error);
vegaEmbed("#vis5", vg5).catch(console.error);
vegaEmbed("#vis3", vg3).then(({view}) => {
	const canvas = document.querySelector("#vis3 canvas");
	if (!canvas) return;

	let dragStart;
	canvas.style.touchAction = "none";
	canvas.style.cursor = "grab";

	canvas.addEventListener("pointerdown", event => {
		if (event.button !== 0) return;
		const bounds = canvas.getBoundingClientRect();
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
			scaleX: canvas.width / bounds.width,
			scaleY: canvas.height / bounds.height,
			mapBounds,
			mapWidth: view.width(),
			mapHeight: view.height()
		};
		canvas.setPointerCapture(event.pointerId);
		canvas.style.cursor = "grabbing";
	});

	canvas.addEventListener("pointermove", event => {
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
		canvas.style.cursor = "grab";
	};
	canvas.addEventListener("pointerup", stopDragging);
	canvas.addEventListener("pointercancel", stopDragging);
}).catch(console.error);