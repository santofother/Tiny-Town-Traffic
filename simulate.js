// simulate.js — Game simulation, vehicle movement, commute scheduling, and economy
// Runs the core game loop: tick advancement, vehicle spawning/pathfinding/arrival,
// day/week cycles, revenue calculation, breakdowns, and loan management.
// Modifies global game state (G) extensively. Depends on: world.js, ui.js, lore.js

function findPath(startX, startY, endX, endY) {
const cacheKey = `${startX},${startY}-${endX},${endY}-${G.lastRoadChangeId}`;
if (G.pathCache.has(cacheKey)) return G.pathCache.get(cacheKey);
// Find nearest ground-level non-highway road to start and end
const startRoad = findNearestRoad(startX, startY, 2, {excludeHighways: true, levelFilter: 0});
const endRoad = findNearestRoad(endX, endY, 2, {excludeHighways: true, levelFilter: 0});
if (!startRoad || !endRoad) return null;
const open = new Map();
const closed = new Set();
const gScore = new Map();
const fScore = new Map();
const cameFrom = new Map();
const startLevel = 0; // buildings always connect at ground level
const endLevel = 0;
const startKey = `${startRoad.x},${startRoad.y},${startLevel}`;
const endKey = `${endRoad.x},${endRoad.y},${endLevel}`;
gScore.set(startKey, 0);
const heuristic = (x1,y1,x2,y2) => Math.abs(x1-x2) + Math.abs(y1-y2);
fScore.set(startKey, heuristic(startRoad.x, startRoad.y, endRoad.x, endRoad.y));
open.set(startKey, {x: startRoad.x, y: startRoad.y, level: startLevel});
let iterations = 0;
while (open.size > 0 && iterations < 8000) {
iterations++;
// Find lowest fScore in open
let current = null, currentKey = null, lowestF = Infinity;
open.forEach((node, key) => {
const f = fScore.get(key) || Infinity;
if (f < lowestF) { lowestF = f; current = node; currentKey = key; }
});
if (!current) break;
if (currentKey === endKey) {
// Reconstruct path
const path = [{x: current.x, y: current.y, level: current.level}];
let k = currentKey;
while (cameFrom.has(k)) {
k = cameFrom.get(k);
const parts = k.split(',').map(Number);
path.unshift({x: parts[0], y: parts[1], level: parts[2]});
}
if (G.pathCache.size > 500) G.pathCache.clear();
G.pathCache.set(cacheKey, path);
return path;
}
open.delete(currentKey);
closed.add(currentKey);
// Neighbors (4 directions, same level)
const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
const curLevel = current.level;
const curIsFlyover = isFlyoverTile(current.x, current.y);
for (const [dx, dy] of dirs) {
const nx = current.x + dx, ny = current.y + dy;
// Try same-level neighbor
const nRoad = getRoadAtLevel(nx, ny, curLevel);
if (nRoad && !(nRoad.breakdown && nRoad.blocking)) {
// One-way enforcement: check if traveling FROM current TO neighbor is allowed
const curRoad = getRoadAtLevel(current.x, current.y, curLevel);
if (curRoad && curRoad.oneWayDir && (curRoad.oneWayDir.dx !== dx || curRoad.oneWayDir.dy !== dy)) {
// Can't leave this tile in the wrong direction — skip
} else if (nRoad.oneWayDir && (nRoad.oneWayDir.dx !== dx || nRoad.oneWayDir.dy !== dy)) {
// Can't enter that tile going the wrong way — skip
} else {
const nk = `${nx},${ny},${curLevel}`;
if (!closed.has(nk)) {
const moveCost = 1 / (ROAD_SPEED[nRoad.type] || 1);
const tentG = (gScore.get(currentKey) || 0) + moveCost;
if (tentG < (gScore.get(nk) || Infinity)) {
cameFrom.set(nk, currentKey);
gScore.set(nk, tentG);
fScore.set(nk, tentG + heuristic(nx, ny, endRoad.x, endRoad.y));
if (!open.has(nk)) open.set(nk, {x: nx, y: ny, level: curLevel});
}
}
} // end one-way else
}
// Level transition: only via flyover tiles
// If current tile is a flyover, we can reach adjacent tiles at the OTHER level
if (curIsFlyover) {
const otherLevel = curLevel === 0 ? 1 : 0;
const nRoadOther = getRoadAtLevel(nx, ny, otherLevel);
if (nRoadOther && !(nRoadOther.breakdown && nRoadOther.blocking)) {
// One-way check: respect target tile's oneWayDir for level transitions too
const canEnter = !nRoadOther.oneWayDir || (nRoadOther.oneWayDir.dx === dx && nRoadOther.oneWayDir.dy === dy);
if (canEnter) {
const nk = `${nx},${ny},${otherLevel}`;
if (!closed.has(nk)) {
const moveCost = 1 / (ROAD_SPEED[nRoadOther.type] || 1) + 0.5; // small penalty for level change
const tentG = (gScore.get(currentKey) || 0) + moveCost;
if (tentG < (gScore.get(nk) || Infinity)) {
cameFrom.set(nk, currentKey);
gScore.set(nk, tentG);
fScore.set(nk, tentG + heuristic(nx, ny, endRoad.x, endRoad.y));
if (!open.has(nk)) open.set(nk, {x: nx, y: ny, level: otherLevel});
}
}
}
}
}
// If the neighbor IS a flyover, we can enter it from either level
const neighborIsFlyover = isFlyoverTile(nx, ny);
if (neighborIsFlyover && curLevel !== 0) {
// Can enter flyover from elevated level too
const flyRoad = getRoadAtLevel(nx, ny, 1);
if (flyRoad && !(flyRoad.breakdown && flyRoad.blocking)) {
// One-way check on current tile leaving direction
const curRoad2 = getRoadAtLevel(current.x, current.y, curLevel);
const canLeave = !curRoad2 || !curRoad2.oneWayDir || (curRoad2.oneWayDir.dx === dx && curRoad2.oneWayDir.dy === dy);
if (canLeave) {
const nk = `${nx},${ny},${curLevel}`;
if (!closed.has(nk)) {
const moveCost = 1 / (ROAD_SPEED[flyRoad.type] || 1);
const tentG = (gScore.get(currentKey) || 0) + moveCost;
if (tentG < (gScore.get(nk) || Infinity)) {
cameFrom.set(nk, currentKey);
gScore.set(nk, tentG);
fScore.set(nk, tentG + heuristic(nx, ny, endRoad.x, endRoad.y));
if (!open.has(nk)) open.set(nk, {x: nx, y: ny, level: curLevel});
}
}
}
}
}
}
}
G.pathCache.set(cacheKey, null);
return null;
}

function findNearestRoad(x, y, maxR, opts) {
const limit = maxR || 10;
const excludeHighways = opts && opts.excludeHighways;
const levelFilter = opts && opts.levelFilter !== undefined ? opts.levelFilter : null;
for (let r = 0; r < limit; r++) {
for (let dx = -r; dx <= r; dx++) {
for (let dy = -r; dy <= r; dy++) {
if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
const k = `${x+dx},${y+dy}`;
const road = G.roads.get(k) || G.elevatedRoads.get(k);
if (!road) continue;
if (excludeHighways && road.type.includes('highway')) continue;
if (levelFilter !== null && (road.elevation || 0) !== levelFilter) continue;
return {x: x+dx, y: y+dy};
}
}
}
return null;
}

function spawnVehicleFrom(family, memberIdx, fromX, fromY, destX, destY, purpose) {
const member = family.members[memberIdx];
if (!findNearestRoad(fromX, fromY, 2, {excludeHighways: true, levelFilter: 0})) {
if (purpose === 'commute' || purpose === 'return') G.failedCommutes++;
return null;
}
if (!findNearestRoad(destX, destY, 2, {excludeHighways: true, levelFilter: 0})) {
if (purpose === 'commute' || purpose === 'return') G.failedCommutes++;
return null;
}
const path = findPath(fromX, fromY, destX, destY);
if (!path || path.length === 0) {
if (purpose === 'commute' || purpose === 'return') G.failedCommutes++;
return null;
}
const startPt = path[0];
const v = {
active: true,
familyId: family.id,
memberIdx,
x: startPt.x,
y: startPt.y,
level: startPt.level || 0,
destX, destY,
purpose,
path: path,
pathIdx: 0,
speed: 0.05,
color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
angle: 0,
braking: false,
departTick: G.dayTick,
arrived: false,
lane: 0,
targetLane: 0,
laneChangeTimer: 0,
usePaidRoad: member ? member.paidRoadTrait : 3,
usePaidParking: member ? member.paidParkingTrait : 2,
tollPaidRoads: new Set()
};
G.vehicles.push(v);
return v;
}

