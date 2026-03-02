// world.js — World generation, road placement, building creation, and map infrastructure
// Handles terrain generation, building placement, road construction/demolition,
// intersection logic, parking connections, pathfinding helpers, and family assignment.
// Modifies global game state (G). Depends on: lore.js (name lists, lore data), ui.js (notifications)

// ===== TERRAIN GENERATION =====
function generateTerrain() {
const seed = Math.floor(Math.random() * 999999);
const perlin = new PerlinNoise(seed);
const perlin2 = new PerlinNoise(seed + 1000);
G.terrain = [];
G.heightMap = [];
const hasVanKleekLake = Math.random() < 0.35;
let vkX = 0, vkY = 0;
if (hasVanKleekLake) {
vkX = 30 + Math.floor(Math.random() * 60);
vkY = 30 + Math.floor(Math.random() * 60);
}
for (let y = 0; y < MAP_H; y++) {
G.terrain[y] = [];
G.heightMap[y] = [];
for (let x = 0; x < MAP_W; x++) {
let h = perlin.octave(x / 35, y / 35, 5, 0.5);
let moisture = perlin2.octave(x / 25, y / 25, 4, 0.5);
G.heightMap[y][x] = h;
if (hasVanKleekLake) {
const dx = x - vkX, dy = y - vkY;
const dist = Math.sqrt(dx * dx + dy * dy);
if (dist < 8 + perlin.noise(x / 5, y / 5) * 3) {
h = -0.4;
}
}
if (h < -0.2) {
G.terrain[y][x] = h < -0.35 ? 4 : 1; // deep water or water
} else if (h > 0.30) {
G.terrain[y][x] = 2; // mountain
} else if (moisture > 0.3 && h < -0.05 && Math.random() < 0.15) {
G.terrain[y][x] = 3; // river
} else {
G.terrain[y][x] = 0; // grass
}
}
}
// Carve rivers and name them
const usedRiverNames = [];
for (let r = 0; r < 3; r++) {
let rx = Math.floor(Math.random() * MAP_W);
let ry = 0;
const riverTiles = [];
const riverWidth = 2 + Math.floor(Math.random() * 2); // 2-3 tiles wide
for (let step = 0; step < MAP_H * 2 && ry < MAP_H; step++) {
if (rx >= 0 && rx < MAP_W && ry >= 0 && ry < MAP_H) {
// Carve river with width
for (let w = -Math.floor(riverWidth/2); w <= Math.ceil(riverWidth/2); w++) {
const wx = rx + w;
if (wx >= 0 && wx < MAP_W) {
G.terrain[ry][wx] = 3;
if (w === 0) riverTiles.push({x: wx, y: ry});
}
}
}
ry++;
rx += Math.floor(Math.random() * 3) - 1;
rx = Math.max(0, Math.min(MAP_W - 1, rx));
}
if (riverTiles.length > 10) {
let rName;
do { rName = RIVER_NAMES[Math.floor(Math.random()*RIVER_NAMES.length)]; } while (usedRiverNames.includes(rName));
usedRiverNames.push(rName);
const mid = riverTiles[Math.floor(riverTiles.length/2)];
G.terrainNames.push({x: mid.x, y: mid.y, name: rName, type: 'river'});
}
}
// Name lakes (find water clusters)
const visitedWater = new Set();
for (let y = 5; y < MAP_H-5; y += 8) {
for (let x = 5; x < MAP_W-5; x += 8) {
if ((G.terrain[y][x] === 1 || G.terrain[y][x] === 4) && !visitedWater.has(`${x},${y}`)) {
// Flood fill to find lake size
let lakeSize = 0, sumX = 0, sumY = 0;
const queue = [{x,y}];
while (queue.length > 0 && lakeSize < 200) {
const p = queue.pop();
const pk = `${p.x},${p.y}`;
if (visitedWater.has(pk)) continue;
if (p.x<0||p.x>=MAP_W||p.y<0||p.y>=MAP_H) continue;
if (G.terrain[p.y][p.x] !== 1 && G.terrain[p.y][p.x] !== 4) continue;
visitedWater.add(pk);
lakeSize++; sumX += p.x; sumY += p.y;
queue.push({x:p.x+1,y:p.y},{x:p.x-1,y:p.y},{x:p.x,y:p.y+1},{x:p.x,y:p.y-1});
}
if (lakeSize >= 8) {
const cx = Math.floor(sumX/lakeSize), cy = Math.floor(sumY/lakeSize);
const isVK = hasVanKleekLake && Math.abs(cx-vkX)<10 && Math.abs(cy-vkY)<10;
const lName = isVK ? 'Van Kleek Lake' : LAKE_NAMES[Math.floor(Math.random()*LAKE_NAMES.length)];
G.terrainNames.push({x: cx, y: cy, name: lName, type: 'lake'});
}
}
}
}
// Name mountain clusters
const visitedMtn = new Set();
for (let y = 5; y < MAP_H-5; y += 10) {
for (let x = 5; x < MAP_W-5; x += 10) {
if (G.terrain[y][x] === 2 && !visitedMtn.has(`${x},${y}`)) {
let mSize = 0, sumX = 0, sumY = 0, maxH = 0, peakX = x, peakY = y;
const queue = [{x,y}];
while (queue.length > 0 && mSize < 500) {
const p = queue.pop();
const pk = `${p.x},${p.y}`;
if (visitedMtn.has(pk)) continue;
if (p.x<0||p.x>=MAP_W||p.y<0||p.y>=MAP_H) continue;
if (G.terrain[p.y][p.x] !== 2) continue;
visitedMtn.add(pk);
mSize++; sumX += p.x; sumY += p.y;
if (G.heightMap[p.y][p.x] > maxH) { maxH = G.heightMap[p.y][p.x]; peakX = p.x; peakY = p.y; }
queue.push({x:p.x+1,y:p.y},{x:p.x-1,y:p.y},{x:p.x,y:p.y+1},{x:p.x,y:p.y-1});
}
if (mSize >= 10) {
G.terrainNames.push({x: peakX, y: peakY, name: MOUNTAIN_NAMES[Math.floor(Math.random()*MOUNTAIN_NAMES.length)], type: 'mountain'});
}
}
}
}
if (hasVanKleekLake) {
G.lakeName = {x: vkX, y: vkY, name: 'Van Kleek Lake'};
}
// Remove isolated water tiles — single water surrounded by land on all 8 sides
let changed = true;
while (changed) {
changed = false;
for (let y = 1; y < MAP_H - 1; y++) {
for (let x = 1; x < MAP_W - 1; x++) {
const t = G.terrain[y][x];
if (t === 1 || t === 3 || t === 4) {
let hasWaterNeighbor = false;
for (let dy = -1; dy <= 1 && !hasWaterNeighbor; dy++) {
for (let dx = -1; dx <= 1 && !hasWaterNeighbor; dx++) {
if (dx === 0 && dy === 0) continue;
const nt = G.terrain[y+dy][x+dx];
if (nt === 1 || nt === 3 || nt === 4) hasWaterNeighbor = true;
}
}
if (!hasWaterNeighbor) {
G.terrain[y][x] = 0; // convert to grass
changed = true;
}
}
}
}
}
}

