// tutorial.js — Interactive tutorial system for Tiny Town Traffic
// Manages guided tutorial steps, progress checking, tool/building highlights, and tutorial rendering.
// Depends on: world.js (hasNearbyRoad), ui.js (showNotification, setSpeed, selectTool), render.js (worldToScreen), lore.js
// Reads from global game state (G), canvas context (ctx, C), and TILE/COS_A/SIN_A constants.

const TUTORIAL_STEPS = [
{
id: 'welcome',
title: '🎓 Welcome, Commissioner!',
text: 'Welcome to <b>Tiny Town Traffic</b>! This interactive tutorial will teach you the basics of building roads and managing your town.<br><br>You\'re in Creative Mode with infinite money, so feel free to experiment!',
hint: '',
check: null,
highlightTool: null,
highlightBuildings: null
},
{
id: 'camera',
title: '📷 Camera Controls',
text: 'First, learn to look around!<br><br>• <b>WASD</b> or <b>Arrow Keys</b> — Pan the camera<br>• <b>Scroll wheel</b> — Zoom in/out<br>• <b>Q / E</b> — Rotate the view<br>• <b>Right-click drag</b> — Pan<br><br>Try moving the camera now!',
hint: 'Move the camera to continue',
check: 'camera_moved',
highlightTool: null,
highlightBuildings: null
},
{
id: 'select_dirt_road',
title: '🛤️ Select a Road Tool',
text: 'Great! Now let\'s build your first road.<br><br>Click the <b>Dirt Road</b> button in the left panel, or press <b>R</b> on your keyboard.',
hint: 'Select the Dirt Road tool',
check: 'tool_road_1lane',
highlightTool: 'road_1lane',
highlightBuildings: null
},
{
id: 'build_first_road',
title: '🏗️ Build Your First Road',
text: 'Now <b>click and drag</b> on the green grass tiles to place roads.<br><br>Try to build a road next to one of the houses (🏠). Buildings need an adjacent road tile to be connected!',
hint: 'Place at least 3 road tiles',
check: 'roads_placed_3',
highlightTool: 'road_1lane',
highlightBuildings: function(G) {
return G.buildings.filter(b => b.type === 'house').map(b => b.id);
}
},
{
id: 'connect_buildings',
title: '🔗 Connect Buildings',
text: 'Buildings show a <span style="color:#50dc50;">green dot</span> when connected to a road, and a <span style="color:#dc3c3c;">red dot</span> when not.<br><br>Keep building roads to connect <b>houses</b> to <b>offices</b> and <b>restaurants</b>. Families need roads to commute to work!',
hint: 'Connect at least 2 buildings',
check: 'buildings_connected_2',
highlightTool: null,
highlightBuildings: function(G) {
return G.buildings.filter(b => !hasNearbyRoad(b.x, b.y)).map(b => b.id);
}
},
{
id: 'unpause',
title: '⏩ Start the Simulation',
text: 'Your roads are in place! Now let\'s see the town come alive.<br><br>Press <b>Space</b> to unpause, or click the <b>▶</b> button. Use <b>1/2/3</b> keys for different speeds.',
hint: 'Unpause the game',
check: 'speed_changed',
highlightTool: null,
highlightBuildings: null
},
{
id: 'inspect',
title: '🔍 Inspect a Building',
text: 'While the simulation runs, let\'s learn to inspect buildings.<br><br>Select the <b>Inspect</b> tool (press <b>I</b>) and click on any building to see details about its families, workers, and connections.',
hint: 'Inspect any building',
check: 'inspected_building',
highlightTool: 'inspect',
highlightBuildings: null
},
{
id: 'upgrade_road',
title: '🛣️ Try a Better Road',
text: 'Dirt roads are slow. Try upgrading!<br><br>Select the <b>Two-Lane Road</b> tool (press <b>T</b>, costs $25) and build some. Faster roads = shorter commute times = happier workers.<br><br>Later you can unlock <b>Multi-Lane</b> and <b>Highways</b> for even more speed!',
hint: 'Build a Two-Lane road',
check: 'twolane_placed',
highlightTool: 'road_2lane',
highlightBuildings: null
},
{
id: 'build_highway',
title: '🛣️ Build a Highway',
text: 'Highways are the fastest roads in the game — they carry the most traffic and let vehicles travel at top speed.<br><br>Select the <b>Highway</b> tool (press <b>H</b>, costs $100) and place at least one segment. Use highways as main arteries between distant parts of your town.',
hint: 'Place a Highway segment',
check: 'tutorial_highway',
highlightTool: 'road_highway',
highlightBuildings: null
},
{
id: 'build_maintenance',
title: '🔧 Maintenance Depot',
text: 'Roads break down over time! A <b>Maintenance Depot</b> automatically dispatches repair vehicles to fix nearby broken roads.<br><br>Press <b>M</b> to select the Maintenance Depot tool ($200) and place one near your road network.',
hint: 'Place a Maintenance Depot',
check: 'tutorial_maintenance',
highlightTool: 'maintenance',
highlightBuildings: null
},
{
id: 'use_search',
title: '🔍 Search Bar',
text: 'The <b>Search Bar</b> in the HUD lets you find any road, building, or family by name.<br><br>Click the search box at the top of the screen and type a name — then select a result to jump the camera straight to it.',
hint: 'Search for something',
check: 'tutorial_search',
highlightTool: null,
highlightBuildings: null
},
{
id: 'open_late_report',
title: '⏰ Late Report',
text: 'The <b>Late Report</b> (press <b>Z</b> or click ⏰ in the HUD) shows which workers arrived late, grouped by house or business.<br><br>Press <b>Z</b> or click the ⏰ button to open the Late Report and see how your road network is performing.',
hint: 'Open the Late Report',
check: 'tutorial_late_report',
highlightTool: null,
highlightBuildings: null
},
{
id: 'artifact_road',
title: '🗺️ Artifacts & Clues',
text: 'Artifacts can be found by placing roads, clicking terrain with Inspect, or exploring near buildings.<br><br>Place <b>any road tile</b> to uncover the first clue.',
hint: 'Place a road to find a clue',
check: 'tutorial_artifact_1',
highlightTool: null,
highlightBuildings: null
},
{
id: 'artifact_inspect',
title: '🔍 Using Inspect',
text: 'Select the <b>Inspect</b> tool and click any tile on the map to search for clues.<br><br>Find the second clue using Inspect.',
hint: 'Inspect a tile to find a clue',
check: 'tutorial_artifact_2',
highlightTool: 'inspect',
highlightBuildings: null
},
{
id: 'pin_evidence',
title: '📌 Pin the Evidence',
text: 'Open your <b>Lore Journal</b> (press <b>N</b> or click 📜 in the HUD), go to the <b>Journal</b> tab, and pin both clues about the bear using the 📌 button.',
hint: 'Pin both clues in the journal',
check: 'tutorial_both_pinned',
highlightTool: null,
highlightBuildings: null
},
{
id: 'draw_connection',
title: '🔗 Connect the Evidence',
text: 'Go to the <b>Mystery Board</b> tab (press <b>N</b> to open the Journal if closed). Click one evidence card, then click the other to draw a connection between them.',
hint: 'Connect the two clues',
check: 'tutorial_connected',
highlightTool: null,
highlightBuildings: null
},
{
id: 'solve_deduction',
title: '🧩 Solve the Case',
text: 'A deduction challenge has unlocked in the Mystery Board. Read the question and choose your answer.',
hint: 'Solve the mystery',
check: 'tutorial_deduction_solved',
highlightTool: null,
highlightBuildings: null
},
{
id: 'complete',
title: '🎉 Tutorial Complete!',
text: 'You\'ve learned the basics!<br><br>• Connect buildings with roads so families can commute<br>• Faster roads reduce travel time<br>• Inspect buildings to check worker status<br>• Watch your budget in Normal mode!<br><br>Click <b>Finish</b> to keep playing in this sandbox, or go to <b>Settings → Main Menu</b> to start a real game.',
hint: '',
check: null,
highlightTool: null,
highlightBuildings: null
}
];

