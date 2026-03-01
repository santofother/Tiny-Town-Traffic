// ui.js — User interface, panels, HUD, inspect, tutorials, lore journal, and controls
// Manages all DOM-based UI: inspect panels, traffic controls, weekly summaries,
// notifications, settings, tutorial pages, lore journal/mystery board, search, and tool selection.
// Reads from and occasionally modifies global game state (G). Depends on: world.js, simulate.js, lore.js

function showWeeklySummary(taxO, taxR, toll, park, upkeep, maint, strikers, totalWorkers, tollPct, disconnected, disconnectPenalty, famTax, loanPay) {
const el = document.getElementById('weekSummary');
const strikeHtml = strikers > 0 ? `
<div class="line"><span>⚠ Workers on Strike</span><span class="neg">${strikers}/${totalWorkers} (${Math.round(tollPct*100)}% toll roads)</span></div>` : '';
const disconnectHtml = disconnected > 0 ? `
<div class="line"><span>🏚️ Unconnected Homes</span><span class="neg">-$${disconnectPenalty} (${disconnected} families)</span></div>` : '';
const loanHtml = (loanPay||0) > 0 ? `
<div class="line"><span>💰 Loan Payments</span><span class="neg">-$${loanPay}</span></div>` : '';
const wcs = G.weeklyCommuteStats;
const wcsTotal = wcs.officeTotal + wcs.restaurantTotal + wcs.schoolTotal;
const wcsLate = wcs.officeLate + wcs.restaurantLate + wcs.schoolLate;
const wcsOnTime = wcsTotal - wcsLate;
const commuteHtml = wcsTotal > 0 ? `
<div class="line"><span>📊 Commute Performance</span><span class="${wcsLate > 0 ? 'neg' : 'pos'}">${wcsOnTime}/${wcsTotal} on-time (${wcsLate} late)</span></div>
<div class="line" style="font-size:11px;color:#a89070;"><span>&nbsp;&nbsp;Office ${wcs.officeTotal-wcs.officeLate}/${wcs.officeTotal} · Restaurant ${wcs.restaurantTotal-wcs.restaurantLate}/${wcs.restaurantTotal} · School ${wcs.schoolTotal-wcs.schoolLate}/${wcs.schoolTotal}</span><span></span></div>` : '';
const net = taxO + taxR + toll + park + (famTax||0) - upkeep - maint - (disconnectPenalty || 0) - (loanPay||0);
el.innerHTML = `
<h2>Weekly Report — Day ${G.day}</h2>
<div class="line"><span>Office Tax</span><span class="pos">+$${taxO}</span></div>
<div class="line"><span>Restaurant Tax</span><span class="pos">+$${taxR}</span></div>
<div class="line"><span>Family Tax</span><span class="pos">+$${famTax||0}</span></div>
<div class="line"><span>Toll Revenue</span><span class="pos">+$${toll}</span></div>
<div class="line"><span>Parking Revenue</span><span class="pos">+$${park}</span></div>
<div class="line"><span>Road Upkeep</span><span class="neg">-$${upkeep}</span></div>
<div class="line"><span>Maintenance</span><span class="neg">-$${maint}</span></div>${loanHtml}${disconnectHtml}${strikeHtml}${commuteHtml}
<hr style="border-color:rgba(232,213,183,0.2);margin:8px 0;">
<div class="line"><span><strong>Net</strong></span><span class="${net>=0?'pos':'neg'}"><strong>${net>=0?'+':''}$${net}</strong></span></div>
${tollPct > 0.2 ? `<p style="color:#ff8844;font-size:11px;margin-top:6px;">⚠ Toll road threshold exceeded (${Math.round(tollPct*100)}% > 20%). Reduce paid roads to end strikes!</p>` : ''}
${disconnected > 0 ? `<p style="color:#ff8844;font-size:11px;margin-top:4px;">🏚️ ${disconnected} families have no road access — they may leave town!</p>` : ''}
<br><button class="menu-btn" onclick="document.getElementById('weekSummary').style.display='none'" style="padding:6px 20px;font-size:12px;">OK</button>
`;
el.style.display = 'block';
setTimeout(() => el.style.display = 'none', 15000);
}

function updateHUD() {
document.getElementById('dayCount').textContent = G.day;
document.getElementById('timeDisplay').textContent = getTimeString();
document.getElementById('balance').textContent = `$${G.money.toLocaleString()}`;
document.getElementById('weeklyRev').textContent = `$${G.weeklyRevenue.toLocaleString()}`;
document.getElementById('balance').style.color = G.money < 100 ? '#cf6679' : '#e8d5b7';
// Toll road indicator
const tollPct = getPaidRoadPercent();
const tollEl = document.getElementById('tollIndicator');
const tollValEl = document.getElementById('tollPercent');
if (G.roads.size + G.elevatedRoads.size > 0) {
tollEl.style.display = '';
const pctNum = Math.round(tollPct * 100);
tollValEl.textContent = pctNum + '%';
if (tollPct > 0.2) {
tollValEl.style.color = tollPct > 0.5 ? '#ff4444' : tollPct > 0.35 ? '#ff8844' : '#ffaa44';
tollEl.title = `⚠ ${pctNum}% paid roads — workers are striking! (threshold: 20%)`;
} else {
tollValEl.style.color = '#88dd88';
tollEl.title = 'Paid road percentage — keep below 20% to avoid strikes';
}
} else {
tollEl.style.display = 'none';
}
// Disconnected houses indicator
const dcEl = document.getElementById('disconnectIndicator');
const dcValEl = document.getElementById('disconnectCount');
if (G.unconnectedHouses > 0) {
dcEl.style.display = '';
dcValEl.textContent = G.unconnectedHouses;
dcValEl.style.color = G.unconnectedHouses > 3 ? '#ff4444' : '#ffaa44';
} else {
dcEl.style.display = 'none';
}
// Disconnected offices indicator
const dcOffices = G.buildings.filter(b => b.type === 'office' && !hasNearbyRoad(b.x, b.y));
const dcOffEl = document.getElementById('disconnectOfficeIndicator');
const dcOffValEl = document.getElementById('disconnectOfficeCount');
if (dcOffices.length > 0) {
dcOffEl.style.display = '';
dcOffValEl.textContent = dcOffices.length;
dcOffValEl.style.color = dcOffices.length > 2 ? '#ff4444' : '#ffaa44';
} else {
dcOffEl.style.display = 'none';
}
// Disconnected restaurants indicator
const dcRests = G.buildings.filter(b => b.type && b.type.startsWith('restaurant') && !hasNearbyRoad(b.x, b.y));
const dcRestEl = document.getElementById('disconnectRestIndicator');
const dcRestValEl = document.getElementById('disconnectRestCount');
if (dcRests.length > 0) {
dcRestEl.style.display = '';
dcRestValEl.textContent = dcRests.length;
dcRestValEl.style.color = dcRests.length > 2 ? '#ff4444' : '#ffaa44';
} else {
dcRestEl.style.display = 'none';
}
// Commute stats indicator
const cs = G.commuteStats;
const csTotal = cs.officeTotal + cs.restaurantTotal + cs.schoolTotal;
const csLate = cs.officeLate + cs.restaurantLate + cs.schoolLate;
const csDiv = document.getElementById('commuteStatsDiv');
if (csTotal > 0) {
csDiv.style.display = '';
const csOnTime = csTotal - csLate;
document.getElementById('commuteStatsVal').textContent = `${csOnTime}/${csTotal}`;
csDiv.title = `Today's commute stats\nOffice: ${cs.officeTotal - cs.officeLate}/${cs.officeTotal} on-time\nRestaurant: ${cs.restaurantTotal - cs.restaurantLate}/${cs.restaurantTotal}\nSchool: ${cs.schoolTotal - cs.schoolLate}/${cs.schoolTotal}`;
} else {
csDiv.style.display = 'none';
}
// Debt indicator
const debtEl = document.getElementById('debtIndicator');
const debtValEl = document.getElementById('debtAmount');
if (G.totalDebt > 0) {
debtEl.style.display = '';
debtValEl.textContent = `$${G.totalDebt.toLocaleString()}`;
debtValEl.style.color = G.totalDebt > 5000 ? '#cf6679' : '#ffaa44';
} else {
debtEl.style.display = 'none';
}
// Voss bonus indicator
const vbEl = document.getElementById('vossBonusIndicator');
if (G.vossActiveBonus) {
vbEl.style.display = '';
const daysLeft = G.vossActiveBonus.expiresDay - G.day;
document.getElementById('vossBonusLabel').textContent = `${G.vossActiveBonus.icon} Voss`;
document.getElementById('vossBonusDays').textContent = daysLeft > 0 ? `${daysLeft}d` : 'active';
vbEl.title = `${G.vossActiveBonus.name}: ${G.vossActiveBonus.desc}`;
} else {
vbEl.style.display = 'none';
}
}

