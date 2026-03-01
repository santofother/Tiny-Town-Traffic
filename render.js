// render.js — Rendering & visual display for Tiny Town Traffic
// Contains all drawing functions: terrain, roads, buildings, vehicles, minimap, sky/ambient lighting.
// Reads from global game state (G) and canvas context (ctx, C). Does not modify game state.
// Depends on: world.js (getRoadAtLevel, isFlyoverTile), lore.js (CAR_COLORS, TRUCK_COLORS)

function getSkyColor() {
const h = getTimeOfDay();
if (h < 7) return lerpColor('#0c1830','#ffdcb0', (h-5)/2);
if (h < 10) return lerpColor('#ffdcb0','#78c8f0', (h-7)/3);
if (h < 16) return '#78c8f0';
if (h < 19) return lerpColor('#78c8f0','#ff9050', (h-16)/3);
if (h < 21) return lerpColor('#ff9050','#1a1a3e', (h-19)/2);
return '#0c1830';
}

function getAmbient() {
const h = getTimeOfDay();
if (h < 7) return 0.45 + (h-5)*0.1;
if (h < 10) return 0.65 + (h-7)*0.12;
if (h < 16) return 1.0;
if (h < 19) return 1.0 - (h-16)*0.12;
if (h < 21) return 0.64 - (h-19)*0.08;
return 0.45;
}