function startTutorial() {
startGame('creative');
G.tutorial = {
step: 0,
cameraStartX: G.camera.x,
cameraStartY: G.camera.y,
speedChanged: false,
inspectedBuilding: false,
roadsAtStart: G.roads.size
};
G.speed = 0;
setSpeed(0);
showTutorialStep();
}

function showTutorialStep() {
if (!G || !G.tutorial) return;
const step = TUTORIAL_STEPS[G.tutorial.step];
if (!step) return;
const popup = document.getElementById('tutorialPopup');
popup.style.display = 'block';
document.getElementById('tutPopStep').textContent = `Step ${G.tutorial.step + 1} / ${TUTORIAL_STEPS.length}`;
document.getElementById('tutPopTitle').textContent = step.title;
document.getElementById('tutPopText').innerHTML = step.text;
const hint = document.getElementById('tutPopHint');
hint.textContent = step.hint || '';
const nextBtn = document.getElementById('tutPopNext');
if (step.check) {
nextBtn.textContent = 'Waiting...';
nextBtn.classList.add('waiting');
nextBtn.onclick = null;
} else {
nextBtn.textContent = G.tutorial.step === TUTORIAL_STEPS.length - 1 ? 'Finish ✓' : 'Next →';
nextBtn.classList.remove('waiting');
nextBtn.onclick = advanceTutorialStep;
}
// Tool highlighting
document.querySelectorAll('.tool-btn.tut-highlight').forEach(b => b.classList.remove('tut-highlight'));
if (step.highlightTool) {
const btn = document.querySelector(`.tool-btn[data-tool="${step.highlightTool}"]`);
if (btn) btn.classList.add('tut-highlight');
}
// Tutorial highlights are drawn dynamically by drawTutorialHighlights()
G.highlightBuildings = [];
}