function cycleDisconnectedHouse() {
if (!G) return;
// Build list of disconnected house buildings
const disconnected = [];
for (const f of G.families) {
if (f.members.length > 0 && f.houseTile && !hasNearbyRoad(f.houseTile.x, f.houseTile.y)) {
const house = G.buildings.find(b => b.id === f.houseId);
if (house) disconnected.push(house);
}
}
if (disconnected.length === 0) {
showNotification('All houses are connected to the road network!');
return;
}
// Deduplicate by building id (multiple families can share an apartment)
const seen = new Set();
const unique = disconnected.filter(b => { if (seen.has(b.id)) return false; seen.add(b.id); return true; });
// If current target is still disconnected and this is the same target, advance to next
if (lastDisconnectedTarget !== null) {
const stillInList = unique.findIndex(b => b.id === lastDisconnectedTarget);
if (stillInList >= 0) {
// Same target still disconnected — advance to next
disconnectedCycleIndex = (stillInList + 1) % unique.length;
} else {
// Previous target is now connected — start from current index or 0
if (disconnectedCycleIndex >= unique.length) disconnectedCycleIndex = 0;
}
} else {
disconnectedCycleIndex = 0;
}
const target = unique[disconnectedCycleIndex];
lastDisconnectedTarget = target.id;
// Pan camera to the building
const iso = toISO(target.x, target.y);
G.camera.x = iso.sx;
G.camera.y = iso.sy;
showNotification(`🏚️ Disconnected: ${target.name || target.type} at (${target.x}, ${target.y}) — ${disconnectedCycleIndex + 1}/${unique.length}`);
}

function cycleDisconnectedBuilding(type) {
if (!G) return;
const isRestaurant = type === 'restaurant';
const label = isRestaurant ? '🍽️' : '🏢';
const typeName = isRestaurant ? 'restaurants' : 'offices';
const disconnected = G.buildings.filter(b => {
    if (isRestaurant) return b.type && b.type.startsWith('restaurant') && !hasNearbyRoad(b.x, b.y);
    return b.type === type && !hasNearbyRoad(b.x, b.y);
});
if (disconnected.length === 0) {
    showNotification(`All ${typeName} are connected to the road network!`);
    return;
}
if (!disconnectedBuildingCycle[type]) disconnectedBuildingCycle[type] = {index: 0, lastId: null};
const state = disconnectedBuildingCycle[type];
if (state.lastId !== null) {
    const stillIdx = disconnected.findIndex(b => b.id === state.lastId);
    if (stillIdx >= 0) {
        state.index = (stillIdx + 1) % disconnected.length;
    } else {
        if (state.index >= disconnected.length) state.index = 0;
    }
} else {
    state.index = 0;
}
const target = disconnected[state.index];
state.lastId = target.id;
const iso = toISO(target.x, target.y);
G.camera.x = iso.sx;
G.camera.y = iso.sy;
showNotification(`${label} Disconnected: ${target.name || target.type} at (${target.x}, ${target.y}) — ${state.index + 1}/${disconnected.length}`);
}

function showNotification(text, duration, onClick) {
const el = document.getElementById('notification');
el.textContent = text;
el.style.display = 'block';
el.style.cursor = onClick ? 'pointer' : 'default';
el.onclick = onClick ? (e) => { onClick(); } : null;
if (onClick) {
    el.title = 'Click to go to location';
} else {
    el.title = '';
}
if (showNotification._timer) clearTimeout(showNotification._timer);
showNotification._timer = setTimeout(() => { el.style.display = 'none'; el.onclick = null; el.style.cursor = 'default'; el.title = ''; }, duration || 6000);
}

function showArtifactPopup(title, text) {
const el = document.getElementById('artifactPopup');
document.getElementById('artifactPopupTitle').textContent = '📜 ' + title;
document.getElementById('artifactPopupText').textContent = text;
el.style.display = 'block';
el.style.animation = 'none';
el.offsetHeight; // reflow
el.style.animation = 'artifactSlideDown 0.6s ease-out';
if (showArtifactPopup._timer) clearTimeout(showArtifactPopup._timer);
showArtifactPopup._timer = setTimeout(() => { el.style.display = 'none'; }, 12000);
}

function selectTool(tool) {
G.selectedTool = G.selectedTool === tool ? null : tool;
G.straightStart = null;
document.querySelectorAll('.tool-btn').forEach(b => {
b.classList.toggle('active', b.dataset.tool === G.selectedTool);
});
}

function setSpeed(s) {
G.speed = s;
document.getElementById('pauseBtn').classList.toggle('active', s === 0);
document.getElementById('playBtn').classList.toggle('active', s === 1);
document.getElementById('fastBtn').classList.toggle('active', s === 2);
document.getElementById('fastBtn2').classList.toggle('active', s === 4);
if (s === 0) G.isPaused = true;
else { G.isPaused = false; G.roadsDuringPause.clear(); }
}

function closeInspect() {
document.getElementById('infoPanel').style.display = 'none';
if (G) { G.highlightBuildings = []; G.commuteZoneCenter = null; }
}

function showInspectPanel(content, html) {
const panel = document.getElementById('infoPanel');
const closeBtn = `<button onclick="closeInspect()" style="position:absolute;top:6px;right:10px;background:rgba(232,213,183,0.15);border:1px solid rgba(232,213,183,0.3);color:#e8d5b7;width:26px;height:26px;border-radius:6px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background='rgba(220,80,80,0.4)'" onmouseout="this.style.background='rgba(232,213,183,0.15)'">&times;</button>`;
content.innerHTML = closeBtn + html;
panel.style.display = 'block';
}