// ===== BUILDING GENERATION =====
function generateInitialBuildings() {
const cx = G.playableCenter.x, cy = G.playableCenter.y;
const r = G.playableRadius;
// Generate 8-12 houses within starting area
for (let i = 0; i < 8 + Math.floor(Math.random() * 5); i++) {
placeRandomBuilding('house', cx, cy, r - 3);
}
// 3-5 offices
for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
placeRandomBuilding('office', cx, cy, r - 3);
}
// 2-3 restaurants
for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
placeRandomBuilding('restaurant', cx, cy, r - 3);
}
// 1 school
placeRandomBuilding('school_elementary', cx, cy, r - 3);
// 1 bank
placeRandomBuilding('bank', cx, cy, r - 3);
// Assign families
assignFamilies();
computeDepartureTicks();
}

function placeRandomBuilding(type, cx, cy, range) {
for (let attempt = 0; attempt < 80; attempt++) {
const angle = Math.random() * Math.PI * 2;
const dist = Math.random() * range;
const x = Math.floor(cx + Math.cos(angle) * dist);
const y = Math.floor(cy + Math.sin(angle) * dist);
if (x < 2 || x >= MAP_W - 2 || y < 2 || y >= MAP_H - 2) continue;
if (G.terrain[y][x] !== 0) continue; // Only ground tiles
// Block building placement on roads, parking lots, maintenance buildings
if (G.roads.has(`${x},${y}`) || G.elevatedRoads.has(`${x},${y}`)) continue;
if (G.parkingLots.some(p => p.x === x && p.y === y)) continue;
if (G.maintenanceBuildings.some(m => m.x === x && m.y === y)) continue;
// Check playable area
const pdx = x - G.playableCenter.x, pdy = y - G.playableCenter.y;
if (Math.sqrt(pdx*pdx + pdy*pdy) > G.playableRadius) continue;
if (G.buildings.some(b => Math.abs(b.x - x) < 3 && Math.abs(b.y - y) < 3)) continue;
const b = createBuilding(type, x, y);
G.buildings.push(b);
// Auto parking lot — place adjacent to building (cardinal directions only)
// Single-family houses don't get parking lots; apartments, offices, restaurants, schools do
if (type !== 'house' || b.isApartment) {
const capMap = {office: 15, school: 10, bank: 8};
const cap = b.isApartment ? 4 : (capMap[type] || (type.startsWith('restaurant') ? 8 : 8));
const adjSpots = [{dx:-1,dy:0},{dx:0,dy:-1},{dx:-1,dy:-1},{dx:1,dy:0},{dx:0,dy:1}]; // Prefer behind building in iso (W, N, NW first) then E, S
for (const spot of adjSpots) {
const px = x + spot.dx, py = y + spot.dy;
if (px >= 0 && px < MAP_W && py >= 0 && py < MAP_H && G.terrain[py] && G.terrain[py][px] === 0) {
if (G.roads.has(`${px},${py}`) || G.elevatedRoads.has(`${px},${py}`)) continue;
const occupied = G.buildings.some(ob => ob !== b && Math.abs(ob.x - px) < 2 && Math.abs(ob.y - py) < 2) ||
G.parkingLots.some(op => op.x === px && op.y === py);
if (!occupied) {
const newParking = {x: px, y: py, capacity: cap, used: 0, paid: false, tier: 0, buildingId: b.id, playerBuilt: false, connectedSides: []};
G.parkingLots.push(newParking);
updateParkingConnections(newParking);
break;
}
}
}
}
return b;
}
return null;
}

function createBuilding(type, x, y) {
const id = ++buildingIdCounter;
const b = {id, type, x, y, revenue: 0, weekRevenue: 0};
if (type === 'house') {
b.isApartment = Math.random() < 0.3;
b.capacity = b.isApartment ? 4 + Math.floor(Math.random() * 4) : 1;
b.name = b.isApartment ? `${LAST_NAMES[Math.floor(Math.random()*LAST_NAMES.length)]} Apartments` : `${Math.floor(Math.random()*9000)+1000} ${ROAD_NAME_PARTS[0][Math.floor(Math.random()*ROAD_NAME_PARTS[0].length)]} ${ROAD_NAME_PARTS[1][Math.floor(Math.random()*ROAD_NAME_PARTS[1].length)]}`;
} else if (type === 'office') {
b.name = OFFICE_NAMES[Math.floor(Math.random() * OFFICE_NAMES.length)];
b.employees = [];
b.capacity = 5 + Math.floor(Math.random() * 15);
} else if (type.startsWith('restaurant')) {
const cuisine = type.includes('_') ? type.split('_')[1] : CUISINE_TYPES[Math.floor(Math.random() * CUISINE_TYPES.length)];
b.type = 'restaurant';
b.cuisine = cuisine;
// Use lore restaurant name for first of each cuisine type
if (G && LORE_RESTAURANT_NAMES[cuisine] && !G.loreRestaurantsUsed[cuisine]) {
b.name = LORE_RESTAURANT_NAMES[cuisine];
b.isLoreRestaurant = true;
G.loreRestaurantsUsed[cuisine] = true;
// Apply special lore properties
if (cuisine === 'Chinese') { b.fixedRevenue = 4847; b.loreOwner = 'Mei Chen'; b.loreOwnerAge = 94; }
if (cuisine === 'Italian') { b.loreMob = true; b.loreOwner = 'Rosa Caruso'; }
if (cuisine === 'American') { b.storageB = true; b.storageBRevenue = 200; b.loreOwner = 'Tommy Pitts'; }
if (cuisine === 'Indian') { b.loreRebuilt = 7; b.loreOwner = 'Priya Anand'; }
if (cuisine === 'Mexican') { b.loreOwner = 'Jorge & Carmen Reyes'; }
} else {
const names = RESTAURANT_NAMES[cuisine] || RESTAURANT_NAMES.American;
b.name = names[Math.floor(Math.random() * names.length)];
}
b.capacity = 10 + Math.floor(Math.random() * 20);
} else if (type.startsWith('school')) {
const stype = type.replace('school_','');
b.type = 'school';
b.schoolType = stype;
const names = SCHOOL_NAMES[stype] || SCHOOL_NAMES.elementary;
b.name = names[Math.floor(Math.random() * names.length)];
b.capacity = 20 + Math.floor(Math.random() * 30);
b.students = [];
} else if (type === 'bank') {
b.name = BANK_NAMES[Math.floor(Math.random() * BANK_NAMES.length)];
b.capacity = 10;
b.employees = [];
b.loansTaken = 0;
}
return b;
}