function advanceTutorialStep() {
if (!G || !G.tutorial) return;
G.tutorial.step++;
if (G.tutorial.step >= TUTORIAL_STEPS.length) {
endTutorial();
return;
}
showTutorialStep();
}

function skipTutorial() {
endTutorial();
}

function endTutorial() {
if (!G) return;
G.tutorial = null;
G.highlightBuildings = [];
document.getElementById('tutorialPopup').style.display = 'none';
document.querySelectorAll('.tool-btn.tut-highlight').forEach(b => b.classList.remove('tut-highlight'));
showNotification('Tutorial complete! You\'re ready to build.');
}

function giveTutorialArtifact(id) {
if (!G || G.artifactsFound.includes(id)) return;
const art = ARTIFACT_POOL.tutorial.find(a => a.id === id);
if (!art) return;
G.artifactsFound.push(id);
addToJournal('legends', art.text, []);
showArtifactPopup(art.title, art.text);
}

function checkTutorialArtifact1() {
return G.artifactsFound.includes('teddy_note_1');
}

function checkTutorialArtifact2() {
return G.artifactsFound.includes('teddy_note_2');
}

function checkTutorialBothPinned() {
if (!G.mysteryBoard) return false;
const art1 = ARTIFACT_POOL.tutorial.find(a => a.id === 'teddy_note_1');
const art2 = ARTIFACT_POOL.tutorial.find(a => a.id === 'teddy_note_2');
if (!art1 || !art2) return false;
const pinnedTexts = G.mysteryBoard.pinnedEntries.map(p => p.text);
return pinnedTexts.includes(art1.text) && pinnedTexts.includes(art2.text);
}

function checkTutorialConnected() {
if (!G.mysteryBoard || G.mysteryBoard.connections.length === 0) return false;
const art1 = ARTIFACT_POOL.tutorial.find(a => a.id === 'teddy_note_1');
const art2 = ARTIFACT_POOL.tutorial.find(a => a.id === 'teddy_note_2');
if (!art1 || !art2) return false;
return G.mysteryBoard.connections.some(c =>
(c.entryA === art1.text && c.entryB === art2.text) ||
(c.entryA === art2.text && c.entryB === art1.text)
);
}

function checkTutorialDeductionSolved() {
return G.mysteryBoard && G.mysteryBoard.solvedDeductions.includes('mystery_of_the_teddy_bear');
}