function showInspectInfo(x, y) {
const panel = document.getElementById('infoPanel');
const content = document.getElementById('infoContent');
if (!G.tutorial) G.highlightBuildings = [];
G.highlightColor = '#44ff44';
G.commuteZoneCenter = null;
// Tutorial: give second artifact when inspect step is active
if (G.tutorial && TUTORIAL_STEPS[G.tutorial.step] && TUTORIAL_STEPS[G.tutorial.step].id === 'artifact_inspect' && !G.artifactsFound.includes('teddy_note_2')) {
giveTutorialArtifact('teddy_note_2');
}

// Check vehicles first (closest to click point)
const clickedVehicle = G.vehicles.find(v => v.active && Math.abs(v.x - x) < 1.5 && Math.abs(v.y - y) < 1.5);
if (clickedVehicle) {
const fam = clickedVehicle.familyId >= 0 ? G.families[clickedVehicle.familyId] : null;
const member = fam ? fam.members[clickedVehicle.memberIdx] : null;
let html = `<h3>${clickedVehicle.isTruck ? '🚛 Delivery Truck' : '🚗 Vehicle'}</h3>`;
if (member) {
html += `<p>👤 Driver: <strong>${member.name}</strong></p>`;
if (fam) html += `<p>👨‍👩‍👧 Family: The ${fam.lastName} Family</p>`;
const home = G.buildings.find(b => b.id === (fam ? fam.houseId : null));
html += `<p>🏠 Home: ${home ? home.name : 'Unknown'}</p>`;
if (member.role === 'adult') {
const wp = G.buildings.find(b => b.id === member.workplaceId);
html += `<p>🏢 Workplace: ${wp ? wp.name : 'Unemployed'}</p>`;
}
}
const purposeLabels = {commute:'Commuting to work',lunch:'Going to lunch',school_dropoff:'School drop-off',return:'Heading home',delivery:'Making a delivery',night_delivery:'Night delivery run',errand:'Running errands'};
html += `<p>📍 Purpose: ${purposeLabels[clickedVehicle.purpose] || clickedVehicle.purpose}</p>`;
const destBuilding = G.buildings.find(b => Math.abs(b.x - clickedVehicle.destX) <= 1 && Math.abs(b.y - clickedVehicle.destY) <= 1);
html += `<p>🎯 Destination: ${destBuilding ? destBuilding.name : `(${clickedVehicle.destX}, ${clickedVehicle.destY})`}</p>`;
html += `<p>${clickedVehicle.braking ? '🔴 Braking' : '🟢 Moving'}</p>`;
if (clickedVehicle.path) {
const progress = Math.round((clickedVehicle.pathIdx / clickedVehicle.path.length) * 100);
html += `<p>📊 Trip progress: ${progress}%</p>`;
}
// Highlight home and destination
const highlightIds = [];
if (fam) {
const homeB = G.buildings.find(b => b.id === fam.houseId);
if (homeB) highlightIds.push(homeB.id);
}
if (destBuilding) highlightIds.push(destBuilding.id);
G.highlightBuildings = highlightIds;
G.highlightColor = clickedVehicle.color || '#44ff44';
showInspectPanel(content, html);
return;
}

// Check road/intersection FIRST so intersections near buildings are clickable
const roadOnTile = G.roads.get(`${x},${y}`) || G.elevatedRoads.get(`${x},${y}`);
const ctrlOnTile = G.intersections.get(`${x},${y}`);
// Check building only if no road at exact clicked tile
if (!roadOnTile && !ctrlOnTile) {
const building = G.buildings.find(b => Math.abs(b.x - x) <= 1 && Math.abs(b.y - y) <= 1);
if (building) {
if (G.tutorial) G.tutorial.inspectedBuilding = true;
let html = `<h3>${building.name}</h3><p>Type: ${building.type}${building.cuisine ? ' ('+building.cuisine+')' : ''}${building.schoolType ? ' ('+building.schoolType+')' : ''}</p>`;
const linkedBuildingIds = [];
if (building.type === 'house') {
const connected = hasNearbyRoad(building.x, building.y);
if (!connected) html += `<p style="color:#ff6666;">🏚️ <strong>No road access!</strong> Family may leave. Build a road nearby.</p>`;
if (building.abandoned && !building.vossHouse) html += `<p style="color:#ff4444;">⛔ <strong>ABANDONED</strong> — Family has left due to no road access.</p>`;
if (building.burnedDown) html += `<p style="color:#ff6644;">🔥 Burned down overnight. Cause: undetermined.</p>`;
if (building.vossHouse) {
const vossArtifacts = (G.artifactsFound||[]).filter(a=>a.startsWith('voss_')).length;
if (vossArtifacts >= 4) {
html += `<p style="color:#998877;font-style:italic;">Status: <strong>Retained</strong>. Daily commute data shows one trip: to the eastern mountain and back. Every day. Same route. Into the tunnels.</p>`;
html += `<p style="color:#776655;font-style:italic;font-size:10px;">Raymond. Retired. Enjoys long walks. Says this is the only place he's ever felt truly at home. Doesn't remember much before arriving here. Doesn't mind.</p>`;
html += `<p style="color:#556677;font-style:italic;font-size:10px;">A neighbor reports: "He comes home smelling like stone dust. His hands are warm, even in winter. If you tunnel deep enough, you might run into him."</p>`;
} else {
html += `<p style="color:#998877;font-style:italic;">Status: Vacant. Previous occupant: Commissioner Raymond Voss. Relocated 18 months ago.</p>`;
}
}
const families = G.families.filter(f => f.houseId === building.id);
if (families.length === 0) html += `<p style="color:#888;">No families assigned yet.</p>`;
families.forEach(fam => {
html += `<p style="margin-top:8px;color:#d4a574;"><strong>The ${fam.lastName} Family</strong></p>`;
if (fam.loreNote) html += `<p style="color:#998877;font-style:italic;font-size:11px;">${fam.loreNote}</p>`;
fam.members.forEach(m => {
if (m.role === 'adult') {
const wp = G.buildings.find(b => b.id === m.workplaceId);
html += `<p>👤 <strong>${m.name}</strong>`;
html += `<br>&nbsp;&nbsp;🏢 Works at: <strong>${wp ? wp.name : '<em>Unemployed</em>'}</strong>`;
html += m.nightShift ? ' <span class="trait">🌙 Night Shift</span>' : ' <span class="trait">☀️ Day Shift</span>';
html += `<br>&nbsp;&nbsp;${m.onStrike ? '✊ ON STRIKE (toll roads)' : m.atWork ? '✅ Currently at work' : '🏠 At home'}`;
const paidRoadLabels = ['Always uses paid roads','Uses paid if traffic','Sometimes uses paid','Never uses paid'];
const paidParkLabels = ['Always uses paid parking','Uses paid if lot full','Never uses paid parking'];
html += `<br><span class="trait">🛣 ${paidRoadLabels[m.paidRoadTrait]}</span>`;
html += `<span class="trait">🅿 ${paidParkLabels[m.paidParkingTrait]}</span>`;
html += '</p>';
if (m.workplaceId) linkedBuildingIds.push(m.workplaceId);
} else {
const school = G.buildings.find(b => b.id === m.schoolId);
html += `<p>👦 <strong>${m.name}</strong> — Age ${m.age}`;
html += `<br>&nbsp;&nbsp;🏫 Attends: <strong>${school ? school.name : '<em>No school assigned</em>'}</strong>`;
html += '</p>';
if (m.schoolId) linkedBuildingIds.push(m.schoolId);
}
});
});
G.highlightBuildings = [...new Set(linkedBuildingIds)];
G.highlightColor = '#44aaff';
} else if (building.type === 'office') {
G.commuteZoneCenter = {x: building.x, y: building.y};
const employees = [];
G.families.forEach(f => {
f.members.forEach(m => {
if (m.role === 'adult' && m.workplaceId === building.id) {
employees.push({name: m.name, familyName: f.lastName, houseId: f.houseId, atWork: m.atWork});
if (f.houseId) linkedBuildingIds.push(f.houseId);
}
});
});
html += `<p>Employees: ${employees.length}/${building.capacity}</p>`;
html += `<p>Weekly Revenue: $${Math.floor(building.weekRevenue || 0)}</p>`;
if (OFFICE_LORE[building.name]) {
html += `<p style="color:#a89070;font-style:italic;font-size:11px;margin-top:4px;">${OFFICE_LORE[building.name]}</p>`;
}
if (building.entityNode && G.artifactsFound && G.artifactsFound.length >= 5) {
html += `<p style="color:#776655;font-style:italic;font-size:10px;">This building\'s revenue never drops, no matter how bad traffic gets. No explanation given.</p>`;
}
if (employees.length > 0) {
html += `<p style="margin-top:6px;color:#a89070;"><strong>Employees:</strong></p>`;
employees.forEach(e => {
html += `<p>&nbsp;👤 ${e.name} (${e.familyName}) ${e.atWork ? '✅' : '🏠'}</p>`;
});
}
G.highlightBuildings = [...new Set(linkedBuildingIds)];
G.highlightColor = '#ff9944';
} else if (building.type === 'restaurant') {
G.commuteZoneCenter = {x: building.x, y: building.y};
html += `<p>Cuisine: ${building.cuisine}</p>`;
if (building.loreOwner) html += `<p>Owner: ${building.loreOwner}</p>`;
html += `<p>Capacity: ${building.capacity}</p>`;
html += `<p>Weekly Revenue: $${building.fixedRevenue ? building.fixedRevenue.toLocaleString() : Math.floor(building.weekRevenue || 0)}</p>`;
const rl = RESTAURANT_LORE[building.name];
if (rl) {
html += `<p style="color:#a89070;font-style:italic;font-size:11px;margin-top:4px;">${rl.desc}</p>`;
if (G.artifactsFound && G.artifactsFound.length >= 3) {
html += `<p style="color:#776655;font-style:italic;font-size:10px;">${rl.dark}</p>`;
}
} else if (RESTAURANT_LORE_GENERIC[building.name]) {
html += `<p style="color:#a89070;font-style:italic;font-size:11px;margin-top:4px;">${RESTAURANT_LORE_GENERIC[building.name]}</p>`;
}
if (building.storageB) {
html += `<p style="color:#665544;font-size:10px;margin-top:4px;">Storage B — Private. Not for public access. Weekly: $${building.storageBRevenue}</p>`;
}
} else if (building.type === 'school') {
const students = [];
G.families.forEach(f => {
f.members.forEach(m => {
if (m.role === 'child' && m.schoolId === building.id) {
students.push({name: m.name, familyName: f.lastName, houseId: f.houseId, age: m.age});
if (f.houseId) linkedBuildingIds.push(f.houseId);
}
});
});
html += `<p>Type: ${building.schoolType}</p>`;
html += `<p>Students: ${students.length}/${building.capacity}</p>`;
if (students.length > 0) {
html += `<p style="margin-top:6px;color:#a89070;"><strong>Students:</strong></p>`;
students.forEach(s => {
html += `<p>&nbsp;👦 ${s.name} (${s.familyName}), age ${s.age}</p>`;
});
}
G.highlightBuildings = [...new Set(linkedBuildingIds)];
G.highlightColor = '#ffdd44';
} else if (building.type === 'bank') {
const employees = [];
G.families.forEach(f => {
f.members.forEach(m => {
if (m.role === 'adult' && m.workplaceId === building.id) {
employees.push({name: m.name, familyName: f.lastName});
}
});
});
html += `<p>Employees: ${employees.length}/${building.capacity}</p>`;
html += `<p>Loans Issued: ${building.loansTaken || 0}</p>`;
const connected = hasNearbyRoad(building.x, building.y);
if (!connected) {
html += `<p style="color:#ff6666;">🏚️ <strong>No road access!</strong> Bank cannot offer loans.</p>`;
} else {
const activeLoans = G.loans.length;
html += `<p style="margin-top:10px;color:#d4a574;"><strong>💰 Get a Loan</strong>${activeLoans>=3?' <span style="color:#cf6679;">(Max 3 loans reached)</span>':''}</p>`;
const loanOptions = [
{label:'Small',amount:2000,weeks:10},
{label:'Medium',amount:5000,weeks:15},
{label:'Large',amount:10000,weeks:20}
];
loanOptions.forEach(opt => {
const weekly = Math.ceil(opt.amount * (1 + LOAN_INTEREST_RATE) / opt.weeks);
const total = weekly * opt.weeks;
const disabled = activeLoans >= 3;
html += `<button class="menu-btn${disabled?' secondary':''}" style="padding:5px 10px;font-size:11px;margin:3px;width:100%;text-align:left;${disabled?'opacity:0.5;cursor:not-allowed;':''}" ${disabled?'disabled':''}onclick="takeLoan(${opt.amount},${opt.weeks},${building.id})">`;
html += `${opt.label}: $${opt.amount.toLocaleString()} — $${weekly}/wk for ${opt.weeks} wks (total: $${total.toLocaleString()})`;
html += `</button>`;
});
}
if (G.loans.length > 0) {
html += `<p style="margin-top:10px;color:#d4a574;"><strong>📋 Active Loans</strong></p>`;
G.loans.forEach((loan, i) => {
html += `<p style="font-size:11px;">Loan ${i+1}: $${loan.remaining.toLocaleString()} remaining — $${loan.weeklyPayment}/wk — ${loan.weeksLeft} wks left</p>`;
});
}
}
showInspectPanel(content, html);
return;
}
} // end if (!roadOnTile && !ctrlOnTile)
// Check road or intersection
const road = G.roads.get(`${x},${y}`) || G.elevatedRoads.get(`${x},${y}`);
const ctrl = G.intersections.get(`${x},${y}`);
if (road || ctrl) {
let html = '';
if (road) {
const typeLabels = {road_1lane:'Dirt Road',road_2lane:'Two-Lane Road',road_oneway:'One-Way Road',road_multi:'Multi-Lane Road',road_highway:'Highway',road_flyover:'Flyover',road_tunnel:'Tunnel',paid_2lane:'Paid Two-Lane',paid_multi:'Paid Multi-Lane',paid_highway:'Paid Highway'};
html += `<h3>${road.name || 'Road'}</h3>`;
html += `<p>Type: ${typeLabels[road.type] || road.type}</p>`;
// Health & breakdown chance
const age = G.day - (road.placedDay || 1);
const baseChance = BREAKDOWN_CHANCE[G.upkeepTier];
const ageMultiplier = 1 + (age / 100); // older roads break more
const breakdownPct = Math.min(99, (baseChance * ageMultiplier * 30 * 100)).toFixed(1);
const healthPct = Math.max(1, 100 - parseFloat(breakdownPct) * 2).toFixed(0);
const healthColor = healthPct > 70 ? '#88dd88' : healthPct > 40 ? '#ffaa44' : '#ff5544';
html += `<p>🔧 Health: <span style="color:${healthColor};font-weight:bold;">${healthPct}%</span></p>`;
html += `<p>⚡ Breakdown risk: ${breakdownPct}%/day</p>`;
html += `<p>📅 Age: ${age} days</p>`;
html += `<p>🚗 Capacity: ${ROAD_CAPACITY[road.type] || 4} vehicles</p>`;
const effectMPH = getRoadEffectiveMPH(road);
const maxMPH = Math.round(30 * (ROAD_SPEED[road.type] || 1));
const crashPct = getSpeedCrashChance(effectMPH);
html += `<p>💨 Speed: ${Math.round(effectMPH)} mph${road.speedLimitMPH && effectMPH < maxMPH ? ' (limit '+road.speedLimitMPH+', max '+maxMPH+')' : ''}${crashPct > 0 ? ' ⚠ Crash risk: '+(crashPct*100).toFixed(0)+'%' : ''}</p>`;
// Per-road speed limit control for one-way roads
if (road.type === 'road_oneway') {
const slBtnStyle = 'padding:3px 8px;font-size:10px;margin:2px;';
html += `<p style="margin-top:4px;">🚦 Speed Limit:</p>`;
for (const spd of [30, 45, 60, 80, 100, 120]) {
const active = (road.speedLimitMPH || 60) === spd;
html += `<button class="menu-btn${active?' secondary':''}" style="${slBtnStyle}" onclick="setRoadSpeedLimit(${x},${y},${spd})">${spd} mph</button>`;
}
html += `<p style="font-size:10px;color:#cc8844;margin-top:3px;">⚠ Crash risk rises exponentially over 60 mph</p>`;
}
if (road.paid) {
const tollAmounts = [0, 2, 5, 10];
html += `<p style="color:#ffcc44;">💰 Toll: $${tollAmounts[road.tollTier || 1]}/vehicle</p>`;
html += `<p>📊 Total toll revenue: $${Math.floor(road.tollRevenue || 0)}</p>`;
html += `<p style="margin-top:4px;">Set toll tier:</p>`;
const tBtnStyle = 'padding:3px 10px;font-size:10px;margin:2px;';
html += `<button class="menu-btn${road.tollTier===1?' secondary':''}" style="${tBtnStyle}" onclick="setTollTier(${x},${y},1)">$2</button>`;
html += `<button class="menu-btn${road.tollTier===2?' secondary':''}" style="${tBtnStyle}" onclick="setTollTier(${x},${y},2)">$5</button>`;
html += `<button class="menu-btn${road.tollTier===3?' secondary':''}" style="${tBtnStyle}" onclick="setTollTier(${x},${y},3)">$10</button>`;
}
if (road.oneWayDir) {
const dirNames = {'0,-1':'North','0,1':'South','1,0':'East','-1,0':'West'};
html += `<p>➡ One-Way: ${dirNames[road.oneWayDir.dx+','+road.oneWayDir.dy] || '?'}</p>`;
}
if (road.type === 'road_flyover') html += `<p>🏗 Flyover — elevated overpass, no intersections with ground roads</p>`;
if (road.bridge) html += `<p>🌉 Bridge — spans water/terrain</p>`;
if (road.type === 'road_tunnel') html += `<p>🕳 Tunnel — passes through mountain</p>`;
if (road.type.includes('highway')) {
const extendCost = (road.elevation || 0) === 0 ? HIGHWAY_EXTEND_COST_GROUND : HIGHWAY_EXTEND_COST;
html += `<p>📐 Elevation: <strong>${road.elevation === 1 ? 'Elevated' : 'Ground Level'}</strong> — $${extendCost}/tile extend</p>`;
const elevBtnStyle = 'padding:4px 12px;font-size:11px;margin:3px;';
html += `<button class="menu-btn" style="${elevBtnStyle}" onclick="toggleHighwayElevation('${x},${y}')">${road.elevation === 1 ? '⬇ Lower to Ground' : '⬆ Raise to Elevated'}</button>`;
}
if (road.breakdown) html += `<p style="color:#cf6679;">⚠ BREAKDOWN — ${road.blocking ? 'BLOCKED' : 'Slowed'}</p>`;
}
// Find the best intersection tile: this tile, or check adjacent tiles
let bestIx = x, bestIy = y;
let bestCtrl = ctrl;
// Count road neighbors on THIS tile
const dirs2 = [[0,-1],[0,1],[-1,0],[1,0]];
let roadNeighbors = 0;
for (const [dx, dy] of dirs2) { if (G.roads.has(`${x+dx},${y+dy}`) || G.elevatedRoads.has(`${x+dx},${y+dy}`)) roadNeighbors++; }
// If this tile doesn't have a control, check adjacent tiles for existing intersections
if (!bestCtrl) {
for (const [dx, dy] of dirs2) {
const nk = `${x+dx},${y+dy}`;
if (G.intersections.has(nk)) {
bestIx = x+dx; bestIy = y+dy;
bestCtrl = G.intersections.get(nk);
break;
}
}
}
// Show traffic controls if: this tile is an intersection (3+ neighbors), OR already has a control, OR adjacent to one
const isIntersection = roadNeighbors >= 3;
if (bestCtrl || isIntersection) {
// For new intersection controls, place on THIS tile if it has 3+ neighbors
if (!bestCtrl && isIntersection) { bestIx = x; bestIy = y; }
const currentType = bestCtrl ? bestCtrl.type : 'none';
const currentStopDirs = bestCtrl ? (bestCtrl.stopDirs || {N:true,S:true,E:true,W:true}) : {N:true,S:true,E:true,W:true};
html += `<p style="margin-top:8px;color:#d4a574;"><strong>🚦 Traffic Control</strong> (${currentType})</p>`;
const btnStyle = 'padding:5px 12px;font-size:11px;margin:3px;';
html += `<button class="menu-btn${currentType==='none'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'none')">❌ None</button>`;
html += `<button class="menu-btn${currentType==='stop'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'stop')">🛑 Stop Sign</button>`;
html += `<button class="menu-btn${currentType==='light'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'light')">🚦 Traffic Light ($50)</button>`;
html += `<button class="menu-btn${currentType==='roundabout'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'roundabout')">🔄 Roundabout ($80)</button>`;
// Stop sign count options (only when stop sign is selected)
if (currentType === 'stop') {
html += `<p style="margin-top:6px;color:#a89070;font-size:11px;"><strong>Stop Sign Directions:</strong></p>`;
const sBtnStyle = 'padding:3px 10px;font-size:10px;margin:2px;min-width:40px;';
const dirLabels = {N:'⬆ N', S:'⬇ S', E:'➡ E', W:'⬅ W'};
const dirOffsets = {N:[0,-1], S:[0,1], E:[1,0], W:[-1,0]};
for (const dir of ['N','S','E','W']) {
const [dx,dy] = dirOffsets[dir];
const hasRoad = G.roads.has(`${bestIx+dx},${bestIy+dy}`) || G.elevatedRoads.has(`${bestIx+dx},${bestIy+dy}`);
if (!hasRoad) continue;
const active = currentStopDirs[dir];
html += `<button class="menu-btn${active?' secondary':''}" style="${sBtnStyle}${active?'':'opacity:0.5;'}" onclick="toggleStopDir(${bestIx},${bestIy},'${dir}')">${dirLabels[dir]}${active?' 🛑':''}</button>`;
}
}
} else if (road) {
// Not an intersection — show hint about where to add controls
html += `<p style="margin-top:6px;color:#888;font-size:11px;">Tip: Traffic controls can be added at intersections (3+ connecting roads)</p>`;
}
showInspectPanel(content, html);
return;
}
// Check parking lot
const parking = G.parkingLots.find(p => Math.abs(p.x - x) <= 1 && Math.abs(p.y - y) <= 1);
if (parking) {
let html = `<h3>Parking Lot</h3>`;
html += `<p>Capacity: ${parking.used}/${parking.capacity}</p>`;
html += `<p>${parking.paid ? 'PAID — Tier '+parking.tier : 'FREE'}</p>`;
html += `<p>Road connections: ${parking.connectedSides && parking.connectedSides.length > 0 ? parking.connectedSides.join(', ') : 'None'}</p>`;
if (parking.playerBuilt) {
html += `<button class="menu-btn" style="padding:5px 10px;font-size:11px;margin:3px;" onclick="setParkingTier(${parking.x},${parking.y},0)">Free</button>`;
html += `<button class="menu-btn" style="padding:5px 10px;font-size:11px;margin:3px;" onclick="setParkingTier(${parking.x},${parking.y},1)">$2/use</button>`;
html += `<button class="menu-btn" style="padding:5px 10px;font-size:11px;margin:3px;" onclick="setParkingTier(${parking.x},${parking.y},2)">$5/use</button>`;
html += `<button class="menu-btn" style="padding:5px 10px;font-size:11px;margin:3px;" onclick="setParkingTier(${parking.x},${parking.y},3)">$10/use</button>`;
}
showInspectPanel(content, html);
return;
}
// Check water tiles for lake artifacts
const terrain = (y >= 0 && y < MAP_H && x >= 0 && x < MAP_W) ? G.terrain[y][x] : -1;
if (terrain === 1 || terrain === 3 || terrain === 4) {
const found = tryLakeArtifact(x, y);
if (!found) {
let html = '<h3>Water</h3>';
const lakeName = G.terrainNames.find(tn => (tn.type === 'lake' || tn.type === 'river') && Math.abs(tn.x - x) < 8 && Math.abs(tn.y - y) < 8);
if (lakeName) {
html += `<p>${lakeName.name}</p>`;
if (TERRAIN_LORE[lakeName.name]) html += `<p style="color:#a89070;font-style:italic;font-size:11px;margin-top:4px;">${TERRAIN_LORE[lakeName.name]}</p>`;
}
html += '<p style="color:#6699bb;">Click water tiles to search for artifacts...</p>';
showInspectPanel(content, html);
return;
}
} else if (terrain === 2) {
const mtnName = G.terrainNames.find(tn => tn.type === 'mountain' && Math.abs(tn.x - x) < 8 && Math.abs(tn.y - y) < 8);
if (mtnName) {
let html = `<h3>⛰️ ${mtnName.name}</h3>`;
if (TERRAIN_LORE[mtnName.name]) html += `<p style="color:#a89070;font-style:italic;font-size:11px;margin-top:4px;">${TERRAIN_LORE[mtnName.name]}</p>`;
html += `<p style="color:#998877;font-size:11px;margin-top:4px;">Build tunnels through mountains to discover artifacts.</p>`;
showInspectPanel(content, html);
return;
}
}
panel.style.display = 'none';
G.highlightBuildings = [];
}