function spawnVehicle(family, memberIdx, destX, destY, purpose) {
const member = family.members[memberIdx];
const hx = family.houseTile.x, hy = family.houseTile.y;
// House must have a directly adjacent ground-level non-highway road (driveway connection)
if (!findNearestRoad(hx, hy, 2, {excludeHighways: true, levelFilter: 0})) {
if (purpose === 'commute' || purpose === 'return') G.failedCommutes++;
return null;
}
// Destination must also have a nearby ground-level non-highway road
if (!findNearestRoad(destX, destY, 2, {excludeHighways: true, levelFilter: 0})) {
if (purpose === 'commute' || purpose === 'return') G.failedCommutes++;
return null;
}
const path = findPath(hx, hy, destX, destY);
if (!path || path.length === 0) {
if (purpose === 'commute' || purpose === 'return') G.failedCommutes++;
return null;
}
// Start vehicle at nearest road (first path waypoint) so it doesn't drive through buildings
const startPt = path[0];
const v = {
active: true,
familyId: family.id,
memberIdx,
x: startPt.x,
y: startPt.y,
level: startPt.level || 0,
destX, destY,
purpose,
path: path,
pathIdx: 0,
speed: 0.05,
color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
angle: 0,
braking: false,
departTick: G.dayTick,
arrived: false,
lane: 0,
targetLane: 0,
laneChangeTimer: 0,
usePaidRoad: member ? member.paidRoadTrait : 3,
usePaidParking: member ? member.paidParkingTrait : 2
};
G.vehicles.push(v);
return v;
}