function assignFamilies() {
const houses = G.buildings.filter(b => b.type === 'house');
const offices = G.buildings.filter(b => b.type === 'office');
const restaurants = G.buildings.filter(b => b.type === 'restaurant');
const schools = G.buildings.filter(b => b.type === 'school');
G.families = [];
// Queue of special lore family names to inject (one each, distributed randomly)
const loreFamilyQueue = ['Aldridge','Chen','Caruso','Reyes','Anand','Pitts'];
const shuffledLoreNames = loreFamilyQueue.sort(() => Math.random() - 0.5);
let loreFamilyIdx = 0;
houses.forEach(house => {
const famCount = house.isApartment ? house.capacity : 1;
for (let f = 0; f < famCount; f++) {
// Inject a lore family name with ~15% chance if we still have some
let lastName;
if (loreFamilyIdx < shuffledLoreNames.length && Math.random() < 0.15) {
lastName = shuffledLoreNames[loreFamilyIdx++];
} else {
lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
}
const loreFam = LORE_FAMILIES[lastName.toLowerCase()];
const family = {
id: G.families.length,
lastName,
members: [],
houseId: house.id,
houseTile: {x: house.x, y: house.y},
loreTrait: loreFam ? loreFam.trait : null,
loreNote: loreFam ? loreFam.note : null
};
// Adults
const adultCount = Math.random() < 0.7 ? 2 : 1;
for (let a = 0; a < adultCount; a++) {
const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
// Some adults work at restaurants, some at offices, some night shift
const allWorkplaces = [...offices, ...restaurants];
const workplace = allWorkplaces.length > 0 ? allWorkplaces[Math.floor(Math.random() * allWorkplaces.length)] : null;
const isNightShift = Math.random() < 0.15; // 15% chance of night shift
family.members.push({
name: name + ' ' + lastName,
role: 'adult',
workplaceId: workplace ? workplace.id : null,
workplaceType: workplace ? workplace.type : null,
nightShift: isNightShift,
paidRoadTrait: Math.floor(Math.random() * 4), // 0=always,1=heavy traffic,2=sometimes,3=never
paidParkingTrait: Math.floor(Math.random() * 3), // 0=always,1=if full,2=never
punctuality: Math.random() * 2 - 1, // -1.0 (early bird) to +1.0 (tardy)
atWork: false,
arrivedOnTime: true,
targetDepartTick: null,
spawnedToday: false
});
}
// Children (50% chance)
if (Math.random() < 0.5) {
const childCount = 1 + Math.floor(Math.random() * 3);
for (let c = 0; c < childCount; c++) {
const age = 5 + Math.floor(Math.random() * 13);
const schoolType = age < 11 ? 'elementary' : age < 14 ? 'middle' : 'high';
const school = schools.find(s => s.schoolType === schoolType) || (schools.length > 0 ? schools[0] : null);
family.members.push({
name: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)] + ' ' + lastName,
role: 'child',
age,
schoolType,
schoolId: school ? school.id : null
});
}
}
G.families.push(family);
}
});
// Ensure remaining lore families get placed
while (loreFamilyIdx < shuffledLoreNames.length && G.families.length > 0) {
const targetFam = G.families[Math.floor(Math.random() * G.families.length)];
if (!targetFam.loreTrait) {
const name = shuffledLoreNames[loreFamilyIdx++];
const loreFam = LORE_FAMILIES[name.toLowerCase()];
targetFam.lastName = name;
targetFam.loreTrait = loreFam ? loreFam.trait : null;
targetFam.loreNote = loreFam ? loreFam.note : null;
// Rename members
targetFam.members.forEach(m => {
const firstName = m.name.split(' ')[0];
m.name = firstName + ' ' + name;
});
} else {
break; // avoid infinite loop
}
}
// Create Voss's vacant house marker (pick a random house and mark it) — only once
if (G.vossHouseId) { /* already created */ } else {
const abandonedCandidates = G.buildings.filter(b => b.type === 'house' && !b.isApartment);
if (abandonedCandidates.length > 0) {
const vossHouse = abandonedCandidates[Math.floor(Math.random() * abandonedCandidates.length)];
vossHouse.name = 'Voss Residence (Vacant)';
vossHouse.vossHouse = true;
G.vossHouseId = vossHouse.id;
// Remove family from this house
const vossFamIdx = G.families.findIndex(f => f.houseId === vossHouse.id);
if (vossFamIdx >= 0) {
G.families[vossFamIdx].members = [];
G.families[vossFamIdx].lastName = 'Voss';
G.families[vossFamIdx].loreTrait = 'retained';
G.families[vossFamIdx].loreNote = LORE_FAMILIES.voss.note;
}
} // end if abandonedCandidates
} // end Voss house creation guard
// Add one building with mysterious revenue (entity node)
const mysteryOffice = G.buildings.find(b => b.type === 'office');
if (mysteryOffice) {
mysteryOffice.entityNode = true;
mysteryOffice.mysteryRevenue = true;
}
// Add ghost family with workplace at nonexistent building
if (G.families.length > 2) {
const ghostFam = G.families[Math.floor(Math.random() * G.families.length)];
const adults = ghostFam.members.filter(m => m.role === 'adult');
if (adults.length > 0) {
adults[0].workplaceId = 99999; // nonexistent building ID
adults[0].workplaceType = 'office';
adults[0].ghostWorker = true;
}
}
}

// ===== PATHFINDING (A*) =====
function getRoadAtLevel(x, y, level) {
const k = `${x},${y}`;
if (level === 1) {
const r = G.elevatedRoads.get(k);
if (r && (r.elevation === 1 || r.type === 'road_flyover')) return r;
return null;
}
// Level 0: ground roads + ground-level highways + flyovers (flyovers connect both levels)
const r = G.roads.get(k);
if (r && (r.elevation || 0) === 0) return r;
const er = G.elevatedRoads.get(k);
if (er && (er.elevation || 0) === 0) return er;
if (er && er.type === 'road_flyover') return er;
return null;
}