function setIntersection(x, y, type) {
const key = `${x},${y}`;
// Block stop signs on highways
if (type === 'stop') {
const tileRoad = G.roads.get(key) || G.elevatedRoads.get(key);
if (tileRoad && (tileRoad.type.includes('highway') || tileRoad.multiLaneGroup)) {
showNotification('🚫 Stop signs cannot be placed on highways or multi-lane roads!');
return;
}
}
const existing = G.intersections.get(key);
if (type === 'light' && G.mode !== 'creative') {
if (G.money < 50) { showNotification('Not enough money!'); return; }
G.money -= 50;
} else if (type === 'roundabout' && G.mode !== 'creative') {
if (G.money < 80) { showNotification('Not enough money!'); return; }
G.money -= 80;
}
if (type === 'none') {
G.intersections.delete(key);
showNotification('Traffic control removed');
} else {
G.intersections.set(key, {type, stopDirs: {N:true,S:true,E:true,W:true}, greenAxis: 'NS', timer: 0});
const labels = {stop: '🛑 Stop sign placed', light: '🚦 Traffic light installed', roundabout: '🔄 Roundabout built'};
showNotification(labels[type] || 'Traffic control updated');
}
document.getElementById('infoPanel').style.display = 'none';
}

function showTrafficControl(x, y) {
const panel = document.getElementById('infoPanel');
const content = document.getElementById('infoContent');
G.highlightBuildings = [];
let html = '';
const road = G.roads.get(`${x},${y}`) || G.elevatedRoads.get(`${x},${y}`);
const ctrl = G.intersections.get(`${x},${y}`);
// Find best intersection tile
let bestIx = x, bestIy = y;
let bestCtrl = ctrl;
const dirs2 = [[0,-1],[0,1],[-1,0],[1,0]];
let roadNeighbors = 0;
for (const [dx, dy] of dirs2) { if (G.roads.has(`${x+dx},${y+dy}`) || G.elevatedRoads.has(`${x+dx},${y+dy}`)) roadNeighbors++; }
if (!bestCtrl) {
for (const [dx, dy] of dirs2) {
const nk = `${x+dx},${y+dy}`;
if (G.intersections.has(nk)) { bestIx = x+dx; bestIy = y+dy; bestCtrl = G.intersections.get(nk); break; }
}
}
const isIntersection = roadNeighbors >= 3;
if (bestCtrl || isIntersection) {
if (!bestCtrl && isIntersection) { bestIx = x; bestIy = y; }
const currentType = bestCtrl ? bestCtrl.type : 'none';
const currentStopDirs = bestCtrl ? (bestCtrl.stopDirs || {N:true,S:true,E:true,W:true}) : {N:true,S:true,E:true,W:true};
html += `<h3>🚦 Traffic Control</h3><p>Current: ${currentType}</p>`;
const btnStyle = 'padding:5px 12px;font-size:11px;margin:3px;';
html += `<button class="menu-btn${currentType==='none'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'none')">❌ None</button>`;
html += `<button class="menu-btn${currentType==='stop'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'stop')">🛑 Stop Sign</button>`;
html += `<button class="menu-btn${currentType==='light'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'light')">🚦 Traffic Light ($50)</button>`;
html += `<button class="menu-btn${currentType==='roundabout'?' secondary':''}" style="${btnStyle}" onclick="setIntersection(${bestIx},${bestIy},'roundabout')">🔄 Roundabout ($80)</button>`;
if (currentType === 'stop') {
html += `<p style="margin-top:6px;color:#a89070;font-size:11px;"><strong>Stop Sign Directions:</strong></p>`;
const sBtnStyle = 'padding:3px 10px;font-size:10px;margin:2px;min-width:40px;';
const dirLabels = {N:'⬆ N', S:'⬇ S', E:'➡ E', W:'⬅ W'};
const dirOffsets = {N:[0,-1], S:[0,1], E:[1,0], W:[-1,0]};
for (const dir of ['N','S','E','W']) {
const [ddx,ddy] = dirOffsets[dir];
const hasRoad = G.roads.has(`${bestIx+ddx},${bestIy+ddy}`) || G.elevatedRoads.has(`${bestIx+ddx},${bestIy+ddy}`);
if (!hasRoad) continue;
const active = currentStopDirs[dir];
html += `<button class="menu-btn${active?' secondary':''}" style="${sBtnStyle}${active?'':'opacity:0.5;'}" onclick="toggleStopDir(${bestIx},${bestIy},'${dir}')">${dirLabels[dir]}${active?' 🛑':''}</button>`;
}
}
} else if (road) {
html += `<h3>🚦 Traffic Control</h3>`;
html += `<p style="color:#888;font-size:11px;">Tip: Traffic controls can be added at intersections (3+ connecting roads)</p>`;
// Highway lonely lane detection: offer to add parallel lane
if (road.type && road.type.includes('highway') && road.oneWayDir) {
const owd = road.oneWayDir;
// Perpendicular offsets (both sides)
const perps = owd.dx !== 0 ? [[0,-1],[0,1]] : [[-1,0],[1,0]];
const hasParallel = perps.some(([pdx,pdy]) => {
const nr = G.elevatedRoads.get(`${x+pdx},${y+pdy}`);
return nr && nr.type && nr.type.includes('highway');
});
if (!hasParallel) {
html += `<p style="margin-top:8px;color:#d4a574;font-size:11px;font-weight:bold;">⚠️ This highway has no parallel lane.</p>`;
perps.forEach(([pdx,pdy]) => {
const label = pdx === 0 ? (pdy < 0 ? 'North' : 'South') : (pdx < 0 ? 'West' : 'East');
html += `<button class="menu-btn secondary" style="padding:5px 12px;font-size:11px;margin:3px;" onclick="addHighwayParallelLane(${x},${y},${pdx},${pdy})">➕ Add Parallel Lane (${label})</button>`;
});
}
}
} else {
html += `<h3>🚦 Traffic Control</h3>`;
html += `<p style="color:#888;font-size:11px;">No road here. Click on a road intersection to manage traffic controls.</p>`;
}
showInspectPanel(content, html);
}