function updateVehicles(dt) {
// Process crashes first
for (let i = G.crashes.length - 1; i >= 0; i--) {
const crash = G.crashes[i];
crash.timer -= dt;
if (crash.timer <= 0) {
G.crashes.splice(i, 1);
G.lastRoadChangeId++;
G.pathCache.clear();
}
}
// Build per-tile vehicle count map for capacity enforcement
const tileVehicleCount = new Map();
for (const v of G.vehicles) {
if (!v.active || v.crashed) continue;
const tk = `${Math.floor(v.x)},${Math.floor(v.y)}`;
tileVehicleCount.set(tk, (tileVehicleCount.get(tk) || 0) + 1);
}
for (let i = G.vehicles.length - 1; i >= 0; i--) {
const v = G.vehicles[i];
if (!v.active) { G.vehicles.splice(i, 1); continue; }
if (v.crashed) { v.active = false; G.vehicles.splice(i, 1); continue; }
if (!v.path || v.pathIdx >= v.path.length) {
v.active = false;
onVehicleArrived(v);
continue;
}
const target = v.path[v.pathIdx];
const dx = target.x - v.x;
const dy = target.y - v.y;
const dist = Math.sqrt(dx*dx + dy*dy);
// Check road speed
const roadKey = `${Math.floor(v.x)},${Math.floor(v.y)}`;
const road = G.roads.get(roadKey) || G.elevatedRoads.get(roadKey);
const rawRoadSpeed = (road ? (ROAD_SPEED[road.type] || 1) : 0.5) * (G.vossSpeedBoost || 1);
// Per-road speed limit (only one-way roads have adjustable limits)
const perRoadLimit = road && road.speedLimitMPH ? road.speedLimitMPH / 30 : Infinity;
const roadSpeed = Math.min(rawRoadSpeed, perRoadLimit);
// Check for crash at or ahead of this location
const vx = Math.floor(v.x), vy = Math.floor(v.y);
const lookCos = Math.cos(v.angle || 0), lookSin = Math.sin(v.angle || 0);
const crashHere = G.crashes.find(c => {
const cdx = c.x - v.x, cdy = c.y - v.y;
const cDist = Math.sqrt(cdx*cdx + cdy*cdy);
if (cDist < 1) return true; // at current location
if (cDist < 3 && (cdx * lookCos + cdy * lookSin) > 0) return true; // ahead
return false;
});
if (crashHere) {
v.braking = true;
continue;
}
// Check for traffic ahead — maintain spacing
let trafficSlowdown = 1;
let tooClose = false;
let closestAheadDist = Infinity;
const vCos = Math.cos(v.angle || 0), vSin = Math.sin(v.angle || 0);
// Determine lane count for current road
const lanesPerDir = road ? (ROAD_LANES_PER_DIR[road.type] || 1) : 1;
const isMultiLane = lanesPerDir >= 2;
// Lane change cooldown
if (v.laneChangeTimer > 0) v.laneChangeTimer -= dt;
// Overtaking detection
let blockedInLane = false;
let blockedSpeed = Infinity;
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
const odx = ov.x - v.x, ody = ov.y - v.y;
const oDist = Math.sqrt(odx*odx + ody*ody);
// Check if this vehicle is ahead of us
const dotProduct = odx * vCos + ody * vSin;
if (oDist < 4.0 && dotProduct > 0) {
// On multi-lane roads, use lane index to filter
if (lanesPerDir >= 1) {
const ovCos = Math.cos(ov.angle || 0), ovSin = Math.sin(ov.angle || 0);
const dirDot = vCos * ovCos + vSin * ovSin;
// Skip opposite direction vehicles
if (dirDot < 0) continue;
// Skip vehicles in different lanes (same direction)
if (isMultiLane && (v.lane || 0) !== (ov.lane || 0)) continue;
}
if (oDist < closestAheadDist) closestAheadDist = oDist;
// Track blocking for overtake decisions
if (oDist < 2.5 && isMultiLane) {
blockedInLane = true;
const ovRoadKey = `${Math.floor(ov.x)},${Math.floor(ov.y)}`;
const ovRoad = G.roads.get(ovRoadKey) || G.elevatedRoads.get(ovRoadKey);
const ovSpeed = ovRoad ? (ROAD_SPEED[ovRoad.type] || 1) : 0.5;
blockedSpeed = Math.min(blockedSpeed, ovSpeed);
}
// Progressive braking based on distance to vehicle ahead
if (oDist < 0.5) {
tooClose = true;
// Crash check — base crash at very close range, plus speed-based crash chance
const effectiveMPH = road ? getRoadEffectiveMPH(road) : 15;
const speedCrashMod = getSpeedCrashChance(effectiveMPH);
const crashThreshold = speedCrashMod > 0 ? 0.25 : 0.15;
const speedCrashRoll = speedCrashMod > 0 && oDist < 0.3 && !v.braking ? Math.random() < speedCrashMod * 0.002 : false;
if ((oDist < crashThreshold && !v.braking && !ov.braking) || speedCrashRoll) {
const crashKey = `${Math.floor((v.x+ov.x)/2)},${Math.floor((v.y+ov.y)/2)}`;
const nearInt = G.intersections.get(crashKey);
if (!nearInt || (nearInt.type !== 'stop' && nearInt.type !== 'light')) {
v.crashed = true;
ov.crashed = true;
const cx = Math.floor((v.x + ov.x) / 2);
const cy = Math.floor((v.y + ov.y) / 2);
if (!G.crashes.find(c => c.x === cx && c.y === cy)) {
const nearest = findNearestMaintenance(cx, cy);
const repairTime = nearest ? Math.max(200, Math.abs(nearest.x - cx) * 30 + Math.abs(nearest.y - cy) * 30) : 600;
G.crashes.push({x: cx, y: cy, timer: repairTime, vehicles: [v.color, ov.color]});
{const _cx=cx, _cy=cy; showNotification(`💥 Crash at (${cx},${cy})! Road blocked for repairs. (Click to view)`, 8000, () => { const iso = toISO(_cx, _cy); G.camera.x = iso.sx; G.camera.y = iso.sy; });}
}
break;
}
}
// Push apart to prevent visual phasing
if (oDist < 0.4 && oDist > 0.01) {
const pushStr = (0.4 - oDist) * 0.3;
const nx = odx / oDist, ny = ody / oDist;
v.x -= nx * pushStr;
v.y -= ny * pushStr;
}
// Allow creep at very low speed instead of full stop to prevent permanent gridlock
trafficSlowdown = Math.min(trafficSlowdown, 0.03);
v.braking = true;
} else if (oDist < 1.2) {
// Close — hard brake but allow creep
const spacingFactor = Math.max(0, (oDist - 0.5) / 0.7);
trafficSlowdown = Math.min(trafficSlowdown, 0.05 + spacingFactor * 0.2);
v.braking = true;
} else if (oDist < 2.5) {
// Medium range — proportional slowdown
const spacingFactor = (oDist - 1.2) / 1.3;
trafficSlowdown = Math.min(trafficSlowdown, 0.2 + spacingFactor * 0.5);
v.braking = spacingFactor < 0.3;
} else {
// Far — gentle slowdown if other vehicle is braking/slow
if (ov.braking) {
trafficSlowdown = Math.min(trafficSlowdown, 0.5 + (oDist - 2.5) / 3);
}
}
}
}
if (v.crashed) continue;
// Overtaking logic: if blocked in current lane on multi-lane road, try to change lanes
if (isMultiLane && blockedInLane && v.laneChangeTimer <= 0) {
const curLane = v.lane || 0;
// Try passing lane (higher index)
const passLane = curLane + 1;
if (passLane < lanesPerDir) {
// Check if passing lane is clear
let passClear = true;
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
if ((ov.lane || 0) !== passLane) continue;
const odx = ov.x - v.x, ody = ov.y - v.y;
const oDist = Math.sqrt(odx*odx + ody*ody);
const ovCos = Math.cos(ov.angle || 0), ovSin = Math.sin(ov.angle || 0);
const dirDot = vCos * ovCos + vSin * ovSin;
if (dirDot > 0 && oDist < 3.0) { passClear = false; break; }
}
if (passClear) {
v.lane = passLane;
v.targetLane = passLane;
v.laneChangeTimer = 30;
}
}
} else if (isMultiLane && !blockedInLane && (v.lane || 0) > 0 && v.laneChangeTimer <= 0) {
// Return to slow lane (lane 0) when no longer blocked
let slowClear = true;
const targetLane = (v.lane || 0) - 1;
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
if ((ov.lane || 0) !== targetLane) continue;
const odx = ov.x - v.x, ody = ov.y - v.y;
const oDist = Math.sqrt(odx*odx + ody*ody);
const ovCos = Math.cos(ov.angle || 0), ovSin = Math.sin(ov.angle || 0);
const dirDot = vCos * ovCos + vSin * ovSin;
if (dirDot > 0 && oDist < 2.5) { slowClear = false; break; }
}
if (slowClear) {
v.lane = targetLane;
v.targetLane = targetLane;
v.laneChangeTimer = 30;
}
}
// Stuck detection — reroute if vehicle hasn't moved significantly
if (!v.stuckCheck) { v.stuckCheck = {x: v.x, y: v.y, tick: 0}; }
v.stuckCheck.tick += dt;
if (v.stuckCheck.tick > 90) { // check every ~90 ticks (~1.5s)
const movedDist = Math.sqrt((v.x - v.stuckCheck.x) ** 2 + (v.y - v.stuckCheck.y) ** 2);
if (movedDist < 0.3) {
// Vehicle is stuck — try to reroute
v.stuckCount = (v.stuckCount || 0) + 1;
if (v.stuckCount >= 2) {
// Reroute: find a new path from current position to destination
const destNode = v.path[v.path.length - 1];
if (destNode) {
const curRoadX = Math.floor(v.x), curRoadY = Math.floor(v.y);
// Temporarily increase lastRoadChangeId to bypass path cache
const savedId = G.lastRoadChangeId;
G.lastRoadChangeId++;
const newPath = findPath(curRoadX, curRoadY, destNode.x, destNode.y);
G.lastRoadChangeId = savedId;
if (newPath && newPath.length > 1) {
v.path = newPath;
v.pathIdx = 0;
v.lastStopKey = null;
v.intersectionCleared = false;
v.stuckCount = 0;
} else if (v.stuckCount >= 5) {
// Truly stuck with no alternate route — despawn
v.active = false;
}
}
}
} else {
v.stuckCount = 0;
}
v.stuckCheck = {x: v.x, y: v.y, tick: 0};
}
// Only clear braking when we have adequate spacing from all vehicles ahead
if (!tooClose && closestAheadDist > 0.6 && trafficSlowdown >= 0.95) {
v.braking = false;
}
// One-lane road: head-on conflict — one vehicle must yield
if (road && road.type === 'road_1lane') {
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
const odx = ov.x - v.x, ody = ov.y - v.y;
const oDist = Math.sqrt(odx*odx + ody*ody);
if (oDist < 2.0 && oDist > 0.1) {
// Check if heading towards each other (dot products with each other's direction)
const vDir = {x: Math.cos(v.angle || 0), y: Math.sin(v.angle || 0)};
const oDir = {x: Math.cos(ov.angle || 0), y: Math.sin(ov.angle || 0)};
// Facing each other if their directions are roughly opposite
const facingDot = vDir.x * oDir.x + vDir.y * oDir.y;
if (facingDot < -0.3) {
// Head-on! Lower ID yields (consistent rule)
if (v.departTick > ov.departTick || (v.departTick === ov.departTick && i > j)) {
trafficSlowdown *= 0.02; // nearly stop to let the other pass
v.braking = true;
}
}
}
}
}
// Check intersection
const intKey = `${Math.floor(v.x)},${Math.floor(v.y)}`;
const intersection = G.intersections.get(intKey);
if (intersection && dist < 0.5) {
// Skip stop signs on highways
const intRoad = G.roads.get(intKey) || G.elevatedRoads.get(intKey);
const isHighwayInt = intRoad && intRoad.type.includes('highway');
if (isHighwayInt && intersection.type === 'stop') {
G.intersections.delete(intKey); // clean up legacy stop signs on highways
} else if (intersection.type === 'stop') {
// Determine which direction this vehicle is approaching from
const stopDirs = intersection.stopDirs || {N:true,S:true,E:true,W:true};
const vAngle = v.angle || 0;
const absA = Math.abs(vAngle);
let approachDir;
if (absA <= Math.PI/4) approachDir = 'W';
else if (absA >= 3*Math.PI/4) approachDir = 'E';
else if (vAngle > 0) approachDir = 'N';
else approachDir = 'S';
if (stopDirs[approachDir]) {
// First-come-first-served stop sign logic
if (v.lastStopKey !== intKey) {
v.stopWait = 12; // brief full stop
v.lastStopKey = intKey;
v.intersectionArrivalTick = G.dayTick + G.day * 3600;
v.intersectionCleared = false;
v.intersectionWaitTicks = 0;
}
if (v.stopWait > 0) {
v.stopWait -= dt;
trafficSlowdown = 0;
v.braking = true;
} else if (!v.intersectionCleared) {
// Track how long we've been waiting after the initial stop
v.intersectionWaitTicks = (v.intersectionWaitTicks || 0) + dt;
let canGo = true;
// Check if another vehicle is physically inside/crossing the intersection
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
const odx = ov.x - v.x, ody = ov.y - v.y;
const oDist = Math.sqrt(odx*odx + ody*ody);
if (oDist < 0.8) {
const occKey = `${Math.floor(ov.x)},${Math.floor(ov.y)}`;
if (occKey === intKey && ov.intersectionCleared) {
canGo = false;
break;
}
}
}
// First-come-first-served: yield to vehicles that arrived earlier
// Use wider window (15 ticks) so simultaneous arrivals resolve via tiebreaker
if (canGo) {
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
if (ov.lastStopKey !== intKey || ov.intersectionCleared) continue;
if (ov.stopWait > 0) continue; // still doing initial stop
if (ov.intersectionArrivalTick < v.intersectionArrivalTick - 15) {
// They clearly arrived first — yield
canGo = false;
break;
} else if (Math.abs(ov.intersectionArrivalTick - v.intersectionArrivalTick) <= 15) {
// Near-simultaneous arrival — right-of-way to vehicle from the right
// Use vehicle index as stable tiebreaker (lower index goes first)
if (j < i) {
canGo = false;
break;
}
}
}
}
// Deadlock breaker: if waiting > 30 ticks after stop, just go
if (v.intersectionWaitTicks > 30) canGo = true;
if (canGo) {
v.intersectionCleared = true;
} else {
trafficSlowdown = 0;
v.braking = true;
}
}
}
} else if (intersection.type === 'light') {
const vAngle = v.angle || 0;
const absA = Math.abs(vAngle);
const movingNS = absA > Math.PI/4 && absA < 3*Math.PI/4;
const vAxis = movingNS ? 'NS' : 'EW';
const phase = intersection.phase || 'green';
if (intersection.greenAxis !== vAxis) {
// Red light — check for right-turn-on-red
let rightTurn = false;
if (v.path && v.pathIdx < v.path.length - 1) {
const next = v.path[v.pathIdx];
const after = v.path[v.pathIdx + 1];
if (next && after) {
const turnDx = after.x - next.x, turnDy = after.y - next.y;
const turnAngle = Math.atan2(turnDy, turnDx);
const diff = ((turnAngle - vAngle) + Math.PI * 2) % (Math.PI * 2);
// Right turn is approximately +π/2 (90° clockwise)
if (diff > Math.PI * 0.25 && diff < Math.PI * 0.75) rightTurn = true;
}
}
if (rightTurn && v.stopWait !== undefined && v.stopWait <= 0) {
// Right turn on red allowed after stopping — check cross traffic
let crossClear = true;
for (let j = 0; j < G.vehicles.length; j++) {
const ov = G.vehicles[j];
if (ov === v || !ov.active || ov.crashed) continue;
const odx = ov.x - v.x, ody = ov.y - v.y;
const oDist = Math.sqrt(odx*odx + ody*ody);
if (oDist < 2.0) {
const ovAngle = ov.angle || 0;
const ovAbsA = Math.abs(ovAngle);
const ovMovingNS = ovAbsA > Math.PI/4 && ovAbsA < 3*Math.PI/4;
const ovAxis = ovMovingNS ? 'NS' : 'EW';
if (ovAxis === intersection.greenAxis && !ov.braking) {
crossClear = false;
break;
}
}
}
if (!crossClear) {
trafficSlowdown = 0;
v.braking = true;
}
// else: right turn on red is allowed, proceed
} else {
// Full red — stop
if (v.lastStopKey !== intKey) {
v.stopWait = 10;
v.lastStopKey = intKey;
}
if (v.stopWait > 0) v.stopWait -= dt;
trafficSlowdown = 0;
v.braking = true;
}
} else if (phase === 'yellow') {
// Yellow light — stop if not very close to intersection
if (dist > 0.3) {
trafficSlowdown = 0;
v.braking = true;
}
// else: already very close, proceed through yellow
}
}
}
// Check breakdown
if (road && road.breakdown && !road.blocking) {
trafficSlowdown *= 0.3;
} else if (road && road.breakdown && road.blocking) {
trafficSlowdown = 0;
v.braking = true;
}
// Capacity-based congestion slowdown
if (road) {
const cap = ROAD_CAPACITY[road.type] || 4;
const count = tileVehicleCount.get(roadKey) || 0;
if (count >= cap) {
trafficSlowdown *= 0.3; // at capacity: severe congestion
} else if (count >= cap * 0.75) {
trafficSlowdown *= 0.7; // approaching capacity
}
}
const moveSpeed = v.speed * roadSpeed * trafficSlowdown * dt;
if (dist < moveSpeed) {
v.x = target.x;
v.y = target.y;
v.level = target.level || 0;
v.pathIdx++;
// Clear intersection state once vehicle moves past the intersection tile
if (v.lastStopKey && v.lastStopKey !== `${Math.floor(target.x)},${Math.floor(target.y)}`) {
v.lastStopKey = null;
v.intersectionCleared = false;
}
// Toll for paid roads — charge once per road segment per vehicle per day
if (road && road.paid) {
const roadKey = `${Math.round(target.x)},${Math.round(target.y)}`;
if (!v.tollPaidRoads) v.tollPaidRoads = new Set();
if (!v.tollPaidRoads.has(roadKey)) {
v.tollPaidRoads.add(roadKey);
const tollAmount = [0, 1, 2, 5][road.tollTier || 1];
if (v.isTruck) {
const truckToll = Math.ceil(tollAmount * 0.5);
G.money += truckToll;
G.weekTollRoad += truckToll;
road.tollRevenue += truckToll;
weeklyTruckTolls += truckToll;
} else if (v.usePaidRoad === 0 || (v.usePaidRoad === 1 && trafficSlowdown < 0.5) ||
(v.usePaidRoad === 2 && Math.random() < 0.5)) {
G.money += tollAmount;
G.weekTollRoad += tollAmount;
road.tollRevenue += tollAmount;
}
}
}
} else {
v.angle = Math.atan2(dy, dx);
let mx = (dx / dist) * moveSpeed;
let my = (dy / dist) * moveSpeed;
// Lane-based perpendicular offset for smooth visual positioning
if (road && lanesPerDir >= 1) {
const perpX = -Math.sin(v.angle);
const perpY = Math.cos(v.angle);
// Direction determines which side of center (drive-right convention)
const side = (v.angle >= 0) ? 1 : -1;
// Lane offset: base side offset + additional lane offset
const laneIdx = v.lane || 0;
const laneSpacing = 0.12 / lanesPerDir;
const totalOffset = side * (0.08 + laneIdx * laneSpacing);
mx += perpX * totalOffset * 0.3;
my += perpY * totalOffset * 0.3;
}
v.x += mx;
v.y += my;
}
}
}

