var vg1 = "vizzes/afl_games_by_state.json"
var vg2 = "vizzes/stadium_locations_map.json"

vegaEmbed("#vis1", vg1).catch(console.error);
vegaEmbed("#vis2", vg2).catch(console.error);