function updateSearchSuggestions() {
const input = document.getElementById('searchBar');
const dropdown = document.getElementById('searchDropdown');
const query = (input.value || '').trim().toLowerCase();
if (!query || !G) { dropdown.style.display = 'none'; searchResults = []; searchHighlight = -1; return; }
const results = [];
const typeIcons = {house:'🏠',office:'🏢',restaurant:'🍽️',school:'🏫',bank:'🏦'};
// Buildings
G.buildings.forEach(b => {
if (results.length >= 8) return;
if (b.name && b.name.toLowerCase().includes(query)) {
results.push({type:'building',label:b.name,sublabel:b.type+(b.cuisine?' ('+b.cuisine+')':''),icon:typeIcons[b.type]||'🏗️',targetX:b.x,targetY:b.y,buildingId:b.id});
}
});
// Families
if (results.length < 8) {
G.families.forEach(f => {
if (results.length >= 8) return;
if (f.lastName.toLowerCase().includes(query)) {
const house = G.buildings.find(b => b.id === f.houseId);
results.push({type:'family',label:'The '+f.lastName+' Family',sublabel:house?house.name:'',icon:'👨‍👩‍👧',targetX:house?house.x:0,targetY:house?house.y:0,buildingId:house?house.id:null});
}
});
}
// People
if (results.length < 8) {
G.families.forEach(f => {
f.members.forEach(m => {
if (results.length >= 8) return;
if (m.name && m.name.toLowerCase().includes(query)) {
const house = G.buildings.find(b => b.id === f.houseId);
results.push({type:'person',label:m.name,sublabel:f.lastName+' family',icon:'👤',targetX:house?house.x:0,targetY:house?house.y:0,buildingId:house?house.id:null});
}
});
});
}
searchResults = results;
searchHighlight = -1;
if (results.length === 0) { dropdown.style.display = 'none'; return; }
dropdown.style.display = 'block';
dropdown.innerHTML = results.map((r, i) => {
const boldLabel = boldMatch(r.label, query);
return `<div onmousedown="selectSearchResult(${i})" style="padding:6px 10px;cursor:pointer;font-size:12px;color:#e8d5b7;border-bottom:1px solid rgba(232,213,183,0.1);display:flex;align-items:center;gap:6px;${i===searchHighlight?'background:rgba(232,213,183,0.15);':''}" onmouseenter="this.style.background='rgba(232,213,183,0.12)'" onmouseleave="this.style.background='${i===searchHighlight?'rgba(232,213,183,0.15)':''}'">${r.icon} <span>${boldLabel}<br><span style="font-size:10px;color:#a89070;">${r.sublabel}</span></span></div>`;
}).join('');
}