function onVehicleArrived(v) {
v.arrived = true;
const travelTime = (G.dayTick - v.departTick) / 60; // in game minutes
// Trucks/deliveries just disappear on arrival
if (v.isTruck || v.purpose === 'delivery' || v.purpose === 'night_delivery') return;
const family = v.familyId >= 0 ? G.families[v.familyId] : null;
if (!family) return;
if (v.purpose === 'commute') {
const member = family.members[v.memberIdx];
if (member) {
member.atWork = true;
const arrivalHour = getTimeOfDay();
const shiftStart = member.nightShift ? NIGHT_SHIFT_START : DAY_SHIFT_START;
member.arrivedOnTime = arrivalHour <= shiftStart;
}
G.commuteStats.officeTotal++;
const arrHour = getTimeOfDay();
const memberForShift = family.members[v.memberIdx];
const shift = memberForShift && memberForShift.nightShift ? NIGHT_SHIFT_START : DAY_SHIFT_START;
if (arrHour > shift) G.commuteStats.officeLate++;
} else if (v.purpose === 'lunch') {
// Restaurant revenue affected by travel time
const restaurant = G.buildings.find(b => b.id === v.destBuildingId);
if (restaurant && travelTime < 60) {
restaurant.weekRevenue += 8;
}
G.commuteStats.restaurantTotal++;
if (travelTime >= 60) G.commuteStats.restaurantLate++;
} else if (v.purpose === 'school_dropoff') {
G.commuteStats.schoolTotal++;
if (travelTime >= 60) G.commuteStats.schoolLate++;
// Continue to workplace after dropping off kids
if (v.nextDest && family) {
const nd = v.nextDest;
const schoolX = Math.floor(v.destX), schoolY = Math.floor(v.destY);
const newV = spawnVehicleFrom(family, v.memberIdx, schoolX, schoolY, nd.x, nd.y, nd.purpose);
if (newV) newV.departTick = G.dayTick; // track from school departure
}
}
}