function isFlyoverTile(x, y) {
const k = `${x},${y}`;
const r = G.elevatedRoads.get(k);
return r && r.type === 'road_flyover';
}

// Compute the largest connected road component via BFS
function computeConnectedRoads() {
const allRoadKeys = new Set([...G.roads.keys(), ...G.elevatedRoads.keys()]);
const visited = new Set();
let largestComponent = new Set();
for (const startKey of allRoadKeys) {
if (visited.has(startKey)) continue;
// BFS from this road tile
const component = new Set();
const queue = [startKey];
component.add(startKey);
visited.add(startKey);
while (queue.length > 0) {
const cur = queue.shift();
const [cx, cy] = cur.split(',').map(Number);
for (const [ddx, ddy] of [[0,-1],[0,1],[-1,0],[1,0]]) {
const nk = `${cx+ddx},${cy+ddy}`;
if (!visited.has(nk) && allRoadKeys.has(nk)) {
visited.add(nk);
component.add(nk);
queue.push(nk);
}
}
}
if (component.size > largestComponent.size) {
largestComponent = component;
}
}
G.connectedRoadSet = largestComponent;
G.lastConnectedRoadChangeId = G.lastRoadChangeId;
}

function hasNearbyRoad(x, y) {
// Recompute connected road set if stale
if (!G.connectedRoadSet || G.lastConnectedRoadChangeId !== G.lastRoadChangeId) {
computeConnectedRoads();
}
// Check immediate cardinal neighbors (N/S/E/W) for a connected ground-level non-highway road
const cardinals = [[0,-1],[0,1],[1,0],[-1,0]];
for (const [dx, dy] of cardinals) {
const k = `${x+dx},${y+dy}`;
if (!G.connectedRoadSet.has(k)) continue;
const road = G.roads.get(k) || G.elevatedRoads.get(k);
if (road && road.type.includes('highway')) continue;
return true;
}
// Check if this building has an attached parking lot that connects to a road
const parking = G.parkingLots.find(p => p.buildingId && p.buildingId === getBuildingIdAt(x, y));
if (parking && parking.connectedSides && parking.connectedSides.length > 0) {
// Verify at least one connected side touches a connected road
for (const side of parking.connectedSides) {
const d = {N:{dx:0,dy:-1},S:{dx:0,dy:1},E:{dx:1,dy:0},W:{dx:-1,dy:0}}[side];
const k = `${parking.x+d.dx},${parking.y+d.dy}`;
if (G.connectedRoadSet.has(k)) return true;
}
}
return false;
}

// ===== PARKING-ROAD CONNECTIONS =====
function updateParkingConnections(parking) {
    parking.connectedSides = [];
    // If road is North of parking (dy=-1), vehicle exits parking heading N, approaching road tile from S
    const dirs = [{dx:0,dy:-1,dir:'N',approachDir:'S'},{dx:0,dy:1,dir:'S',approachDir:'N'},{dx:1,dy:0,dir:'E',approachDir:'W'},{dx:-1,dy:0,dir:'W',approachDir:'E'}];
    for (const d of dirs) {
        const px = parking.x + d.dx, py = parking.y + d.dy;
        const k = `${px},${py}`;
        if (G.roads.has(k) || G.elevatedRoads.has(k)) {
            parking.connectedSides.push(d.dir);
            // Only place stop sign facing the parking lot exit direction
            // so through-traffic on the road is not affected
            const existing = G.intersections.get(k);
            if (existing && !existing.parkingStop) {
                // Real intersection (traffic light or manually placed stop) — leave it alone
            } else if (existing && existing.parkingStop) {
                // Another parking lot already set a parking stop here — add this direction too
                existing.stopDirs[d.approachDir] = true;
            } else {
                // Create stop sign that only stops traffic coming from the parking lot side
                const stopDirs = {N:false, S:false, E:false, W:false};
                stopDirs[d.approachDir] = true;
                G.intersections.set(k, {type:'stop', stopDirs, greenAxis:'NS', timer:0, parkingStop:true});
            }
        }
    }
}

function updateAllParkingConnections() {
    // First remove all parking-only stop signs so they can be rebuilt cleanly
    for (const [k, ctrl] of G.intersections) {
        if (ctrl.parkingStop) G.intersections.delete(k);
    }
    for (const p of G.parkingLots) {
        updateParkingConnections(p);
    }
}

// ===== ROAD PLACEMENT =====
function canPlaceRoad(type, x, y) {
if (x < 0 || x >= MAP_W || y < 0 || y >= MAP_H) return false;
// Check playable area
const pdx = x - G.playableCenter.x, pdy = y - G.playableCenter.y;
if (Math.sqrt(pdx*pdx + pdy*pdy) > G.playableRadius + 1) return false;
// Block road placement on building tiles (highways/flyovers also blocked adjacent to buildings)
const isHighwayType = type.includes('highway');
if (G.buildings.some(b => {
if (b.x === x && b.y === y) return true;
if (isHighwayType && Math.abs(b.x - x) <= 1 && Math.abs(b.y - y) <= 1) return true;
return false;
})) return false;
// Block road placement on parking lot tiles
if (G.parkingLots.some(p => p.x === x && p.y === y)) return false;
const key = `${x},${y}`;
// Elevated roads and highways can overlay existing ground roads
if (type === 'road_highway' || type === 'paid_highway') {
if (G.elevatedRoads.has(key)) return false;
const terrain = G.terrain[y][x];
return terrain === 0 || terrain === 1 || terrain === 3 || terrain === 4 || G.roads.has(key);
}
// Flyovers go over ground roads (stored in elevatedRoads map)
if (type === 'road_flyover') {
if (G.elevatedRoads.has(key)) return false;
// Block flyover if tile already has an elevated road (highway)
const terrain = G.terrain[y][x];
return terrain === 0 || terrain === 1 || terrain === 3 || terrain === 4 || G.roads.has(key);
}
// Tunnels can go under existing ground roads (stored in elevatedRoads map)
if (type === 'road_tunnel') {
if (G.elevatedRoads.has(key)) return false;
const terrain = G.terrain[y][x];
return terrain === 2 || terrain === 0 || G.roads.has(key);
}
// Normal roads: can't place if tile already occupied
if (G.roads.has(key)) return false;
const terrain = G.terrain[y][x];
// Auto-convert: any road type can go on water (becomes bridge) or mountain (becomes tunnel)
if (terrain === 1 || terrain === 3 || terrain === 4 || terrain === 2) return true;
if (terrain !== 0) return false;
return true;
}