function showSettings() {
document.getElementById('settingsModal').style.display = 'block';
document.getElementById('overlay').style.display = 'block';
if (G && G.speed !== 0) {
speedBeforeSettings = G.speed;
setSpeed(0);
}
}

function showTutorial() {
tutorialPage = 0;
tutorialFromMenu = !G;
if (tutorialFromMenu) {
document.getElementById('mainMenu').style.display = 'none';
}
document.getElementById('tutorialModal').style.display = 'block';
document.getElementById('overlay').style.display = 'block';
if (G && G.speed !== 0) { speedBeforeSettings = G.speed; setSpeed(0); }
renderTutorialPage();
}

function renderTutorialPage() {
const page = TUTORIAL_PAGES[tutorialPage];
const body = page.body.replace(/\n/g, '<br>');
document.getElementById('tutorialContent').innerHTML =
`<div class="tut-page-icon">${page.icon}</div>` +
`<div class="tut-title">${page.title}</div>` +
`<div class="tut-body">${body}</div>` +
`<div class="tut-hint">${page.hint}</div>`;
document.getElementById('tutPageIndicator').textContent = `${tutorialPage + 1} / ${TUTORIAL_PAGES.length}`;
document.getElementById('tutPrevBtn').disabled = tutorialPage === 0;
document.getElementById('tutNextBtn').textContent = tutorialPage === TUTORIAL_PAGES.length - 1 ? 'Close ✓' : 'Next →';
}

function openLoreJournal(tab) {
if (!G) return;
if (tab) journalCurrentTab = tab;
// Sync geography from terrainNames
if (G.terrainNames && G.terrainNames.length > 0) {
G.terrainNames.forEach(tn => {
const desc = tn.name ? `${tn.name} (${tn.type || 'landmark'})` : `${tn.type || 'landmark'}`;
addToJournal('geography', desc);
});
}
// Generate founding history if empty
if (G.loreJournal.history.length === 0) {
addToJournal('history', 'You have been appointed Transport Commissioner. The previous commissioner disappeared under unclear circumstances. Nobody talks about it.');
if (G.day > 7) addToJournal('history', `By week ${Math.floor(G.day/7)}, the town had ${G.buildings.length} buildings and ${G.roads.size} roads.`);
}
// Ensure mysteryBoard exists (backward compat)
if (!G.mysteryBoard) G.mysteryBoard = { pinnedEntries:[], connections:[], solvedDeductions:[], failedAttempts:{}, revealedCollections:{}, unlockedBonusLore:[] };
const modal = document.getElementById('loreJournal');
let html = '<h2>Lore Journal</h2>';
// Tab bar
html += '<div class="journal-tabs">';
html += `<div class="journal-tab ${journalCurrentTab==='journal'?'active':''}" onclick="openLoreJournal('journal')">📖 Journal</div>`;
html += `<div class="journal-tab ${journalCurrentTab==='collections'?'active':''}" onclick="openLoreJournal('collections')">🔖 Collections</div>`;
html += `<div class="journal-tab ${journalCurrentTab==='mystery'?'active':''}" onclick="openLoreJournal('mystery')">🔍 Mystery Board</div>`;
html += '</div>';
if (journalCurrentTab === 'journal') html += renderJournalTab();
else if (journalCurrentTab === 'collections') html += renderCollectionsTab();
else html += renderMysteryBoardTab();
html += '<button class="menu-btn" onclick="closeLoreJournal()" style="padding:8px 20px;font-size:13px;margin-top:10px;width:100%;">Close</button>';
modal.innerHTML = html;
modal.style.display = 'block';
document.getElementById('overlay').style.display = 'block';
// Mark all as read when viewing journal tab
if (journalCurrentTab === 'journal') {
const categories = ['legends','discoveries','geography','history'];
for (const key of categories) {
(G.loreJournal[key] || []).forEach(e => e.isNew = false);
}
}
if (G && G.speed !== 0) {
speedBeforeSettings = G.speed;
setSpeed(0);
}
}