// ===== SIMULATION =====
function simulate(dt) {
if (G.speed === 0) return;
const tickDelta = dt * G.speed;
G.dayTick += tickDelta;
// Day cycle (3600 ticks = 1 day at 60fps)
if (G.dayTick >= 3600) {
G.dayTick = 0;
endOfDay();
}
const hour = getTimeOfDay();
// Deterministic commute spawning — each worker departs at their computed tick
spawnScheduledCommuters();
// Night shift commute (legacy fallback for any night workers not caught by scheduler)
if (hour >= 21 && hour < 23 && Math.random() < 0.04 * G.speed) {
spawnCommuteVehicles(true);
}
// Night shift return (5-7 AM)
if (hour >= 5 && hour < 7 && Math.random() < 0.04 * G.speed) {
spawnNightReturnVehicles();
}
// Mid-morning deliveries (9-11 AM)
if (hour >= 9 && hour < 11 && Math.random() < 0.025 * G.speed) {
spawnDeliveryTruck();
}
// Random errands throughout the day (9 AM - 5 PM)
if (hour >= 9 && hour < 17 && Math.random() < 0.02 * G.speed) {
spawnRandomTrip();
}
// Lunch rush (11:30-1:30 PM) — wider window, more traffic
if (hour >= 11.5 && hour < 13.5 && Math.random() < 0.035 * G.speed) {
spawnLunchVehicles();
}
// Afternoon deliveries (1-4 PM)
if (hour >= 13 && hour < 16 && Math.random() < 0.02 * G.speed) {
spawnDeliveryTruck();
}
// Evening return (4:30-7 PM) — starts earlier, more vehicles
if (hour >= 16.5 && hour < 19 && Math.random() < 0.05 * G.speed) {
spawnReturnVehicles();
}
// Evening errands (5-9 PM)
if (hour >= 17 && hour < 21 && Math.random() < 0.015 * G.speed) {
spawnRandomTrip();
}
// Night deliveries (10 PM - 5 AM)
if ((hour >= 22 || hour < 5) && Math.random() < 0.015 * G.speed) {
spawnNightDelivery();
}
// Update traffic lights
G.intersections.forEach((ctrl, key) => {
// Clear occupiedBy if vehicle has left the intersection (all types)
if (ctrl.occupiedBy) {
const occ = ctrl.occupiedBy;
if (!occ.active || occ.crashed) ctrl.occupiedBy = null;
else {
const occKey = `${Math.floor(occ.x)},${Math.floor(occ.y)}`;
if (occKey !== key) ctrl.occupiedBy = null;
}
}
if (ctrl.type === 'light') {
ctrl.timer += tickDelta;
if (!ctrl.phase) ctrl.phase = 'green';
if (ctrl.phase === 'green' && ctrl.timer > 150) {
ctrl.phase = 'yellow';
ctrl.timer = 0;
} else if (ctrl.phase === 'yellow' && ctrl.timer > 30) {
ctrl.phase = 'green';
ctrl.greenAxis = ctrl.greenAxis === 'NS' ? 'EW' : 'NS';
ctrl.timer = 0;
}
}
});
// Breakdowns
if (Math.random() < 0.0003 * G.speed) {
tryBreakdown();
}
// Repair breakdowns
G.breakdowns = G.breakdowns.filter(bd => {
bd.repairTimer -= tickDelta;
if (bd.repairTimer <= 0) {
const road = G.roads.get(`${bd.x},${bd.y}`) || G.elevatedRoads.get(`${bd.x},${bd.y}`);
if (road) { road.breakdown = false; road.blocking = false; }
G.lastRoadChangeId++;
G.pathCache.clear();
return false;
}
return true;
});
// Update maintenance vehicles — follow road path if available
G.maintenanceVehicles = G.maintenanceVehicles.filter(mv => {
// Build path on first update if not yet done
if (!mv.path) {
const rawPath = findPath(Math.round(mv.startX), Math.round(mv.startY), Math.round(mv.destX), Math.round(mv.destY));
if (rawPath && rawPath.length > 1) {
mv.path = rawPath;
mv.pathIdx = 0;
mv.x = mv.startX;
mv.y = mv.startY;
} else {
// No road path — fall back to direct travel
mv.path = null;
mv.pathIdx = -1;
}
}
const speed = 3.5; // tiles per second
if (mv.path && mv.pathIdx >= 0 && mv.pathIdx < mv.path.length) {
const target = mv.path[mv.pathIdx];
const dx = target.x - mv.x;
const dy = target.y - mv.y;
const dist = Math.sqrt(dx*dx + dy*dy);
const step = speed * tickDelta;
if (dist < step) {
mv.x = target.x;
mv.y = target.y;
mv.pathIdx++;
} else {
mv.angle = Math.atan2(dy, dx);
mv.x += (dx / dist) * step;
mv.y += (dy / dist) * step;
}
return mv.pathIdx < mv.path.length;
} else {
// Fallback direct travel
mv.progress = (mv.progress || 0) + tickDelta / mv.totalTime;
const t = Math.min(mv.progress, 1);
mv.x = mv.startX + (mv.destX - mv.startX) * t;
mv.y = mv.startY + (mv.destY - mv.startY) * t;
mv.angle = Math.atan2(mv.destY - mv.startY, mv.destX - mv.startX);
return mv.progress < 1.05;
}
});
updateVehicles(tickDelta);
// Auto-save every 30 seconds
if (Date.now() - G.lastSave > 30000) {
saveGame();
G.lastSave = Date.now();
}
}

function computeDepartureTicks() {
if (!G || !G.families) return;
G.families.forEach(family => {
for (let i = 0; i < family.members.length; i++) {
const m = family.members[i];
if (m.role !== 'adult' || !m.workplaceId) continue;
m.spawnedToday = false;
const workplace = G.buildings.find(b => b.id === m.workplaceId);
if (!workplace) { m.targetDepartTick = null; continue; }
const dx = workplace.x - family.houseTile.x;
const dy = workplace.y - family.houseTile.y;
const dist = Math.sqrt(dx * dx + dy * dy);
const zone = getCommuteZone(dist);
const shiftStart = m.nightShift ? NIGHT_SHIFT_START : DAY_SHIFT_START;
const personalAdjust = (m.punctuality || 0) * 60; // -60 to +60 minutes
// Parent modifier: primary adult with school children leaves 20 min earlier
const children = family.members.filter(c => c.role === 'child' && c.schoolId);
const parentExtra = (i === 0 && children.length > 0) ? 20 : 0;
const totalLead = zone.leadMinutes + parentExtra - personalAdjust;
let departHour = shiftStart - totalLead / 60;
// Clamp departure to reasonable range (don't depart before 5 AM or negative ticks)
if (!m.nightShift) departHour = Math.max(5, departHour);
else departHour = Math.max(18, departHour);
// Convert hour to dayTick: hour 6 = tick 0, hour 24 = tick 3600
m.targetDepartTick = (departHour - 6) / 18 * 3600;
if (m.targetDepartTick < 0) m.targetDepartTick = 0;
}
});
}

function spawnScheduledCommuters() {
if (!G || !G.families) return;
const tollPct = getPaidRoadPercent();
let spawned = 0;
const maxPerTick = 3;
for (let fi = 0; fi < G.families.length && spawned < maxPerTick; fi++) {
const family = G.families[fi];
if (!family) continue;
for (let i = 0; i < family.members.length && spawned < maxPerTick; i++) {
const m = family.members[i];
if (m.role !== 'adult' || m.atWork || !m.workplaceId || m.spawnedToday) continue;
if (m.targetDepartTick == null || G.dayTick < m.targetDepartTick) continue;
// Strike check
if (tollPct > 0.2) {
const excessPct = (tollPct - 0.2) / 0.8;
const strikeThresholds = [0.7, 0.5, 0.3, 0.1];
const strikeChance = Math.max(0, (excessPct - strikeThresholds[m.paidRoadTrait]) * 2);
if (Math.random() < strikeChance) {
m.onStrike = true;
m.spawnedToday = true;
continue;
}
}
m.onStrike = false;
const workplace = G.buildings.find(b => b.id === m.workplaceId);
if (!workplace) { m.spawnedToday = true; continue; }
// Day shift: check if children need school dropoff
if (!m.nightShift) {
const children = family.members.filter(c => c.role === 'child' && c.schoolId);
if (children.length > 0 && i === 0) {
const school = G.buildings.find(b => b.id === children[0].schoolId);
if (school) {
const v = spawnVehicle(family, i, school.x, school.y, 'school_dropoff');
if (v) v.nextDest = {x: workplace.x, y: workplace.y, purpose: 'commute'};
m.spawnedToday = true;
spawned++;
continue;
}
}
}
const v = spawnVehicle(family, i, workplace.x, workplace.y, 'commute');
if (v) spawned++;
m.spawnedToday = true;
}
}
}