function checkTutorialProgress() {
if (!G || !G.tutorial) return;
// Stage tutorial artifacts on first tick
if (G.tutorial && !G.tutorialArtifactsGiven) {
G.tutorialArtifactsGiven = true;
G._pendingTutorialArtifact = 'teddy_note_1';
}
const step = TUTORIAL_STEPS[G.tutorial.step];
if (!step || !step.check) return;

let satisfied = false;
switch (step.check) {
case 'camera_moved': {
const dx = Math.abs(G.camera.x - G.tutorial.cameraStartX);
const dy = Math.abs(G.camera.y - G.tutorial.cameraStartY);
satisfied = (dx > 50 || dy > 50);
break;
}
case 'tool_road_1lane':
satisfied = G.selectedTool === 'road_1lane';
break;
case 'roads_placed_3':
satisfied = G.roads.size >= G.tutorial.roadsAtStart + 3;
break;
case 'buildings_connected_2': {
const connected = G.buildings.filter(b => hasNearbyRoad(b.x, b.y)).length;
satisfied = connected >= 2;
break;
}
case 'speed_changed':
satisfied = G.speed > 0;
break;
case 'inspected_building':
satisfied = G.tutorial.inspectedBuilding;
break;
case 'twolane_placed': {
let has2lane = false;
G.roads.forEach(r => { if (r.type === 'road_2lane') has2lane = true; });
satisfied = has2lane;
break;
}
case 'tutorial_highway': {
let hasHighway = false;
G.roads.forEach(r => { if (r.type === 'road_highway' || r.type === 'paid_highway') hasHighway = true; });
satisfied = hasHighway;
break;
}
case 'tutorial_maintenance': {
satisfied = G.buildings.some(b => b.type === 'maintenance');
break;
}
case 'tutorial_search': {
satisfied = !!G._tutorialSearched;
break;
}
case 'tutorial_late_report': {
satisfied = !!G._tutorialLateOpened;
break;
}
case 'tutorial_artifact_1': {
// Give artifact when a road was placed since this step became active
const prevRoadCount = G.tutorial._artifactStepRoads;
if (prevRoadCount === undefined) G.tutorial._artifactStepRoads = G.roads.size;
if (G.roads.size > G.tutorial._artifactStepRoads && G._pendingTutorialArtifact === 'teddy_note_1') {
giveTutorialArtifact('teddy_note_1');
delete G._pendingTutorialArtifact;
}
satisfied = checkTutorialArtifact1();
break;
}
case 'tutorial_artifact_2': {
satisfied = checkTutorialArtifact2();
break;
}
case 'tutorial_both_pinned': {
satisfied = checkTutorialBothPinned();
break;
}
case 'tutorial_connected': {
satisfied = checkTutorialConnected();
break;
}
case 'tutorial_deduction_solved': {
satisfied = checkTutorialDeductionSolved();
break;
}
}

if (satisfied) {
const nextBtn = document.getElementById('tutPopNext');
nextBtn.textContent = 'Continue →';
nextBtn.classList.remove('waiting');
nextBtn.onclick = advanceTutorialStep;
}
}

function drawTutorialHighlights() {
if (!G || !G.tutorial) return;
const step = TUTORIAL_STEPS[G.tutorial.step];
if (!step) return;
const zoom = G.camera.zoom;
const tw = TILE * COS_A * 2 * zoom;
const th = TILE * SIN_A * 2 * zoom;
// Dynamically compute highlighted buildings from step function
if (step.highlightBuildings) {
const ids = step.highlightBuildings(G);
const pulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
for (const id of ids) {
const b = G.buildings.find(bb => bb.id === id);
if (!b) continue;
const sp = worldToScreen(b.x, b.y);
if (sp.x < -tw*2 || sp.x > C.width+tw*2 || sp.y < -th*6 || sp.y > C.height+th*2) continue;
ctx.strokeStyle = `rgba(68, 255, 136, ${pulse})`;
ctx.lineWidth = 3 * zoom;
ctx.beginPath();
ctx.arc(sp.x, sp.y - 12*zoom, tw*0.5, 0, Math.PI*2);
ctx.stroke();
// Pulsing arrow pointing down
ctx.fillStyle = `rgba(68, 255, 136, ${pulse})`;
ctx.beginPath();
ctx.moveTo(sp.x, sp.y + th*0.2);
ctx.lineTo(sp.x - 5*zoom, sp.y + th*0.2 - 8*zoom);
ctx.lineTo(sp.x + 5*zoom, sp.y + th*0.2 - 8*zoom);
ctx.closePath();
ctx.fill();
}
}
// Draw subtle text hint near center bottom when tutorial is active
const hintText = step.hint;
if (hintText) {
ctx.save();
ctx.font = '13px "Segoe UI", sans-serif';
ctx.fillStyle = 'rgba(26,26,46,0.7)';
const metrics = ctx.measureText(hintText);
const textW = metrics.width + 20;
ctx.beginPath();
ctx.roundRect(C.width/2 - textW/2, C.height - 50, textW, 28, 8);
ctx.fill();
ctx.fillStyle = 'rgba(78,140,80,0.9)';
ctx.font = '13px "Segoe UI", sans-serif';
ctx.textAlign = 'center';
ctx.fillText(hintText, C.width/2, C.height - 32);
ctx.restore();
}
}