function renderJournalTab() {
const categories = [
{ key: 'legends', label: 'Legends & Lore', icon: '📜' },
{ key: 'discoveries', label: 'Artifacts & Discoveries', icon: '💎' },
{ key: 'geography', label: 'Geography', icon: '🗺️' },
{ key: 'history', label: 'History & Events', icon: '📖' }
];
const mb = G.mysteryBoard;
let html = '';
for (const cat of categories) {
const entries = G.loreJournal[cat.key] || [];
html += `<div class="journal-category"><h3>${cat.icon} ${cat.label}<span class="count">(${entries.length})</span></h3>`;
if (entries.length === 0) {
html += '<div class="empty-category">No entries yet...</div>';
} else {
for (let ei = 0; ei < entries.length; ei++) {
const e = entries[ei];
const cls = e.isNew ? 'journal-entry new-entry' : 'journal-entry';
// Collection badges: hidden unless revealed
const colBadges = (e.collections || []).map(c => {
const m = COLLECTION_META[c];
if (!m) return '';
const revealed = mb.revealedCollections[e.text] && mb.revealedCollections[e.text].includes(c);
if (revealed) {
return `<span class="collection-revealed">${m.icon} ${m.label}</span>`;
} else {
return `<span class="collection-hidden">🔒 ???</span>`;
}
}).join('');
// Pin button — use category key + index to avoid quote-escaping issues in onclick
const isPinned = mb.pinnedEntries.some(p => p.text === e.text);
const pinCls = isPinned ? 'pin-btn pinned' : 'pin-btn';
const pinBtn = `<span class="${pinCls}" onclick="event.stopPropagation();togglePinEntryByIndex('${cat.key}',${ei})" title="${isPinned?'Unpin from Mystery Board':'Pin to Mystery Board'}">📌</span>`;
html += `<div class="${cls}"><span class="entry-day">Day ${e.day}</span>${e.text}${colBadges}${pinBtn}</div>`;
}
}
html += '</div>';
}
return html;
}

function renderCollectionsTab() {
const mb = G.mysteryBoard;
const colKeys = Object.keys(COLLECTION_META);
// Compute the true total size of each collection from the full artifact/deduction pools
const collectionPoolSize = {};
for (const key of colKeys) collectionPoolSize[key] = 0;
const allArtifacts = [...(ARTIFACT_POOL.ground || []), ...(ARTIFACT_POOL.mountain || []), ...(ARTIFACT_POOL.lake || [])];
for (const art of allArtifacts) {
if (art.collections) art.collections.forEach(c => { if (collectionPoolSize[c] !== undefined) collectionPoolSize[c]++; });
}
for (const ded of MYSTERY_DEDUCTIONS) {
if (ded.revealsCollections) ded.revealsCollections.forEach(c => { if (collectionPoolSize[c] !== undefined) collectionPoolSize[c]++; });
if (ded.bonusCollections) ded.bonusCollections.forEach(c => { if (collectionPoolSize[c] !== undefined) collectionPoolSize[c]++; });
}
let html = '';
for (const colKey of colKeys) {
const meta = COLLECTION_META[colKey];
const entries = G.loreCollections[colKey] || [];
// Only count entries whose collection membership has been revealed to the player
const revealedCount = entries.filter(e => mb.revealedCollections[e.text] && mb.revealedCollections[e.text].includes(colKey)).length;
const totalCount = collectionPoolSize[colKey] || 0;
html += `<div style="margin-bottom:10px;border:1px solid rgba(212,165,116,0.2);border-radius:8px;padding:8px 10px;background:rgba(232,213,183,0.04);">`;
html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;cursor:pointer;" onclick="this.parentElement.querySelector('.coll-entries').style.display=this.parentElement.querySelector('.coll-entries').style.display==='none'?'block':'none'">`;
html += `<span style="color:#d4a574;font-size:13px;font-weight:600;">${meta.icon} ${meta.label}</span>`;
html += `<span style="color:#a89070;font-size:11px;">${revealedCount}/${totalCount} revealed ▾</span>`;
html += `</div>`;
html += `<div style="font-size:11px;color:#706050;font-style:italic;margin-bottom:6px;">${meta.desc}</div>`;
// Progress bar
if (totalCount > 0) {
const pct = Math.round((revealedCount / totalCount) * 100);
html += `<div style="background:rgba(232,213,183,0.1);border-radius:4px;height:6px;margin-bottom:6px;overflow:hidden;">`;
html += `<div style="background:linear-gradient(90deg,#4e8c50,#6abf69);height:100%;width:${pct}%;border-radius:4px;transition:width 0.3s;"></div>`;
html += `</div>`;
}
html += `<div class="coll-entries" style="display:none;">`;
if (entries.length === 0) {
html += '<div class="empty-category">No entries discovered yet...</div>';
} else {
let hasUnrevealed = false;
for (const e of entries) {
const isRevealed = mb.revealedCollections[e.text] && mb.revealedCollections[e.text].includes(colKey);
if (isRevealed) {
html += `<div class="journal-entry" style="margin-bottom:3px;"><span class="entry-day">Day ${e.day}</span>${e.text}</div>`;
} else {
hasUnrevealed = true;
}
}
if (hasUnrevealed) {
html += `<div class="journal-entry" style="margin-bottom:3px;color:#504840;">🔒 <em>Solve a mystery to reveal hidden entries...</em></div>`;
}
}
html += `</div></div>`;
}
return html;
}

function renderMysteryBoardTab() {
const mb = G.mysteryBoard;
let html = '';
// --- Pinned Evidence ---
html += `<div class="journal-category"><h3>📌 Pinned Evidence<span class="count">(${mb.pinnedEntries.length})</span></h3>`;
if (mb.pinnedEntries.length === 0) {
html += '<div class="empty-category">Pin entries from the Journal tab to investigate them here...</div>';
} else {
html += '<div style="font-size:10px;color:#706050;margin-bottom:6px;">Click one card, then another to draw a connection.</div>';
for (let i = 0; i < mb.pinnedEntries.length; i++) {
const p = mb.pinnedEntries[i];
const isSelected = _boardSelectA === i;
const selCls = isSelected ? 'evidence-card selected' : 'evidence-card';
const truncText = p.text.length > 100 ? p.text.substring(0,100) + '...' : p.text;
html += `<div class="${selCls}" onclick="selectEvidence(${i})">`;
html += `<span class="unpin-btn" onclick="event.stopPropagation();unpinEntry(${i})">✕</span>`;
html += `<span style="color:#a89070;font-size:9px;">${p.category.toUpperCase()} — Day ${p.day}</span><br>${truncText}`;
html += `</div>`;
}
}
html += '</div>';
// --- Connections ---
html += `<div class="journal-category"><h3>🔗 Connections<span class="count">(${mb.connections.length})</span></h3>`;
if (mb.connections.length === 0) {
html += '<div class="empty-category">No connections yet. Select two pinned cards to link them.</div>';
} else {
for (let i = 0; i < mb.connections.length; i++) {
const c = mb.connections[i];
const tA = c.entryA.length > 40 ? c.entryA.substring(0,40)+'...' : c.entryA;
const tB = c.entryB.length > 40 ? c.entryB.substring(0,40)+'...' : c.entryB;
html += `<div class="connection-item">`;
html += `<span>"${tA}" ↔ "${tB}"</span>`;
html += `<span class="disconnect-btn" onclick="removeConnection(${i})">✕ disconnect</span>`;
html += `</div>`;
}
}
html += '</div>';
// --- Deduction Challenges ---
const available = getAvailableDeductions();
html += `<div class="journal-category"><h3>🧩 Deduction Challenges<span class="count">(${available.length} available)</span></h3>`;
if (available.length === 0 && mb.solvedDeductions.length === 0) {
html += '<div class="empty-category">Pin and connect the right evidence to unlock deduction challenges...</div>';
} else if (available.length === 0) {
html += '<div class="empty-category">No new challenges available. Keep discovering artifacts!</div>';
}
for (const ded of available) {
const fails = mb.failedAttempts[ded.id] || 0;
const stars = '★'.repeat(ded.difficulty) + '☆'.repeat(3 - ded.difficulty);
html += `<div class="deduction-card">`;
html += `<h4>🧩 Case: ${ded.id.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</h4>`;
html += `<div class="difficulty">${stars} Difficulty</div>`;
html += `<p>${ded.question}</p>`;
for (let ci = 0; ci < ded.choices.length; ci++) {
html += `<button class="deduction-choice" onclick="attemptDeduction('${escapeForAttr(ded.id)}',${ci})">${ded.choices[ci]}</button>`;
}
if (fails >= 2) {
html += `<div class="hint-text">💡 Hint: ${ded.hint}</div>`;
}
if (fails > 0 && fails < 2) {
html += `<div style="font-size:10px;color:#e07070;margin-top:4px;">${fails} failed attempt${fails>1?'s':''}. Hint available after 2.</div>`;
}
html += `</div>`;
}
html += '</div>';
// --- Solved Cases ---
if (mb.solvedDeductions.length > 0) {
html += `<div class="journal-category"><h3>✅ Solved Cases<span class="count">(${mb.solvedDeductions.length})</span></h3>`;
for (const solvedId of mb.solvedDeductions) {
const ded = MYSTERY_DEDUCTIONS.find(d => d.id === solvedId);
if (!ded) continue;
html += `<div class="deduction-solved">`;
html += `<h4>✅ ${ded.id.replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase())}</h4>`;
html += `<p>${ded.bonusLore}</p>`;
const revColls = (ded.revealsCollections || []).map(c => {
const m = COLLECTION_META[c];
return m ? `<span class="collection-revealed">${m.icon} ${m.label}</span>` : '';
}).join(' ');
if (revColls) html += `<div style="margin-top:4px;">Revealed: ${revColls}</div>`;
html += `</div>`;
}
html += '</div>';
}
return html;
}