function spawnCommuteVehicles(nightShift) {
// Legacy function — kept for night shift random spawning fallback
const family = G.families[Math.floor(Math.random() * G.families.length)];
if (!family) return;
const tollPct = getPaidRoadPercent();
for (let i = 0; i < family.members.length; i++) {
const m = family.members[i];
if (m.role === 'adult' && !m.atWork && m.workplaceId && !!m.nightShift === !!nightShift) {
if (m.spawnedToday) continue;
if (tollPct > 0.2) {
const excessPct = (tollPct - 0.2) / 0.8;
const strikeThresholds = [0.7, 0.5, 0.3, 0.1];
const strikeChance = Math.max(0, (excessPct - strikeThresholds[m.paidRoadTrait]) * 2);
if (Math.random() < strikeChance) {
m.onStrike = true;
continue;
}
}
m.onStrike = false;
const workplace = G.buildings.find(b => b.id === m.workplaceId);
if (workplace) {
if (!nightShift) {
const children = family.members.filter(c => c.role === 'child' && c.schoolId);
if (children.length > 0 && i === 0) {
const school = G.buildings.find(b => b.id === children[0].schoolId);
if (school) {
const v = spawnVehicle(family, i, school.x, school.y, 'school_dropoff');
if (v) v.nextDest = {x: workplace.x, y: workplace.y, purpose: 'commute'};
return;
}
}
}
spawnVehicle(family, i, workplace.x, workplace.y, 'commute');
}
}
}
}

function spawnNightReturnVehicles() {
const family = G.families[Math.floor(Math.random() * G.families.length)];
if (!family) return;
for (let i = 0; i < family.members.length; i++) {
const m = family.members[i];
if (m.role === 'adult' && m.atWork && m.nightShift) {
spawnVehicle(family, i, family.houseTile.x, family.houseTile.y, 'return');
m.atWork = false;
}
}
}

function spawnLunchVehicles() {
const family = G.families[Math.floor(Math.random() * G.families.length)];
if (!family) return;
for (let i = 0; i < family.members.length; i++) {
const m = family.members[i];
if (m.role === 'adult' && m.atWork) {
const cuisine = CUISINE_TYPES[Math.floor(Math.random() * CUISINE_TYPES.length)];
const restaurant = G.buildings.find(b => b.type === 'restaurant' && b.cuisine === cuisine);
if (restaurant) {
const v = spawnVehicle(family, i, restaurant.x, restaurant.y, 'lunch');
if (v) v.destBuildingId = restaurant.id;
}
break;
}
}
}

function spawnReturnVehicles() {
const family = G.families[Math.floor(Math.random() * G.families.length)];
if (!family) return;
for (let i = 0; i < family.members.length; i++) {
const m = family.members[i];
if (m.role === 'adult' && m.atWork) {
spawnVehicle(family, i, family.houseTile.x, family.houseTile.y, 'return');
m.atWork = false;
}
}
}

function spawnDeliveryTruck() {
// Delivery trucks travel between random buildings
if (G.buildings.length < 2) return;
const sources = G.buildings.filter(b => b.type === 'office' || b.type === 'restaurant');
const destinations = G.buildings.filter(b => b.type === 'house' || b.type === 'office' || b.type === 'restaurant');
if (sources.length === 0 || destinations.length === 0) return;
const src = sources[Math.floor(Math.random() * sources.length)];
let dest = destinations[Math.floor(Math.random() * destinations.length)];
if (src.id === dest.id) return; // skip same building
const v = {
active: true, familyId: -1, memberIdx: -1,
x: src.x, y: src.y, destX: dest.x, destY: dest.y,
purpose: 'delivery', path: null, pathIdx: 0,
speed: 0.035, // trucks are slower
color: TRUCK_COLORS[Math.floor(Math.random() * TRUCK_COLORS.length)],
angle: 0, braking: false, departTick: G.dayTick, arrived: false,
isTruck: true, usePaidRoad: 0, usePaidParking: 2
};
v.path = findPath(v.x, v.y, dest.x, dest.y);
if (!v.path) { v.active = false; return; }
G.vehicles.push(v);
}

function spawnNightDelivery() {
// Night delivery trucks between offices and restaurants
const restaurants = G.buildings.filter(b => b.type === 'restaurant');
const offices = G.buildings.filter(b => b.type === 'office');
if (restaurants.length === 0) return;
const dest = restaurants[Math.floor(Math.random() * restaurants.length)];
// Truck comes from a random edge of the playable area
const edge = Math.random() < 0.5 ? 'x' : 'y';
const src = {
x: edge === 'x' ? (Math.random() < 0.5 ? G.playableCenter.x - G.playableRadius + 2 : G.playableCenter.x + G.playableRadius - 2) : G.playableCenter.x + Math.floor(Math.random() * 10 - 5),
y: edge === 'y' ? (Math.random() < 0.5 ? G.playableCenter.y - G.playableRadius + 2 : G.playableCenter.y + G.playableRadius - 2) : G.playableCenter.y + Math.floor(Math.random() * 10 - 5)
};
const nearRoad = findNearestRoad(src.x, src.y, 5);
if (!nearRoad) return;
const v = {
active: true, familyId: -1, memberIdx: -1,
x: nearRoad.x, y: nearRoad.y, destX: dest.x, destY: dest.y,
purpose: 'night_delivery', path: null, pathIdx: 0,
speed: 0.04, color: TRUCK_COLORS[Math.floor(Math.random() * TRUCK_COLORS.length)],
angle: 0, braking: false, departTick: G.dayTick, arrived: false,
isTruck: true, usePaidRoad: 0, usePaidParking: 2
};
v.path = findPath(nearRoad.x, nearRoad.y, dest.x, dest.y);
if (!v.path) { v.active = false; return; }
G.vehicles.push(v);
}

function spawnRandomTrip() {
// Random civilian trips between houses and various buildings (errands, shopping, visiting)
if (G.families.length === 0) return;
const family = G.families[Math.floor(Math.random() * G.families.length)];
const destinations = G.buildings.filter(b => b.type !== 'house');
if (destinations.length === 0) return;
const dest = destinations[Math.floor(Math.random() * destinations.length)];
// Find an adult who isn't at work
const adultIdx = family.members.findIndex(m => m.role === 'adult' && !m.atWork && !m.onStrike);
if (adultIdx < 0) return;
spawnVehicle(family, adultIdx, dest.x, dest.y, 'errand');
}

function tryBreakdown() {
const allRoadKeys = [...Array.from(G.roads.keys()), ...Array.from(G.elevatedRoads.keys())];
if (allRoadKeys.length === 0) return;
const key = allRoadKeys[Math.floor(Math.random() * allRoadKeys.length)];
const road = G.roads.get(key) || G.elevatedRoads.get(key);
if (road.breakdown) return;
const chance = BREAKDOWN_CHANCE[G.upkeepTier];
if (Math.random() > chance * 30) return;
road.breakdown = true;
road.blocking = Math.random() < 0.3;
const [bx, by] = key.split(',').map(Number);
// Repair time based on maintenance building distance
let repairTime = 600; // base 10 seconds
const nearest = findNearestMaintenance(bx, by);
if (nearest) {
const dist = Math.abs(nearest.x - bx) + Math.abs(nearest.y - by);
repairTime = Math.max(120, dist * 30);
}
G.breakdowns.push({x: bx, y: by, repairTimer: repairTime});
if (nearest) {
G.maintenanceVehicles.push({
startX: nearest.x, startY: nearest.y,
destX: bx, destY: by,
x: nearest.x, y: nearest.y,
progress: 0,
totalTime: repairTime,
angle: Math.atan2(by - nearest.y, bx - nearest.x),
active: true
});
}
G.lastRoadChangeId++;
G.pathCache.clear();
if (road.blocking) {
{const _bx=bx, _by=by; showNotification(`⚠️ Road blocked at (${bx},${by})! Repair in progress. (Click to view)`, 8000, () => { const iso = toISO(_bx, _by); G.camera.x = iso.sx; G.camera.y = iso.sy; });}
}
}

function findNearestMaintenance(x, y) {
let nearest = null, minDist = Infinity;
G.maintenanceBuildings.forEach(mb => {
const dist = Math.abs(mb.x - x) + Math.abs(mb.y - y);
if (dist < minDist) { minDist = dist; nearest = mb; }
});
return nearest;
}