// Determine actual road type based on terrain (auto-converts over water/mountains)
// Now preserves original road type for water — bridge flag is set in placeRoad instead
function getAutoRoadType(type, x, y) {
const terrain = G.terrain[y][x];
// If explicitly placing a flyover or it's an elevated road, keep the type
if (type === 'road_flyover') return type;
// Water terrain: keep original type (bridge flag added in placeRoad)
if (terrain === 1 || terrain === 3 || terrain === 4) return type;
if (terrain === 2) return 'road_tunnel'; // mountain -> tunnel
return type;
}

function placeRoad(type, x, y, freePlacement) {
const key = `${x},${y}`;
if (type === 'road_tunnel' || type === 'road_flyover' || type === 'road_highway' || type === 'paid_highway') {
if (G.elevatedRoads.has(key)) return false;
} else {
if (G.roads.has(key)) return false;
}
// Auto-convert road type based on terrain
type = getAutoRoadType(type, x, y);
let cost = ROAD_COSTS[type] || 25;
// Highway setup vs extend cost logic
if (type === 'road_highway' || type === 'paid_highway') {
const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
const adjacentHighway = dirs.some(([dx, dy]) => {
const nk = `${x+dx},${y+dy}`;
const r = G.roads.get(nk) || G.elevatedRoads.get(nk);
return r && r.type.includes('highway');
});
if (adjacentHighway) {
// Check if extending from a ground-level highway — cheaper cost
const adjGroundHighway = dirs.some(([dx, dy]) => {
const nk = `${x+dx},${y+dy}`;
const r = G.roads.get(nk) || G.elevatedRoads.get(nk);
return r && r.type.includes('highway') && (r.elevation || 0) === 0;
});
if (type === 'paid_highway') {
cost = PAID_HIGHWAY_EXTEND_COST;
} else {
cost = adjGroundHighway ? HIGHWAY_EXTEND_COST_GROUND : HIGHWAY_EXTEND_COST;
}
} else {
cost = type === 'paid_highway' ? PAID_HIGHWAY_SETUP_COST : HIGHWAY_SETUP_COST;
}
}
// Apply Voss tunnel discount if active
if (type === 'road_tunnel' && G.vossTunnelDiscount && G.vossTunnelDiscount < 1) {
cost = Math.floor(cost * G.vossTunnelDiscount);
}
if (G.terrain[y][x] === 2) {
// Apply mining boost from Voss bonus
const miningMult = G.vossMiningBoost || 1;
// Check for Raymond Voss discovery — requires 3+ Voss artifacts, extremely rare
const vossArtifacts = (G.artifactsFound||[]).filter(a=>a.startsWith('voss_')).length;
if (vossArtifacts >= 3 && Math.random() < 0.004) {
// Found Voss! Pick a random bonus
const bonus = VOSS_BONUSES[Math.floor(Math.random() * VOSS_BONUSES.length)];
// Remove previous active bonus if any
if (G.vossActiveBonus) {
const prev = VOSS_BONUSES.find(b=>b.id===G.vossActiveBonus.id);
if (prev) prev.remove(G);
}
bonus.apply(G);
G.vossFindsTotal = (G.vossFindsTotal||0) + 1;
G.vossActiveBonus = bonus.durationDays > 0 ? {id:bonus.id,name:bonus.name,desc:bonus.desc,icon:bonus.icon,expiresDay:G.day+bonus.durationDays} : null;
G.discoveredSecrets.push('voss_found');
const findNum = G.vossFindsTotal;
const vossTexts = [
'A figure sits in the deepest chamber, studying a map by lantern light. He looks up. "Another commissioner. You found me." He hands you his notes. "Use these. The network is patient, but you don\'t have to be."',
'The tunnel opens into a warm chamber. Raymond Voss is here, tracing lines on the stone wall. "The routes are clearer from down here," he says. "Take this — it\'ll help you see what I see."',
'At the end of the passage, a small camp. A bedroll. A lantern. Stacks of survey maps. Voss looks up from his work. "I wondered when you\'d dig this far. Here — I\'ve been preparing something for whoever came next."',
'The chamber hums. Voss sits cross-legged at the center, eyes closed. He opens them slowly. "It told me you were coming," he says. "Don\'t ask what \'it\' is. You already know. Take this and build."',
'You find him at a junction where six tunnels converge. He looks younger than his photographs. "Time moves differently down here," he says, smiling. "I mapped something for you. The mountains are full of gifts, if you know where to look."'
];
const vossText = vossTexts[Math.min(findNum-1, vossTexts.length-1)];
showArtifactPopup('Raymond Voss', vossText + '\n\n' + bonus.icon + ' BONUS: ' + bonus.name + '\n' + bonus.desc);
showNotification(`${bonus.icon} Found Raymond Voss! ${bonus.name}: ${bonus.desc}`);
addToJournal('discoveries', `You found Raymond Voss in the deepest tunnel. ${bonus.icon} ${bonus.name}: ${bonus.desc}`, ['voss','entity']);
}
// Treasure in mountains — increased frequency and value
else if (Math.random() < 0.09 * miningMult) {
// Gold: common, good payout
const goldAmount = 400 + Math.floor(Math.random() * 1200);
G.money += goldAmount;
G.discoveredSecrets.push('gold');
showNotification(`⛏️ Gold vein struck! +$${goldAmount}! The mountain runs deep.`);
addToJournal('discoveries', `⛏️ Gold vein struck while tunneling — +$${goldAmount}`, ['deep_history']);
} else if (Math.random() < 0.04 * miningMult) {
// Rare silver seam
const silverAmount = 1500 + Math.floor(Math.random() * 1000);
G.money += silverAmount;
G.discoveredSecrets.push('silver_seam');
showNotification(`🪨 Silver seam discovered! +$${silverAmount}! Pure ore, deep in the rock.`);
addToJournal('discoveries', `🪨 Silver seam uncovered in the mountain — +$${silverAmount}`, ['deep_history']);
} else if (Math.random() < 0.025 * miningMult) {
// Ancient artifact cache
const artifactAmount = 2500 + Math.floor(Math.random() * 1500);
G.money += artifactAmount;
G.discoveredSecrets.push('ancient_artifact');
showNotification(`🏺 Ancient artifact cache! +$${artifactAmount}! These predate the town by centuries.`);
addToJournal('discoveries', `🏺 Ancient artifact cache unearthed — +$${artifactAmount}`, ['deep_history','entity']);
} else if (Math.random() < 0.012 * miningMult) {
// Crystal cavern — rare, massive
G.money += 12000;
G.discoveredSecrets.push('crystal_cavern');
showNotification(`💎 Crystal cavern discovered! +$12,000! The walls stretch further than your lights can reach.`);
addToJournal('discoveries', '💎 Crystal cavern discovered beneath the mountain — +$12,000', ['deep_history']);
} else {
// Lore artifact from mountain pool
tryDiscoverArtifact('mountain');
}
} else if (G.terrain[y][x] === 0) {
// Ground tile: chance of lore artifact
tryDiscoverArtifact('ground');
}
// Track road building for Caruso escalation
G.lastRoadBuildDay = G.day;
if (freePlacement) { cost = 0; }
if (G.mode !== 'creative' && G.money < cost) {
showNotification('Not enough money!');
return false;
}
if (G.mode !== 'creative' && cost > 0) G.money -= cost;
// Show floating cost popup
if (cost > 0) showCostPopup(x, y, cost, type);
const isHighwayType = type.includes('highway');
const elevation = isHighwayType ? 1 : 0;
const road = {type, placedDay: G.day, placedTick: G.dayTick, breakdown: false, blocking: false, name: generateRoadName(), elevation};
// One-way roads and flyovers — direction determined by drag direction
if (type === 'road_oneway' || type === 'road_flyover') {
const prev = G._lastPlacedPos;
if (prev) {
const ddx = x - prev.x, ddy = y - prev.y;
if (Math.abs(ddx) + Math.abs(ddy) === 1) {
road.oneWayDir = {dx: ddx, dy: ddy};
} else {
// Not adjacent: inherit from nearest flyover/oneway neighbor
const dirs2 = [[0,-1],[0,1],[-1,0],[1,0]];
for (const [adx,ady] of dirs2) {
const nr = G.elevatedRoads.get(`${x+adx},${y+ady}`) || G.roads.get(`${x+adx},${y+ady}`);
if (nr && nr.oneWayDir) { road.oneWayDir = nr.oneWayDir; break; }
}
}
} else if (type === 'road_flyover') {
// First flyover placed: default east
road.oneWayDir = {dx: 1, dy: 0};
}
G._lastPlacedPos = {x, y};
if (type === 'road_oneway') road.speedLimitMPH = 60;
}
// Highways — always one-lane one-way, direction set by drag direction (wrong-way forbidden)
if (type === 'road_highway' || type === 'paid_highway') {
const prev = G._lastPlacedPos;
if (prev) {
const ddx = x - prev.x, ddy = y - prev.y;
if (Math.abs(ddx) + Math.abs(ddy) === 1) {
road.oneWayDir = {dx: ddx, dy: ddy};
} else {
// Not adjacent: inherit direction from a neighboring highway tile
const dirs2 = [[0,-1],[0,1],[-1,0],[1,0]];
for (const [adx,ady] of dirs2) {
const nr = G.elevatedRoads.get(`${x+adx},${y+ady}`);
if (nr && nr.type.includes('highway') && nr.oneWayDir) { road.oneWayDir = nr.oneWayDir; break; }
}
}
} else {
// First tile placed: try to inherit from adjacent highway, else default east
const dirs2 = [[0,-1],[0,1],[-1,0],[1,0]];
for (const [adx,ady] of dirs2) {
const nr = G.elevatedRoads.get(`${x+adx},${y+ady}`);
if (nr && nr.type.includes('highway') && nr.oneWayDir) { road.oneWayDir = nr.oneWayDir; break; }
}
if (!road.oneWayDir) road.oneWayDir = {dx: 1, dy: 0}; // default: east
}
G._lastPlacedPos = {x, y};
}
// Set bridge flag for any road placed on water (preserves original type's capacity/speed)
const terrain = G.terrain[y][x];
if ((terrain === 1 || terrain === 3 || terrain === 4) && type !== 'road_flyover') {
road.bridge = true;
}
if (type.startsWith('paid')) {
// Enforce 1 connected toll road per week
if (G.mode !== 'creative') {
if (G.tollPlacedThisWeek && G.currentTollGroup.size > 0) {
// Must be adjacent to existing toll group
const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
const adjacent = dirs.some(([ddx,ddy]) => G.currentTollGroup.has(`${x+ddx},${y+ddy}`));
if (!adjacent) {
showNotification('⚠ You can only place one connected toll road per week! Extend your existing toll road.');
G.money += cost; // refund the cost deducted above
return false;
}
}
G.tollPlacedThisWeek = true;
G.currentTollGroup.add(key);
}
road.paid = true;
road.tollTier = 1;
road.tollRevenue = 0;
}
// Elevated roads, flyovers, tunnels, and highways go in separate map so they can overlay ground roads
if (type === 'road_tunnel' || type === 'road_flyover' || type === 'road_highway' || type === 'paid_highway') {
G.elevatedRoads.set(key, road);
} else {
G.roads.set(key, road);
}
G.lastRoadChangeId++;
G.pathCache.clear();
if (G.speed === 0) G.roadsDuringPause.add(key);
// Check if creates intersection
updateIntersections(x, y);
// Update parking lot connections (new road may be adjacent to existing parking lots)
updateAllParkingConnections();
// Warn about paid road threshold
if (road.paid) {
const pct = getPaidRoadPercent();
if (pct > 0.2 && pct <= 0.25) {
showNotification('⚠ Over 20% of roads are toll roads! Workers may start striking.');
} else if (pct > 0.4 && pct <= 0.45) {
showNotification('🚨 Over 40% toll roads! Many workers are refusing to commute!');
} else if (pct > 0.6 && pct <= 0.65) {
showNotification('🔥 Over 60% toll roads! Town economy grinding to a halt!');
}
updateHUD();
}
// Flyover placement guidance: warn if not adjacent to both ground and elevated roads
if (type === 'road_flyover') {
const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
let hasGroundAdj = false, hasElevatedAdj = false;
for (const [dx, dy] of dirs) {
const nk = `${x+dx},${y+dy}`;
const nr = G.roads.get(nk) || G.elevatedRoads.get(nk);
if (nr) {
if ((nr.elevation || 0) === 0 && !nr.type.includes('highway')) hasGroundAdj = true;
if ((nr.elevation || 0) === 1 || nr.type.includes('highway')) hasElevatedAdj = true;
}
}
if (hasGroundAdj && hasElevatedAdj) {
showNotification('Flyover ramp connects ground road to highway');
} else if (!hasGroundAdj && !hasElevatedAdj) {
showNotification('Tip: Place flyover between a ground road and an elevated highway for best results');
} else if (hasGroundAdj) {
showNotification('Tip: Place flyover between a ground road and an elevated highway for best results');
} else {
showNotification('Tip: Place flyover between a ground road and an elevated highway for best results');
}
}
return true;
}