// ===== LATE REPORT =====
let lateReportTab = 'house'; // 'house' or 'business'
let lateReportPeriod = 'day'; // 'day' or 'week'
let lateReportExpanded = {}; // keyed by id, true if expanded

function updateLateReport(period) {
if (!G) return;
const snapshot = { byHouse: [], byBusiness: [] };
const houseMap = {};
const bizMap = {};
for (const f of G.families) {
if (!f.members || f.members.length === 0) continue;
const house = G.buildings.find(b => b.id === f.houseId);
if (!house) continue;
for (const m of f.members) {
if (m.role !== 'adult' || !m.workplaceId || !m.minutesLate || m.minutesLate <= 0) continue;
const workplace = G.buildings.find(b => b.id === m.workplaceId);
if (!workplace) continue;
// By house
if (!houseMap[house.id]) houseMap[house.id] = { houseId: house.id, houseName: house.name, workers: [] };
houseMap[house.id].workers.push({ name: m.name, destName: workplace.name, destId: workplace.id, minutesLate: m.minutesLate });
// By business
if (!bizMap[workplace.id]) bizMap[workplace.id] = { bizId: workplace.id, bizName: workplace.name, workers: [] };
bizMap[workplace.id].workers.push({ name: m.name, homeName: house.name, homeId: house.id, minutesLate: m.minutesLate });
}
}
// Sort sections by total lateness descending
const sortByTotal = arr => arr.sort((a, b) => {
const ta = a.workers.reduce((s, w) => s + w.minutesLate, 0);
const tb = b.workers.reduce((s, w) => s + w.minutesLate, 0);
return tb - ta;
});
// Sort workers within each section worst first
const sortWorkers = arr => { for (const s of arr) s.workers.sort((a, b) => b.minutesLate - a.minutesLate); };
snapshot.byHouse = sortByTotal(Object.values(houseMap));
snapshot.byBusiness = sortByTotal(Object.values(bizMap));
sortWorkers(snapshot.byHouse);
sortWorkers(snapshot.byBusiness);
if (period === 'day') {
G.lateReportDay = snapshot;
// Reset week accumulator at start of new week (day 1 of each week)
if (G.day % 7 === 1) {
G.lateReportWeek = { byHouse: [], byBusiness: [] };
}
} else {
// Accumulate into week: merge workers into existing entries
const week = G.lateReportWeek;
mergeSnapshot(week.byHouse, snapshot.byHouse, 'houseId', 'houseName');
mergeSnapshot(week.byBusiness, snapshot.byBusiness, 'bizId', 'bizName');
// Re-sort after merge
sortByTotal(week.byHouse);
sortByTotal(week.byBusiness);
sortWorkers(week.byHouse);
sortWorkers(week.byBusiness);
}
// Show/hide HUD button
const btn = document.getElementById('lateReportBtn');
const hasData = G.lateReportDay.byHouse.length > 0 || G.lateReportDay.byBusiness.length > 0;
if (btn) btn.style.display = hasData ? '' : 'none';
}

function mergeSnapshot(target, source, idKey, nameKey) {
for (const entry of source) {
let existing = target.find(t => t[idKey] === entry[idKey]);
if (!existing) {
existing = { [idKey]: entry[idKey], [nameKey]: entry[nameKey], workers: [] };
target.push(existing);
}
existing.workers.push(...entry.workers);
}
}

function getBadgeClass(totalMin) {
if (totalMin > 30) return 'lr-badge lr-badge-red';
if (totalMin >= 10) return 'lr-badge lr-badge-orange';
return 'lr-badge lr-badge-yellow';
}

function jumpToBuilding(buildingId) {
if (!G) return;
const b = G.buildings.find(b => b.id === buildingId);
if (!b) return;
const iso = toISO(b.x, b.y);
G.camera.x = iso.sx;
G.camera.y = iso.sy;
}

function showLateReport() {
if (!G) return;
const panel = document.getElementById('lateReportPanel');
if (panel.style.display === 'block') { panel.style.display = 'none'; return; }
renderLateReport();
panel.style.display = 'block';
}

function closeLateReport() {
document.getElementById('lateReportPanel').style.display = 'none';
}

function setLateReportTab(tab) {
lateReportTab = tab;
renderLateReport();
}

function setLateReportPeriod(p) {
lateReportPeriod = p;
renderLateReport();
}

function toggleLateSection(id) {
lateReportExpanded[id] = !lateReportExpanded[id];
renderLateReport();
}

function renderLateReport() {
if (!G) return;
const panel = document.getElementById('lateReportPanel');
const data = lateReportPeriod === 'day' ? G.lateReportDay : G.lateReportWeek;
const list = lateReportTab === 'house' ? data.byHouse : data.byBusiness;
const idKey = lateReportTab === 'house' ? 'houseId' : 'bizId';
const nameKey = lateReportTab === 'house' ? 'houseName' : 'bizName';
let html = '<h2>⏰ Late Report</h2>';
html += '<button class="lr-close" onclick="closeLateReport()">✕ Close</button>';
// Tabs
html += '<div class="lr-tabs">';
html += `<div class="lr-tab ${lateReportTab==='house'?'active':''}" onclick="setLateReportTab('house')">By House</div>`;
html += `<div class="lr-tab ${lateReportTab==='business'?'active':''}" onclick="setLateReportTab('business')">By Business</div>`;
html += '</div>';
// Period toggle
html += '<div class="lr-toggle">';
html += `<div class="lr-toggle-btn ${lateReportPeriod==='day'?'active':''}" onclick="setLateReportPeriod('day')">Yesterday</div>`;
html += `<div class="lr-toggle-btn ${lateReportPeriod==='week'?'active':''}" onclick="setLateReportPeriod('week')">Last Week</div>`;
html += '</div>';
if (list.length === 0) {
html += '<div style="color:#6a7a5a;font-style:italic;padding:12px 0;">No late workers recorded.</div>';
} else {
for (const section of list) {
const sid = section[idKey];
const total = section.workers.reduce((s, w) => s + w.minutesLate, 0);
const expanded = !!lateReportExpanded[sid];
const badge = getBadgeClass(total);
html += '<div class="lr-section">';
html += `<div class="lr-section-hdr" onclick="toggleLateSection(${sid})">`;
html += `<span class="lr-name" onclick="event.stopPropagation();jumpToBuilding(${sid})">${section[nameKey]}</span>`;
html += `<span class="${badge}">${total}m late</span>`;
html += `<span style="color:#6a7a5a;font-size:10px;margin-left:6px;">${expanded ? '▾' : '▸'}</span>`;
html += '</div>';
if (expanded) {
html += '<div class="lr-rows">';
for (const w of section.workers) {
const wBadge = getBadgeClass(w.minutesLate);
const dest = lateReportTab === 'house' ? w.destName : w.homeName;
const destId = lateReportTab === 'house' ? w.destId : w.homeId;
html += `<div class="lr-row" onclick="jumpToBuilding(${destId})">`;
html += `<span>${w.name}</span>`;
html += `<span class="lr-arrow">→</span>`;
html += `<span>${dest}</span>`;
html += `<span style="margin-left:auto;" class="${wBadge}">${w.minutesLate}m</span>`;
html += '</div>';
}
html += '</div>';
}
html += '</div>';
}
}
panel.innerHTML = html;
}