function endOfDay() {
G.day++;
G.score = G.day;
// Check Voss bonus expiration
if (G.vossActiveBonus && G.vossActiveBonus.expiresDay && G.day >= G.vossActiveBonus.expiresDay) {
const expired = VOSS_BONUSES.find(b=>b.id===G.vossActiveBonus.id);
if (expired) expired.remove(G);
showNotification(`${G.vossActiveBonus.icon} ${G.vossActiveBonus.name} has expired. Tunnel deeper to find Voss again.`);
G.vossActiveBonus = null;
}
// Reset per-day toll tracking for all active vehicles
G.vehicles.forEach(v => { if (v.tollPaidRoads) v.tollPaidRoads.clear(); });
// Commute failure warning
if (G.failedCommutes > 0) {
showNotification(`⚠️ ${G.failedCommutes} worker${G.failedCommutes > 1 ? 's' : ''} couldn't reach their destination! Connect more buildings to roads.`);
}
G.failedCommutes = 0;
// Accumulate daily commute stats into weekly
const cs2 = G.commuteStats;
G.weeklyCommuteStats.officeTotal += cs2.officeTotal; G.weeklyCommuteStats.officeLate += cs2.officeLate;
G.weeklyCommuteStats.restaurantTotal += cs2.restaurantTotal; G.weeklyCommuteStats.restaurantLate += cs2.restaurantLate;
G.weeklyCommuteStats.schoolTotal += cs2.schoolTotal; G.weeklyCommuteStats.schoolLate += cs2.schoolLate;
G.commuteStats = { officeTotal:0, officeLate:0, restaurantTotal:0, restaurantLate:0, schoolTotal:0, schoolLate:0 };
// Check unconnected houses — penalties
let unconnected = 0;
G.families.forEach(f => {
if (f.houseTile && !hasNearbyRoad(f.houseTile.x, f.houseTile.y)) {
unconnected++;
// Family loses happiness & may leave
f.disconnectedDays = (f.disconnectedDays || 0) + 1;
if (f.disconnectedDays >= 5 && Math.random() < 0.15) {
// Family abandons house
const house = G.buildings.find(b => b.id === f.houseId);
if (house) house.abandoned = true;
f.members = []; // family leaves
}
} else {
f.disconnectedDays = 0;
}
});
G.unconnectedHouses = unconnected;
if (unconnected > 0 && G.day % 3 === 0) {
showNotification(`🏚️ ${unconnected} ${unconnected > 1 ? 'families live' : 'family lives'} without road access! They may leave town.`);
}
// Reset work status (night shift workers stay at work through the night)
G.families.forEach(f => {
f.members.forEach(m => { if (m.role === 'adult' && !m.nightShift) m.atWork = false; });
});
// Compute departure ticks for the new day
computeDepartureTicks();
// Clear vehicles
G.vehicles = G.vehicles.filter(v => v.active);
G.roadsDuringPause.clear();
// Weekly events
if (G.day % 7 === 0) {
endOfWeek();
}
// Check bankruptcy
if (G.mode !== 'creative' && G.mode !== 'endless' && G.money <= 0) {
G.graceDays++;
if (G.graceDays >= 3) {
gameOver();
return;
}
showNotification(`⚠️ Treasury empty! ${3 - G.graceDays} days until bankruptcy!`);
} else {
G.graceDays = 0;
}
// Show lore tip occasionally
if (Math.random() < 0.05) {
const tip = LORE_TIPS[Math.floor(Math.random() * LORE_TIPS.length)];
showNotification('📜 ' + tip, 12000);
addToJournal('legends', tip);
}
// Caruso escalation — days without building roads
G.daysWithoutRoad = G.day - (G.lastRoadBuildDay || 0);
if (G.daysWithoutRoad >= 3 && G.daysWithoutRoad < 7 && G.carusoEscalation < 1) {
const seen = new Set(G.loreJournal.history.map(e => e.text));
const pool = CARUSO_EVENTS.whispers.filter(w => !seen.has('📰 ' + w.text));
const ev = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CARUSO_EVENTS.whispers[Math.floor(Math.random() * CARUSO_EVENTS.whispers.length)];
showNotification('📰 ' + ev.text, 8000);
addToJournal('history', '📰 ' + ev.text, ev.collections);
G.carusoEscalation = 1;
} else if (G.daysWithoutRoad >= 7 && G.daysWithoutRoad < 11 && G.carusoEscalation < 2) {
const seen = new Set(G.loreJournal.history.map(e => e.text));
const pool = CARUSO_EVENTS.pressure.filter(w => !seen.has('📰 ' + w.text));
const ev = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : CARUSO_EVENTS.pressure[Math.floor(Math.random() * CARUSO_EVENTS.pressure.length)];
showNotification('📰 ' + ev.text, 8000);
addToJournal('history', '📰 ' + ev.text, ev.collections);
G.carusoEscalation = 2;
} else if (G.daysWithoutRoad >= 11 && G.daysWithoutRoad < 16 && G.carusoEscalation < 3) {
showNotification('🔥 ' + CARUSO_EVENTS.fire, 10000);
addToJournal('history', CARUSO_EVENTS.fire, ['caruso']);
G.carusoEscalation = 3;
// Burn a random house on the outskirts
const outskirtHouse = G.buildings.filter(b => b.type === 'house' && !b.abandoned).sort((a,b) => {
const da = Math.abs(a.x - G.playableCenter.x) + Math.abs(a.y - G.playableCenter.y);
const db = Math.abs(b.x - G.playableCenter.x) + Math.abs(b.y - G.playableCenter.y);
return db - da;
})[0];
if (outskirtHouse) {
outskirtHouse.abandoned = true;
outskirtHouse.burnedDown = true;
const fam = G.families.find(f => f.houseId === outskirtHouse.id);
if (fam) fam.members = [];
}
} else if (G.daysWithoutRoad >= 16 && G.daysWithoutRoad < 21 && G.carusoEscalation < 4) {
showNotification('✉️ A letter from Rosa Caruso has arrived. Check the Lore Journal.', 10000);
addToJournal('history', '✉️ Rosa Caruso\'s Letter: ' + CARUSO_EVENTS.rosa_letter, ['caruso']);
G.carusoEscalation = 4;
} else if (G.daysWithoutRoad >= 30 && G.carusoEscalation < 5) {
showNotification(CARUSO_EVENTS.final_warning, 15000);
addToJournal('history', CARUSO_EVENTS.final_warning, ['caruso']);
G.carusoEscalation = 5;
}
// Reset escalation counter when roads are built
if (G.daysWithoutRoad <= 1) G.carusoEscalation = 0;
// Ghost car at night (entity lore)
const hour = getTimeOfDay();
if (hour >= 23 && !G.ghostCarSpawned && Math.random() < 0.15 && G.roads.size > 5) {
G.ghostCarSpawned = true;
const roadKeys = [...G.roads.keys()];
if (roadKeys.length > 1) {
const startKey = roadKeys[Math.floor(Math.random() * roadKeys.length)];
const endKey = roadKeys[Math.floor(Math.random() * roadKeys.length)];
const [sx,sy] = startKey.split(',').map(Number);
const [ex,ey] = endKey.split(',').map(Number);
const ghostCar = {
active: true, x: sx, y: sy, destX: ex, destY: ey, pathIdx: 0,
speed: 0.02, color: '#1a1a2e', angle: 0, braking: false,
departTick: G.dayTick, arrived: false, familyId: -1, memberIdx: -1,
purpose: 'ghost', isGhostCar: true
};
ghostCar.path = findPath(sx, sy, ex, ey);
if (ghostCar.path) G.vehicles.push(ghostCar);
}
}
if (hour < 22) G.ghostCarSpawned = false;
// Compute network completion for potential game over
G.networkCompletion = Math.min(99, Math.round((G.roads.size + G.elevatedRoads.size) / (MAP_W * MAP_H * 0.3) * 100));
updateHUD();
}

function takeLoan(amount, weeks, bankId) {
if (!G) return;
if (G.loans.length >= 3) { showNotification('Maximum 3 active loans!'); return; }
const weeklyPayment = Math.ceil(amount * (1 + LOAN_INTEREST_RATE) / weeks);
const totalRepay = weeklyPayment * weeks;
G.money += amount;
G.loans.push({amount, remaining: totalRepay, weeklyPayment, interestRate: LOAN_INTEREST_RATE, weeksLeft: weeks, bankId});
G.totalDebt = G.loans.reduce((s, l) => s + l.remaining, 0);
const bank = G.buildings.find(b => b.id === bankId);
if (bank) bank.loansTaken = (bank.loansTaken || 0) + 1;
showNotification(`💰 Loan of $${amount.toLocaleString()} approved! $${weeklyPayment}/week for ${weeks} weeks`);
updateHUD();
// Refresh inspect panel
if (bank) showInspectInfo(bank.x, bank.y);
}