function placeWideRoad(type, x, y, direction, flowDir) {
// direction: 'h' = horizontal drag -> widen vertically, 'v' = vertical drag -> widen horizontally
// flowDir: {dx, dy} = direction of traffic flow along the road (from drag step)
const isMulti = type.includes('multi');
const isHighway = type.includes('highway');
const width = isHighway ? 2 : isMulti ? 2 : 1;
if (width === 1) { placeRoad(type, x, y); return; }
const offsets = [0, 1]; // 2-wide for highway and multi
const parentKey = `${x},${y}`;
const childKeys = [];
for (const off of offsets) {
const nx = direction === 'h' ? x : x + off;
const ny = direction === 'h' ? y + off : y;
if (canPlaceRoad(type, nx, ny)) {
// For highways: only the center tile (offset=0) pays, flanking tiles are free
const isFlanking = (type.includes('highway')) && off !== 0;
if (placeRoad(type, nx, ny, isFlanking)) {
const nk = `${nx},${ny}`;
childKeys.push(nk);
// Mark child tiles with parent reference
const roadMap = (type === 'road_tunnel' || type === 'road_flyover' || type === 'road_highway' || type === 'paid_highway') ? G.elevatedRoads : G.roads;
const r = roadMap.get(nk);
if (r && (nx !== x || ny !== y)) {
r.parentRoad = parentKey;
}
// Multi-lane & Highway: set one-way direction per tile
if (r && (isMulti || isHighway) && flowDir) {
r.multiLaneGroup = true; // tag for intersection skipping
if (isHighway) {
// Both lanes of highway go the SAME direction (one-way highway)
r.oneWayDir = {dx: flowDir.dx, dy: flowDir.dy};
} else if (off === 0) {
r.oneWayDir = {dx: flowDir.dx, dy: flowDir.dy};
} else {
r.oneWayDir = {dx: -flowDir.dx, dy: -flowDir.dy};
}
}
}
}
}
// Mark parent with children + multi-lane tag
const roadMap = (type === 'road_tunnel' || type === 'road_flyover' || type === 'road_highway' || type === 'paid_highway') ? G.elevatedRoads : G.roads;
const parentRoad = roadMap.get(parentKey);
if (parentRoad) {
parentRoad.childRoads = childKeys.filter(k => k !== parentKey);
if ((isMulti || isHighway) && flowDir) {
parentRoad.multiLaneGroup = true;
if (!parentRoad.oneWayDir) {
parentRoad.oneWayDir = {dx: flowDir.dx, dy: flowDir.dy};
}
}
}
}