function lerpColor(a, b, t) {
t = Math.max(0, Math.min(1, t));
const ar = parseInt(a.slice(1,3),16), ag = parseInt(a.slice(3,5),16), ab = parseInt(a.slice(5,7),16);
const br = parseInt(b.slice(1,3),16), bg = parseInt(b.slice(3,5),16), bb = parseInt(b.slice(5,7),16);
const r = Math.round(ar + (br-ar)*t), g = Math.round(ag + (bg-ag)*t), bl = Math.round(ab + (bb-ab)*t);
return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bl.toString(16).padStart(2,'0')}`;
}

function adjustBrightness(color, factor) {
let r,g,b;
if (color.startsWith('#')) {
r = parseInt(color.slice(1,3),16); g = parseInt(color.slice(3,5),16); b = parseInt(color.slice(5,7),16);
} else if (color.startsWith('rgb')) {
const m = color.match(/(\d+)/g);
if (m) { r = +m[0]; g = +m[1]; b = +m[2]; } else { r=g=b=128; }
} else { r=g=b=128; }
r = Math.min(255,Math.max(0,Math.round(r*factor)));
g = Math.min(255,Math.max(0,Math.round(g*factor)));
b = Math.min(255,Math.max(0,Math.round(b*factor)));
return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

function getTerrainColor(type, x, y) {
const amb = getAmbient();
const h = getTimeOfDay();
const noise = ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * 0.08;
// Check if outside playable area — dim it
let playDim = 1.0;
if (G.playableRadius) {
const pdx = x - G.playableCenter.x, pdy = y - G.playableCenter.y;
const pDist = Math.sqrt(pdx*pdx + pdy*pdy);
if (pDist > G.playableRadius + 3) playDim = 0.35;
else if (pDist > G.playableRadius) playDim = 0.35 + 0.65 * (1 - (pDist - G.playableRadius) / 3);
}
const a = amb * playDim;
switch(type) {
case 0: { // grass — lush bright green
const warmShift = h > 17 ? (h-17)/5 * 20 : 0;
const r = Math.floor((75 + noise*45 + warmShift) * a);
const g = Math.floor((170 + noise*30 - warmShift*0.5) * a);
const b = Math.floor((55 + noise*25) * a);
return `rgb(${r},${g},${b})`;
}
case 1: case 4: { // water — vivid blue-teal
const depth = type === 4 ? 0.8 : 1.0;
const wave = Math.sin(Date.now()/1200 + x*0.7 + y*1.3) * 10;
const r = Math.floor((40 + wave) * a * depth);
const g = Math.floor((140 + wave*1.5) * a * depth);
const b = Math.floor((210 + wave*0.5) * a);
return `rgb(${r},${g},${b})`;
}
case 3: { // river — brighter flowing blue
const rwave = Math.sin(Date.now()/700 + x*2 + y*0.5) * 12;
const r = Math.floor((45 + rwave) * a);
const g = Math.floor((150 + rwave) * a);
const b = Math.floor((220) * a);
return `rgb(${r},${g},${b})`;
}
case 2: { // mountain — warm earthy browns with snow caps
const mh = G.heightMap[y] ? G.heightMap[y][x] || 0.4 : 0.4;
if (mh > 0.55) return `rgb(${Math.floor(235*a)},${Math.floor(240*a)},${Math.floor(245*a)})`;
if (mh > 0.48) return `rgb(${Math.floor((160+noise*40)*a)},${Math.floor((145+noise*30)*a)},${Math.floor((120+noise*20)*a)})`;
return `rgb(${Math.floor((130+noise*50)*a)},${Math.floor((110+noise*35)*a)},${Math.floor((75+noise*25)*a)})`;
}
default: return `rgb(${Math.floor(75*a)},${Math.floor(170*a)},${Math.floor(55*a)})`;
}
}

function drawTileSurface(sx, sy, color, tileW, tileH) {
ctx.fillStyle = color;
ctx.beginPath();
ctx.moveTo(sx, sy - tileH/2);
ctx.lineTo(sx + tileW/2, sy);
ctx.lineTo(sx, sy + tileH/2);
ctx.lineTo(sx - tileW/2, sy);
ctx.closePath();
ctx.fill();
}

function drawIsoBox(sx, sy, color, tileW, tileH, height) {
const darker = adjustBrightness(color, 0.7);
const darkest = adjustBrightness(color, 0.5);
// Top
ctx.fillStyle = color;
ctx.beginPath();
ctx.moveTo(sx, sy - height - tileH/2);
ctx.lineTo(sx + tileW/2, sy - height);
ctx.lineTo(sx, sy - height + tileH/2);
ctx.lineTo(sx - tileW/2, sy - height);
ctx.closePath();
ctx.fill();
// Right face
ctx.fillStyle = darker;
ctx.beginPath();
ctx.moveTo(sx + tileW/2, sy - height);
ctx.lineTo(sx, sy - height + tileH/2);
ctx.lineTo(sx, sy + tileH/2);
ctx.lineTo(sx + tileW/2, sy);
ctx.closePath();
ctx.fill();
// Left face
ctx.fillStyle = darkest;
ctx.beginPath();
ctx.moveTo(sx - tileW/2, sy - height);
ctx.lineTo(sx, sy - height + tileH/2);
ctx.lineTo(sx, sy + tileH/2);
ctx.lineTo(sx - tileW/2, sy);
ctx.closePath();
ctx.fill();
}

function render() {
C.width = window.innerWidth;
C.height = window.innerHeight;
ctx.globalAlpha = 1; // safety reset
if (!G.terrain || G.terrain.length === 0) return; // terrain not yet generated
// Sky
ctx.fillStyle = getSkyColor();
ctx.fillRect(0, 0, C.width, C.height);
const zoom = G.camera.zoom;
const tw = TILE * COS_A * 2 * zoom;
const th = TILE * SIN_A * 2 * zoom;
// Determine visible tiles
const centerWorld = screenToWorld(C.width/2, C.height/2);
const viewRange = Math.ceil(Math.max(C.width, C.height) / (TILE * zoom) / 1.2) + 4;
const minX = Math.max(0, centerWorld.x - viewRange);
const maxX = Math.min(MAP_W - 1, centerWorld.x + viewRange);
const minY = Math.max(0, centerWorld.y - viewRange);
const maxY = Math.min(MAP_H - 1, centerWorld.y + viewRange);
const amb = getAmbient();
// Draw terrain (skip tiles that have a bridge — the bridge renderer draws terrain underneath)
for (let y = minY; y <= maxY; y++) {
for (let x = minX; x <= maxX; x++) {
const sp = worldToScreen(x, y);
if (sp.x < -tw || sp.x > C.width + tw || sp.y < -th*3 || sp.y > C.height + th*3) continue;
const bRoad = G.roads.get(`${x},${y}`);
if (bRoad && (bRoad.type === 'road_flyover' || bRoad.bridge)) continue;
const ttype = G.terrain[y][x];
const color = getTerrainColor(ttype, x, y);
drawTileSurface(sp.x, sp.y, color, tw, th);
// Mountain height
if (ttype === 2) {
const mh = G.heightMap[y] ? (G.heightMap[y][x] - 0.35) * 80 * zoom : 10;
const mamb = getAmbient();
const mhVal = G.heightMap[y] ? G.heightMap[y][x] || 0.4 : 0.4;
const mColor = mhVal > 0.55 ? adjustBrightness('#e8edf2', mamb) : mhVal > 0.48 ? adjustBrightness('#a09070', mamb) : adjustBrightness('#8a7050', mamb);
drawIsoBox(sp.x, sp.y, mColor, tw*0.8, th*0.8, Math.max(5, mh));
}
}
}
// Debug artifact tile overlay
if (G.debugShowArtifacts) {
// Only highlight terrain types that still have undiscovered artifacts
const hasGround = ARTIFACT_POOL.ground.some(a => !G.artifactsFound.includes(a.id));
const hasMountain = ARTIFACT_POOL.mountain.some(a => !G.artifactsFound.includes(a.id));
const hasLake = ARTIFACT_POOL.lake.some(a => !G.artifactsFound.includes(a.id));
ctx.globalAlpha = 0.25;
for (let y = minY; y <= maxY; y++) {
for (let x = minX; x <= maxX; x++) {
const t = G.terrain[y][x];
const k = `${x},${y}`;
// Ground: grass tiles without a road (building a road triggers discovery)
if (t === 0 && hasGround && !G.roads.has(k) && !G.elevatedRoads.has(k)) {
const sp2 = worldToScreen(x, y);
if (sp2.x < -tw || sp2.x > C.width + tw || sp2.y < -th*3 || sp2.y > C.height + th*3) continue;
drawTileSurface(sp2.x, sp2.y, 'rgba(50,255,50,1)', tw, th);
}
// Mountain: mountain tiles without a tunnel (tunneling triggers discovery)
else if (t === 2 && hasMountain && !G.elevatedRoads.has(k)) {
const sp2 = worldToScreen(x, y);
if (sp2.x < -tw || sp2.x > C.width + tw || sp2.y < -th*3 || sp2.y > C.height + th*3) continue;
drawTileSurface(sp2.x, sp2.y, 'rgba(255,165,50,1)', tw, th);
}
// Water: water tiles (clicking triggers discovery)
else if ((t === 1 || t === 3 || t === 4) && hasLake) {
const sp2 = worldToScreen(x, y);
if (sp2.x < -tw || sp2.x > C.width + tw || sp2.y < -th*3 || sp2.y > C.height + th*3) continue;
drawTileSurface(sp2.x, sp2.y, 'rgba(50,150,255,1)', tw, th);
}
}
}
ctx.globalAlpha = 1;
}
// Draw terrain feature names
G.terrainNames.forEach(tn => {
const lp = worldToScreen(tn.x, tn.y);
if (lp.x < -200 || lp.x > C.width+200 || lp.y < -100 || lp.y > C.height+100) return;
const nameColor = tn.type === 'river' ? `rgba(200,230,255,${amb*0.75})` :
tn.type === 'lake' ? `rgba(180,220,255,${amb*0.8})` :
`rgba(240,230,210,${amb*0.75})`;
ctx.fillStyle = nameColor;
ctx.font = `italic ${(tn.type === 'mountain' ? 11 : 10)*zoom}px 'Segoe UI'`;
ctx.textAlign = 'center';
ctx.fillText(tn.name, lp.x, lp.y - (tn.type === 'mountain' ? 30 : 8)*zoom);
});
// Draw commute zone rings when inspecting office/restaurant
if (G.commuteZoneCenter) {
const czc = G.commuteZoneCenter;
const zoneColors = ['rgba(76,175,80,0.12)','rgba(255,235,59,0.10)','rgba(255,152,0,0.09)','rgba(244,67,54,0.08)','rgba(156,39,176,0.07)'];
const zoneDistances = [8, 16, 25, 35, 50];
ctx.save();
for (let zi = zoneDistances.length - 1; zi >= 0; zi--) {
const tileDist = zoneDistances[zi];
const screenRadius = tileDist * TILE * zoom * COS_A * 1.4;
const sp = worldToScreen(czc.x, czc.y);
ctx.fillStyle = zoneColors[zi];
ctx.beginPath();
ctx.ellipse(sp.x, sp.y, screenRadius, screenRadius * 0.5, 0, 0, Math.PI * 2);
ctx.fill();
ctx.strokeStyle = zoneColors[zi].replace(/[\d.]+\)$/, '0.35)');
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.ellipse(sp.x, sp.y, screenRadius, screenRadius * 0.5, 0, 0, Math.PI * 2);
ctx.stroke();
}
ctx.restore();
}
// Draw roads
G.roads.forEach((road, key) => {
const [rx, ry] = key.split(',').map(Number);
const sp = worldToScreen(rx, ry);
if (sp.x < -tw || sp.x > C.width + tw || sp.y < -th*2 || sp.y > C.height + th*2) return;
drawRoad(sp, road, tw, th, rx, ry);
});
// Draw elevated roads (render on top of ground roads)
G.elevatedRoads.forEach((road, key) => {
const [rx, ry] = key.split(',').map(Number);
const sp = worldToScreen(rx, ry);
if (sp.x < -tw || sp.x > C.width + tw || sp.y < -th*2 || sp.y > C.height + th*2) return;
drawRoad(sp, road, tw, th, rx, ry);
});
// Draw diagonal road connection wedges
const hx = tw / 2, hy = th / 2;
const hasAnyRoad = (k) => G.roads.has(k) || G.elevatedRoads.has(k);
G.roads.forEach((road, key) => {
const [rx, ry] = key.split(',').map(Number);
const sp = worldToScreen(rx, ry);
if (sp.x < -tw*2 || sp.x > C.width + tw*2 || sp.y < -th*3 || sp.y > C.height + th*3) return;
const wedgeColor = getRoadColor(road);
const wedgeSize = 0.3;
// Check 4 diagonal neighbors: [dx, dy, cardinal1, cardinal2, corner]
// NE: shares Right corner; SE: shares Bottom corner; SW: shares Left corner; NW: shares Top corner
const diags = [
[1, -1, `${rx+1},${ry}`, `${rx},${ry-1}`, {x: sp.x + hx, y: sp.y}],           // NE → Right corner
[1, 1, `${rx+1},${ry}`, `${rx},${ry+1}`, {x: sp.x, y: sp.y + hy}],             // SE → Bottom corner
[-1, 1, `${rx-1},${ry}`, `${rx},${ry+1}`, {x: sp.x - hx, y: sp.y}],            // SW → Left corner
[-1, -1, `${rx-1},${ry}`, `${rx},${ry-1}`, {x: sp.x, y: sp.y - hy}]            // NW → Top corner
];
for (const [dx, dy, card1, card2, corner] of diags) {
if (hasAnyRoad(`${rx+dx},${ry+dy}`) && !hasAnyRoad(card1) && !hasAnyRoad(card2)) {
// Draw wedge triangle at the shared corner
ctx.fillStyle = wedgeColor;
ctx.beginPath();
ctx.moveTo(corner.x, corner.y);
ctx.lineTo(corner.x + (sp.x - corner.x) * wedgeSize, corner.y + (sp.y - corner.y) * wedgeSize - hy * wedgeSize);
ctx.lineTo(corner.x + (sp.x - corner.x) * wedgeSize, corner.y + (sp.y - corner.y) * wedgeSize + hy * wedgeSize);
ctx.closePath();
ctx.fill();
}
}
});
// Bridge/flyover inter-tile diagonal gap filler
const gapFillRoads = (road, key) => {
const isBr = road.type === 'road_flyover' || road.bridge;
if (!isBr) return;
const [rx, ry] = key.split(',').map(Number);
const sp = worldToScreen(rx, ry);
if (sp.x < -tw*2 || sp.x > C.width + tw*2 || sp.y < -th*3 || sp.y > C.height + th*3) return;
const isBridgeAt2 = (k) => { const r = G.roads.get(k) || G.elevatedRoads.get(k); return r && (r.type==='road_flyover'||r.bridge); };
const bl = 6 * zoom;
const bridgeColor = getRoadColor(road);
const bsp = {x: sp.x, y: sp.y - bl};
const bhx = tw / 2, bhy = th / 2;
const diags2 = [
[1, -1, `${rx+1},${ry}`, `${rx},${ry-1}`, {x: bsp.x + bhx, y: bsp.y}],
[1,  1, `${rx+1},${ry}`, `${rx},${ry+1}`, {x: bsp.x,       y: bsp.y + bhy}],
[-1, 1, `${rx-1},${ry}`, `${rx},${ry+1}`, {x: bsp.x - bhx, y: bsp.y}],
[-1,-1, `${rx-1},${ry}`, `${rx},${ry-1}`, {x: bsp.x,       y: bsp.y - bhy}]
];
for (const [dx, dy, card1, card2, corner] of diags2) {
if (isBridgeAt2(`${rx+dx},${ry+dy}`) && !isBridgeAt2(card1) && !isBridgeAt2(card2)) {
ctx.fillStyle = bridgeColor;
ctx.beginPath();
ctx.moveTo(corner.x, corner.y);
ctx.lineTo(corner.x + (bsp.x - corner.x) * 0.3, corner.y + (bsp.y - corner.y) * 0.3 - bhy * 0.3);
ctx.lineTo(corner.x + (bsp.x - corner.x) * 0.3, corner.y + (bsp.y - corner.y) * 0.3 + bhy * 0.3);
ctx.closePath();
ctx.fill();
}
}
};
G.roads.forEach(gapFillRoads);
G.elevatedRoads.forEach(gapFillRoads);
// Draw driveways from buildings to adjacent road (max 1 tile)
// Draw driveways from buildings to adjacent road (max 1 tile)
G.buildings.forEach(b => {
const bsp = worldToScreen(b.x, b.y);
if (bsp.x < -tw*3 || bsp.x > C.width + tw*3 || bsp.y < -th*6 || bsp.y > C.height + th*3) return;
// Only draw driveway to directly adjacent road (1 tile away)
for (const [ddx, ddy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
const rx = b.x + ddx, ry = b.y + ddy;
const adjRoad = G.roads.get(`${rx},${ry}`) || G.elevatedRoads.get(`${rx},${ry}`);
if (adjRoad && !adjRoad.type.includes('highway')) {
const roadSp = worldToScreen(rx, ry);
const driveColor = `rgba(155,150,140,${amb * 0.75})`;
const edgeColor = `rgba(120,115,105,${amb * 0.5})`;
const driveW = 4 * zoom;
// Draw driveway as an isometric strip from building to road edge
// Compute perpendicular for width in iso space
const dx = roadSp.x - bsp.x, dy = roadSp.y - bsp.y;
const len = Math.sqrt(dx*dx + dy*dy);
if (len < 1) break;
const px = (-dy / len) * driveW * 0.5;
const py = (dx / len) * driveW * 0.5;
// Driveway strip (filled quad)
ctx.fillStyle = driveColor;
ctx.beginPath();
ctx.moveTo(bsp.x + px, bsp.y + py);
ctx.lineTo(roadSp.x + px, roadSp.y + py);
ctx.lineTo(roadSp.x - px, roadSp.y - py);
ctx.lineTo(bsp.x - px, bsp.y - py);
ctx.closePath();
ctx.fill();
// Edge lines
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(0.5, zoom * 0.5);
ctx.beginPath();
ctx.moveTo(bsp.x + px, bsp.y + py);
ctx.lineTo(roadSp.x + px, roadSp.y + py);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(bsp.x - px, bsp.y - py);
ctx.lineTo(roadSp.x - px, roadSp.y - py);
ctx.stroke();
// Driveway pad at building end (small isometric diamond)
const padSize = 3 * zoom;
ctx.fillStyle = `rgba(145,140,130,${amb * 0.8})`;
ctx.beginPath();
ctx.moveTo(bsp.x, bsp.y - padSize * 0.4);
ctx.lineTo(bsp.x + padSize * 0.7, bsp.y);
ctx.lineTo(bsp.x, bsp.y + padSize * 0.4);
ctx.lineTo(bsp.x - padSize * 0.7, bsp.y);
ctx.closePath();
ctx.fill();
break; // Only draw one driveway
}
}
});
// Draw parking lots attached to buildings — driveway connector
G.parkingLots.forEach(p => {
if (!p.buildingId) return;
const building = G.buildings.find(b => b.id === p.buildingId);
if (!building) return;
const psp = worldToScreen(p.x, p.y);
const bsp2 = worldToScreen(building.x, building.y);
if (psp.x < -tw*2 || psp.x > C.width + tw*2 || psp.y < -th*3 || psp.y > C.height + th*3) return;
// Draw wide driveway path from building to parking lot
const dx = psp.x - bsp2.x, dy = psp.y - bsp2.y;
const len = Math.sqrt(dx*dx + dy*dy) || 1;
const perpX = (-dy / len) * 3 * zoom, perpY = (dx / len) * 3 * zoom;
ctx.fillStyle = `rgba(90,90,98,${amb * 0.7})`;
ctx.beginPath();
ctx.moveTo(bsp2.x + perpX, bsp2.y + perpY);
ctx.lineTo(psp.x + perpX, psp.y + perpY);
ctx.lineTo(psp.x - perpX, psp.y - perpY);
ctx.lineTo(bsp2.x - perpX, bsp2.y - perpY);
ctx.closePath();
ctx.fill();
// Driveway edge lines
ctx.strokeStyle = `rgba(60,60,68,${amb * 0.5})`;
ctx.lineWidth = Math.max(0.5, zoom * 0.4);
ctx.beginPath();
ctx.moveTo(bsp2.x + perpX, bsp2.y + perpY);
ctx.lineTo(psp.x + perpX, psp.y + perpY);
ctx.moveTo(bsp2.x - perpX, bsp2.y - perpY);
ctx.lineTo(psp.x - perpX, psp.y - perpY);
ctx.stroke();
});
// Draw parking lots (before buildings so they appear behind in iso view)
G.parkingLots.forEach(p => {
const sp = worldToScreen(p.x, p.y);
if (sp.x < -tw || sp.x > C.width + tw || sp.y < -th*2 || sp.y > C.height + th*2) return;
const lotW = tw * 0.95, lotH = th * 0.95;
// Yellow border outline for visibility
ctx.strokeStyle = `rgba(200,180,60,${amb * 0.5})`;
ctx.lineWidth = Math.max(1, zoom * 0.7);
ctx.beginPath();
ctx.moveTo(sp.x, sp.y - lotH*0.5);
ctx.lineTo(sp.x + lotW*0.5, sp.y);
ctx.lineTo(sp.x, sp.y + lotH*0.5);
ctx.lineTo(sp.x - lotW*0.5, sp.y);
ctx.closePath();
ctx.stroke();
// Asphalt surface
drawTileSurface(sp.x, sp.y, `rgba(70,70,78,${amb})`, lotW * 0.95, lotH * 0.95);
// Parking space lines
ctx.strokeStyle = `rgba(220,220,200,${amb * 0.45})`;
ctx.lineWidth = Math.max(0.5, zoom * 0.4);
const lineCount = 3;
for (let li = 1; li <= lineCount; li++) {
const t = li / (lineCount + 1);
const lx = sp.x + (lotW * 0.5 - lotW) * (1-t) + (-lotW * 0.5 + lotW) * t - lotW*0.5;
const ly = sp.y - lotH * 0.5 * (1-t) + lotH * 0.5 * t;
ctx.beginPath();
ctx.moveTo(sp.x - lotW*0.15 + li*lotW*0.15, sp.y - lotH*0.25 + li*lotH*0.08);
ctx.lineTo(sp.x - lotW*0.15 + li*lotW*0.15 + lotW*0.12, sp.y + lotH*0.05 + li*lotH*0.08);
ctx.stroke();
}
// 3D side edge
ctx.fillStyle = `rgba(50,50,58,${amb})`;
const edgeH = 1.5 * zoom;
ctx.beginPath();
ctx.moveTo(sp.x - lotW*0.5, sp.y);
ctx.lineTo(sp.x, sp.y + lotH*0.5);
ctx.lineTo(sp.x, sp.y + lotH*0.5 + edgeH);
ctx.lineTo(sp.x - lotW*0.5, sp.y + edgeH);
ctx.closePath();
ctx.fill();
ctx.fillStyle = `rgba(40,40,48,${amb})`;
ctx.beginPath();
ctx.moveTo(sp.x, sp.y + lotH*0.5);
ctx.lineTo(sp.x + lotW*0.5, sp.y);
ctx.lineTo(sp.x + lotW*0.5, sp.y + edgeH);
ctx.lineTo(sp.x, sp.y + lotH*0.5 + edgeH);
ctx.closePath();
ctx.fill();
// Draw entry indicators for connected sides
if (p.connectedSides && p.connectedSides.length > 0) {
// Iso diamond corners: cTop = (0, -lotH/2), cRight = (lotW/2, 0), cBottom = (0, lotH/2), cLeft = (-lotW/2, 0)
const cTop = {x: sp.x, y: sp.y - lotH*0.5};
const cRight = {x: sp.x + lotW*0.5, y: sp.y};
const cBottom = {x: sp.x, y: sp.y + lotH*0.5};
const cLeft = {x: sp.x - lotW*0.5, y: sp.y};
const edgeMids = {
    N: {x: (cTop.x+cRight.x)/2, y: (cTop.y+cRight.y)/2},
    E: {x: (cRight.x+cBottom.x)/2, y: (cRight.y+cBottom.y)/2},
    S: {x: (cBottom.x+cLeft.x)/2, y: (cBottom.y+cLeft.y)/2},
    W: {x: (cLeft.x+cTop.x)/2, y: (cLeft.y+cTop.y)/2}
};
// Outward normals for each side (in iso space)
const outNormals = {
    N: {x: 0.5, y: -0.25}, E: {x: 0.5, y: 0.25}, S: {x: -0.5, y: 0.25}, W: {x: -0.5, y: -0.25}
};
const sz = 3 * zoom;
for (const side of p.connectedSides) {
    const mid = edgeMids[side];
    const norm = outNormals[side];
    ctx.fillStyle = `rgba(80,200,80,${amb*0.8})`;
    ctx.beginPath();
    // Small chevron/triangle pointing outward
    ctx.moveTo(mid.x + norm.x * sz, mid.y + norm.y * sz);
    ctx.lineTo(mid.x - norm.y * sz * 0.6, mid.y + norm.x * sz * 0.6);
    ctx.lineTo(mid.x + norm.y * sz * 0.6, mid.y - norm.x * sz * 0.6);
    ctx.closePath();
    ctx.fill();
    // Dashed line from entry to center
    ctx.strokeStyle = `rgba(80,200,80,${amb*0.4})`;
    ctx.lineWidth = Math.max(0.5, zoom * 0.5);
    ctx.setLineDash([2*zoom, 2*zoom]);
    ctx.beginPath();
    ctx.moveTo(mid.x, mid.y);
    ctx.lineTo(sp.x, sp.y);
    ctx.stroke();
    ctx.setLineDash([]);
}
}
// P label with capacity
ctx.fillStyle = p.paid ? `rgba(255,204,0,${amb*0.9})` : `rgba(200,200,220,${amb * 0.7})`;
ctx.font = `bold ${Math.max(7, 9*zoom)}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText(`${p.paid ? '$ ' : ''}P ${p.used}/${p.capacity}`, sp.x, sp.y + 3*zoom);
});
// Draw buildings
G.buildings.forEach(b => {
const sp = worldToScreen(b.x, b.y);
if (sp.x < -tw*2 || sp.x > C.width + tw*2 || sp.y < -th*6 || sp.y > C.height + th*2) return;
drawBuilding(sp, b, tw, th);
// Highlight ring if this building is in the highlight list
if (G.highlightBuildings.includes(b.id)) {
const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
ctx.strokeStyle = G.highlightColor;
ctx.globalAlpha = pulse;
ctx.lineWidth = 2.5 * zoom;
ctx.beginPath();
ctx.arc(sp.x, sp.y - 15*zoom, tw*0.55, 0, Math.PI*2);
ctx.stroke();
// Downward pointer arrow
ctx.fillStyle = G.highlightColor;
ctx.beginPath();
ctx.moveTo(sp.x, sp.y + th*0.3);
ctx.lineTo(sp.x - 4*zoom, sp.y + th*0.3 - 6*zoom);
ctx.lineTo(sp.x + 4*zoom, sp.y + th*0.3 - 6*zoom);
ctx.closePath();
ctx.fill();
ctx.globalAlpha = 1;
}
});
// Draw maintenance buildings
G.maintenanceBuildings.forEach(mb => {
const sp = worldToScreen(mb.x, mb.y);
if (sp.x < -tw*2 || sp.x > C.width + tw*2 || sp.y < -th*4 || sp.y > C.height + th*2) return;
const mbColor = adjustBrightness('#b46432', amb);
drawIsoBox(sp.x, sp.y, mbColor, tw*1.2, th*1.2, 25*zoom);
ctx.fillStyle = `rgba(255,200,0,${amb})`;
ctx.font = `bold ${10*zoom}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText('🔧', sp.x, sp.y - 30*zoom);
});
// Draw breakdowns
G.breakdowns.forEach(bd => {
const sp = worldToScreen(bd.x, bd.y);
ctx.fillStyle = '#ff4444';
ctx.font = `${14*zoom}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText('⚠', sp.x, sp.y - 15*zoom);
});
// Draw vehicles
G.vehicles.forEach(v => {
if (!v.active) return;
const sp = worldToScreen(v.x, v.y);
if (sp.x < -20 || sp.x > C.width + 20 || sp.y < -20 || sp.y > C.height + 20) return;
// Offset Y for elevated vehicles (matching bridge lift)
if (v.level === 1) {
sp.y -= 12 * zoom; // match elevated bridgeLift
}
drawVehicle(sp, v, zoom);
});
// Draw maintenance vehicles
G.maintenanceVehicles.forEach(mv => {
const sp = worldToScreen(mv.x, mv.y);
if (sp.x < -20 || sp.x > C.width + 20 || sp.y < -20 || sp.y > C.height + 20) return;
drawVehicle(sp, {color:'#e8a020', angle: mv.angle, braking:false, isTruck:false}, zoom);
// Flashing amber roof light
const flash = (Math.sin(Date.now()/300) + 1) * 0.5;
ctx.fillStyle = `rgba(255,180,30,${0.4 + flash * 0.6})`;
ctx.beginPath();
ctx.arc(sp.x, sp.y - 10*zoom, 2.5*zoom, 0, Math.PI*2);
ctx.fill();
});
// Draw crash sites
G.crashes.forEach(crash => {
const sp = worldToScreen(crash.x, crash.y);
if (sp.x < -tw || sp.x > C.width + tw || sp.y < -th || sp.y > C.height + th) return;
// Flashing warning circle
const flash = Math.sin(Date.now() / 200) > 0 ? 1 : 0.4;
ctx.fillStyle = `rgba(255,60,20,${flash * 0.3})`;
ctx.beginPath();
ctx.ellipse(sp.x, sp.y, 12*zoom, 6*zoom, 0, 0, Math.PI*2);
ctx.fill();
// Crash icon
ctx.font = `${14*zoom}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText('💥', sp.x, sp.y - 6*zoom);
// Small timer bar
const pct = crash.timer / 600;
ctx.fillStyle = 'rgba(0,0,0,0.5)';
ctx.fillRect(sp.x - 10*zoom, sp.y + 4*zoom, 20*zoom, 3*zoom);
ctx.fillStyle = '#ff6644';
ctx.fillRect(sp.x - 10*zoom, sp.y + 4*zoom, 20*zoom * pct, 3*zoom);
});
// Draw cost popups
drawCostPopups();
// Draw intersections controls
G.intersections.forEach((ctrl, key) => {
const [ix, iy] = key.split(',').map(Number);
const sp = worldToScreen(ix, iy);
if (sp.x < -tw || sp.x > C.width + tw || sp.y < -th*2 || sp.y > C.height + th*2) return;
if (ctrl.type === 'light') {
// Traffic light post
ctx.fillStyle = `rgba(60,60,60,${amb})`;
ctx.fillRect(sp.x - 1.5*zoom, sp.y - 28*zoom, 3*zoom, 18*zoom);
const nsGreen = ctrl.greenAxis === 'NS';
const phase = ctrl.phase || 'green';
// NS light state: green if nsGreen&green, yellow if nsGreen&yellow, red otherwise
// EW light state: green if !nsGreen&green, yellow if !nsGreen&yellow, red otherwise
const nsState = nsGreen ? phase : 'red';
const ewState = !nsGreen ? phase : 'red';
// Left housing (N/S)
const lx = sp.x - 5*zoom;
ctx.fillStyle = `rgba(40,40,40,${amb})`;
ctx.fillRect(lx - 3*zoom, sp.y - 30*zoom, 6*zoom, 14*zoom);
// Red
ctx.fillStyle = nsState === 'red' ? `rgba(255,50,50,${amb})` : `rgba(80,40,40,${amb*0.4})`;
ctx.beginPath(); ctx.arc(lx, sp.y - 27*zoom, 1.6*zoom, 0, Math.PI*2); ctx.fill();
// Yellow
ctx.fillStyle = nsState === 'yellow' ? `rgba(255,220,50,${amb})` : `rgba(80,70,30,${amb*0.4})`;
ctx.beginPath(); ctx.arc(lx, sp.y - 23*zoom, 1.6*zoom, 0, Math.PI*2); ctx.fill();
// Green
ctx.fillStyle = nsState === 'green' ? `rgba(50,255,50,${amb})` : `rgba(40,80,40,${amb*0.4})`;
ctx.beginPath(); ctx.arc(lx, sp.y - 19*zoom, 1.6*zoom, 0, Math.PI*2); ctx.fill();
// Right housing (E/W)
const rx2 = sp.x + 5*zoom;
ctx.fillStyle = `rgba(40,40,40,${amb})`;
ctx.fillRect(rx2 - 3*zoom, sp.y - 30*zoom, 6*zoom, 14*zoom);
// Red
ctx.fillStyle = ewState === 'red' ? `rgba(255,50,50,${amb})` : `rgba(80,40,40,${amb*0.4})`;
ctx.beginPath(); ctx.arc(rx2, sp.y - 27*zoom, 1.6*zoom, 0, Math.PI*2); ctx.fill();
// Yellow
ctx.fillStyle = ewState === 'yellow' ? `rgba(255,220,50,${amb})` : `rgba(80,70,30,${amb*0.4})`;
ctx.beginPath(); ctx.arc(rx2, sp.y - 23*zoom, 1.6*zoom, 0, Math.PI*2); ctx.fill();
// Green
ctx.fillStyle = ewState === 'green' ? `rgba(50,255,50,${amb})` : `rgba(40,80,40,${amb*0.4})`;
ctx.beginPath(); ctx.arc(rx2, sp.y - 19*zoom, 1.6*zoom, 0, Math.PI*2); ctx.fill();
} else if (ctrl.type === 'roundabout') {
// Roundabout circle with arrows
ctx.strokeStyle = `rgba(255,255,255,${amb*0.6})`;
ctx.lineWidth = 2.5*zoom;
ctx.beginPath();
ctx.arc(sp.x, sp.y, 7*zoom, 0, Math.PI*2);
ctx.stroke();
// Center island
ctx.fillStyle = `rgba(100,180,100,${amb*0.5})`;
ctx.beginPath();
ctx.arc(sp.x, sp.y, 3.5*zoom, 0, Math.PI*2);
ctx.fill();
// Arrow indicators
ctx.strokeStyle = `rgba(255,255,255,${amb*0.8})`;
ctx.lineWidth = 1.5*zoom;
for (let a = 0; a < 4; a++) {
const angle = a * Math.PI/2 + Math.PI/4;
const ax = sp.x + Math.cos(angle) * 5*zoom;
const ay = sp.y + Math.sin(angle) * 5*zoom;
ctx.beginPath();
ctx.moveTo(ax, ay);
const tipAngle = angle + Math.PI/3;
ctx.lineTo(ax + Math.cos(tipAngle) * 2.5*zoom, ay + Math.sin(tipAngle) * 2.5*zoom);
ctx.stroke();
}
} else if (ctrl.type === 'stop') {
// Per-direction stop signs at road edges
const stopDirs = ctrl.stopDirs || {N:true,S:true,E:true,W:true};
const dirVecs = {N:[0,-1], S:[0,1], E:[1,0], W:[-1,0]};
for (const dir of ['N','S','E','W']) {
if (!stopDirs[dir]) continue;
const [dx,dy] = dirVecs[dir];
const offX = (dx - dy) * tw/4;
const offY = (dx + dy) * th/4;
const sx = sp.x + offX;
const sy2 = sp.y + offY - 12*zoom;
const sz = 3.2*zoom;
// Octagon
ctx.fillStyle = `rgba(220,40,40,${amb})`;
ctx.beginPath();
for (let i = 0; i < 8; i++) {
const angle = (i * Math.PI / 4) - Math.PI / 8;
const ox = sx + Math.cos(angle) * sz;
const oy = sy2 + Math.sin(angle) * sz;
if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
}
ctx.closePath();
ctx.fill();
ctx.strokeStyle = `rgba(255,255,255,${amb*0.8})`;
ctx.lineWidth = 0.6*zoom;
ctx.stroke();
// Post
ctx.fillStyle = `rgba(100,100,100,${amb})`;
ctx.fillRect(sx - 0.8*zoom, sp.y + offY - 8*zoom, 1.6*zoom, 7*zoom);
}
}
});
// Draw connection indicators on buildings (green=connected, red=no road)
G.buildings.forEach(b => {
const bsp = worldToScreen(b.x, b.y);
if (bsp.x < -tw*2 || bsp.x > C.width+tw*2 || bsp.y < -th*6 || bsp.y > C.height+th*2) return;
const connected = hasNearbyRoad(b.x, b.y);
const indicatorColor = connected ? 'rgba(80,220,80,0.8)' : 'rgba(220,60,60,0.7)';
ctx.fillStyle = indicatorColor;
ctx.beginPath();
ctx.arc(bsp.x + tw*0.35, bsp.y - 4*zoom, 3*zoom, 0, Math.PI*2);
ctx.fill();
ctx.strokeStyle = 'rgba(0,0,0,0.3)';
ctx.lineWidth = 1;
ctx.stroke();
});
// Draw parking lot connection indicators
G.parkingLots.forEach(p => {
const psp = worldToScreen(p.x, p.y);
if (psp.x < -tw || psp.x > C.width+tw || psp.y < -th*2 || psp.y > C.height+th*2) return;
const connected = p.connectedSides && p.connectedSides.length > 0;
const indicatorColor = connected ? 'rgba(80,220,80,0.7)' : 'rgba(220,60,60,0.6)';
ctx.fillStyle = indicatorColor;
ctx.beginPath();
ctx.arc(psp.x + tw*0.3, psp.y - 2*zoom, 2.5*zoom, 0, Math.PI*2);
ctx.fill();
});
// Draw demolish area selection
if (G.selectedTool === 'demolish' && G.demolishStart && G.demolishEnd) {
const x1 = Math.min(G.demolishStart.x, G.demolishEnd.x);
const y1 = Math.min(G.demolishStart.y, G.demolishEnd.y);
const x2 = Math.max(G.demolishStart.x, G.demolishEnd.x);
const y2 = Math.max(G.demolishStart.y, G.demolishEnd.y);
for (let dy = y1; dy <= y2; dy++) {
for (let dx = x1; dx <= x2; dx++) {
const dsp = worldToScreen(dx, dy);
if (dsp.x < -tw || dsp.x > C.width+tw || dsp.y < -th*2 || dsp.y > C.height+th*2) continue;
ctx.globalAlpha = 0.35;
const hasRoad = G.roads.has(`${dx},${dy}`) || G.elevatedRoads.has(`${dx},${dy}`);
drawTileSurface(dsp.x, dsp.y, hasRoad ? '#ff3333' : '#cc6644', tw, th);
ctx.globalAlpha = 0.6;
ctx.strokeStyle = '#ff3333';
ctx.lineWidth = 1.5*zoom;
ctx.beginPath();
ctx.moveTo(dsp.x, dsp.y - th/2);
ctx.lineTo(dsp.x + tw/2, dsp.y);
ctx.lineTo(dsp.x, dsp.y + th/2);
ctx.lineTo(dsp.x - tw/2, dsp.y);
ctx.closePath();
ctx.stroke();
ctx.globalAlpha = 1;
}
}
// Show count
const count = countRoadsInArea(x1,y1,x2,y2);
if (count > 0) {
const midSp = worldToScreen((x1+x2)/2, (y1+y2)/2);
ctx.fillStyle = 'rgba(26,26,46,0.85)';
ctx.beginPath();
ctx.roundRect(midSp.x - 40, midSp.y - 35, 80, 24, 6);
ctx.fill();
ctx.fillStyle = '#ff6666';
ctx.font = `bold ${11*zoom}px 'Segoe UI'`;
ctx.textAlign = 'center';
ctx.fillText(`Demolish ${count} roads`, midSp.x, midSp.y - 18);
}
}
// Draw straight line preview
else if (G.selectedTool && (G.selectedTool.startsWith('road') || G.selectedTool.startsWith('paid')) && G.straightMode && G.straightStart) {
const mp = screenToWorld(mouseX, mouseY);
const sx = G.straightStart.x, sy = G.straightStart.y;
const ex = mp.x, ey = mp.y;
const baseTiles = getStraightRoadTiles(sx, sy, ex, ey);
// For wide roads (multi-lane, highway), add parallel tiles
const isWide = G.selectedTool.includes('multi') || G.selectedTool.includes('highway');
let tiles = baseTiles;
if (isWide && baseTiles.length >= 2) {
tiles = [];
// Determine drag direction from the line: mostly horizontal or mostly vertical
const lineDx = ex - sx, lineDy = ey - sy;
const dir = Math.abs(lineDx) >= Math.abs(lineDy) ? 'h' : 'v';
for (const t of baseTiles) {
tiles.push(t);
// Widen perpendicular to drag direction
const nx = dir === 'h' ? t.x : t.x + 1;
const ny = dir === 'h' ? t.y + 1 : t.y;
tiles.push({x: nx, y: ny});
}
}
if (tiles.length > 0) {
const placeable = [];
for (const t of tiles) {
if (t.x < 0 || t.x >= MAP_W || t.y < 0 || t.y >= MAP_H) continue;
const psp = worldToScreen(t.x, t.y);
const canPlace = canPlaceRoad(G.selectedTool, t.x, t.y);
ctx.globalAlpha = 0.4;
drawTileSurface(psp.x, psp.y, canPlace ? '#4ea050' : '#cc5544', tw * 0.7, th * 0.7);
ctx.globalAlpha = 1;
if (canPlace) placeable.push(t);
}
// Cost preview — for highways flanking tiles are free, count only base tiles
const costTiles = isWide ? placeable.filter((t, i) => {
// Base tiles are at even indices in the expanded array
return baseTiles.some(bt => bt.x === t.x && bt.y === t.y);
}).length : placeable.length;
const cost = costTiles * (ROAD_COSTS[G.selectedTool] || 25);
const midTile = tiles[Math.floor(tiles.length / 2)];
const midSp = worldToScreen(midTile.x, midTile.y);
ctx.fillStyle = 'rgba(26,26,46,0.85)';
ctx.beginPath();
ctx.roundRect(midSp.x - 50, midSp.y - 35, 100, 24, 6);
ctx.fill();
ctx.fillStyle = cost > G.money && G.mode !== 'creative' ? '#ff6666' : '#88dd88';
ctx.font = `bold ${11*zoom}px 'Segoe UI'`;
ctx.textAlign = 'center';
ctx.fillText(`${placeable.length} tiles — $${cost}`, midSp.x, midSp.y - 18);
}
// Start marker
const startSp = worldToScreen(sx, sy);
ctx.strokeStyle = '#44ff44';
ctx.lineWidth = 2*zoom;
ctx.beginPath();
ctx.arc(startSp.x, startSp.y, 5*zoom, 0, Math.PI*2);
ctx.stroke();
ctx.globalAlpha = 1;
}
// Normal ghost tile for single placement
else if (G.selectedTool && G.selectedTool !== 'inspect' && G.selectedTool !== 'demolish') {
const mp = screenToWorld(mouseX, mouseY);
if (mp.x >= 0 && mp.x < MAP_W && mp.y >= 0 && mp.y < MAP_H) {
const gp = worldToScreen(mp.x, mp.y);
const isRoadTool = G.selectedTool.startsWith('road') || G.selectedTool.startsWith('paid');
const canPlace = isRoadTool ? canPlaceRoad(G.selectedTool, mp.x, mp.y) : true;
ctx.globalAlpha = 0.35;
drawTileSurface(gp.x, gp.y, canPlace ? '#4e8c50' : '#cc6644', tw, th);
ctx.globalAlpha = 0.7;
ctx.strokeStyle = canPlace ? '#4e8c50' : '#cc6644';
ctx.lineWidth = 2 * zoom;
ctx.beginPath();
ctx.moveTo(gp.x, gp.y - th/2);
ctx.lineTo(gp.x + tw/2, gp.y);
ctx.lineTo(gp.x, gp.y + th/2);
ctx.lineTo(gp.x - tw/2, gp.y);
ctx.closePath();
ctx.stroke();
ctx.globalAlpha = 1;
}
}
// Demolish single tile ghost
else if (G.selectedTool === 'demolish' && !G.demolishStart) {
const mp = screenToWorld(mouseX, mouseY);
if (mp.x >= 0 && mp.x < MAP_W && mp.y >= 0 && mp.y < MAP_H) {
const gp = worldToScreen(mp.x, mp.y);
ctx.globalAlpha = 0.35;
drawTileSurface(gp.x, gp.y, '#cc4444', tw, th);
ctx.globalAlpha = 0.7;
ctx.strokeStyle = '#cc4444';
ctx.lineWidth = 2 * zoom;
ctx.beginPath();
ctx.moveTo(gp.x, gp.y - th/2);
ctx.lineTo(gp.x + tw/2, gp.y);
ctx.lineTo(gp.x, gp.y + th/2);
ctx.lineTo(gp.x - tw/2, gp.y);
ctx.closePath();
ctx.stroke();
ctx.globalAlpha = 1;
}
}
// Tutorial highlights
if (G.tutorial) drawTutorialHighlights();
// Minimap
renderMinimap();
}

function getRoadColor(road) {
const amb = getAmbient();
switch(road.type) {
case 'road_1lane': return adjustBrightness('#9a8868', amb);
case 'road_2lane': case 'paid_2lane': return adjustBrightness('#a0a0a8', amb);
case 'road_oneway': return adjustBrightness('#a8a0b0', amb);
case 'road_multi': case 'paid_multi': return adjustBrightness('#b0b0b8', amb);
case 'road_highway': case 'paid_highway': return adjustBrightness('#c8c0a8', amb);
case 'road_flyover': return adjustBrightness('#b0b0b0', amb);
case 'road_tunnel': return adjustBrightness('#787068', amb);
default: return adjustBrightness('#989898', amb);
}
}

function getRoadWidth(road) {
if (road.type.includes('highway')) return 0.50;
if (road.type.includes('multi')) return 0.42;
if (road.type.includes('2lane') || road.type.includes('flyover') || road.type === 'road_oneway') return 0.32;
return 0.24;
}

function drawRoad(sp, road, tw, th, rx, ry) {
const amb = getAmbient();
const zoom = G.camera.zoom;
const color = getRoadColor(road);
const edgeColor = adjustBrightness(color, 0.65);
const sideColor = adjustBrightness(color, 0.5);
const isPaid = road.type.startsWith('paid');
const rw = getRoadWidth(road);
const hx = tw / 2;
const hy = th / 2;

// Neighbor connectivity (check both regular and elevated roads)
const hasRoad = (k) => G.roads.has(k) || G.elevatedRoads.has(k);
const hasN = hasRoad(`${rx},${ry-1}`);
const hasS = hasRoad(`${rx},${ry+1}`);
const hasE = hasRoad(`${rx+1},${ry}`);
const hasW = hasRoad(`${rx-1},${ry}`);
const conCount = (hasN?1:0) + (hasS?1:0) + (hasE?1:0) + (hasW?1:0);

// Tile-based approach: fill full isometric diamond as road surface
const roadH = 2 * zoom;
const isFlyover = road.type === 'road_flyover';
const isBridge = isFlyover || road.bridge;
const isElevated = road.type.includes('highway') && road.elevation === 1;
const isGroundHighway = road.type.includes('highway') && road.elevation === 0;
const isTunnel = road.type === 'road_tunnel';

// Bridge/tunnel/elevated neighbor detection for seamless rendering
const isBridgeAt = (k) => { const r = G.roads.get(k) || G.elevatedRoads.get(k); return r && (r.type==='road_flyover'||r.bridge); };
const isTunnelAt = (k) => { const r = G.roads.get(k) || G.elevatedRoads.get(k); return r && r.type==='road_tunnel'; };
const isElevatedAt = (k) => G.elevatedRoads.has(k);
const isHighwayAt = (k) => { const r = G.roads.get(k) || G.elevatedRoads.get(k); return r && r.type.includes('highway'); };
// Bridges/elevated connect to other bridges, elevated, highways, and regular roads (smooth on-ramp)
const isBridgeNeighbor = (k) => isBridgeAt(k) || isElevatedAt(k) || isHighwayAt(k) || G.roads.has(k);
const hasBridgeN = (isBridge || isElevated) && isBridgeNeighbor(`${rx},${ry-1}`);
const hasBridgeS = (isBridge || isElevated) && isBridgeNeighbor(`${rx},${ry+1}`);
const hasBridgeE = (isBridge || isElevated) && isBridgeNeighbor(`${rx+1},${ry}`);
const hasBridgeW = (isBridge || isElevated) && isBridgeNeighbor(`${rx-1},${ry}`);
const hasTunnelN = isTunnel && isTunnelAt(`${rx},${ry-1}`);
const hasTunnelS = isTunnel && isTunnelAt(`${rx},${ry+1}`);
const hasTunnelE = isTunnel && isTunnelAt(`${rx+1},${ry}`);
const hasTunnelW = isTunnel && isTunnelAt(`${rx-1},${ry}`);
const tunnelNeighborCount = (hasTunnelN?1:0)+(hasTunnelS?1:0)+(hasTunnelE?1:0)+(hasTunnelW?1:0);

// 1. Fill the tile — bridges are elevated (show water below), tunnels show mountain
if (isBridge || isElevated) {
// Draw terrain underneath first (slightly oversized to cover gaps with adjacent water)
const terrainType = (ry >= 0 && ry < MAP_H && rx >= 0 && rx < MAP_W) ? G.terrain[ry][rx] : 0;
const underColor = getTerrainColor(terrainType, rx, ry);
const overDraw = isElevated ? Math.max(4, zoom * 4) : Math.max(1, zoom * 0.5);
drawTileSurface(sp.x, sp.y, underColor, tw + overDraw, th + overDraw);
const bridgeLift = isElevated ? 12 * zoom : 6 * zoom;
drawTileSurface(sp.x, sp.y - bridgeLift, color, tw + overDraw, th + overDraw);
// Side walls on non-connected edges to seal bridge visually against water
const sideColor = adjustBrightness(color, 0.65);
const drawBridgeSide = (x1, y1, x2, y2) => {
ctx.fillStyle = sideColor;
ctx.beginPath();
ctx.moveTo(x1, y1 - bridgeLift);
ctx.lineTo(x2, y2 - bridgeLift);
ctx.lineTo(x2, y2);
ctx.lineTo(x1, y1);
ctx.closePath();
ctx.fill();
};
// N edge (top-left to top-right): top→right corners
if (!hasBridgeN) drawBridgeSide(sp.x, sp.y - th/2, sp.x + tw/2, sp.y);
// E edge (top-right to bottom-right): right→bottom corners
if (!hasBridgeE) drawBridgeSide(sp.x + tw/2, sp.y, sp.x, sp.y + th/2);
// S edge (bottom-right to bottom-left): bottom→left corners
if (!hasBridgeS) drawBridgeSide(sp.x, sp.y + th/2, sp.x - tw/2, sp.y);
// W edge (bottom-left to top-left): left→top corners
if (!hasBridgeW) drawBridgeSide(sp.x - tw/2, sp.y, sp.x, sp.y - th/2);
// Full-tile corners at bridge lift height (no deckScale — tiles share exact corners)
const dcTop    = {x: sp.x,       y: sp.y - bridgeLift - th/2};
const dcRight  = {x: sp.x + tw/2, y: sp.y - bridgeLift};
const dcBottom = {x: sp.x,       y: sp.y - bridgeLift + th/2};
const dcLeft   = {x: sp.x - tw/2, y: sp.y - bridgeLift};
// Shoulder wedges on non-connected edges
const deckShoulder = (1 - rw * 1.4) / 2;
if (deckShoulder > 0.02) {
const fillDeckWedge = (p1, p2, connected) => {
if (connected) return;
const wColor = adjustBrightness(color, 0.7);
const inL = lerp2(p1, p2, deckShoulder);
const inR = lerp2(p1, p2, 1 - deckShoulder);
ctx.fillStyle = wColor;
ctx.beginPath();
ctx.moveTo(p1.x, p1.y);
ctx.lineTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.lineTo(p2.x, p2.y);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, zoom * 0.6);
ctx.beginPath();
ctx.moveTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.stroke();
};
fillDeckWedge(dcTop,    dcRight,  hasBridgeN);
fillDeckWedge(dcRight,  dcBottom, hasBridgeE);
fillDeckWedge(dcBottom, dcLeft,   hasBridgeS);
fillDeckWedge(dcLeft,   dcTop,    hasBridgeW);
}
// Support pillars — suppress on sides with adjacent bridge/elevated
const pillarColor = isElevated ? `rgba(160,155,140,${amb})` : `rgba(140,120,90,${amb})`;
ctx.fillStyle = pillarColor;
const pw = isElevated ? 3.5 * zoom : 2.5 * zoom;
// Left pillar: only if no bridge to W or N
if (!hasBridgeW && !hasBridgeN) {
ctx.fillRect(sp.x - tw*0.3 - pw/2, sp.y - bridgeLift + 1, pw, bridgeLift + th*0.15);
}
// Right pillar: only if no bridge to E or S
if (!hasBridgeE && !hasBridgeS) {
ctx.fillRect(sp.x + tw*0.3 - pw/2, sp.y - bridgeLift + 1, pw, bridgeLift + th*0.15);
}
if (isElevated && !hasBridgeW && !hasBridgeE && !hasBridgeN && !hasBridgeS) {
// Extra center pillar for isolated elevated highways
ctx.fillRect(sp.x - pw/2, sp.y - bridgeLift + 1, pw, bridgeLift + th*0.15);
}
// Railing lines — suppress on connected sides
ctx.strokeStyle = isElevated ? `rgba(200,195,180,${amb * 0.7})` : `rgba(180,160,130,${amb * 0.7})`;
ctx.lineWidth = Math.max(1, zoom * 0.6);
const rlY = sp.y - bridgeLift - 2*zoom;
// Top railing: only if no bridge to N
if (!hasBridgeN) {
ctx.beginPath();
ctx.moveTo(sp.x - tw*0.35, rlY + th*0.17);
ctx.lineTo(sp.x + tw*0.35, rlY - th*0.17);
ctx.stroke();
}
// Bottom railing: only if no bridge to S
if (!hasBridgeS) {
ctx.beginPath();
ctx.moveTo(sp.x - tw*0.35, rlY + th*0.33);
ctx.lineTo(sp.x + tw*0.35, rlY + th*0.0);
ctx.stroke();
}
} else if (isTunnel) {
// Draw mountain terrain as base
const terrainType = (ry >= 0 && ry < MAP_H && rx >= 0 && rx < MAP_W) ? G.terrain[ry][rx] : 0;
const mtnColor = getTerrainColor(terrainType, rx, ry);
drawTileSurface(sp.x, sp.y, mtnColor, tw, th);
if (tunnelNeighborCount >= 2) {
// Interior tunnel tile — full tile ceiling so adjacent tiles connect seamlessly
drawTileSurface(sp.x, sp.y - 2*zoom, adjustBrightness(mtnColor, 0.7), tw, th);
// Dark passage interior
drawTileSurface(sp.x, sp.y, `rgba(30,25,20,${amb * 0.7})`, tw * 0.65, th * 0.65);
// Road surface visible inside
drawTileSurface(sp.x, sp.y + th*0.1, color, tw * 0.45, th * 0.25);
} else {
// Entrance tile — draw arch facing the opening direction (non-tunnel side)
const tunnelW = tw * 0.5;
const tunnelH = th * 0.55;
// Determine which direction the opening faces (the non-tunnel neighbor side)
const openN = !hasTunnelN && hasN;
const openS = !hasTunnelS && hasS;
const openE = !hasTunnelE && hasE;
const openW = !hasTunnelW && hasW;
// Iso diamond corners for directional arch positioning
const cTopT = {x: sp.x, y: sp.y - hy};
const cRightT = {x: sp.x + hx, y: sp.y};
const cBottomT = {x: sp.x, y: sp.y + hy};
const cLeftT = {x: sp.x - hx, y: sp.y};
// Draw arch for each open side
const drawArch = (p1, p2) => {
const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
const cpx = (mx + sp.x) / 2, cpy = (my + sp.y) / 2 - tunnelH * 0.7;
ctx.fillStyle = `rgba(30,25,20,${amb * 0.85})`;
ctx.beginPath();
ctx.moveTo(p1.x * 0.6 + sp.x * 0.4, p1.y * 0.6 + sp.y * 0.4);
ctx.quadraticCurveTo(cpx, cpy, p2.x * 0.6 + sp.x * 0.4, p2.y * 0.6 + sp.y * 0.4);
ctx.lineTo(p2.x * 0.5 + sp.x * 0.5, p2.y * 0.5 + sp.y * 0.5 + tunnelH * 0.2);
ctx.lineTo(p1.x * 0.5 + sp.x * 0.5, p1.y * 0.5 + sp.y * 0.5 + tunnelH * 0.2);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = `rgba(120,110,100,${amb})`;
ctx.lineWidth = Math.max(1.5, zoom * 1.2);
ctx.beginPath();
ctx.moveTo(p1.x * 0.6 + sp.x * 0.4, p1.y * 0.6 + sp.y * 0.4);
ctx.quadraticCurveTo(cpx, cpy, p2.x * 0.6 + sp.x * 0.4, p2.y * 0.6 + sp.y * 0.4);
ctx.stroke();
};
if (openN || (!openS && !openE && !openW)) drawArch(cTopT, cRightT); // N edge: top→right
if (openE) drawArch(cRightT, cBottomT); // E edge: right→bottom
if (openS) drawArch(cBottomT, cLeftT);  // S edge: bottom→left
if (openW) drawArch(cLeftT, cTopT);     // W edge: left→top
// Road surface visible inside tunnel
drawTileSurface(sp.x, sp.y + th*0.1, color, tw * 0.45, th * 0.25);
}
} else {
// Normal road — fill entire tile
drawTileSurface(sp.x, sp.y, color, tw, th);
}

// 2. Draw darker curb/shoulder on non-connected edges to show road boundary
// Corners of diamond
const cTop = {x: sp.x, y: sp.y - hy};
const cRight = {x: sp.x + hx, y: sp.y};
const cBottom = {x: sp.x, y: sp.y + hy};
const cLeft = {x: sp.x - hx, y: sp.y};

// For each non-connected edge, draw a grass/terrain wedge to show road ends
const terrainType = (ry >= 0 && ry < MAP_H && rx >= 0 && rx < MAP_W) ? G.terrain[ry][rx] : 0;
const grassColor = getTerrainColor(terrainType, rx, ry);
const shoulderW = (1 - rw * 1.3) / 2; // how much shoulder on each side (0 = no shoulder)
if (shoulderW > 0.02 && !isBridge && !isTunnel && !isElevated) {
// Draw shoulder wedges at non-connected edges
if (!hasN) {
// N edge (top→right): draw terrain wedge
const inL = lerp2(cTop, cRight, shoulderW);
const inR = lerp2(cTop, cRight, 1 - shoulderW);
ctx.fillStyle = grassColor;
ctx.beginPath();
ctx.moveTo(cTop.x, cTop.y);
ctx.lineTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.lineTo(cRight.x, cRight.y);
ctx.closePath();
ctx.fill();
// Road edge line
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, zoom * 0.6);
ctx.beginPath();
ctx.moveTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.stroke();
}
if (!hasE) {
const inL = lerp2(cRight, cBottom, shoulderW);
const inR = lerp2(cRight, cBottom, 1 - shoulderW);
ctx.fillStyle = grassColor;
ctx.beginPath();
ctx.moveTo(cRight.x, cRight.y);
ctx.lineTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.lineTo(cBottom.x, cBottom.y);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, zoom * 0.6);
ctx.beginPath();
ctx.moveTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.stroke();
}
if (!hasS) {
const inL = lerp2(cBottom, cLeft, shoulderW);
const inR = lerp2(cBottom, cLeft, 1 - shoulderW);
ctx.fillStyle = grassColor;
ctx.beginPath();
ctx.moveTo(cBottom.x, cBottom.y);
ctx.lineTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.lineTo(cLeft.x, cLeft.y);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, zoom * 0.6);
ctx.beginPath();
ctx.moveTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.stroke();
}
if (!hasW) {
const inL = lerp2(cLeft, cTop, shoulderW);
const inR = lerp2(cLeft, cTop, 1 - shoulderW);
ctx.fillStyle = grassColor;
ctx.beginPath();
ctx.moveTo(cLeft.x, cLeft.y);
ctx.lineTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.lineTo(cTop.x, cTop.y);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, zoom * 0.6);
ctx.beginPath();
ctx.moveTo(inL.x, inL.y);
ctx.lineTo(inR.x, inR.y);
ctx.stroke();
}
}

// 3. Raised side panels for 3D effect
if (conCount > 0) {
ctx.fillStyle = sideColor;
ctx.beginPath();
ctx.moveTo(cLeft.x, cLeft.y);
ctx.lineTo(cBottom.x, cBottom.y);
ctx.lineTo(cBottom.x, cBottom.y + roadH);
ctx.lineTo(cLeft.x, cLeft.y + roadH);
ctx.closePath();
ctx.fill();
ctx.fillStyle = adjustBrightness(sideColor, 0.85);
ctx.beginPath();
ctx.moveTo(cRight.x, cRight.y);
ctx.lineTo(cBottom.x, cBottom.y);
ctx.lineTo(cBottom.x, cBottom.y + roadH);
ctx.lineTo(cRight.x, cRight.y + roadH);
ctx.closePath();
ctx.fill();
}

// Edge midpoints (needed for arrows/indicators even outside lane markings)
const midN = {x:(cTop.x+cRight.x)/2, y:(cTop.y+cRight.y)/2};
const midE = {x:(cRight.x+cBottom.x)/2, y:(cRight.y+cBottom.y)/2};
const midS = {x:(cBottom.x+cLeft.x)/2, y:(cBottom.y+cLeft.y)/2};
const midW = {x:(cLeft.x+cTop.x)/2, y:(cLeft.y+cTop.y)/2};
// 4. Lane markings — number of lines reflects road type
if (road.type !== 'road_1lane' && road.type !== 'road_tunnel' && conCount >= 2) {
const mids = [];
if (hasN) mids.push(midN);
if (hasE) mids.push(midE);
if (hasS) mids.push(midS);
if (hasW) mids.push(midW);
// How many lane lines? 2lane=1 center, multi=2, highway=3
const isMulti = road.type.includes('multi');
const isHighway = road.type.includes('highway');
const laneCount = isHighway ? 2 : isMulti ? 2 : 1;
// Helper: check if neighbor at direction is a narrower road type
const isNarrowNeighbor = (dir) => {
const nk = dir === 'N' ? `${rx},${ry-1}` : dir === 'S' ? `${rx},${ry+1}` : dir === 'E' ? `${rx+1},${ry}` : `${rx-1},${ry}`;
const nr = G.roads.get(nk) || G.elevatedRoads.get(nk);
if (!nr) return false;
return !nr.type.includes('highway') && !nr.type.includes('multi');
};
// Map mids to their direction for taper checks
const midDirs = [];
if (hasN) midDirs.push({mid: midN, dir: 'N'});
if (hasE) midDirs.push({mid: midE, dir: 'E'});
if (hasS) midDirs.push({mid: midS, dir: 'S'});
if (hasW) midDirs.push({mid: midW, dir: 'W'});
for (let ln = 0; ln < laneCount; ln++) {
// Center line is dashed yellow; outer lane lines are solid white
const isCenterLine = (ln === 0 && laneCount === 1) || (ln === Math.floor(laneCount/2) && laneCount % 2 === 1);
const offset = (ln - (laneCount - 1) / 2) * 0.12; // spread across road width
if (isCenterLine) {
ctx.strokeStyle = `rgba(255,255,100,${amb * 0.5})`;
ctx.setLineDash([3*zoom, 5*zoom]);
} else {
ctx.strokeStyle = `rgba(255,255,255,${amb * 0.35})`;
ctx.setLineDash([6*zoom, 3*zoom]);
}
ctx.lineWidth = Math.max(1, zoom * 0.6);
if (mids.length === 2) {
// Offset perpendicular to the line direction
const ldx = mids[1].x - mids[0].x, ldy = mids[1].y - mids[0].y;
const llen = Math.sqrt(ldx*ldx + ldy*ldy) || 1;
const px = (-ldy / llen) * offset * tw, py = (ldx / llen) * offset * th;
// Taper outer lanes at narrower neighbors
const narrow0 = !isCenterLine && isHighway && isNarrowNeighbor(midDirs[0].dir);
const narrow1 = !isCenterLine && isHighway && isNarrowNeighbor(midDirs[1].dir);
const sx = narrow0 ? mids[0].x + px * 0.0 : mids[0].x + px;
const sy = narrow0 ? mids[0].y + py * 0.0 : mids[0].y + py;
const ex = narrow1 ? mids[1].x + px * 0.0 : mids[1].x + px;
const ey = narrow1 ? mids[1].y + py * 0.0 : mids[1].y + py;
ctx.beginPath();
ctx.moveTo(sx, sy);
ctx.lineTo(ex, ey);
ctx.stroke();
} else {
for (const md of midDirs) {
const m = md.mid;
const ldx = m.x - sp.x, ldy = m.y - sp.y;
const llen = Math.sqrt(ldx*ldx + ldy*ldy) || 1;
const px = (-ldy / llen) * offset * tw, py = (ldx / llen) * offset * th;
// Taper outer lanes toward narrower neighbor
const narrow = !isCenterLine && isHighway && isNarrowNeighbor(md.dir);
ctx.beginPath();
ctx.moveTo(sp.x + px, sp.y + py);
if (narrow) {
// Taper: converge offset to 0 over last 40%
const tapePt = {x: sp.x + (m.x - sp.x) * 0.6 + px, y: sp.y + (m.y - sp.y) * 0.6 + py};
ctx.lineTo(tapePt.x, tapePt.y);
ctx.lineTo(m.x, m.y); // offset=0 at edge
} else {
ctx.lineTo(m.x + px, m.y + py);
}
ctx.stroke();
}
}
}
ctx.setLineDash([]);
// One-way arrows for one-way roads
if (road.oneWayDir && mids.length >= 2) {
const owDir = road.oneWayDir;
// Map direction to iso screen vector
// N=(0,-1), S=(0,1), E=(1,0), W=(-1,0)
// In iso: moving N means toward cTop, S toward cBottom, E toward cRight, W toward cLeft
const dirMid = owDir.dy === -1 ? midN : owDir.dy === 1 ? midS : owDir.dx === 1 ? midE : midW;
const arrowDx = dirMid.x - sp.x, arrowDy = dirMid.y - sp.y;
const arrowLen = Math.sqrt(arrowDx*arrowDx + arrowDy*arrowDy) || 1;
const adx = arrowDx / arrowLen, ady = arrowDy / arrowLen;
const perpX = -ady, perpY = adx;
const arrowSize = Math.max(3, zoom * 3.5);
ctx.fillStyle = `rgba(255,255,255,${amb * 0.45})`;
// Draw 2 arrows along the road direction, spaced apart
for (const t of [0.3, 0.7]) {
const ax = sp.x + arrowDx * t;
const ay = sp.y + arrowDy * t;
ctx.beginPath();
ctx.moveTo(ax + adx * arrowSize, ay + ady * arrowSize);
ctx.lineTo(ax - perpX * arrowSize * 0.5, ay - perpY * arrowSize * 0.5);
ctx.lineTo(ax + perpX * arrowSize * 0.5, ay + perpY * arrowSize * 0.5);
ctx.closePath();
ctx.fill();
}
}
// Highway edge lines (solid white) — taper at narrower neighbors
if (isHighway && mids.length >= 2) {
ctx.strokeStyle = `rgba(255,255,255,${amb * 0.5})`;
ctx.lineWidth = Math.max(1, zoom * 0.8);
ctx.setLineDash([]);
const edgeOff = 0.32;
if (mids.length === 2) {
const ldx = mids[1].x - mids[0].x, ldy = mids[1].y - mids[0].y;
const llen = Math.sqrt(ldx*ldx + ldy*ldy) || 1;
const narrow0 = isNarrowNeighbor(midDirs[0].dir);
const narrow1 = isNarrowNeighbor(midDirs[1].dir);
for (const side of [-1, 1]) {
const px = (-ldy / llen) * edgeOff * side * tw, py = (ldx / llen) * edgeOff * side * th;
const sx = narrow0 ? mids[0].x : mids[0].x + px;
const sy = narrow0 ? mids[0].y : mids[0].y + py;
const ex = narrow1 ? mids[1].x : mids[1].x + px;
const ey = narrow1 ? mids[1].y : mids[1].y + py;
ctx.beginPath();
ctx.moveTo(sx, sy);
ctx.lineTo(ex, ey);
ctx.stroke();
}
}
}
// Highway: yellow center divider + bold one-way arrows
if (isHighway && mids.length === 2) {
const ldx = mids[1].x - mids[0].x, ldy = mids[1].y - mids[0].y;
const llen = Math.sqrt(ldx*ldx + ldy*ldy) || 1;
ctx.strokeStyle = `rgba(255,210,30,${amb * 0.85})`;
ctx.lineWidth = Math.max(2, zoom * 1.8);
ctx.setLineDash([]);
ctx.beginPath();
ctx.moveTo(mids[0].x, mids[0].y);
ctx.lineTo(mids[1].x, mids[1].y);
ctx.stroke();
if (road.oneWayDir) {
const owDir = road.oneWayDir;
const dirMid = owDir.dy === -1 ? midN : owDir.dy === 1 ? midS : owDir.dx === 1 ? midE : midW;
if (dirMid) {
const arrowDx = dirMid.x - sp.x, arrowDy = dirMid.y - sp.y;
const arrowLen = Math.sqrt(arrowDx*arrowDx + arrowDy*arrowDy) || 1;
const adx = arrowDx / arrowLen, ady = arrowDy / arrowLen;
const perpX2 = -ady, perpY2 = adx;
const arrowSize = Math.max(6, zoom * 7);
ctx.fillStyle = `rgba(255,255,255,${amb * 0.95})`;
for (const t of [0.25, 0.50, 0.75]) {
const ax = sp.x + arrowDx * t, ay = sp.y + arrowDy * t;
ctx.beginPath();
ctx.moveTo(ax + adx * arrowSize, ay + ady * arrowSize);
ctx.lineTo(ax - perpX2 * arrowSize * 0.65, ay - perpY2 * arrowSize * 0.65);
ctx.lineTo(ax + adx * arrowSize * 0.15, ay + ady * arrowSize * 0.15);
ctx.lineTo(ax + perpX2 * arrowSize * 0.65, ay + perpY2 * arrowSize * 0.65);
ctx.closePath(); ctx.fill();
}
}
}
ctx.setLineDash([]);
}
// Ground-level highway barrier lines (solid orange/red to show limited access)
if (isGroundHighway && conCount >= 2 && mids.length >= 2) {
ctx.strokeStyle = `rgba(255,140,40,${amb * 0.6})`;
ctx.lineWidth = Math.max(1.5, zoom * 1.0);
ctx.setLineDash([]);
const barrierOff = 0.24;
if (mids.length === 2) {
const ldx = mids[1].x - mids[0].x, ldy = mids[1].y - mids[0].y;
const llen = Math.sqrt(ldx*ldx + ldy*ldy) || 1;
for (const side of [-1, 1]) {
const px = (-ldy / llen) * barrierOff * side * tw, py = (ldx / llen) * barrierOff * side * th;
ctx.beginPath();
ctx.moveTo(mids[0].x + px, mids[0].y + py);
ctx.lineTo(mids[1].x + px, mids[1].y + py);
ctx.stroke();
}
}
}
}

// Paid road indicator
if (isPaid) {
ctx.fillStyle = `rgba(255,204,0,${amb*0.8})`;
ctx.font = `bold ${8*zoom}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText('$', sp.x, sp.y + 3*zoom);
}
// Flyover indicator: entry dot (green), exit arrow (yellow), plus center direction arrow
if (isFlyover && road.oneWayDir) {
const fLift = 6 * zoom;
const owDir = road.oneWayDir;
// Center direction arrow on each flyover tile
const dirMidFly = owDir.dy === -1 ? midN : owDir.dy === 1 ? midS : owDir.dx === 1 ? midE : midW;
if (dirMidFly) {
const aDx = dirMidFly.x - sp.x, aDy = dirMidFly.y - sp.y - fLift;
const aLen = Math.sqrt(aDx*aDx + aDy*aDy) || 1;
const adxN = aDx/aLen, adyN = aDy/aLen;
const perpXF = -adyN, perpYF = adxN;
const aSize = Math.max(4, zoom * 4.5);
ctx.fillStyle = `rgba(255,220,50,${amb * 0.9})`;
for (const t of [0.35, 0.65]) {
const ax = sp.x + aDx * t, ay = sp.y - fLift + (dirMidFly.y - sp.y) * t;
ctx.beginPath();
ctx.moveTo(ax + adxN * aSize, ay + adyN * aSize);
ctx.lineTo(ax - perpXF * aSize * 0.5, ay - perpYF * aSize * 0.5);
ctx.lineTo(ax + adxN * aSize * 0.15, ay + adyN * aSize * 0.15);
ctx.lineTo(ax + perpXF * aSize * 0.5, ay + perpYF * aSize * 0.5);
ctx.closePath(); ctx.fill();
}
}
// Entry/exit markers at tile edges
for (const [ddx,ddy] of [[0,-1],[0,1],[1,0],[-1,0]]) {
const isExit  = owDir.dx === ddx && owDir.dy === ddy;
const isEntry = owDir.dx === -ddx && owDir.dy === -ddy;
if (!isExit && !isEntry) continue;
const ex = sp.x + ddx*tw*0.28, ey = sp.y + ddy*th*0.28 - fLift;
if (isExit) {
const ax = ddx*tw*0.15, ay = ddy*th*0.15;
const px2 = -ddy*th*0.10, py2 = ddx*tw*0.10;
ctx.fillStyle = `rgba(255,210,30,${amb * 0.95})`;
ctx.beginPath();
ctx.moveTo(ex+ax, ey+ay);
ctx.lineTo(ex-ax+px2, ey-ay+py2);
ctx.lineTo(ex-ax-px2, ey-ay-py2);
ctx.closePath(); ctx.fill();
} else {
ctx.fillStyle = `rgba(60,210,100,${amb * 0.95})`;
ctx.beginPath();
ctx.arc(ex, ey, Math.max(3, zoom*3), 0, Math.PI*2);
ctx.fill();
}
}
}
// Breakdown indicator
if (road.breakdown) {
ctx.fillStyle = '#ff6644';
ctx.font = `${12*zoom}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText('⚠', sp.x, sp.y - 10*zoom);
}
}

// Lerp between two 2D points
function lerp2(a, b, t) {
return {x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t};
}

function drawRoadSegment(x1, y1, x2, y2, halfW, color, edgeColor) {
// Draw a filled road segment (rectangle aligned along the direction)
const dx = x2 - x1;
const dy = y2 - y1;
const len = Math.sqrt(dx*dx + dy*dy);
if (len < 0.5) return;
// Perpendicular unit vector
const px = (-dy / len) * halfW;
const py = (dx / len) * halfW;

// Road fill
ctx.fillStyle = color;
ctx.beginPath();
ctx.moveTo(x1 + px, y1 + py);
ctx.lineTo(x2 + px, y2 + py);
ctx.lineTo(x2 - px, y2 - py);
ctx.lineTo(x1 - px, y1 - py);
ctx.closePath();
ctx.fill();

// Edge lines
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, G.camera.zoom * 0.5);
ctx.beginPath();
ctx.moveTo(x1 + px, y1 + py);
ctx.lineTo(x2 + px, y2 + py);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(x1 - px, y1 - py);
ctx.lineTo(x2 - px, y2 - py);
ctx.stroke();
}

function drawCurvedRoadSegment(x1, y1, x2, y2, cpx, cpy, halfW, color, edgeColor) {
// Draw a smooth bezier road strip curving from (x1,y1) to (x2,y2) via control point (cpx,cpy)
// Compute perpendicular offsets at the start and end points
const d0x = cpx - x1, d0y = cpy - y1;
const len0 = Math.sqrt(d0x*d0x + d0y*d0y) || 1;
const p0x = (-d0y / len0) * halfW, p0y = (d0x / len0) * halfW;

const d1x = x2 - cpx, d1y = y2 - cpy;
const len1 = Math.sqrt(d1x*d1x + d1y*d1y) || 1;
const p1x = (-d1y / len1) * halfW, p1y = (d1x / len1) * halfW;

// Perpendicular offset at control point — average of both tangent perps for smooth strip
const cpPx = (p0x + p1x) * 0.5, cpPy = (p0y + p1y) * 0.5;

// Filled road shape: left edge bezier + right edge bezier (reversed)
ctx.fillStyle = color;
ctx.beginPath();
// Left edge: start → control → end (offset +p)
ctx.moveTo(x1 + p0x, y1 + p0y);
ctx.quadraticCurveTo(cpx + cpPx, cpy + cpPy, x2 + p1x, y2 + p1y);
// Right edge: end → control → start (offset -p, reversed)
ctx.lineTo(x2 - p1x, y2 - p1y);
ctx.quadraticCurveTo(cpx - cpPx, cpy - cpPy, x1 - p0x, y1 - p0y);
ctx.closePath();
ctx.fill();

// Left edge stroke
ctx.strokeStyle = edgeColor;
ctx.lineWidth = Math.max(1, G.camera.zoom * 0.5);
ctx.beginPath();
ctx.moveTo(x1 + p0x, y1 + p0y);
ctx.quadraticCurveTo(cpx + cpPx, cpy + cpPy, x2 + p1x, y2 + p1y);
ctx.stroke();

// Right edge stroke
ctx.beginPath();
ctx.moveTo(x1 - p0x, y1 - p0y);
ctx.quadraticCurveTo(cpx - cpPx, cpy - cpPy, x2 - p1x, y2 - p1y);
ctx.stroke();
}

function drawBuilding(sp, b, tw, th) {
const amb = getAmbient();
const zoom = G.camera.zoom;
const h = getTimeOfDay();
const bw = tw * 1.1; // building footprint width
const bh = th * 1.1;

// Shadow
const shadowOff = (h < 12 ? (12-h) : (h-12)) * 1.5 * zoom;
ctx.fillStyle = `rgba(0,0,0,${0.12 * amb})`;
ctx.beginPath();
ctx.moveTo(sp.x + shadowOff*1.5, sp.y + th*0.15);
ctx.lineTo(sp.x + tw*0.6 + shadowOff, sp.y + th*0.4);
ctx.lineTo(sp.x + shadowOff*0.5, sp.y + th*0.65);
ctx.lineTo(sp.x - tw*0.5, sp.y + th*0.4);
ctx.closePath();
ctx.fill();

switch(b.type) {
case 'house': {
const wallColor = adjustBrightness(b.isApartment ? '#e8c8a0' : '#f0dcc0', amb);
const roofColor = adjustBrightness(b.isApartment ? '#c85040' : '#d06838', amb);
const height = b.isApartment ? 30 * zoom : 18 * zoom;
// Walls
drawIsoBox(sp.x, sp.y, wallColor, bw, bh, height);
// Pitched roof (triangle on top)
const roofH = 10 * zoom;
ctx.fillStyle = roofColor;
// Front roof face
ctx.beginPath();
ctx.moveTo(sp.x, sp.y - height - bh/2);
ctx.lineTo(sp.x + bw/2, sp.y - height);
ctx.lineTo(sp.x, sp.y - height - roofH);
ctx.closePath();
ctx.fill();
// Back roof face
ctx.fillStyle = adjustBrightness(roofColor, 0.8);
ctx.beginPath();
ctx.moveTo(sp.x, sp.y - height - bh/2);
ctx.lineTo(sp.x - bw/2, sp.y - height);
ctx.lineTo(sp.x, sp.y - height - roofH);
ctx.closePath();
ctx.fill();
// Right roof face
ctx.fillStyle = adjustBrightness(roofColor, 0.9);
ctx.beginPath();
ctx.moveTo(sp.x + bw/2, sp.y - height);
ctx.lineTo(sp.x, sp.y - height + bh/2);
ctx.lineTo(sp.x, sp.y - height - roofH);
ctx.closePath();
ctx.fill();
// Left roof face
ctx.fillStyle = adjustBrightness(roofColor, 0.65);
ctx.beginPath();
ctx.moveTo(sp.x - bw/2, sp.y - height);
ctx.lineTo(sp.x, sp.y - height + bh/2);
ctx.lineTo(sp.x, sp.y - height - roofH);
ctx.closePath();
ctx.fill();
// Door
ctx.fillStyle = adjustBrightness('#6b4020', amb);
ctx.fillRect(sp.x + bw*0.1, sp.y - 5*zoom, 3*zoom, 5*zoom);
// Windows
if (b.isApartment) {
for (let wy = 1; wy < 3; wy++) {
ctx.fillStyle = (h > 18 || h < 7) ? 'rgba(255,230,140,0.7)' : adjustBrightness('#a0d4f0', amb);
ctx.fillRect(sp.x + bw*0.15, sp.y - wy*9*zoom, 3*zoom, 3*zoom);
ctx.fillRect(sp.x - bw*0.15 - 3*zoom, sp.y - wy*9*zoom, 3*zoom, 3*zoom);
}
} else {
ctx.fillStyle = (h > 18 || h < 7) ? 'rgba(255,230,140,0.7)' : adjustBrightness('#a0d4f0', amb);
ctx.fillRect(sp.x + bw*0.12, sp.y - 10*zoom, 3*zoom, 3*zoom);
ctx.fillRect(sp.x - bw*0.15, sp.y - 10*zoom, 3*zoom, 3*zoom);
}
break;
}
case 'office': {
const height = (40 + (b.capacity || 10)) * zoom * 0.6;
const wallColor = adjustBrightness('#70a8d0', amb);
const glassColor = adjustBrightness('#90c8e8', amb);
drawIsoBox(sp.x, sp.y, wallColor, bw*0.9, bh*0.9, height);
// Glass windows in rows
const floors = Math.floor(height / (8*zoom));
for (let f = 0; f < floors; f++) {
const wy = sp.y - (f+1)*7*zoom;
const lit = (h > 18 || h < 7);
ctx.fillStyle = lit ? 'rgba(255,235,160,0.65)' : glassColor;
// Right face windows
ctx.fillRect(sp.x + 2*zoom, wy, 4*zoom, 3*zoom);
ctx.fillRect(sp.x + 8*zoom, wy, 4*zoom, 3*zoom);
// Left face windows
ctx.fillRect(sp.x - 6*zoom, wy, 4*zoom, 3*zoom);
ctx.fillRect(sp.x - 12*zoom, wy, 4*zoom, 3*zoom);
}
// Flat roof accent
drawTileSurface(sp.x, sp.y - height, adjustBrightness('#506878', amb), bw*0.7, bh*0.7);
break;
}
case 'restaurant': {
const height = 16 * zoom;
// Warm building colors per cuisine
const cuisineColors = {Chinese:'#d42020',Mexican:'#e8a030',Italian:'#40a840',American:'#3070c0',Indian:'#d06020'};
const baseColor = adjustBrightness(cuisineColors[b.cuisine] || '#c85040', amb);
const wallColor = adjustBrightness('#f0e0c8', amb);
drawIsoBox(sp.x, sp.y, wallColor, bw, bh, height);
// Colored awning / signboard stripe
ctx.fillStyle = baseColor;
ctx.beginPath();
ctx.moveTo(sp.x + bw/2, sp.y - height + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh/2 + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh/2 + 5*zoom);
ctx.lineTo(sp.x + bw/2, sp.y - height + 5*zoom);
ctx.closePath();
ctx.fill();
ctx.fillStyle = adjustBrightness(baseColor, 0.75);
ctx.beginPath();
ctx.moveTo(sp.x - bw/2, sp.y - height + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh/2 + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh/2 + 5*zoom);
ctx.lineTo(sp.x - bw/2, sp.y - height + 5*zoom);
ctx.closePath();
ctx.fill();
// Door
ctx.fillStyle = adjustBrightness('#805030', amb);
ctx.fillRect(sp.x + bw*0.08, sp.y - 4*zoom, 3*zoom, 4*zoom);
// Warm window glow
ctx.fillStyle = (h > 17 || h < 7) ? 'rgba(255,220,120,0.6)' : adjustBrightness('#f0e8b0', amb);
ctx.fillRect(sp.x - bw*0.15, sp.y - 10*zoom, 4*zoom, 3*zoom);
ctx.fillRect(sp.x + bw*0.1, sp.y - 10*zoom, 4*zoom, 3*zoom);
break;
}
case 'school': {
const height = 25 * zoom;
const wallColor = adjustBrightness('#e0c080', amb);
const roofColor = adjustBrightness('#804020', amb);
drawIsoBox(sp.x, sp.y, wallColor, bw*1.15, bh*1.15, height);
// Flat brick-colored roof
drawTileSurface(sp.x, sp.y - height, roofColor, bw*1.0, bh*1.0);
// Flag pole
ctx.strokeStyle = adjustBrightness('#808080', amb);
ctx.lineWidth = 1.5*zoom;
ctx.beginPath();
ctx.moveTo(sp.x - bw*0.3, sp.y - height);
ctx.lineTo(sp.x - bw*0.3, sp.y - height - 15*zoom);
ctx.stroke();
// Flag
ctx.fillStyle = adjustBrightness('#d04040', amb);
ctx.fillRect(sp.x - bw*0.3, sp.y - height - 15*zoom, 6*zoom, 4*zoom);
// Windows
for (let w = 0; w < 3; w++) {
ctx.fillStyle = (h > 18 || h < 7) ? 'rgba(255,230,140,0.5)' : adjustBrightness('#a8d0f0', amb);
ctx.fillRect(sp.x - 8*zoom + w*7*zoom, sp.y - 12*zoom, 3*zoom, 4*zoom);
}
break;
}
case 'bank': {
const height = 28 * zoom;
const wallColor = adjustBrightness('#1a2a5c', amb);
const trimColor = adjustBrightness('#c8a832', amb);
drawIsoBox(sp.x, sp.y, wallColor, bw*1.05, bh*1.05, height);
// Gold trim stripe at top
ctx.fillStyle = trimColor;
ctx.beginPath();
ctx.moveTo(sp.x + bw*0.525, sp.y - height + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh*0.525 + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh*0.525 + 5*zoom);
ctx.lineTo(sp.x + bw*0.525, sp.y - height + 5*zoom);
ctx.closePath();
ctx.fill();
ctx.fillStyle = adjustBrightness(trimColor, 0.75);
ctx.beginPath();
ctx.moveTo(sp.x - bw*0.525, sp.y - height + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh*0.525 + 2*zoom);
ctx.lineTo(sp.x, sp.y - height + bh*0.525 + 5*zoom);
ctx.lineTo(sp.x - bw*0.525, sp.y - height + 5*zoom);
ctx.closePath();
ctx.fill();
// Flat roof accent
drawTileSurface(sp.x, sp.y - height, adjustBrightness('#0f1a3a', amb), bw*0.8, bh*0.8);
// Columns (two pillars)
ctx.fillStyle = trimColor;
ctx.fillRect(sp.x + bw*0.2, sp.y - height*0.8, 2*zoom, height*0.6);
ctx.fillRect(sp.x - bw*0.2 - 2*zoom, sp.y - height*0.8, 2*zoom, height*0.6);
// Door
ctx.fillStyle = adjustBrightness('#0f1a3a', amb);
ctx.fillRect(sp.x - 2*zoom, sp.y - 5*zoom, 4*zoom, 5*zoom);
// Windows
const lit = (h > 18 || h < 7);
ctx.fillStyle = lit ? 'rgba(255,235,160,0.65)' : adjustBrightness('#a0c0f0', amb);
ctx.fillRect(sp.x + bw*0.15, sp.y - 14*zoom, 3*zoom, 3*zoom);
ctx.fillRect(sp.x - bw*0.15 - 3*zoom, sp.y - 14*zoom, 3*zoom, 3*zoom);
break;
}
default: {
const height = 20 * zoom;
drawIsoBox(sp.x, sp.y, adjustBrightness('#b0b0b0', amb), bw, bh, height);
}
}
// Building type icon/label
const labelY = sp.y - (b.type === 'office' ? (40+(b.capacity||10))*zoom*0.6 : b.type === 'house' ? (b.isApartment?40:28)*zoom : b.type === 'school' ? 42*zoom : b.type === 'bank' ? 38*zoom : 24*zoom) - 4*zoom;
// Type indicator emoji
const typeIcons = {house:'🏠',office:'🏢',restaurant:'🍽',school:'🏫',bank:'🏦'};
ctx.font = `${10*zoom}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText(typeIcons[b.type] || '', sp.x, labelY);
// Name label
ctx.fillStyle = `rgba(255,255,255,${amb * 0.85})`;
ctx.font = `bold ${8*zoom}px 'Segoe UI'`;
ctx.fillText(b.name, sp.x, labelY + 11*zoom);
}

function drawVehicle(sp, v, zoom) {
const amb = getAmbient();
const h = getTimeOfDay();
const night = h > 18 || h < 7;
// Convert world angle to screen-space angle via isometric projection
const worldA = v.angle || 0;
const camRot = G ? (G.camera.rotation || 0) : 0;
const rotA = worldA - camRot * Math.PI / 2;
const wdx = Math.cos(rotA), wdy = Math.sin(rotA);
const sdx = (wdx - wdy);
const sdy = (wdx + wdy) * 0.5;
const a = Math.atan2(sdy, sdx);
const ca = Math.cos(a), sa = Math.sin(a);

// Truck: draw larger, boxy vehicle
if (v.isTruck) {
const len = 17.0 * zoom;
const wid = 9.5 * zoom;
const carH = 6.0 * zoom;
const rx = (lx,ly) => sp.x + lx*ca - ly*sa;
const ry = (lx,ly) => sp.y + lx*sa + ly*ca - carH;
// Shadow
ctx.fillStyle = `rgba(0,0,0,${0.2*amb})`;
ctx.beginPath();
ctx.ellipse(sp.x + 1.5*zoom, sp.y + 1*zoom, len*0.9, wid*0.35, a, 0, Math.PI*2);
ctx.fill();
// Truck body (cargo box)
const bodyColor = adjustBrightness(v.color || '#e8e8e8', amb);
ctx.fillStyle = bodyColor;
ctx.beginPath();
ctx.moveTo(rx(-len, -wid), ry(-len, -wid));
ctx.lineTo(rx(len*0.3, -wid), ry(len*0.3, -wid));
ctx.lineTo(rx(len*0.3, wid), ry(len*0.3, wid));
ctx.lineTo(rx(-len, wid), ry(-len, wid));
ctx.closePath();
ctx.fill();
// Cargo side
ctx.fillStyle = adjustBrightness(bodyColor, 0.7);
ctx.beginPath();
ctx.moveTo(rx(-len, wid), ry(-len, wid));
ctx.lineTo(rx(len*0.3, wid), ry(len*0.3, wid));
ctx.lineTo(rx(len*0.3, wid) , ry(len*0.3, wid) + 4.5*zoom);
ctx.lineTo(rx(-len, wid), ry(-len, wid) + 4.5*zoom);
ctx.closePath();
ctx.fill();
// Cab
ctx.fillStyle = adjustBrightness('#5588bb', amb);
ctx.beginPath();
ctx.moveTo(rx(len*0.3, -wid*0.8), ry(len*0.3, -wid*0.8));
ctx.lineTo(rx(len, -wid*0.8), ry(len, -wid*0.8));
ctx.lineTo(rx(len, wid*0.8), ry(len, wid*0.8));
ctx.lineTo(rx(len*0.3, wid*0.8), ry(len*0.3, wid*0.8));
ctx.closePath();
ctx.fill();
// Headlights
if (night) {
ctx.fillStyle = 'rgba(255,255,200,0.9)';
ctx.beginPath();
ctx.arc(rx(len, -wid*0.5), ry(len, -wid*0.5), 1.5*zoom, 0, Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.arc(rx(len, wid*0.5), ry(len, wid*0.5), 1.5*zoom, 0, Math.PI*2);
ctx.fill();
}
return;
}

// Car dimensions in pixels (~45% of tile)
const len = 14.5 * zoom; // half-length
const wid = 8.0 * zoom; // half-width
const cabLen = 6.5 * zoom;
const carH = 5.0 * zoom; // height off ground
const cabH = 3.5 * zoom;
// Transform helper: rotate point by car angle (squish baked into screen angle)
const rx = (lx,ly) => sp.x + lx*ca - ly*sa;
const ry = (lx,ly) => sp.y + lx*sa + ly*ca - carH;

// Shadow on ground
ctx.fillStyle = `rgba(0,0,0,${0.18*amb})`;
ctx.beginPath();
ctx.ellipse(sp.x + 1.5*zoom, sp.y + 1*zoom, len*0.9, wid*0.35, a, 0, Math.PI*2);
ctx.fill();

// Car body (lower box)
const bodyColor = v.color || '#e74c3c';
const bodyDark = adjustBrightness(bodyColor, 0.7);
ctx.fillStyle = bodyColor;
ctx.beginPath();
ctx.moveTo(rx(-len, -wid), ry(-len, -wid));
ctx.lineTo(rx(len, -wid), ry(len, -wid));
ctx.lineTo(rx(len, wid), ry(len, wid));
ctx.lineTo(rx(-len, wid), ry(-len, wid));
ctx.closePath();
ctx.fill();
// Body side (depth)
ctx.fillStyle = bodyDark;
ctx.beginPath();
ctx.moveTo(rx(-len, wid), ry(-len, wid));
ctx.lineTo(rx(len, wid), ry(len, wid));
ctx.lineTo(rx(len, wid) , ry(len, wid) + 2.2*zoom);
ctx.lineTo(rx(-len, wid), ry(-len, wid) + 2.2*zoom);
ctx.closePath();
ctx.fill();

// Cabin (upper box, set back from front)
const cabColor = adjustBrightness('#3a4a5a', amb);
const cabFront = len * 0.15;
const cabBack = -len * 0.45;
const cabWid = wid * 0.82;
ctx.fillStyle = cabColor;
ctx.beginPath();
ctx.moveTo(rx(cabBack, -cabWid), ry(cabBack, -cabWid) - cabH);
ctx.lineTo(rx(cabFront, -cabWid), ry(cabFront, -cabWid) - cabH);
ctx.lineTo(rx(cabFront, cabWid), ry(cabFront, cabWid) - cabH);
ctx.lineTo(rx(cabBack, cabWid), ry(cabBack, cabWid) - cabH);
ctx.closePath();
ctx.fill();
// Cabin windshield (front glass)
ctx.fillStyle = night ? 'rgba(180,210,240,0.4)' : 'rgba(160,200,240,0.6)';
ctx.beginPath();
ctx.moveTo(rx(cabFront, -cabWid*0.9), ry(cabFront, -cabWid*0.9) - cabH);
ctx.lineTo(rx(cabFront + len*0.2, -cabWid*0.7), ry(cabFront + len*0.2, -cabWid*0.7));
ctx.lineTo(rx(cabFront + len*0.2, cabWid*0.7), ry(cabFront + len*0.2, cabWid*0.7));
ctx.lineTo(rx(cabFront, cabWid*0.9), ry(cabFront, cabWid*0.9) - cabH);
ctx.closePath();
ctx.fill();
// Cabin side glass
ctx.fillStyle = night ? 'rgba(160,190,220,0.3)' : 'rgba(140,185,230,0.45)';
ctx.beginPath();
ctx.moveTo(rx(cabBack, cabWid), ry(cabBack, cabWid) - cabH);
ctx.lineTo(rx(cabFront, cabWid), ry(cabFront, cabWid) - cabH);
ctx.lineTo(rx(cabFront, cabWid), ry(cabFront, cabWid));
ctx.lineTo(rx(cabBack, cabWid), ry(cabBack, cabWid));
ctx.closePath();
ctx.fill();

// Wheels (4 small dark rects)
ctx.fillStyle = `rgba(30,30,30,${amb})`;
const wOff = [[len*0.6, wid+0.5*zoom], [len*0.6, -wid-0.5*zoom], [-len*0.5, wid+0.5*zoom], [-len*0.5, -wid-0.5*zoom]];
for (const [wx,wy] of wOff) {
ctx.fillRect(rx(wx,wy) - 1.75*zoom, ry(wx,wy) + carH*0.3, 3.5*zoom, 1.8*zoom);
}

// Headlights
if (night) {
ctx.fillStyle = 'rgba(255,255,200,0.7)';
ctx.beginPath();
ctx.arc(rx(len, -wid*0.6), ry(len, -wid*0.6), 1.8*zoom, 0, Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.arc(rx(len, wid*0.6), ry(len, wid*0.6), 1.8*zoom, 0, Math.PI*2);
ctx.fill();
// Headlight beam
ctx.fillStyle = 'rgba(255,255,200,0.08)';
ctx.beginPath();
ctx.moveTo(rx(len, -wid*0.5), ry(len, -wid*0.5));
ctx.lineTo(rx(len + 16*zoom, -wid*2), ry(len + 16*zoom, -wid*2));
ctx.lineTo(rx(len + 16*zoom, wid*2), ry(len + 16*zoom, wid*2));
ctx.lineTo(rx(len, wid*0.5), ry(len, wid*0.5));
ctx.closePath();
ctx.fill();
}

// Brake / tail lights
const tailLit = v.braking || night;
if (tailLit) {
ctx.fillStyle = v.braking ? 'rgba(255,30,30,0.85)' : 'rgba(180,30,30,0.5)';
ctx.beginPath();
ctx.arc(rx(-len, -wid*0.55), ry(-len, -wid*0.55), 1.5*zoom, 0, Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.arc(rx(-len, wid*0.55), ry(-len, wid*0.55), 1.5*zoom, 0, Math.PI*2);
ctx.fill();
}
}

function renderMinimap() {
mctx.fillStyle = '#1a1a2e';
mctx.fillRect(0, 0, MC.width, MC.height);
const scaleX = MC.width / MAP_W;
const scaleY = MC.height / MAP_H;
// Terrain
for (let y = 0; y < MAP_H; y += 2) {
for (let x = 0; x < MAP_W; x += 2) {
const t = G.terrain[y][x];
switch(t) {
case 0: mctx.fillStyle = '#4a7a3a'; break;
case 1: case 4: mctx.fillStyle = '#3a6a9a'; break;
case 3: mctx.fillStyle = '#4a80b0'; break;
case 2: mctx.fillStyle = '#8a7a6a'; break;
}
mctx.fillRect(x * scaleX, y * scaleY, scaleX * 2 + 1, scaleY * 2 + 1);
}
}
// Roads
mctx.fillStyle = '#aaa';
G.roads.forEach((_, key) => {
const [rx, ry] = key.split(',').map(Number);
mctx.fillRect(rx * scaleX, ry * scaleY, scaleX + 1, scaleY + 1);
});
// Elevated roads
mctx.fillStyle = '#ccb';
G.elevatedRoads.forEach((_, key) => {
const [rx, ry] = key.split(',').map(Number);
mctx.fillRect(rx * scaleX, ry * scaleY, scaleX + 1, scaleY + 1);
});
// Buildings
G.buildings.forEach(b => {
switch(b.type) {
case 'house': mctx.fillStyle = '#d4a574'; break;
case 'office': mctx.fillStyle = '#6a9fcc'; break;
case 'restaurant': mctx.fillStyle = '#cc6a5a'; break;
case 'school': mctx.fillStyle = '#ccb84a'; break;
case 'bank': mctx.fillStyle = '#1a3a7a'; break;
}
mctx.fillRect(b.x * scaleX - 1, b.y * scaleY - 1, 3, 3);
});
// Viewport
const topLeft = screenToWorld(0, 0);
const bottomRight = screenToWorld(C.width, C.height);
mctx.strokeStyle = '#e8d5b7';
mctx.lineWidth = 1;
mctx.strokeRect(
Math.max(0,topLeft.x) * scaleX,
Math.max(0,topLeft.y) * scaleY,
(bottomRight.x - topLeft.x) * scaleX,
(bottomRight.y - topLeft.y) * scaleY
);
}

function drawCostPopups() {
const zoom = G.camera.zoom;
for (let i = costPopups.length - 1; i >= 0; i--) {
const p = costPopups[i];
p.life--;
if (p.life <= 0) { costPopups.splice(i, 1); continue; }
const sp = worldToScreen(p.x, p.y);
const progress = 1 - p.life / p.maxLife;
const alpha = p.life < 30 ? p.life / 30 : 1;
const yOff = progress * 30 * zoom;
ctx.globalAlpha = alpha;
ctx.fillStyle = '#ff8866';
ctx.font = `bold ${Math.max(9, 11 * zoom)}px sans-serif`;
ctx.textAlign = 'center';
ctx.fillText(p.text, sp.x, sp.y - 20*zoom - yOff);
ctx.globalAlpha = 1;
}
}