function endOfWeek() {
// Calculate strike impact from paid roads
const tollPct = getPaidRoadPercent();
let strikersCount = 0;
let totalWorkers = 0;
G.families.forEach(f => {
f.members.forEach(m => {
if (m.role === 'adult' && m.workplaceId) {
totalWorkers++;
if (m.onStrike) strikersCount++;
}
});
});
// Calculate revenue (reduced by strikes)
let officeRevenue = 0;
G.buildings.filter(b => b.type === 'office').forEach(office => {
const employees = G.families.reduce((count, f) => {
return count + f.members.filter(m => m.role === 'adult' && m.workplaceId === office.id && !m.onStrike).length;
}, 0);
const totalEmp = G.families.reduce((count, f) => {
return count + f.members.filter(m => m.role === 'adult' && m.workplaceId === office.id).length;
}, 0);
const onTimeCount = G.families.reduce((total, f) => {
const workers = f.members.filter(m => m.role === 'adult' && m.workplaceId === office.id && !m.onStrike);
return total + workers.filter(m => m.arrivedOnTime).length;
}, 0);
let rev = employees * 120;
if (onTimeCount === employees && employees > 0) {
rev *= 1.5; // 50% bonus for perfect on-time
} else {
const lateCount = employees - onTimeCount;
rev -= lateCount * 80; // $80 deduction per late worker
}
rev = Math.max(0, rev);
office.weekRevenue = rev;
officeRevenue += rev;
});
const taxOffice = Math.floor(officeRevenue * 0.20);
let restaurantRevenue = 0;
G.buildings.filter(b => b.type === 'restaurant').forEach(r => {
// Base revenue: restaurants earn $80-150/week just from existing
const baseRev = 120 + Math.floor(Math.random() * 100);
// Restaurant employees boost revenue — each working employee adds $50
const employees = G.families.reduce((count, f) => {
return count + f.members.filter(m => m.role === 'adult' && m.workplaceId === r.id && !m.onStrike).length;
}, 0);
const onTimeCount = G.families.reduce((total, f) => {
const workers = f.members.filter(m => m.role === 'adult' && m.workplaceId === r.id && !m.onStrike);
return total + workers.filter(m => m.arrivedOnTime).length;
}, 0);
let staffBonus = employees * 75;
if (onTimeCount === employees && employees > 0) {
staffBonus *= 1.5; // 50% bonus for all on-time
} else {
const lateCount = employees - onTimeCount;
staffBonus -= lateCount * 60; // $60 deduction per late
}
staffBonus = Math.max(0, staffBonus);
const totalRev = baseRev + r.weekRevenue + staffBonus;
restaurantRevenue += totalRev;
r.weekRevenue = 0;
});
const taxRestaurant = Math.floor(restaurantRevenue * 0.15);
// Road upkeep
const roadCount = G.roads.size + G.elevatedRoads.size;
const upkeepCost = roadCount * UPKEEP_COST[G.upkeepTier];
// Maintenance building cost
const maintCost = G.maintenanceBuildings.length * 30;
// Family population tax: $5 per connected family
const connectedFamilies = G.families.filter(f => f.members.length > 0 && f.houseTile && hasNearbyRoad(f.houseTile.x, f.houseTile.y)).length;
const familyTax = connectedFamilies * 8;
// Unconnected house penalty: $20 per disconnected family (emergency services, complaints)
const disconnectedFamilies = G.families.filter(f => f.members.length > 0 && f.houseTile && !hasNearbyRoad(f.houseTile.x, f.houseTile.y)).length;
const disconnectPenalty = disconnectedFamilies * 20;
// Remove abandoned families
G.families = G.families.filter(f => f.members.length > 0);
let totalIncome = taxOffice + taxRestaurant + G.weekTollRoad + G.weekParking + familyTax;
// Apply Voss income boost if active
if (G.vossIncomeBoost && G.vossIncomeBoost > 1) {
totalIncome = Math.floor(totalIncome * G.vossIncomeBoost);
}
const totalCost = upkeepCost + maintCost + disconnectPenalty;
if (G.mode !== 'creative') {
G.money += totalIncome - totalCost;
}
// Process loan payments
let loanPayments = 0;
G.loans.forEach(loan => {
const payment = loan.weeklyPayment;
loanPayments += payment;
loan.remaining -= payment;
loan.weeksLeft--;
});
G.loans = G.loans.filter(l => l.weeksLeft > 0 && l.remaining > 0);
if (G.mode !== 'creative') {
G.money -= loanPayments;
}
G.totalDebt = G.loans.reduce((s, l) => s + l.remaining, 0);
if (loanPayments > 0 && G.loans.length === 0) showNotification('🎉 All loans fully repaid!');
// Show weekly summary
showWeeklySummary(taxOffice, taxRestaurant, G.weekTollRoad, G.weekParking, upkeepCost, maintCost, strikersCount, totalWorkers, tollPct, disconnectedFamilies, disconnectPenalty, familyTax, loanPayments);
G.weeklyRevenue = totalIncome - totalCost - loanPayments;
G.weekTaxOffice = 0;
G.weekTaxRestaurant = 0;
G.weekTollRoad = 0;
G.weekParking = 0;
weeklyTruckTolls = 0;
G.tollPlacedThisWeek = false;
G.currentTollGroup = new Set();
G.weeklyCommuteStats = { officeTotal:0, officeLate:0, restaurantTotal:0, restaurantLate:0, schoolTotal:0, schoolLate:0 };
// Expand playable area each week
const maxRadius = Math.floor(Math.min(MAP_W, MAP_H) / 2) - 2;
G.playableRadius = Math.min(maxRadius, G.playableRadius + 5);
showNotification(`🗺 Town expanded! Buildable area grew.`);
// Spawn new buildings within playable area (increased growth)
const cx = G.playableCenter.x, cy = G.playableCenter.y, pr = G.playableRadius - 3;
// Houses: 8-15 per week
for (let i = 0; i < 8; i++) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.8) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.7) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.7) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.6) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.5) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.4) placeRandomBuilding('house', cx, cy, pr);
if (Math.random() < 0.3) placeRandomBuilding('house', cx, cy, pr);
// Offices: 2-4 per week
for (let i = 0; i < 2; i++) placeRandomBuilding('office', cx, cy, pr);
if (Math.random() < 0.6) placeRandomBuilding('office', cx, cy, pr);
if (Math.random() < 0.4) placeRandomBuilding('office', cx, cy, pr);
// Restaurants: 1-3 per week
placeRandomBuilding('restaurant', cx, cy, pr);
if (Math.random() < 0.6) placeRandomBuilding('restaurant', cx, cy, pr);
if (Math.random() < 0.3) placeRandomBuilding('restaurant', cx, cy, pr);
// Banks: rare spawn, max 2
const bankCount = G.buildings.filter(b => b.type === 'bank').length;
if (bankCount < 2 && Math.random() < 0.05) placeRandomBuilding('bank', cx, cy, pr);
// Schools: only spawn if all existing schools of that type are at capacity
const schoolTypes = ['school_elementary','school_middle','school_high'];
for (const sType of schoolTypes) {
const sTypeName = sType.replace('school_','');
const existingSchools = G.buildings.filter(b => b.type === 'school' && b.schoolType === sTypeName);
if (existingSchools.length === 0) {
// Always spawn if none exist
if (Math.random() < 0.3) placeRandomBuilding(sType, cx, cy, pr);
} else {
// Only spawn if ALL existing schools of this type are at capacity
const allFull = existingSchools.every(school => {
const studentCount = G.families.reduce((count, f) => {
return count + f.members.filter(m => m.role === 'child' && m.schoolId === school.id).length;
}, 0);
return studentCount >= school.capacity;
});
if (allFull && Math.random() < 0.5) {
placeRandomBuilding(sType, cx, cy, pr);
}
}
}
// Reassign families for new buildings
assignFamilies();
computeDepartureTicks();
}

// ===== UI =====
function getPaidRoadPercent() {
const totalRoads = G.roads.size + G.elevatedRoads.size;
if (totalRoads === 0) return 0;
let paidCount = 0;
G.roads.forEach(r => { if (r.paid) paidCount++; });
G.elevatedRoads.forEach(r => { if (r.paid) paidCount++; });
return paidCount / totalRoads;
}