function generateRoadName() {
return ROAD_NAME_PARTS[0][Math.floor(Math.random()*ROAD_NAME_PARTS[0].length)] + ' ' +
ROAD_NAME_PARTS[1][Math.floor(Math.random()*ROAD_NAME_PARTS[1].length)];
}

function toggleHighwayElevation(key) {
const [x, y] = key.split(',').map(Number);
// Find the road in either map
let road = G.elevatedRoads.get(key);
let fromElevated = true;
if (!road) {
road = G.roads.get(key);
fromElevated = false;
}
if (!road) return;
if (!road.type.includes('highway')) return;
// Toggle elevation
road.elevation = road.elevation === 1 ? 0 : 1;
// Move between maps
if (fromElevated && road.elevation === 0) {
G.elevatedRoads.delete(key);
G.roads.set(key, road);
} else if (!fromElevated && road.elevation === 1) {
G.roads.delete(key);
G.elevatedRoads.set(key, road);
}
// Handle child tiles
if (road.childRoads) {
for (const ck of road.childRoads) {
const child = G.elevatedRoads.get(ck) || G.roads.get(ck);
if (child) {
child.elevation = road.elevation;
if (fromElevated && road.elevation === 0) {
G.elevatedRoads.delete(ck);
G.roads.set(ck, child);
} else if (!fromElevated && road.elevation === 1) {
G.roads.delete(ck);
G.elevatedRoads.set(ck, child);
}
}
}
}
G.lastRoadChangeId++;
G.pathCache.clear();
updateIntersections(x, y);
showNotification(road.elevation === 1 ? 'Highway raised to elevated level — extend cost $15/tile' : 'Highway lowered — extend cost reduced to $10/tile');
// Refresh inspect panel
showInspectInfo(x, y);
}

function updateIntersections(x, y) {
// Check this tile and all neighbors for intersection status
const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
const dirNames = ['N','S','W','E']; // matching dirs array order
const tilesToCheck = [{x, y}];
for (const [dx, dy] of dirs) {
tilesToCheck.push({x: x+dx, y: y+dy});
}
for (const tile of tilesToCheck) {
const tk = `${tile.x},${tile.y}`;
const tileRoad = G.roads.get(tk) || G.elevatedRoads.get(tk);
if (!tileRoad) continue;
// No automatic stop signs on highways or elevated highways
if (tileRoad.type && tileRoad.type.includes('highway')) continue;
// Flyovers and tunnels never get intersections — they pass over/under ground roads
if (tileRoad.type === 'road_flyover' || tileRoad.type === 'road_tunnel') continue;
const isMultiLane = tileRoad.multiLaneGroup || (tileRoad.type && tileRoad.type.includes('multi'));
// Count non-sibling road neighbors and track which are smaller roads
let roadCount = 0;
let stopDirs = {N:false,S:false,E:false,W:false};
let hasSmaller = false;
let hasMulti = false;
// For multi×multi detection: track multi-lane neighbors by axis
// Determine this tile's group identity (parent key)
let multiNS = false, multiEW = false;
const tileGroup = tileRoad.parentRoad || tk; // parent key, or self if we ARE the parent
for (let di = 0; di < dirs.length; di++) {
const [dx, dy] = dirs[di];
const nk = `${tile.x+dx},${tile.y+dy}`;
const neighbor = G.roads.get(nk);
if (!neighbor) continue;
const neighborIsMulti = neighbor.multiLaneGroup || (neighbor.type && neighbor.type.includes('multi'));
// Check if neighbor is a sibling (same wide-road group)
const neighborGroup = neighbor.parentRoad || nk;
const isSibling = (neighborGroup === tileGroup) || (nk === tileGroup) || (neighborGroup === tk);
if (neighborIsMulti && !isSibling) {
// Multi-lane neighbor from a DIFFERENT road group — real crossing
hasMulti = true;
if (di < 2) multiNS = true; // N or S
else multiEW = true; // W or E
}
if (neighbor.multiLaneGroup) continue; // skip siblings for roadCount
roadCount++;
if (!neighborIsMulti) {
hasSmaller = true;
}
}
// Multi×multi intersection: multi-lane neighbors on BOTH axes
if (isMultiLane && multiNS && multiEW) {
tileRoad.boxJunction = true;
G.intersections.set(tk, {type: 'multi_intersection', phase: 'green', greenAxis: 'NS', timer: 0, phaseLength: 200});
} else if (roadCount >= 3 || (isMultiLane && hasSmaller && roadCount >= 1)) {
tileRoad.boxJunction = false;
if (isMultiLane) {
// Multi-lane tile: only stop directions where smaller roads connect
for (let di = 0; di < dirs.length; di++) {
const [dx, dy] = dirs[di];
const nk = `${tile.x+dx},${tile.y+dy}`;
const neighbor = G.roads.get(nk);
if (!neighbor || neighbor.multiLaneGroup) continue;
const neighborIsMulti = neighbor.type && neighbor.type.includes('multi');
if (!neighborIsMulti) {
stopDirs[dirNames[di]] = true; // stop sign facing the smaller road
}
}
if (Object.values(stopDirs).some(v => v)) {
G.intersections.set(tk, {type: 'stop', stopDirs, greenAxis: 'NS', timer: 0});
}
} else {
// Regular road: all-way stop as before
if (!G.intersections.has(tk)) {
G.intersections.set(tk, {type: 'stop', stopDirs: {N:true,S:true,E:true,W:true}, greenAxis: 'NS', timer: 0});
}
}
} else {
// No intersection conditions met — clean up stale data
tileRoad.boxJunction = false;
G.intersections.delete(tk);
}
}
}

function demolishRoad(x, y) {
const key = `${x},${y}`;
// Check both regular and elevated roads
let road = G.roads.get(key);
let isElevated = false;
if (!road) {
road = G.elevatedRoads.get(key);
isElevated = true;
}
if (!road) return 0;
let totalRefund = 0;
// If this tile has a parentRoad that still exists, demolish from the parent instead
if (road.parentRoad) {
const [px, py] = road.parentRoad.split(',').map(Number);
const pk = `${px},${py}`;
if (G.roads.has(pk) || G.elevatedRoads.has(pk)) {
return demolishRoad(px, py);
}
}
// Collect all tiles to demolish: this tile + children (recursively)
const tilesToDemolish = new Set();
const collectTiles = (tk) => {
if (tilesToDemolish.has(tk)) return;
const r = G.roads.get(tk) || G.elevatedRoads.get(tk);
if (!r) return;
tilesToDemolish.add(tk);
if (r.childRoads) {
for (const ck of r.childRoads) collectTiles(ck);
}
};
collectTiles(key);
for (const tk of tilesToDemolish) {
const r = G.roads.get(tk) || G.elevatedRoads.get(tk);
if (!r) continue;
const cost = ROAD_COSTS[r.type] || 25;
// Grace period: full refund if placed during pause OR within the same in-game day
const sameDay = r.placedDay === G.day;
const recentlyPlaced = sameDay && (G.dayTick - (r.placedTick || 0)) < 1800; // half a day (~30s real time at 1x)
if (G.roadsDuringPause.has(tk) || sameDay) {
// Full refund within the same day, 80% if placed today but more than half-day ago
totalRefund += road.type === 'road_tunnel' ? 0 : (recentlyPlaced || G.roadsDuringPause.has(tk) ? cost : Math.floor(cost * 0.8));
} else {
totalRefund += road.type === 'road_tunnel' ? 0 : Math.floor(cost * 0.2);
}
// Delete from whichever map it's in
if (G.elevatedRoads.has(tk)) {
G.elevatedRoads.delete(tk);
} else {
G.roads.delete(tk);
}
G.intersections.delete(tk);
}
G.money += totalRefund;
G.lastRoadChangeId++;
G.pathCache.clear();
// Update parking lot connections after road removal
updateAllParkingConnections();
return totalRefund;
}

function demolishArea(x1, y1, x2, y2) {
let totalRefund = 0, count = 0;
for (let y = y1; y <= y2; y++) {
for (let x = x1; x <= x2; x++) {
const refund = demolishRoad(x, y);
if (refund > 0) { totalRefund += refund; count++; }
const mi = G.maintenanceBuildings.findIndex(m => m.x === x && m.y === y);
if (mi >= 0) {
G.maintenanceBuildings.splice(mi, 1);
const ref = G.mode === 'creative' ? 0 : 100;
G.money += ref; totalRefund += ref; count++;
}
const pi = G.parkingLots.findIndex(p => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1 && p.playerBuilt);
if (pi >= 0) {
G.parkingLots.splice(pi, 1);
const ref = G.mode === 'creative' ? 0 : 30;
G.money += ref; totalRefund += ref; count++;
}
}
}
if (count > 0) showNotification(`Demolished ${count} items. Refund: $${totalRefund}`);
}

function countRoadsInArea(x1, y1, x2, y2) {
let count = 0;
for (let y = y1; y <= y2; y++) {
for (let x = x1; x <= x2; x++) {
if (G.roads.has(`${x},${y}`) || G.elevatedRoads.has(`${x},${y}`)) count++;
}
}
return count;
}

function addHighwayParallelLane(x, y, pdx, pdy) {
// Place a parallel highway tile beside a lonely highway tile, matching its direction
const srcRoad = G.elevatedRoads.get(`${x},${y}`);
if (!srcRoad || !srcRoad.type.includes('highway')) return;
const nx = x + pdx, ny = y + pdy;
if (!canPlaceRoad(srcRoad.type, nx, ny)) {
showNotification('Cannot place parallel lane here (blocked or out of bounds).');
return;
}
// Place using placeRoad directly, free (flanking lane)
if (placeRoad(srcRoad.type, nx, ny, true)) {
const newRoad = G.elevatedRoads.get(`${nx},${ny}`);
if (newRoad && srcRoad.oneWayDir) {
newRoad.oneWayDir = {dx: srcRoad.oneWayDir.dx, dy: srcRoad.oneWayDir.dy};
newRoad.multiLaneGroup = true;
}
showNotification('Parallel highway lane added!');
} else {
showNotification('Could not place parallel lane here.');
}
document.getElementById('infoPanel').style.display = 'none';
}
