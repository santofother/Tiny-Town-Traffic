// lore.js — Static data declarations extracted from index.html
// These are read-only data used by the game but never modified at runtime.

const VOSS_BONUSES = [
{id:'voss_income',name:'Voss\'s Revenue Map',desc:'Voss marked optimal tax collection routes. +25% income for 30 days.',icon:'📊',durationDays:30,
 apply:(g)=>{g.vossIncomeBoost=1.25;},remove:(g)=>{g.vossIncomeBoost=1;}},
{id:'voss_tunnel',name:'Voss\'s Tunnel Charts',desc:'Voss\'s geological surveys reveal weak points. Tunnels cost 50% less for 30 days.',icon:'🗺️',durationDays:30,
 apply:(g)=>{g.vossTunnelDiscount=0.5;},remove:(g)=>{g.vossTunnelDiscount=1;}},
{id:'voss_treasure',name:'Voss\'s Hidden Cache',desc:'Voss buried emergency funds throughout the mountains. +$15,000!',icon:'💰',durationDays:0,
 apply:(g)=>{g.money+=15000;},remove:()=>{}},
{id:'voss_speed',name:'Voss\'s Bypass Routes',desc:'Voss mapped shortcuts through the network. All roads +20% speed for 30 days.',icon:'⚡',durationDays:30,
 apply:(g)=>{g.vossSpeedBoost=1.2;},remove:(g)=>{g.vossSpeedBoost=1;}},
{id:'voss_reveal',name:'Voss\'s Survey Data',desc:'Voss\'s complete survey reveals all mountain treasure locations. +50% mountain discovery rate for 30 days.',icon:'🔍',durationDays:30,
 apply:(g)=>{g.vossMiningBoost=2.0;},remove:(g)=>{g.vossMiningBoost=1;}}
];
const CUISINE_TYPES = ['Chinese','Mexican','Italian','American','Indian','Japanese','Thai','Greek','French','Ethiopian','Korean','Vietnamese'];
const FIRST_NAMES = ['Emma','Liam','Olivia','Noah','Ava','Ethan','Sophia','Mason','Isabella','James','Mia','Logan','Charlotte','Lucas','Amelia','Jack','Harper','Henry','Evelyn','Alex','Lily','Ben','Grace','Owen','Zoe','Ella','Leo','Aria','Caleb','Chloe','Wyatt','Nora','Luke','Riley','Grayson','Hazel','Izzy','Luna','Violet','Stella','Elijah','Aiden','Scarlett','Jackson','Penelope','Sebastian','Layla','Mateo','Camila','Daniel','Gianna','Michael','Aaliyah','Abigail','Samuel','Elena','David','Madelyn','Carter','Skylar','Jayden','Paisley','Julian','Savannah','Hannah','Nathan','Aurora','Dylan','Ellie','Gabriel','Naomi','Aubrey','Kai','Willow','Clara','Theodore','Ruby','Josie','Ryan','Vivian','Asher','Ivy','Levi','Emilia','Isla','Maya','Jasper','Alice','Sienna','Max','Sadie','Felix','Piper','Oscar','Freya','Miles','Blake','Parker','Quinn','Rowan','Sage','Finn','River','Jade','Nova','Iris','Pearl','Cole','Beckett','Archer','Wren','Tessa','Margot','Theo','Elliot','Mila','Brielle','Ezra','Valentina','Rose','Arthur','Daisy','August','Poppy','Atlas','Claire','Axel','Thea','Brooks','Maeve','Dean','Fiona','Grant','Lydia','Hank','Vera','Ivan','Daphne','Knox','Gemma','Rhett','Ingrid','Seth','Lena','Troy','Nina','Vince','Opal','Wesley','Pia',
// Additional names — diverse and international
'Amara','Kofi','Yusuf','Fatima','Priya','Ravi','Sanjay','Neha','Arjun','Kavya','Zara','Omar','Laila','Tariq','Nadia','Hamza','Soraya','Idris','Yasmin','Khalil','Imani','Kwame','Asha','Darius','Seren','Nneka','Tobias','Miriam','Elias','Noor','Cyrus','Leila','Rashid','Zahra','Oluseun','Adaeze','Chidi','Blessing','Emeka','Chisom','Remy','Sylvie','Marcel','Colette','Henri','Brigitte','Claude','Celeste','Renaud','Fleur','Piotr','Katarzyna','Andrzej','Zofia','Marek','Ewa','Tomasz','Agnieszka','Lars','Sigrid','Bjorn','Astrid','Erik','Freya','Gunnar','Ingrid','Dmitri','Natasha','Alexei','Oksana','Pavel','Svetlana','Boris','Irina','Kenji','Yuki','Hiroshi','Akira','Mei','Hana','Takeshi','Sakura','Ji-woo','Min-jun','Soo-yeon','Hyun','Jae','Seun','Lin','Wei','Xiao','Jing','Fang','Bao','Dong','Ying','Marco','Sofia','Lucia','Lorenzo','Valentina','Matteo','Giulia','Federico','Alessia','Enrique','Pilar','Rodrigo','Ines','Alejandro','Carmen','Diego','Lola','Rafa','Consuela','Hamish','Fiona','Alasdair','Catriona','Eoin','Siobhan','Cormac','Niamh','Declan','Aoife','Taliesin','Cerys','Rhys','Branwen','Caden','Meredith','Gwen','Emrys','Dafydd','Anwen'];

const LAST_NAMES = ['Smith','Johnson','Garcia','Martinez','Brown','Jones','Wilson','Davis','Taylor','Clark','Hall','Young','King','Wright','Hill','Scott','Green','Baker','Adams','Nelson','Carter','Mitchell','Rivera','Chen','Kim','Patel','Lopez','Lee','Walker','Robinson','Torres','Flores','Nguyen','Murphy','Stewart','Fothergill','Bennett','Brooks','Price','Reed','Cooper','Morgan','Bell','Ward','Rogers','Foster','Sanders','Ross','Powell','Long','Hughes','Diaz','Perry','Sullivan','Graham','Reynolds','Butler','Barnes','Fisher','Henderson','Coleman','Simmons','Patterson','Jordan','Hamilton','Wallace','Ellis','Harrison','Hunt','Hart','Mason','Griffin','Fox','Spencer','Wagner','Palmer','Stone','Dean','Boyd','Black','Webb','Gordon','Shaw','Burns','Warren','Fields','Oliver','Walsh','Park','Hoffman','Jensen','Dunn','Carr','Knight','Wells','Schmidt','Fuller','Harvey','Holland','Keller','May','Moran','Pearson','Quinn','Riley','Sharp','Snyder','Stephens','Tucker','Vega','West','Wolfe','Woods','York','Zimmerman',
// Additional last names — more variety and texture
'Okafor','Adeyemi','Nwosu','Eze','Obi','Mensah','Asante','Owusu','Boateng','Acheampong','Kowalski','Nowak','Wiśniewski','Wójcik','Kowalczyk','Kamińska','Lewandowski','Zielińska','Szymańska','Andersen','Johansen','Pedersen','Nilsson','Eriksson','Lindqvist','Magnusson','Bergström','Holm','Dahl','Ivanov','Petrov','Sidorov','Kuznetsov','Morozov','Volkov','Popov','Sokolov','Lebedev','Kozlov','Nakamura','Tanaka','Suzuki','Watanabe','Ito','Yamamoto','Kobayashi','Sato','Kato','Yoshida','Park','Choi','Jung','Yoon','Lim','Oh','Jang','Han','Shin','Kwon','Zhang','Wang','Li','Liu','Yang','Huang','Wu','Zhou','Xu','Sun','Romano','Ferrari','Russo','Esposito','Bianchi','Colombo','Ricci','Marino','Greco','Bruno','Fernández','González','Rodríguez','Pérez','Sánchez','Ramírez','Cruz','Reyes','Morales','Herrera','MacLeod','MacDonald','MacKenzie','Campbell','Fraser','Murray','Robertson','Stewart','McGregor','Sinclair','O\'Brien','O\'Sullivan','McCarthy','O\'Connor','Walsh','Burke','Byrne','Doyle','Dunne','Gallagher','Holloway','Ashworth','Pemberton','Whitfield','Blackwood','Wentworth','Caldwell','Hargrove','Whitmore','Alderton','Grainger','Mercer','Thorne','Hartley','Prescott','Bancroft','Whitfield','Drummond','Langford','Somerfield','Nightingale','Ravenswood','Coldwell','Marsh','Fenwick','Delacroix','Beaumont','Leclerc','Moreau','Dupont','Laurent','Rousseau','Leblanc','Garnier','Fontaine'];

const ROAD_NAME_PARTS = [
['Sunset','Maple','Oak','Pine','Cedar','Elm','Willow','River','Lake','Mountain','Valley','Forest','Meadow','Harbor','Ivory','Golden','Silver','Copper','Crystal','Amber','Sapphire','Emerald','Ruby','Diamond','Izzy\'s','Starlight','Moonbeam','Sunrise','Twilight','Birch','Chestnut','Magnolia','Cypress','Aspen','Sycamore','Hawthorn','Juniper','Redwood','Sequoia','Laurel','Cherry','Poplar','Spruce','Hemlock','Coral','Granite','Marble','Slate','Cobalt','Indigo','Orchid','Peach','Plum','Crimson','Scarlet','Azure','Sage','Fern','Clover','Bramble','Thistle','Rosewood','Briarwood','Foxglove','Primrose','Bluebell','Heather','Jasmine','Lavender','Marigold','Wisteria','Driftwood','Pebble','Sandstone','Irongate','Beacon','Lighthouse','Compass','Anchor','Windmill','Harvest',
// More road name prefixes
'Hollow','Whispering','Silent','Crooked','Winding','Old','Forgotten','Pale','Blind','Narrow','Broad','Upper','Lower','North','South','East','West','Hidden','Shaded','Barrow','Gallows','Lantern','Cinder','Frost','Ember','Ash','Thorn','Briar','Raven','Crow','Heron','Falcon','Hawk','Osprey','Badger','Fox','Otter','Hare','Wolf','Stag','Iron','Flint','Chalk','Loam','Peat','Moor','Fen','Bog','Glen','Dell','Crest','Ridge','Bluff','Knoll','Cairn','Mast','Pier','Quay','Lockwood','Sherwood','Blackthorn','Whitestone','Greenfield','Brownlow','Greystone','Redbridge','Bluefield','Goldcroft','Millstream','Highgate','Lowgate','Fargate','Thorngate','Ironbridge','Woodbridge','Stonebridge','Coldwater','Clearwater','Deepwater','Swiftwater','Darkwater','Brightwater','Saltmarsh','Sweetbriar','Sorrel','Fennel','Tansy','Yarrow','Sedge','Reed','Rush','Lichen','Moss','Flax','Gorse','Furze','Nettle','Dock','Speedwell','Teasel','Vetch','Weld','Woad','Mulberry','Quince','Damson','Sloe','Crabapple','Hazel','Walnut','Almond','Tamarind','Persimmon','Pawpaw','Tupelo','Mimosa','Catalpa','Larch','Alder','Alder','Hornbeam','Boxwood','Privet','Yew','Holly','Ivy','Vine','Briar','Brier','Tangle','Thicket','Copse','Grove','Stand','Glade','Rill','Beck','Burn','Ghyll','Force','Mere','Pool','Tarn','Loch','Fen','Carr','Mire','Swale','Holt','Shaw','Spinney','Brake','Covert','Warren','Burrow','Den','Sett','Lair','Eyrie','Roost','Perch','Hatch','Lea','Leas','Lyng','Ing','Ings','Carrs'],
['Boulevard','Avenue','Street','Drive','Lane','Way','Road','Court','Place','Circle','Path','Trail','Crossing','Ridge','Pass','Loop','Run','Bend','Row','Terrace','Parkway','Promenade','Alley','Crescent','Esplanade','Commons','Grove','Heights','Junction','Square','Landing','Hollow','Glen','Cove','Bluff','Vista','Overlook','Point','Meadows','Chase',
// More road name suffixes
'Close','Gate','Yard','Walk','Mews','Wharf','Quay','Rise','Bank','Brow','Brow','Edge','End','Nook','Reach','Drift','Garth','Garths','Haunt','Keep','Knoll','Lea','Leat','Ley','Loke','Lure','Ness','Wick','Wynd','Tye','Toft','Staith','Stile','Strand','Stray','Sward','Sway','Tarn','Toll','Top','Trod','Turn','Vale','Vane','Wend','Wold','Wood','Wray']
];
const OFFICE_NAMES = ['Pinnacle Corp','Atlas Industries','Horizon Tech','Nova Systems','Apex Solutions','Ember Analytics','Skyline Group','Zenith Partners','Summit Labs','Ironwood Co','Cascade Digital','Silverline Inc','Brightpath Ltd','Stonebridge LLC','Fothergill & Associates','Starfield Solutions','Moonrise Media','Crestview Holdings','Amber Wave Co','Vertex Global','Falcon Dynamics','Quantum Edge','Nexus Group','Prism Analytics','Cloudpeak Inc','Meridian Systems','Trident Partners','Vanguard Labs','Evergreen Corp','Redstone Tech','Sapphire Solutions','Obsidian Holdings','Crescent Digital','Wolfram Industries','Titan Works','Polaris Consulting','Keystone Ventures','Northstar Media','Cobalt Systems','Helix Innovation','Axion Partners','Blueprint Co','Driftwood LLC','Echo Dynamics','Flint Technologies','Grove Capital','Ivory Tower Inc','Juniper Analytics','Lantern Group','Nimbus Digital','Orion Solutions','Pathfinder Inc','Quill Media','Ridgeline Corp','Sequoia Partners','Tidewater LLC','Uplift Ventures','Vista Labs','Whiteoak Holdings','Bellweather & Sons','Revenant Data','Hargrove Mutual','Lattice Logistics','Osprey Maritime','Cairn Insurance','Rookwood Capital','Thornfield Legal','Bramblegate Equity','Sable Creek Timber','Ironhill Foundry','Blackthorn Research','Ashcroft & Webb','Gilded Ledger Accounting','The Moorland Group','Hawkridge Security','Verdant Holdings','Millhaven Development Corp','Stonewall Adjusters','Graycliff Architects','Pale Harbor Shipping','Aldridge & Aldridge','Fenwick Geological','Old Mill Analytics','Rowan & Hatch','Silver Basin Energy','Canopy Wealth Mgmt','Dustveil Mining','Hollow Creek Advisory','Wychwood Biotech',
// Additional office names
'Crossfield Partners','Amber Road Consulting','Greystone Capital','Thornwick & Marsh','Peregrine Logistics','Coppergate Media','Ashfield Data Systems','Barrow & Crane','Foxhaven Analytics','Coldspring Research','Harken Maritime','Wandering Pine LLC','Stillwater Consulting','Bridgemoore Finance','Darkwater Industries','Silverbell Advisory','Ironroot Technologies','Pale Moon Holdings','Oldfield & Sons','Fernwood Capital','Croftside Ventures','Brackwater Systems','Oakhurst Consulting','Ridgeback Security','Milkweed Media','Fernhaven Research','Copse & Corwin','Thatcher & Reed','Gallowgate Industries','Wren & Partners','Starling Group','Nightingale Digital','Osprey & Hatch','Cranbrook Equity','Morningfield Tech','Lakemoor Holdings','Highfield & Associates','Willowmere Consulting','Thorngate Legal','Blackwater Advisory','Cornfield Capital','Ember & Oak','Clearfield Systems','Coldwater Analytics','Ironbell Research','Duskwood Holdings','Sunfield Partners','Goldcroft Ventures','Marshfield LLC','Rookery & Associates','Greywood Capital','Fenland Partners','Ironhaven Systems','Pale Ridge Consulting','Ashwood & Webb','Stonegate Analytics','Briarfield Research','Copperwood Partners','Darkfield Systems','Ferngate Media','Hollowbell Holdings','Ironwick Consulting','Lakefield Partners','Moorgate Systems'];

const OFFICE_LORE = {
'Fothergill & Associates':'Founded by the Fothergill family in 1952. Their original filing cabinets are still in the basement — none of them have locks, but none of them open either.',
'Bellweather & Sons':'Three generations of actuaries. Their risk models are unnervingly accurate. The founder\'s son once predicted a building fire six weeks before it happened.',
'Revenant Data':'Moved into their current office in 2019. The previous tenant left overnight. Revenant found the servers still running — processing data for a client that doesn\'t exist.',
'Millhaven Development Corp':'The town\'s own development office. Every commissioner inherits a desk with a locked drawer. Nobody has the key. Nobody has tried to force it.',
'Aldridge & Aldridge':'A law firm run by the Aldridge family. Their records go back to 1923. Every partner has been named either Thomas or Eleanor. Every single one.',
'Hargrove Mutual':'An insurance company that has never denied a claim. Their premiums are suspiciously low. They have been profitable every single quarter since 1967.',
'Thornfield Legal':'Handles most of the town\'s property disputes. Their filing system is organized by a method no one else understands, but it works perfectly.',
'Fenwick Geological':'Hired by Commissioner Voss in 2004 to survey the bedrock. The lead geologist quit after two weeks. The report was filed but the conclusions page is blank.',
'Hollow Creek Advisory':'Financial advisors. Their office smells faintly of cedar and old paper. Clients report feeling unusually calm during appointments.',
'Dustveil Mining':'Technically still operational, though they haven\'t extracted anything in decades. Their deepest shaft was sealed in 1978. The reason is listed as "complete."',
// New lore entries
'Crossfield Partners':'A consulting firm that has occupied the same corner office since 1961. Every employee hired since 1980 has eventually asked why the walls are warm. No one has ever answered.',
'Peregrine Logistics':'Handles freight contracts for the eastern valley. Their manifest records show deliveries to an address that doesn\'t appear on any map — listed simply as "the junction."',
'Coppergate Media':'A local newspaper that went to print-only in 2012 and somehow gained subscribers. They print one edition a month. It is always exactly 24 pages.',
'Stillwater Consulting':'Business strategy firm. Their most requested service is "continuity planning." Their clients never go bankrupt. Some of them go missing.',
'Bridgemoore Finance':'Run by the Bridgemoore family since 1934. Their loan interest rate has never changed. The rate is listed as a fraction no one can fully express in decimal form.',
'Ironroot Technologies':'Software company founded in 2016. Their offices are in the basement of a building with no listed owner. The lease is paid monthly in cash.',
'Pale Moon Holdings':'A real estate investment company. Every property they\'ve purchased has gone up in value within a week. Every property they\'ve sold has burned down within a year.',
'Croftside Ventures':'Capital firm. Their portfolio is listed as "diversified infrastructure." Nobody knows what that means. Their returns are consistent to four decimal places, every quarter.',
'Gallowgate Industries':'Fabrication company. Supplies raw materials to six local businesses. None of the businesses know what the materials are for. All of them ordered them again.',
'Nightingale Digital':'A marketing firm. They have no visible clients, no case studies, and no social media presence. Their lobby always has fresh flowers and no receptionist.',
'Morningfield Tech':'Software development. Their codebase has never been reviewed externally. Former employees describe the architecture as "elegant but wrong in a way I can\'t explain."',
'Rookery & Associates':'A law practice that specializes exclusively in easement disputes. In Millhaven, this apparently generates enough work for twelve attorneys.',
'Greywood Capital':'Venture capital. One of their early investments was the town\'s original road network in 1923. They list it as an "ongoing position."',
'Cornerstone Adjusters':'Insurance adjusters. Their claim settlement ratio is exactly 1:1 — every claim is paid out at the precise value of the loss, to the penny, always.',
'Wren & Partners':'Architecture firm. Known for structures that feel slightly wrong from the inside — rooms that seem larger than their footprint, staircases that appear to lead somewhere they don\'t.',
'Ashwood & Webb':'Property law. Their client list goes back to 1901. Some of those clients\' signatures appear on recent documents.',
'Duskwood Holdings':'Real estate. Their properties have an average occupancy of 100%. Even properties listed as vacant show signs of use.',
'Ember & Oak':'Interior design. They keep a room at the back of their studio that clients are never shown. The door is always ajar. The light is always on.',
'Ironbell Research':'A research consultancy. Their specialization is listed as "applied topology." Their only visible product is a series of maps that keep changing.'
};
const RESTAURANT_NAMES = {
Chinese:['Golden Dragon','Jade Palace','Lucky Panda','Silk Road Kitchen','Bamboo Garden','Red Lantern','Wok Star','Peking House','Lotus Blossom','Ming Garden','Dragon Pearl','China Moon','Fortune Garden','Great Wall Kitchen','The Paper Lantern','Jasmine & Five Spice','Cloud Nine Noodles','Two Tigers','Pearl River House','Morning Dim Sum','The Jade Sparrow','Eight Dragons','Silver Chopstick','Sichuan Gate','Dumpling House','Plum Blossom Court','The Mandarin','Crane & Carp','Moongate Kitchen','Iron Wok','Painted Fan','Autumn Moon'],
Mexican:['Casa del Sol','El Dorado Grill','Fiesta Cantina','La Rosa Taqueria','Pueblo Lindo','El Jardin','Salsa Verde','Azteca Kitchen','Sol y Luna','Tres Amigos','Hacienda Grill','Don Carlos','Mariposa Cafe','La Abuela\'s','Coyote Moon','Fuego & Masa','Flor de Maiz','Casa Oaxaca','Nopal Cocina','Los Compadres','Tortilleria Reyna','La Paloma','El Tlayuda','Cazuela Grande','Taco del Valle','La Milpa','Molino Viejo','Agave & Salt','El Rincon','Carnitas Reyes'],
Italian:['Bella Notte','Luigi\'s','Trattoria Roma','Villa Toscana','Piccolo Giardino','La Famiglia','Dolce Vita','Napoli Kitchen','Amore Mio','Rustico','Il Forno','Capri House','Bella Luna','Sotto Voce','Nonna\'s Table','Due Fratelli','Pane e Vino','Il Gatto Nero','La Vecchia Scuola','Basilico','Tramonto','Osteria del Porto','Al Fresco','Piazza Vecchia','Acqua e Sale','La Brace','Il Viaggio','Stelle di Mare','La Corte','Casa Toscana'],
American:['The Rusty Skillet','Blue Sky Diner','Hometown Grill','Liberty Burgers','Fireside Kitchen','Izzy\'s Diner','Main Street Cafe','Route 66 Diner','Copper Kettle','Parkside Grill','The Iron Griddle','Bayview BBQ','Stars & Stripes Diner','Crossroads Kitchen','The Lonesome Dove','Biscuit & Bone','Two Forks Tavern','The Blackbird Cafe','Red Hen Kitchen','Stack & Griddle','The Tired Mule','Cornerstone Diner','Stump & Rail','The Smokehouse','Crow Bar & Grill','The Grain Elevator','Old Post Diner','The Millpond','Hearth & Home','Provisions','Last Light Diner'],
Indian:['Taj Mahal','Spice Route','Curry House','Saffron Kitchen','Bombay Bistro','Tandoori Nights','Masala House','Naan Stop','Delhi Darbar','Cardamom Kitchen','Ganges Grill','Mogul Palace','Kerala Kitchen','Turmeric & Thyme','The Copper Thali','Chai & Chutney','Raga Kitchen','Sitar & Smoke','Dosa Corner','Jaipur Table','Marigold & Mint','The Pepper Trail','Bengal Tiger','Himalayan Spice','Laal Mirch','The Biryani House','Tamarind Tree','Coriander & Clove','The Spice Box','Rasoi Garden'],
Japanese:['Sakura House','Zen Garden Kitchen','Tanuki Ramen','Mount Fuji Grill','The Bamboo Crane','Koi & Noodle','Harvest Moon Sushi','Tempura & Tea','Kitsune Kitchen','Shiso & Salt','The Paper Screen','Umami Garden','Tsuki Sushi','Black Pine Kitchen','Morning Miso','Tsuru Ramen','Hotaru Kitchen','Hinoki & Rice','The Lantern Bridge','Yamaboshi','Kombu & Dashi'],
Thai:['Golden Temple','Pad Thai Palace','Bangkok Garden','Lotus & Lemongrass','Elephant Gate','Mango & Basil','Siam Kitchen','The Wok Bell','Chai Pho Cha','Spice Orchid','Emerald Buddha Kitchen','Chili & Coconut','Tom Yum House','The River Boat','Sawadee Kitchen'],
Greek:['The Olive Branch','Athena\'s Table','Santorini Grill','Blue Aegean','Kyria Kitchen','Opa! Taverna','The Parthenon','Zeus & Hera Kitchen','Mykonos Cafe','Delphi Grill','The Acropolis','Hellas Kitchen','Mediterra'],
French:['Le Petit Bistro','Chez Colette','Maison du Soir','La Brasserie','L\'Escargot','Café Marché','Le Coq Doré','La Table du Moulin','Fleur de Sel','Burgundy & Brie','Le Jardin Fermé','Allium','La Crémaillère','Terroir & Table'],
Ethiopian:['The Blue Nile','Addis Kitchen','Lalibela Table','Injera House','Habesha Kitchen','The Berbere Pot','East Horn Kitchen','Selam Dining','Abyssinia Table','The Tej House','Shiro & Lentil','Bunna Café'],
Korean:['Kimchi House','Seoul Garden','K-Grill','Banchan Kitchen','The Bulgogi Place','Samgyeopsal & Co','Han River Grill','Bibim & Bowl','Dakgalbi Corner','Soju & Ssam','Gochujang Kitchen','The Doenjang','Makgeolli House'],
Vietnamese:['Pho Saigon','The Bánh Mì Bar','Hanoi Garden','Lemongrass & Lime','The Lotus Bowl','Phở & More','Bún Bò Corner','Nem Kitchen','The Mekong','Saigon Street Kitchen','Cơm Tấm House','Chả Cá Table']
};
const RESTAURANT_LORE_GENERIC = {
'The Paper Lantern':'The owner insists the building\'s feng shui was perfect the day she moved in. She didn\'t change a thing. She says the layout chose her.',
'Jasmine & Five Spice':'Opened in 2018. The owner\'s grandmother sent her a recipe book with a note: "Cook these where the roads meet." She\'d never been to Millhaven.',
'Cloud Nine Noodles':'The broth recipe is a closely guarded secret. Staff say the owner adds one ingredient at midnight that she won\'t name.',
'La Abuela\'s':'Named for a grandmother who never existed. The owner made her up to explain why the recipes felt like memories she\'d never had.',
'Coyote Moon':'Live mariachi on Fridays. The lead guitarist has been playing the same setlist for 30 years and swears the songs rearrange themselves.',
'Fuego & Masa':'The wood-fired oven was salvaged from a restaurant that burned down in 1987. The bricks still smell faintly of smoke that isn\'t mesquite.',
'Sotto Voce':'Reservations only. The host claims every table has a story. Table 7 is never booked — "previous reservation, indefinite."',
'Nonna\'s Table':'The nonna in question is a photograph above the register. Different employees describe different women when asked who she is.',
'Il Gatto Nero':'A black cat lives in the restaurant. No one adopted it. It was here when the first owner signed the lease in 1994.',
'The Lonesome Dove':'The jukebox plays songs that aren\'t on the playlist. Regulars have stopped noticing.',
'Biscuit & Bone':'A breakfast spot. The owner\'s dog sits by the door every morning, watching the road. The owner says he\'s "counting."',
'Two Forks Tavern':'Built on the exact site where two old roads used to converge. The foundation had to be poured twice — the first pour cracked overnight in a perfect line.',
'The Blackbird Cafe':'Three blackbirds sit on the roof every morning. They arrived the day the cafe opened. They haven\'t aged.',
'Izzy\'s Diner':'Named after the town spirit. The original Izzy\'s burned down and rebuilt itself — same floorplan, same tables, same crack in the third booth.',
'Turmeric & Thyme':'The owner grows herbs on the roof. She says the thyme grows fastest on the side facing the eastern mountains.',
'The Copper Thali':'Every dish is served on a copper plate the owner brought from Jaipur. She says the metal "remembers flavors" from previous meals.',
'Chai & Chutney':'The tea here tastes different every visit. The owner uses the same recipe. She blames the water and smiles.',
'Raga Kitchen':'Named for the musical scales. The owner plays sitar during slow hours. Customers report the food tastes better when she plays.',
'Dosa Corner':'The smallest restaurant in town. Four tables. There is always a seat available, no matter how busy it looks from outside.',
// New Chinese entries
'Eight Dragons':'The owner refuses to explain the name. There are eight framed photos on the wall, each showing a different version of the same alley. None of the alleys are in Millhaven.',
'Silver Chopstick':'The chopsticks here are wooden, not silver. The original owner insisted the name referred to something else. He never explained what.',
'Sichuan Gate':'The front door faces a different direction than all other doors on the street. The owner says it was like that when she arrived. The building permit shows it wasn\'t.',
'Moongate Kitchen':'The dining room has a perfectly circular window that overlooks a wall. Customers who sit facing it report feeling like something is looking back.',
// New Mexican entries
'La Paloma':'A white dove has perched above the entrance since the restaurant opened in 2009. It has never been identified as belonging to anyone.',
'Molino Viejo':'The grinding stone in the kitchen is genuine colonial-era equipment. The owner inherited it from someone she never met. It arrived in a box with no return address.',
'Agave & Salt':'The agave plant on the bar has been growing since 1994. It has never flowered. The owner says it will bloom when something important happens.',
// New Italian entries
'Osteria del Porto':'The menu changes every week. Former regulars swear they\'ve never seen a dish repeated in ten years of visits. The owner keeps no written recipes.',
'Stelle di Mare':'The fish tank in the lobby has never needed maintenance. The fish have been the same fish — the same individual fish — since the restaurant opened in 2001.',
'La Corte':'Named for a courtyard that no longer exists. The original building burned down in 1963. The current structure was built around the ghost of the old one.',
// New American entries
'Stump & Rail':'Built on the site of Millhaven\'s first logging camp. The original tree stumps are still in the floor — polished, varnished, and used as tables.',
'The Grain Elevator':'Converted from an actual grain elevator. The upper floors are used for storage. Employees are not permitted above the third level. Nobody explains why.',
'Last Light Diner':'Open only from 4pm to midnight. The owner says she tried to open at lunchtime once, but the building wouldn\'t. She describes it as the doors being "heavy."',
'Old Post Diner':'Occupies the original post office building. Regulars say mail occasionally still arrives addressed to people who moved away decades ago.',
// New Indian entries
'The Pepper Trail':'The heat scale here goes up to eleven. The owner claims there are twelve. No one has ever ordered twelve.',
'Bengal Tiger':'A large oil painting of a tiger watches every table in the dining room. Staff joke that it blinks. The joke is not as funny as it should be.',
'Tamarind Tree':'There is no tamarind tree. There is a large pot in the corner that the owner says belongs to one. She waters it every morning. Nothing grows in it.',
// New Japanese entries
'Sakura House':'Cherry blossoms fall in the dining room in April. The nearest cherry tree is two miles away. The owner sweeps them up each morning and says nothing.',
'Tanuki Ramen':'A ceramic tanuki statue by the door has been moved three times by staff who found it in different positions each morning. It now faces the road.',
'Harvest Moon Sushi':'The fish case was bought at auction from a restaurant that closed the day it was supposed to open. The new owner didn\'t ask why it closed.',
'Kitsune Kitchen':'The owner\'s grandmother described the restaurant location in a letter written in 1947 — thirty years before the building was constructed.',
// New Thai entries
'Golden Temple':'The small brass shrine by the entrance was here before the restaurant. The building\'s previous owner, and the one before that, both left it in place.',
'Lotus & Lemongrass':'The lemongrass growing on the windowsill came from seeds the owner\'s mother gave her. Her mother has never been to Thailand.',
'Elephant Gate':'The carved wooden elephant above the door weighs an estimated 80 pounds and is fixed to the wall with no visible fasteners. It has not moved since 1997.',
// New Greek entries
'The Olive Branch':'The olive tree in the corner was grown from a cutting the owner brought from Crete. It has produced fruit every year since 2003, despite being indoors.',
'Opa! Taverna':'The plate-smashing tradition here is real. The owner keeps a back room stocked with plates. She says they are never quite the same plates she started with.',
'Delphi Grill':'The owner says she chose the location based on a dream. In the dream, someone was already cooking here. When she arrived to sign the lease, the ovens were warm.',
// New French entries
'Le Petit Bistro':'The menu is handwritten on a chalkboard in ink. The ink never quite wipes off. Every menu from the past twelve years is faintly visible behind the current one.',
'Maison du Soir':'Open only in the evening. The owner claims mornings don\'t suit the building. The previous tenant — a florist — said the same thing.',
'Fleur de Sel':'The salt cellar on every table is always full. Staff have stopped refilling it because it refills itself. They have stopped discussing this.',
// New Ethiopian entries
'The Blue Nile':'The injera here is made from teff that the owner grows on a plot of land in the eastern valley. The soil there is described by agronomists as "unusual."',
'Addis Kitchen':'The communal dining style means strangers share platters. The owner says three couples met here, got engaged here, and held their receptions here. The same table.',
'Bunna Café':'The coffee ceremony takes forty minutes. Every customer who has sat through the full ceremony reports the same feeling: that they\'ve been here before.',
// New Korean entries
'Seoul Garden':'The kimchi here ferments in jars buried in the garden behind the restaurant. The garden is enclosed on all sides. There is no gate. Nobody asks how the jars get in or out.',
'Han River Grill':'The grill at each table is original — from a restaurant in Seoul that closed in 1989. The owner found them in a warehouse in New Jersey. She doesn\'t know how they got there.',
'Makgeolli House':'The makgeolli is brewed on the premises. The recipe was written down once and the paper was lost. The owner still makes the same batch each time. She doesn\'t know how.',
// New Vietnamese entries
'Pho Saigon':'The broth simmers for eighteen hours. The owner starts it at midnight. Night staff say she doesn\'t sleep — she just sits with the pot and watches the road.',
'Hanoi Garden':'The garden is not a garden. It is a small courtyard with a single bench and a view of the intersection. Customers who eat facing it say the food tastes different.',
'The Mekong':'The owner came to Millhaven from Da Nang in 2011. She was not planning to come here. She describes being redirected by road closures that don\'t appear on any map.'
};
const SCHOOL_NAMES = {
elementary:['Sunshine Elementary','Meadowbrook Elementary','Riverside Elementary','Oakdale Elementary','Pinewood Elementary','Maplewood Elementary','Birchwood Elementary','Lakeview Elementary','Hillcrest Elementary','Cedar Grove Elementary','Willowbrook Elementary','Stonehill Elementary','Fernwood Elementary','Hollowbrook Elementary','Brightfield Elementary','Coppergate Elementary','Rosehaven Elementary','Millstream Elementary','Ashford Elementary','Thornfield Elementary','Ironwood Elementary','Goldfield Elementary','Clearwater Elementary','Harborview Elementary','Valley Ridge Elementary','Whispering Pines Elementary','Foxglove Elementary','Bluebell Elementary','Highmeadow Elementary'],
middle:['Westview Middle School','Ridgecrest Middle','Lakewood Middle','Summit Middle School','Eagle Ridge Middle','Greenfield Middle','Horizon Middle School','Bayside Middle','Clearwater Middle','Valley Forge Middle','Ironbridge Middle','Copperfield Middle','Northgate Middle','Ashwood Middle','Thorngate Middle','Millhaven Middle School','Cornerstone Academy','Riverton Middle','Westbrook Middle','Coldfield Middle'],
high:['Northridge High','Eastview Academy','Tigard Tigers High','Westmont High','Crestwood Prep','Lincoln High','Roosevelt Academy','Central High','Skyline High','Pinnacle Prep','Heritage Academy','Coastal High','Thunder Ridge High','Millhaven High School','Commissioner\'s Academy','Irongate High','Ashfield Preparatory','The Valley School','Bridgemoor High','Coldwater Academy','Fenwick High','Rosewood Preparatory','Old Mill High','Hawthorn Academy']
};
const RIVER_NAMES = ['Whispering Creek','Silverbrook River','Cedar Run','Willow Stream','Copper Creek','Moonlight River','Starfall Creek','Izzy\'s Brook','Golden Current','Amber Flow','Crystal Run','Fothergill Creek','Twilight Stream','Sunrise River','Blackwater Run','Shepherd\'s Creek','The Winding Vein','Coldspring Branch','Tanner\'s Fork','Mill Race','Bitterroot Creek','Pale Water','Holt\'s Crossing','Snakebend River','Ironwash Creek','Dead Man\'s Run',
// New river names
'Gallows Branch','The Thin Rill','Murmur Creek','Sorrow Run','The Blind Beck','Fernfall River','Ashwater Branch','Mossgill Creek','Bogside Run','The Old Course','Hawthorn Burn','Rusted Fork','The Quickwater','Coldmere Stream','Irongate Beck','Hollow Ghyll','The Slow River','Millstream Run','Copperflow Creek','Thornfall Branch','The Narrow Way','Dark Hazel Run','Foxwater Creek','Raven\'s Ghyll','The Singing Rill','Nettlebed Run','Pallid Creek','Shepherd\'s Ghyll','The Fever Brook','Cinder Run','Ashfield Stream','Bracken Beck','Bramble Flow','The Sunken Course','Coldbrook','Moorside Run','The Crooked Beck','Fernside Stream','Ghostwater Run','The Murmuring Fork','Peatfall Creek','Saltwater Branch','The Old Vein','Rushwater Run','Ironside Beck'];
const LAKE_NAMES = ['Mirror Lake','Emerald Lake','Sapphire Pond','Sunset Lake','Serenity Lake','Crystal Lake','Moonrise Lake','Starlight Lake','Willow Pond','Izzy\'s Lagoon','Stillwater Mere','Blackglass Tarn','The Drowning Pool','Bellini\'s Pond','Cairn Lake','Shepherd\'s Basin','Lost Penny Pond','Foghollow Lake','The Old Reservoir','Heron\'s Rest',
// New lake names
'The Pale Mere','Ashwater Lake','Coldhollow Pond','The Blind Lake','Ironmere','The Forgotten Pool','Gallows Tarn','Pale Eye Lake','Shepherd\'s Rest','The Shivering Pond','Moorwater Lake','Cinder Tarn','Hollow Eye Mere','The Glass Pool','Fernhollow Lake','Bogwater Mere','The Listening Pool','Deepwater Tarn','Ashfield Lake','The Still Black','Ironwater Pond','Sorrel Mere','Fernside Tarn','The Amber Pool','Gravemere','The Cold Heart','Thornwater Lake','Old Sorrow Pond','The Rim','Brightwater Mere','Pale Hollow Lake','Rushwater Tarn','The Drowned Field','Coldmere','The Ink Pool'];
const MOUNTAIN_NAMES = ['Eagle Peak','Stonewatch Ridge','Thunder Mountain','Sentinel Peak','Ironclad Summit','Cloudrest Peak','Amber Heights','Copper Ridge','Fothergill Mountain','Twilight Bluff','Starfall Ridge','Izzy\'s Lookout','The Jawbone','Voss\'s Overlook','Gallows Hill','Ashenmount','The Crooked Spine','Cairnstack Peak','Raven\'s Perch','Hollow Crown Ridge','The Iron Teeth','Watcher\'s Bluff','Holt\'s Folly','Greymantle Summit','The Lantern Ridge','Commissioner\'s Rest','Voss\'s Descent','The Deep Arch','Blackvein Mountain','Sleeper\'s Peak',
// New mountain names
'The Pale Crown','Irongate Ridge','Shepherd\'s Shoulder','The Bent Horn','Whisper Peak','The Cold Spine','Ashfield Summit','Mourning Bluff','Ferngate Ridge','The Blind Crag','Sorrowback Mountain','Ironside Peak','The Hungry Heights','Shepherd\'s Skull','Pale Mound','Cairn\'s Tooth','The Tilted Horn','Frozen Knuckle','The Hollow Crest','Ashfall Summit','The Waiting Ridge','Bonehill Peak','Coppergate Heights','The Shrug','Fernside Crag','The Long Tooth','Gallowback Ridge','Shepherd\'s Spine','The Pale Arch','Ironwhisper Peak','The Sunken Crest','Coldfall Bluff','Thorngate Ridge','The Kneeling Man','Fen\'s Crown','Ashwhisper Summit','Deeparch Peak','The Sleeping Shoulder','Pale Lantern Ridge','Commissioner\'s Peak'];
const TERRAIN_LORE = {
'Blackwater Run':'The water runs dark here. Locals say it\'s tannins from the peat. The geologist\'s report says otherwise, but it was never published.',
'The Winding Vein':'Named by Elias Holt in 1923. He wrote that the river moved "as if it had a pulse." His survey maps show the river in a slightly different position than it is today.',
'Dead Man\'s Run':'A body was never found here. The name predates the town. Nobody remembers who named it or why.',
'Holt\'s Crossing':'Where Elias Holt first crossed into the valley. His journal says he hesitated for twenty minutes before stepping over. He didn\'t say why.',
'Pale Water':'The water is unnaturally clear. Fish avoid it. Birds drink from it constantly.',
'Stillwater Mere':'Perfectly still in all weather. No wind has ever been observed rippling the surface. Residents avoid swimming here.',
'Blackglass Tarn':'So dark and still it reflects the sky like a mirror. Photographers love it. Their photos always come out slightly wrong — trees in different positions, extra shadows.',
'The Drowning Pool':'Not a single drowning has ever been recorded here. The name was on Holt\'s original 1923 survey. He didn\'t explain it.',
'Bellini\'s Pond':'Named after Marco Bellini, who used to fish here every Sunday. He stopped coming in October 1987. His tackle box was found at the shore.',
'Foghollow Lake':'Fog rises from this lake at dawn regardless of temperature or season. It always drifts toward the center of town.',
'The Old Reservoir':'Built in 1941, decommissioned in 1968. The pipes underneath still carry water. Nobody turned them back on.',
'The Jawbone':'The ridgeline looks like a jawbone from the south approach. Hikers report the resemblance is more convincing in person than it should be.',
'Voss\'s Overlook':'Commissioner Voss spent his last weeks here, surveying the road network from above. His binoculars were found on the ledge. He left them deliberately. At night, hikers report a faint lantern glow from somewhere inside the mountain below.',
'Gallows Hill':'No gallows were ever built here. The name is from a Potawatomi word that roughly translates to "the place that holds things up."',
'Ashenmount':'The soil here is unnaturally grey. Nothing grows on the summit. Something grew here once — the root impressions in the stone are enormous.',
'The Crooked Spine':'A ridge that curves in a way that shouldn\'t be geologically possible. The bend happened sometime between the 1923 and 1962 surveys.',
'Hollow Crown Ridge':'The peak is concave — a natural bowl at the summit. It collects rainwater that drains into the mountain through channels no one has mapped.',
'The Iron Teeth':'Jagged peaks that contain unusually high iron content. Compasses behave erratically near the summit.',
'Watcher\'s Bluff':'Overlooks the entire town. Residents report seeing a figure standing on the bluff at dusk. When they hike up, no one is there.',
'Holt\'s Folly':'Elias Holt tried to build a road over this mountain in 1924. The road kept sinking into the earth overnight. He gave up after the fourth attempt.',
'Greymantle Summit':'Perpetually overcast at the peak, even when the rest of the sky is clear. Climbers describe a feeling of being watched.',
'The Lantern Ridge':'A warm glow has been reported deep inside this mountain at night. No mining operations are active. No one has claimed the light.',
'Commissioner\'s Rest':'Named by Public Works employees after Voss resigned. They say he used to sit here for hours, staring at the tunnel entrance below. Some say he still does.',
'Voss\'s Descent':'The tunnel entrance on the eastern face leads further than any survey has mapped. Maintenance crews refuse to go past the second junction. They say the air gets warm and the walls hum.',
'Blackvein Mountain':'Dark mineral veins run through the stone in patterns that look deliberate. Geologists disagree on whether they are natural. The veins point inward.',
'Sleeper\'s Peak':'Unusually quiet. No wind, no birds, no insects near the summit. The stone is warm year-round. Locals say something inside is breathing.',
// New terrain lore entries
'Gallows Branch':'The name predates the town by at least 200 years. No record of a hanging. No record of a structure. Something clearly happened here that was important enough to name.',
'The Winding Vein':'Named by Elias Holt in 1923. He wrote that the river moved "as if it had a pulse." His survey maps show the river in a slightly different position than it is today.',
'Murmur Creek':'Hikers report hearing something beneath the sound of the water — not words exactly, but something with cadence. Recordings pick up nothing unusual.',
'Sorrow Run':'The water here is cold even in August. Fish are plentiful but won\'t bite. The name was on the first map Holt filed. He offered no explanation.',
'The Blind Beck':'A stream that appears and disappears. It has been observed in the same place twice, but the second time it was flowing the other direction.',
'Ashwater Branch':'The water runs clear but tastes of ash. No upstream source of ash has been identified. The watershed is fully mapped.',
'The Old Course':'A dry riverbed that shows signs of very recent flow — within days. No rain has fallen. No source of water is uphill.',
'Raven\'s Ghyll':'A narrow gorge that ravens avoid. Every other bird species passes through freely. Ornithologists have noted this and declined to offer an explanation.',
'The Fever Brook':'A local physician in the 1940s noted that patients who drank from this stream reported vivid dreams for several weeks afterward. He stopped drinking from it himself.',
'The Pale Mere':'A lake where the water is so pale it looks like sky. Photographs taken at the shore show the water dark — almost black. The contradiction has no explanation.',
'The Forgotten Pool':'Not on any map before 2008. Not on any survey before 2008. Locals insist it has always been there. It is possible they are correct.',
'Gallows Tarn':'Perfectly circular. Geologists say it is not a meteor crater. They have not offered an alternative explanation.',
'The Listening Pool':'No insects near the water. No frogs. No birds overhead. The silence is described by visitors as "attentive," as though the quiet has a direction.',
'Pale Eye Lake':'The lake has a pale sandy bottom visible from shore. In the center, the bottom disappears at a depth shallower than it should. Something beneath the center absorbs light.',
'The Still Black':'No current. No wind effect. No seasons on the surface — it looks the same in winter and summer. The temperature at the surface has been measured at exactly the same reading three years running.',
'Gravemere':'Nobody is buried near it. The name is old — older than the town. The Potawatomi word it derives from translates loosely as "the place that keeps things."',
'The Cold Heart':'The center of the lake is measurably colder than the edges — by twelve degrees, consistently. No current explains it. The cold spot is fixed.',
'The Drowned Field':'In dry summers, the outline of old field boundaries is visible beneath the water. No settlement or farmland has been recorded at this location.',
'The Pale Crown':'The peak stays pale in all seasons — snow-free even in deep winter, never sunburned in summer. The stone itself appears to resist change.',
'The Bent Horn':'A peak that leans noticeably to one side. Geological surveys confirm it has been leaning since at least 1923. It has not continued to lean. It simply leans.',
'The Cold Spine':'A ridge where the temperature drops ten degrees in the space of about twenty feet. No elevation change accounts for this. Thermometers placed on the ridge read differently from each other even when placed side by side.',
'Mourning Bluff':'A cliff face that produces a sound in high wind described variously as singing, humming, and sobbing. Acoustic surveys find nothing anomalous about the rock face.',
'The Hungry Heights':'Nothing grows above the treeline here, which is normal. What is not normal is that nothing grows below it either, for about fifty feet. The boundary is perfectly horizontal.',
'Shepherd\'s Skull':'Named for the shape. The resemblance is noticed immediately by most visitors and described as uncanny. The formation is entirely natural.',
'The Waiting Ridge':'Hikers report a persistent feeling of being followed on this ridge. No wildlife has been observed. Footprints in the mud have been found, though they stop mid-trail and do not continue.',
'The Hollow Crest':'The peak is hollow — a verified cave system extends at least 400 meters beneath the summit. The cave has been surveyed to 400 meters. Beyond that, surveyors declined to continue.',
'Bonehill Peak':'White stone that breaks like chalk and looks exactly like bone. Geologists confirm it is limestone. They confirm this more insistently than seems necessary.',
'The Shrug':'A ridge that forms a shape resembling a shrug when seen from the valley floor. Locals named it generations ago. Visitors say the resemblance is too good.',
'The Long Tooth':'A single sharp peak that stands significantly higher than the surrounding range. Compasses near the base point toward it rather than north.',
'Gallowback Ridge':'A curved ridge where sound behaves incorrectly. A voice at one end is clearly audible at the other end, despite the distance and terrain. Whispered conversations carry further than shouts.',
'The Kneeling Man':'A rock formation that is exactly what the name suggests. The figure faces the town. No one can agree which direction it was facing in older photographs.',
'The Sleeping Shoulder':'A smooth rounded ridge where travelers feel an overwhelming urge to rest. Most people who sit down here report sleeping for longer than intended.'
};
const BANK_NAMES = ['First National Bank','Tiny Town Savings','Commerce Bank','Heritage Credit Union','Summit Financial','Valley Trust Bank','Millhaven Mutual','Irongate Savings','Coldwater Credit Union','Shepherd\'s Bank','The Pale Vault','Cairn Financial','Old Mill Trust','Fernside Savings','Thorngate Bank','Commissioner\'s Reserve','Ashfield Credit Union','Bridgemoor Savings','The Stone Vault','Coldspring Financial'];
const LOAN_INTEREST_RATE = 0.05;
const LORE_TIPS = [
'Legend says the first road in Tiny Town was paved by a wanderer who just wanted to find a good taco.',
'Old miners speak of golden veins hidden deep within the mountains... dig carefully.',
'The lakes here formed millennia ago when ancient giants wept tears of joy.',
'They say if you build enough roads, the town spirit Izzy blesses your treasury.',
'Van Kleek Lake is rumored to have a friendly lake monster that brings good fortune.',
'Local folklore: every 100th tunnel reveals something precious within the stone.',
'The Tigard Tigers mascot was once a real tiger who directed traffic at the old crossroads.',
'Some say the mountains whisper secrets to those who tunnel through them with care.',
'Izzy is the guardian spirit of Tiny Town. She watches over every intersection with love.',
'The ancient road builders left treasures buried under the mountains as gifts for the future.',
'The previous Transport Commissioner vanished under unclear circumstances. Nobody talks about it.',
'Maintenance crews report seeing a lantern light deep in the eastern tunnels. No workers are assigned there.',
'Commissioner Voss\'s binoculars were found on the overlook, but his survey notebooks were not. He took them with him.',
'A hiker near the eastern ridge swears she heard someone humming inside the mountain. The tune was a traffic report jingle from the \'90s.',
'They say if you tunnel deep enough into the right mountain, you\'ll find someone who never left Millhaven.',
'Certain old families have lived here since before the roads were built. They never seem to age.',
'Late at night, some residents report seeing a car on the road that doesn\'t belong to anyone.',
'The bedrock underneath the town has structure. Almost like architecture.',
'The valley was avoided by native peoples — a place of "a hunger that mistakes movement for offering."',
'Elias Holt described the valley as "almost eager to be connected" in his 1923 survey notes.',
'A Norse inscription found near the eastern hills translates roughly to "the path that drinks."',
'Residents of the eastern district report an unusual hum at night. Probably electrical.',
'Rosa Caruso\'s tiramisu is the best in town. Everyone agrees. Nobody asks how she stays so young.',
'The Golden Lotus has reported exactly $4,847.00 in revenue every single week since 1941.',
'A child\'s drawing found under a road shows a town with roads spreading outward like roots.',
'Holt\'s Diner has a back room called Storage B. Nobody goes in. Nobody comes out.',
'Spice Meridian was built on foundations that have been rebuilt at least seven times.',
'The roads didn\'t bring people here. Something else did.',
'Some roads, when demolished, reveal ghost asphalt underneath — from a network that predates the town.',
'The Stonebridge building was constructed in 2003. A love letter from 1987 mentions its east entrance by name.',
'Three commissioners ago, a routine survey found a road running six feet under an empty lot. Public Works filled it in and asked no questions.',
'The eastern tunnel maintenance crew has a rule: never go past the second junction. Nobody remembers who made the rule.',
'Every family that moves to Millhaven reports the same thing: they weren\'t planning to come here. Something redirected them.',
'Bellini\'s Pond was named after a man who disappeared in 1987. His tackle box was found at the shore. His boat was still tied up.',
'The Aldridge & Aldridge law firm has had 23 partners since 1923. Every one has been named Thomas or Eleanor.',
'If you look at a map of every road ever built in Millhaven, the shape isn\'t a city. It\'s something else.',
'Hargrove Mutual has never denied an insurance claim. Their premiums should bankrupt them. They are very profitable.',
'The town\'s first commissioner lasted 312 days. The second lasted over 5 years. The third lasted 11. The pattern is accelerating.',
'An unused room was found in the basement of the Public Works building. It contains a map of the town dated 2047.',
'Three residents on different streets independently had the same dream last night: roads folding inward like the arms of something waking.',
'The fog from Foghollow Lake always drifts toward the town center. It doesn\'t matter which direction the wind is blowing.',
'The survey map Elias Holt filed in 1923 shows roads he didn\'t build for another three years.',
'There are twelve bridges in Millhaven. Eleven are in the official records. The twelfth only appears on Voss\'s private maps.',
'The warm stone in Voss\'s Descent tunnel has no heat source. It has been warm since at least 1923.',
'A resident once tried to drive out of Millhaven and found himself returning from the other side of town. He doesn\'t try anymore.',
'The Public Works filing room has a drawer labeled DO NOT FILE. It is always full. Nobody refills it.',
'Every new building that goes up in Millhaven sits exactly on a foundation that was used before. Exactly.',
'The town\'s traffic has never caused a true gridlock. The roads always clear. Nobody knows why.',
'Something under the town is not asleep. It is very patiently waiting for the network to be completed.',
'A geologist once described the bedrock under Millhaven as "load-bearing in ways that don\'t make physical sense."',
'The Millhaven town seal shows roads radiating from a central point. The original design had something at that point. It was removed in 1947.',
'Maintenance workers who service the eastern tunnels are given hazard pay. The official reason is listed as "atmospheric irregularity."',
'Van Kleek Lake has no visible inlet or outlet. Hydrologists say it should have drained centuries ago.',
'The oldest headstone in the Millhaven cemetery is dated 1847. The town was founded in 1923.'
];

// ===== ARTIFACT & DEEP LORE SYSTEM =====
const ARTIFACT_POOL = {
// Artifacts found when building roads on normal ground tiles (low chance)
ground: [
{id:'time_capsule',title:'Time Capsule (1987)',text:'MEADOWBROOK ELEMENTARY — CLASS OF 1987 TIME CAPSULE\n\n"When I grow up I want to be a fireman." — Danny R.\n"I want to be a vet and have 100 dogs." — Sarah M.\n"I want to build roads like my grandpa. He says the town needs us." — Tommy Aldridge\n"I want to leave Millhaven." — Katie P.\n[The next page is water-damaged. Only one line is legible:]\n"I drew the thing under the school. Mrs. Patterson says it isn\'t real but I can hear it at nap time."',category:'discoveries',chance:0.004,collections:['millhaven','founding']},
{id:'ghost_road',title:'Ghost Road',text:'MILLHAVEN PUBLIC WORKS — INCIDENT LOG\nDate: 09/14/2003\nCrew: Daniels, Okafor, Pitts (J.)\nLocation: Lot 7, Block 22 (undeveloped)\n\n"Hit something at 18 inches. Thought it was a water main. It\'s asphalt. Old asphalt — black, dense, no air pockets. Runs northeast for at least 40 yards before we stopped digging.\nNo record of any road on this lot. Checked with planning — nothing. Checked the 1923 survey — nothing.\nOkafor says the route matches Cedar Ave exactly, just six feet deeper.\nForeman authorized backfill. Said not to log it. I\'m logging it anyway."\n— T. Daniels, crew lead',category:'discoveries',chance:0.003,collections:['entity','deep_history']},
{id:'wooden_sign',title:'Old Road Sign',text:'A hand-carved wooden sign, recovered from two feet underground.\n\nIt reads: VEIN ROAD — NO OUTLET\n\nThe lettering style matches WPA-era signage from the 1930s. The paint has faded to a dull olive.\nThe wood has not rotted. Not even slightly. The grain is tight and warm to the touch.\nNo street called "Vein Road" appears on any survey, any map, or any planning document in Millhaven\'s records.\nThe sign was facing downward when it was found — as if meant to be read from below.',category:'discoveries',chance:0.003,collections:['entity','millhaven']},
{id:'lovers_note',title:'A Lover\'s Note',text:'A folded note, sealed with candle wax, found in a glass jar beneath the topsoil.\n\n"My darling,\nMeet me Tuesday at the bench behind the Stonebridge building. I\'ll bring the blanket and the wine. If it rains we\'ll sit under the awning by the east entrance. You know the one — the door with the green tile.\nI miss you terribly.\nForever, J."\n\nThe note is dated June 12, 1987.\nThe Stonebridge LLC building was constructed in 2003. Its east entrance has a green tile threshold.\nThe handwriting is steady and unhurried. The ink has barely faded.',category:'discoveries',chance:0.003,collections:['millhaven']},
{id:'bellini_matchbook',title:'Bellini\'s Matchbook',text:'A cardboard matchbook, barely faded. Twenty matches inside — none struck.\n\nFront (printed, red ink on cream):\nBELLINI\'S RISTORANTE\n26 Lakeside Drive, Millhaven\n"Opening Soon — Autumn 1987"\nAuthentic Neapolitan Cuisine\n\nBack (hand-drawn in ballpoint):\nA small map showing the route from Main Street to 26 Lakeside Drive, with a star marking the location and a note: "You can\'t miss it!"\n\nInside flap (stamped): Printed by Valley Press, June 1987. Order of 500.\n\n26 Lakeside Drive is currently the Stonewall Adjusters office complex, constructed in 1989. No restaurant has ever operated at that address.',category:'discoveries',chance:0.003,collections:['bellini','caruso']},
{id:'police_report',title:'Redacted Police Report (1987)',text:'MILLHAVEN POLICE DEPARTMENT — INTERNAL REPORT\nCase #: 87-0441\nType: Missing Person\nDate Filed: 10/09/1987\nReporting Officer: Sgt. D. Holbrook\n\nSubject: ██████ ███████, male, age 29, last seen ██/██/1987 near ████████ Lake.\n\nSummary:\nSubject reported missing by ██████████ on 10/06/1987. Subject was last seen at ████████ on the evening of October 3rd. Witness (name withheld) initially reported seeing subject in the company of ██████████████████████ near the waterfront at approximately 11 PM.\n\nWitness recanted statement on 10/08/1987. No reason given. Witness has since relocated out of state.\n\n██████████████████████████████████████████\n██████████████████████████████████████████\n\nRecommendation: Deputy Commissioner G. Caruso has reviewed this case and recommends closure. "Insufficient evidence to continue. Subject likely left town voluntarily."\n\nCase Status: CLOSED\nClosed by: Sgt. Holbrook (under advisement)\nFollow-up: None',category:'discoveries',chance:0.002,collections:['bellini','caruso']},
{id:'caruso_ledger',title:'Torn Ledger Page',text:'A torn page from a financial ledger. Two columns, labeled in neat handwriting:\nVISIBLE — Jan: $12,400 / Feb: $11,800 / Mar: $13,200\nFAMILY — Jan: $41,600 / Feb: $38,900 / Mar: $44,100\nThe "visible" figures match La Dolce Via\'s publicly filed tax returns for Q1 1986. The "family" column is not filed anywhere.',category:'discoveries',chance:0.002,collections:['caruso']},
{id:'dale_note',title:'Note to Dale Pitts',text:'Folded paper tucked behind a wall panel at Holt\'s Diner. Handwriting is neat, authoritative:\n"Dale — arrangement as discussed. Room in back, kept clear, one key only. Payment monthly, no questions, no names. If anyone asks, it\'s storage. It is storage. You don\'t need to know what\'s stored.\nWe\'ll take care of the permits.\n— G.C."',category:'discoveries',chance:0.002,collections:['caruso','pitts']},
{id:'holt_survey',title:'Holt\'s 1923 Survey Notes',text:'Field journal, E. Holt, June 1923.\n"Arrived at the valley today. Never seen terrain like this. The ground is soft where roads should go and hard where buildings should stand. I don\'t mean figuratively — I drove stakes and the soil yields along perfect straight lines, as if it\'s been prepared.\nThe valley feels almost eager to be connected. I sketched a road plan in twenty minutes. Normally takes me weeks. The pen just moved.\nThis is the place. I don\'t know how I know, but this is the place."',category:'history',chance:0.003,collections:['founding','entity']},
{id:'1940s_plan',title:'1940s City Planning Document',text:'MILLHAVEN MUNICIPAL PLANNING — 1947\nRecommended Road Extensions (Priority Routes)\n"The following routes are recommended for geological stability. Soil surveys indicate these corridors offer optimal load-bearing capacity."\nAttached is a fold-out map. The routes branch from a central point, split into smaller paths, then reconnect in loops. Arteries to veins to capillaries. Someone has penciled in the margin: "Why does a road plan need to circulate?"',category:'history',chance:0.002,collections:['entity','founding']},
{id:'child_drawing',title:'Child\'s Drawing',text:'A crayon drawing on manila paper, found folded inside a lunch box beneath a residential road.\n\nThe top half shows a town — houses in a row, stick-figure people, a yellow sun. Roads spread outward from the center in branching lines, drawn in heavy black crayon pressed hard into the paper.\n\nThe bottom half shows what\'s underneath. The child drew a line across the middle of the page and labeled it "GROUND" in wobbly letters. Below that, the roads continue downward like roots, all converging on a large dark circle filled in so hard the crayon tore through the paper.\n\nThe circle has two words written next to it in red:\n"IT\'S HUNGRY"\n\nOn the back, in a teacher\'s handwriting: "Very creative, Emily! But let\'s draw something happier next time."',category:'discoveries',chance:0.003,collections:['entity']},
{id:'civic_surcharge',title:'Civic Development Surcharge Memo',text:'TOWN OF MILLHAVEN — OFFICE OF THE DEPUTY COMMISSIONER\nMEMO 14-C | INTERNAL | DO NOT DISTRIBUTE\nDate: March 3, 1972\nFrom: Gerald Caruso, Deputy Commissioner\nTo: Commissioner R. Voss (and all future holders of the office)\nRe: Civic Development Surcharge — Infrastructure Compliance Protocol\n\nCommissioner,\n\nAs you are aware, the continued growth and prosperity of Millhaven depends upon consistent expansion of our road infrastructure. Recent periods of administrative delay have resulted in measurable harm to local businesses, declining property values, and diminished public confidence in municipal leadership.\n\nEffective immediately, the following policy is enacted:\n\nAny sitting Commissioner who fails to authorize new road construction for a period exceeding fourteen (14) calendar days shall incur a Civic Development Surcharge of $500 per day, retroactive to Day 1 of the period of inaction.\n\nAppeals may be filed in writing with the Deputy Commissioner\'s office. Processing time: 90 business days.\n\nThis measure ensures accountability and reflects the expectations of the community — and of the families who have invested in Millhaven\'s future.\n\nI trust this will not be necessary for a commissioner of your caliber.\n\nRegards,\nGerald Caruso\nDeputy Commissioner, Town of Millhaven\n\n[Handwritten at bottom:] Co-signers: None. Council vote: Not submitted to council. Filed under Deputy Commissioner\'s sole authority, Section 9(b) — a provision that does not exist in the town charter.',category:'history',chance:0.001,collections:['caruso']},
{id:'bellini_letter',title:'Marco Bellini\'s Unsent Letter',text:'A letter found in an unsealed envelope, addressed to "Mama" in Naples. Never mailed.\n\n"Cara Mama,\nThe permit was denied again. They say there is a \'proximity conflict\' with an existing restaurant, but Lakeside Drive is half a mile from the nearest kitchen. I asked to see the regulation. They said it was on file. I asked to see the file. They said come back Monday.\nI went back Monday. Different clerk. Same answer.\nThere is one family here I cannot get a read on. They smile at everything. The old woman brought me tiramisu when I moved in. Her son stops by the house. Friendly. Very friendly. Papa always said you should trust a man who knows how to frown.\nI will try the permit office one more time.\nThe lake is beautiful in the morning. I am going fishing tomorrow.\nYour loving son,\nMarco"\n\nDated October 3rd, 1987. No further letters were found.',category:'discoveries',chance:0.002,collections:['bellini','caruso']},
{id:'naples_letter',title:'Letter from Naples (1951)',text:'Envelope postmarked Napoli, March 1951. Addressed to Antonio Caruso, 14 Founder\'s Row, Millhaven.\n"Antonio — The arrangement is acceptable. Millhaven is small enough to manage. Establish the restaurant first. Make it beloved. Make it necessary. Everything else follows from a place people trust.\nIf local officials become difficult, be patient with them first. You know what to do if patience doesn\'t work.\nYour mother sends her love. She says to name the restaurant something sweet.\n— Zio R."',category:'history',chance:0.001,collections:['caruso']},
{id:'aldridge_deed',title:'Property Deed — 14 Founder\'s Row',text:'MILLHAVEN MUNICIPAL RECORDS — PROPERTY DEED\nProperty: 14 Founder\'s Row\nDate of First Filing: June 4, 1923\nOwner of Record: Thomas P. Aldridge\n\nThe deed has been transferred seventeen times. Each transfer is dated approximately 35-40 years apart.\n\nOwners of record:\nThomas P. Aldridge → Thomas J. Aldridge → Eleanor M. Aldridge → Thomas A. Aldridge → Eleanor R. Aldridge → Thomas W. Aldridge → [continues for twelve more lines]\n\nThe current owner is listed as: Thomas C. Aldridge.\n\nA surveyor\'s note stapled to the back, dated 1988:\n"At the request of Aldridge & Aldridge, I verified the property measurements match the original 1923 survey. They do. Exactly. To the quarter inch.\nI could not determine if this was due to careful maintenance or because the property has not changed at all."',category:'history',chance:0.002,collections:['millhaven','entity']},
{id:'school_capsule_1962',title:'School Time Capsule (1962)',text:'WESTVIEW ELEMENTARY — CLASS OF 1962 TIME CAPSULE\nOpened: 1987 (as scheduled)\nRe-sealed: 1987\nThis box is the re-sealed version.\n\nContents as catalogued before re-sealing:\n— 14 drawings of houses, roads, trees, families (age-appropriate)\n— 1 letter from a student named Danny Aldridge describing plans to "stay in Millhaven forever"\n— 1 letter from a student named Eleanor Aldridge expressing identical sentiments in nearly identical language\n— 1 drawing that was not catalogued. A teacher\'s note explains only: "removed from exhibit. not appropriate for public display. do not re-file."\n\nThe drawing was not removed from the box. It is still here. It depicts a road network seen from directly above, with something drawn at the center. The center has been colored over with black crayon, applied with heavy pressure, many times.',category:'discoveries',chance:0.003,collections:['entity','founding','millhaven']},
{id:'public_works_log',title:'Public Works Incident Log (2011)',text:'MILLHAVEN PUBLIC WORKS — INCIDENT LOG\nDate: 03/17/2011\nCrew Lead: D. Okafor\nLocation: Block 44, eastern residential grid\nIncident type: Unexpected subsurface obstruction\n\n"Digging for water line access at 3ft when we hit something solid. Not rock — too regular. Cleared 8 inches of topsoil to find a flagstone path, perfectly preserved, running perpendicular to the modern road above it.\n\nFlagstones are cut and dressed. Not rough fieldstone. Professional work. The jointing compound is still intact — no moisture intrusion. Path is approximately 4ft wide.\n\nNo record of any path or road at this location in any survey or planning document. Checked with the foreman. He said stop digging.\n\nI asked if I should document it. He said I just did.\n\nPath continues beyond excavation boundary in both directions. We re-buried it."\n\nThis log was not filed. It was found inside a lunch box in the Public Works storage room.',category:'discoveries',chance:0.003,collections:['entity','deep_history']},
{id:'stoke_journal_fragment',title:'Commissioner Stoke\'s Journal Fragment',text:'A single torn page, found between floorboards.\n\n"...I asked the maintenance supervisor directly. He said the eastern tunnels go further than the maps show. I asked how much further. He looked at his hands for a long time and said he didn\'t know where they stopped.\n\nI had the foreman pull the construction logs. The tunnels were extended three times after the original dig — in 1931, 1947, and 1968. No work orders exist for any of these extensions. No crews were assigned. No materials were requisitioned.\n\nThey extended themselves.\n\nI am writing this down because I am afraid that if I tell anyone, I will stop believing it. And I need to keep believing it. I need to know what I found.\n\nVoss knew. The tunnel entrance on the eastern face, the one the maintenance crew won\'t go past — he went past it. His last field note was filed from there. I drove out and found the note weighted with a stone.\n\nHe left it for someone who came after him.\n\nI think he meant me. I think he means all of us."',category:'discoveries',chance:0.002,collections:['voss','entity','millhaven']},
{id:'delivery_manifest',title:'Delivery Manifest — No Return Address',text:'A clipboard found in the commissioner\'s loading dock. One manifest attached.\n\nSHIPPING MANIFEST\nFrom: [blank]\nTo: Commissioner\'s Office, Millhaven\nDate: [blank]\n\nContents:\n1x reference map (rolled, sealed)\n1x survey kit (surveyor\'s bag, full complement)\n1x brass compass\n1x field notebook, blank\n1x envelope, sealed, marked: "FOR THE NEXT ONE"\n\nNo delivery driver. No carrier markings on the box. The box was simply present in the loading dock one morning.\n\nThe envelope was opened. The contents are not recorded.\n\nThe map was hung on the wall of the commissioner\'s office, where it has remained. It shows the road network in a state of completion no current commissioner has authorized.',category:'discoveries',chance:0.002,collections:['voss','entity','millhaven']}
],
// Artifacts found when building tunnels through mountains (higher chance)
mountain: [
{id:'voss_notebook',title:'Voss\'s Survey Notebook',text:'Survey notebook, leather-bound. Name on inside cover: R. Voss.\nMost pages are routine — lane widths, grade percentages, drainage notes. The last six pages are different.\n"March 14 — Ran traffic count on eastern bypass. 340 vehicles/hr. Expected 120. Where are they coming from?"\n"March 17 — Followed a sedan from the eastern grid. Driver turned left on Meridian. I watched him try to turn right. The wheel turned left. He didn\'t seem to notice."\n"March 20 — Repeated the test with my own car. I intended to drive north. I drove east. I don\'t remember deciding to."',category:'discoveries',chance:0.02,collections:['voss','entity']},
{id:'voss_memo',title:'Crumpled Internal Memo',text:'Found crumpled in the commissioner\'s office filing cabinet. No letterhead. No signature. Typed on a typewriter that doesn\'t match any municipal equipment.\n"Commissioner Voss —\nReroute the highway extension away from the eastern grid. Do not survey east of Meridian St. Do not file documentation for any work already completed in that sector.\nThis is not a request.\nThere will be no follow-up correspondence on this matter."',category:'discoveries',chance:0.015,collections:['voss','entity']},
{id:'voss_journal',title:'Voss\'s Personal Journal',text:'Personal journal. Pages water-stained. Final weeks of entries.\n"April 2 — I overlaid every road I\'ve approved in 11 years onto a single map. They form a closed loop. I didn\'t plan a loop. No one plans a loop. Each road made sense on its own. Together they make a shape."\n"April 5 — The shape matches something. I laid my map over the geological survey from \'94. The subsurface structures and my roads are the same drawing. I built this. I didn\'t know I was building this."\n"April 8 — Every new road toward the eastern hills completes another segment. I am not designing these routes. I sit at my desk, I pick up my pen, and the lines are already there."',category:'discoveries',chance:0.01,collections:['voss','entity']},
{id:'voss_map',title:'Voss\'s Hand-Drawn Map',text:'A large sheet of drafting paper, folded into quarters. Two layers drawn in different ink:\n\nLayer 1 (black ink): The complete Millhaven road network as of 2015. Every street, every bypass, every cul-de-sac. Standard commissioner\'s reference map.\n\nLayer 2 (red ink): Traced from the 1994 geological survey. Subsurface formations at 40-80m depth. Channels, branches, junctions.\n\nThe two layers are identical.\n\nMargins are covered in Voss\'s handwriting, increasingly unsteady:\n"They\'re the same drawing."\n"I didn\'t copy this. I didn\'t know this was down there."\n"Eleven years of roads and I drew the thing that was already underneath."\n\nAn arrow points to a convergence point in the eastern grid, circled three times:\n"A junction. The oldest one. Everything flows through here.\nI have to see it."',category:'discoveries',chance:0.008,collections:['voss','entity']},
{id:'voss_final',title:'Voss\'s Last Entry',text:'A single sheet of commissioner\'s letterhead, found weighted down with a stone at the eastern tunnel entrance.\n\n"I walked the deepest tunnel today. The one that goes past where the maps end.\n\nThe walls are warm. The floor is smooth — worn smooth, like a path that has been walked for a very long time. By what, I don\'t know. The air moves. It moves in rhythm.\n\nAt the end there is a chamber. I didn\'t go in. I stood at the threshold and I understood.\n\nThey were here before the town. Before Holt. Before the Potawatomi. Before anyone.\n\nThe roads didn\'t bring people to Millhaven. The roads brought Millhaven to them.\n\nI\'m going back tomorrow. I think I\'m meant to.\n\n— R. Voss"\n\nThe date is illegible. His office was cleared out within the week. No forwarding address was filed.',category:'discoveries',chance:0.005,collections:['voss','entity']},
{id:'geological_survey',title:'Geological Survey Report',text:'PRIVATE GEOLOGICAL ASSESSMENT — Commissioned by R. Voss\nDr. Ellen Marsh, PhD Geology, State University\n"Subsurface imaging reveals structured formations at 40-80m depth inconsistent with natural bedrock. Symmetrical channels radiating from a central mass. Material composition:ite calciumite calciumite calcium —"\nThe line repeats for half a page. Then:\n"I\'m sorry. I don\'t know why I typed that. The formations appear to be load-bearing. Almost architectural. I would like to visit the site. Please send coordinates."\nA handwritten note in the margin, different hand: "Do NOT send coordinates. — V"',category:'discoveries',chance:0.015,collections:['voss','entity','deep_history']},
{id:'fossil_roads',title:'Fossil Roads',text:'FENWICK GEOLOGICAL — FIELD NOTES (UNPUBLISHED)\nSite: Eastern tunnel system, depth 60m+\nGeologist: Dr. A. Kapoor\nDate: 11/18/1994\n\n"Compressed trace fossils in Carboniferous limestone. Organism unknown — vermiform, large-bore (est. 0.5m diameter). Radiocarbon dating: ~300 million years.\n\nThese are not random burrows. The pathways branch symmetrically, reconnect at fixed intervals, and intersect at consistent angles. There are junctions. There are what I can only describe as on-ramps.\n\nAll routes converge on a central chamber approximately 4m x 4m. The chamber walls are smooth. The chamber is warm — 4°C above ambient rock temperature. There is no geothermal explanation for this.\n\nI am not comfortable with what I am looking at.\n\nRecommendation: Do not extend tunnel system east. Do not send additional survey teams."\n\nDr. Kapoor resigned from Fenwick Geological the following week.',category:'discoveries',chance:0.006,collections:['entity','deep_history']},
{id:'pictographs',title:'Ancient Pictographs',text:'STATE UNIVERSITY — DEPARTMENT OF ARCHAEOLOGY\nField Catalog Entry #1962-0047\nSite: Millhaven eastern cave system, chamber 3\nRecorded by: Prof. H. Whitfield\n\nPanel 1 (deepest layer, est. 8,000+ years): A large circle drawn below a ground line. Lines radiate upward from the circle to the surface. Small four-legged figures move along the lines.\n\nPanel 2 (overlaid): Same composition. The circle is larger. Different figures on the lines — multi-limbed, not identifiable with any known species.\n\nPanel 3 (overlaid): Same composition. Circle larger still. Figures are bipedal. Human.\n\nPanel 4 (most recent layer): Same composition. The circle fills most of the underground space. The lines reach further. The figures on the lines are—\n\nThe panel is unfinished. The pigment is fresh.\n\nNote: "Fresh" is relative — Dr. Whitfield estimated this layer at 200-400 years old. I re-tested it last week. The pigment is wet.\n\n[Addendum, unsigned:] "Recommend sealing chamber 3. Do not photograph Panel 4."',category:'discoveries',chance:0.005,collections:['entity','deep_history']},
{id:'mei_journal',title:'Mei Chen\'s Journal (1943)',text:'A cloth-bound journal, Mandarin characters on the cover. Pages translated by State University linguistics department, 2006.\n\nApril 3, 1943:\n"Opened the kitchen window this morning and the air was different. Sweeter. The floorboards are warm even though the furnace has been off since March. Business has been steady — the same twelve customers every day, like clockwork. I don\'t advertise. They just come."\n\nApril 19, 1943:\n"Something changed in the spring. The restaurant feels different — fuller. Like something is paying attention. Like the walls are leaning in to listen. My mother would have called it ancestors. Maybe she was right."\n\nMay 2, 1943:\n"I cut my hand on a kitchen knife last week. A deep cut. It healed in two days. Not a scar.\nI feel well. I feel very well. I haven\'t felt tired since April.\nI think I will be here for a long time."\n\nThe journal continues for another 400 pages. The last entry is dated 2004. The handwriting never changes.',category:'discoveries',chance:0.01,collections:['mei_chen','entity']},
{id:'health_inspection',title:'Health Dept. Inspection (1987)',text:'MILLHAVEN COUNTY HEALTH DEPARTMENT\nRoutine Inspection Report — Food Service Establishment\nDate: 06/14/1987\nEstablishment: Golden Lotus, 8 Meridian St.\nInspector: R. Farrow, Badge #114\n\nKitchen: Pass\nStorage: Pass\nRefrigeration: Pass\nPest Control: Pass\nHandwashing Station: Pass\nOverall Rating: SATISFACTORY\n\nInspector\'s Notes:\n"Spotless kitchen. Possibly the cleanest I\'ve seen in 20 years. Owner (Mei Chen) was present and cooperative. She appears to be in her late thirties — early forties at most.\n\nI cross-referenced the business registration on file. Golden Lotus was registered in 1941 by Mei Chen. Same name. If this is the same person, she is at minimum 65-70 years old.\n\nI asked her age. She smiled and said \'I\'ve lost count.\'\n\nI noted this discrepancy on Form 7-B for follow-up."\n\nForm 7-B: [BLANK]\nFollow-up inspection: Never scheduled\nInspector R. Farrow transferred to another county three weeks later.',category:'discoveries',chance:0.008,collections:['mei_chen']},
{id:'mei_letter',title:'Mei Chen\'s Unsent Letter',text:'An unsealed envelope, addressed in careful handwriting:\nLin Chen\n1847 Grant Avenue\nSan Francisco, CA 94133\n\nReturn address: Golden Lotus, 8 Meridian St., Millhaven\n\n"Dear Lin,\n\nI hope this finds you well. I hope the children are growing. I wish I could see them. I wish I could leave.\n\nI don\'t mean that the way it sounds. No one is keeping me here. I simply cannot bring myself to go. I\'ve tried. Twice I packed a suitcase and got as far as the bus station. Both times my feet carried me back to the restaurant before I\'d bought a ticket.\n\nI have been here for fifty years. My hair has not gone grey. My hands do not ache. I think I will be here for fifty more.\n\nDo not come to Millhaven. I mean this.\n\nTell your children about the restaurant. Tell them their grandmother is well. Tell them the Golden Lotus will always be here. It was here before me. It will be here after — well. It will be here.\n\nAll my love,\nMama"\n\nThe letter was never mailed. It was found pressed between pages 312 and 313 of her journal.',category:'discoveries',chance:0.008,collections:['mei_chen']},
{id:'spice_survey',title:'Subsurface Examination — Meridian St.',text:'GRAYCLIFF ARCHITECTS — STRUCTURAL ASSESSMENT\nClient: Priya Anand (Spice Meridian renovation)\nSite: 12 Meridian St., Millhaven\nDate: 03/22/2024\nEngineer: J. Torres, P.E.\n\n"Client requested standard foundation inspection prior to kitchen renovation. Core samples revealed the following:\n\nLayer 1 (current): Poured concrete, est. 2019\nLayer 2: Concrete block, est. 1988\nLayer 3: Brick and mortar, est. 1952\nLayer 4: Cut stone, est. 1920s\nLayer 5: Dry-stacked fieldstone, est. 1870-1900\nLayer 6: Hand-shaped sandstone, est. ???\nLayer 7: [Material unidentified —ite calciumite calcium]\n\nNote: I typed that twice and it came out the same way. The material in Layer 7 isite calcium\n\nI\'m sorry. I\'m going to describe it differently. The deepest layer is warm to the touch and appears to be calciumite calcium\n\nI have removed my equipment from the site. I recommend the client not excavate below Layer 5.\n\nThe building has been constructed, demolished, and reconstructed on this exact footprint a minimum of seven times. Every iteration sits on the same foundation point. Not approximately. Exactly.\n\nSomeone — or something — keeps rebuilding here."',category:'discoveries',chance:0.01,collections:['anand','entity','deep_history']},
{id:'potawatomi',title:'Missionary Record (1804)',text:'JOURNAL OF FR. AUGUSTIN DELACROIX\nSociety of Jesus — Western Mission, 1804\n\n"June 9th — Asked the Potawatomi elders about the valley to the southeast. They will not go there. They will not explain why in full.\n\nThe eldest, whom I have come to respect deeply, spoke through the interpreter for some time. The interpreter struggled. He said the concept does not translate cleanly into French or English.\n\nThe closest he could manage: \'a hunger that mistakes movement for offering.\'\n\nI asked what this meant. The elder said: \'Things that move through the valley feed it. They do not know they are feeding it. They believe they are traveling. The roads are its mouth.\'\n\nI asked: \'What roads? There is nothing built there.\'\n\nThe elder looked at me as one looks at a child.\n\n\'There are always roads,\' he said. \'You will build them and believe they are yours.\'"\n\nFr. Delacroix\'s mission was abandoned later that year. His journal was archived at the diocese and not catalogued until 1971.',category:'history',chance:0.008,collections:['entity','deep_history']},
{id:'norse_inscription',title:'Norse Inscription',text:'STATE UNIVERSITY — DEPARTMENT OF LINGUISTICS\nAnalysis Request #1997-221\nSubmitted by: Fenwick Geological (attn: Dr. Marsh)\n\nObject: Runic inscription carved into exposed rock face, eastern hills, Millhaven.\n\nTranscription: ᚨᚦᚨᚱᚹᛖᚷᚱ\nRomanized: ÆÐARVEGR\n\nTranslation: Compound word. "Æðar" (vein, as in blood vessel) + "vegr" (road, path). Literal: "the vein-road." Poetic interpretation: "the path that drinks."\n\nCarving depth: 3-4mm, consistent with iron or steel tool.\nEstimated age: Inconclusive. Patina suggests 800-1,100 years.\n\nNotes from Dr. K. Lindqvist (Norse Studies):\n"The inscription is genuine Old Norse. This is deeply problematic. There is no credible evidence of Norse exploration this far inland. The nearest confirmed Norse site is over 1,500 miles northeast.\n\nMore troubling: the word \'æðarvegr\' does not appear in any known Norse text, saga, or runic corpus. Whoever carved this either coined a new word or learned it somewhere we have no record of.\n\nThey named the road before it existed. They described it as something that drinks."\n\nFollow-up: None requested. File closed.',category:'history',chance:0.006,collections:['entity','deep_history']},
{id:'cave_paintings',title:'Prehistoric Cave Paintings',text:'STATE UNIVERSITY — ARCHAEOLOGY FIELD REPORT\nExpedition: Millhaven Valley Survey, Summer 1962\nSite: Cave system, western ridge\nCatalog: "Trade route maps" (classification disputed)\n\nExcerpt from field notes, Prof. R. Yamamoto:\n\n"Five layers of painting, spanning an estimated 2,000-6,000 years. Each layer depicts the same subject: lines radiating from a central point beneath the ground.\n\nMy initial classification was \'trade route maps.\' I no longer believe this is correct.\n\nThe lines do not connect settlements. They do not connect water sources, hunting grounds, or any identifiable landmark. They connect to each other. Every line leads to the same central point, always depicted below the ground surface.\n\nThe central point is drawn larger in each successive layer. In the oldest painting it is the size of a fist. In the most recent it fills the wall.\n\nMultiple cultures painted this. Over thousands of years. They all drew the same thing growing.\n\nI\'ve requested carbon dating on the pigments. I\'ve also requested a geological survey of the area directly beneath this cave.\n\nI would like to know what is under the central point."\n\nThe geological survey was denied. Prof. Yamamoto did not publish this report.',category:'history',chance:0.005,collections:['entity','deep_history']},
{id:'voss_caruso_note',title:'Voss\'s Note on the Carusos',text:'A page from Voss\'s notebook, dated months before the later entries. Neat handwriting, matter-of-fact:\n"Feb 9 — Confirmed the Caruso operation. Revenue laundering through at least four businesses. Larger than expected. Deputy Commissioner Gerald Caruso has been running it since \'67.\nI could pursue this. I could end my career pursuing this.\nLeaving it alone. Bigger problems east of Meridian."',category:'discoveries',chance:0.008,collections:['voss','caruso']},
{id:'tunnel_wall_writing',title:'Writing on the Tunnel Wall',text:'Photographed by a maintenance crew in 2019 at an unofficial depth record in the eastern tunnel system.\n\nThe text is carved into warm stone at approximately eye level. Different hands, different eras — some sections are deeply weathered, some appear recent. All are in English.\n\n"I CAME BACK" — oldest section, estimated 19th century\n"I UNDERSTAND NOW" — mid 20th century\n"THE ROADS ARE CORRECT" — 1970s, based on pen style used to trace it\n"IT IS NOT MALEVOLENT" — 1990s\n"VOSS WAS RIGHT" — recent, possibly within the decade\n"YOU WILL COME BACK TOO" — fresh. The stone dust is still on the floor below it.\n\nThe maintenance crew photographed the wall and left immediately. The foreman filed the photos under a non-searchable code. He retired the following month.',category:'discoveries',chance:0.004,collections:['voss','entity','deep_history']},
{id:'mountain_door',title:'Survey Note — Sealed Entry',text:'MILLHAVEN PUBLIC WORKS — INTERNAL MEMORANDUM\nDate: April 2, 1968\nFrom: Chief Engineer R. Polk\nTo: Deputy Commissioner G. Caruso\nRe: Eastern tunnel access point — immediate action required\n\n"During extension work in the eastern section, Crew C encountered a formed aperture in the rock face at depth +340m. Not natural. Smooth-edged, approximately 2m high, 1m wide. Materials are the same anomalous composition described in prior geological reports.\n\nAperture is open.\n\nCrew C did not enter. Crew C has been reassigned.\n\nRecommending immediate concrete seal with no record of aperture location on working maps. The depth coordinates will be adjusted in official documentation.\n\nThis matter should not be discussed further in writing.\n— R. Polk"\n\nHandwritten in Caruso\'s margin: "Agreed. Seal it. And Polk — it was already sealed before. Something opened it."',category:'discoveries',chance:0.005,collections:['entity','deep_history','voss']},
{id:'maintenance_logbook',title:'Maintenance Crew Logbook (Eastern Section)',text:'A standard-issue logbook recovered from the eastern maintenance depot, covering 1989-2001.\n\nMost entries are routine. Lamp replacements, drainage checks, ventilation maintenance.\n\nExceptions:\n\n"6/3/1994 — Warm spot at J2. No heat source. Flagged for follow-up. Nobody followed up last time either. Not our job."\n\n"11/12/1996 — Heard movement past J2. Animal, probably. Except the air doesn\'t reach past J2. No oxygen to speak of. Something lives where air doesn\'t go."\n\n"3/7/1999 — New footpath worn into floor between J1 and J2. Not us. Not gradual — not there last week, there this week. Something walks this route regularly."\n\n"9/1/2001 — Last entry. The warm spot is moving. Slowly, toward J1. Going to stop noting it. If it reaches J1, someone else can deal with it."\n\nNo entries after 2001. The depot was decommissioned in 2002. The reason given was "budget reallocation."',category:'discoveries',chance:0.006,collections:['entity','voss']}
],
// Artifacts found when clicking on lake/water tiles
lake: [
{id:'tackle_box',title:'Rusted Tackle Box',text:'A green metal tackle box, badly rusted. Latch broken. Inside: tangled line, corroded hooks, a dried-out tube of sunscreen, and a small waterproof notebook.\n\nThe notebook contains a fishing log. Same handwriting as the Bellini permit application.\n\nJune 14: Mirror Lake, north shore. 3 bass. Beautiful morning.\nJune 28: Stillwater Mere. Nothing biting. Water too clear.\nJuly 9: Mirror Lake again. 2 bass, 1 catfish. Met a nice old man — says he\'s fished here since \'55.\nJuly 22: Bellini\'s Pond. (They named it after me! Ha!) 4 bass.\nAug 5: Mirror Lake. Good haul. Saw a black car parked on the access road. No one fishing.\nAug 19: Bellini\'s Pond. Black car again. Parked across the lake. Someone sitting inside.\nSept 3: Didn\'t fish. Went to the permit office instead. Denied again.\nSept 20: Mirror Lake. Someone following me from town again. Third time this week. Thought it was kids.\nIt wasn\'t kids.\n\n[No further entries.]',category:'discoveries',chance:0.02,collections:['bellini','caruso']},
{id:'permit_copy',title:'Bellini\'s Permit — DENIED',text:'TOWN OF MILLHAVEN — BUSINESS PERMIT APPLICATION\n[WATERPROOF COPY — found in sealed plastic bag at lake bottom]\n\nApplicant: Marco Bellini\nBusiness Name: Bellini\'s Ristorante\nProposed Address: 26 Lakeside Drive\nBusiness Type: Restaurant (Italian cuisine)\nDate Filed: 07/15/1987\n\nStatus: ██ DENIED ██\n\nReason for Denial:\n"Zoning conflict — existing establishment of same cuisine type within municipal proximity radius (Section 12.4.7). Applicant may reapply after a period of not less than 24 months."\n\nReviewed by: Gerald Caruso, Deputy Commissioner\nDate of Decision: 07/16/1987\n\n[Handwritten appeal on back, in Bellini\'s handwriting:]\n"There is no Section 12.4.7. I checked. I went to the town clerk and asked to see the zoning code. Section 12 has six subsections, not seven.\nThe nearest Italian restaurant is La Dolce Via — owned by the Caruso family.\nThe permit was denied by Gerald Caruso.\nI am filing this appeal with the Commissioner directly.\nI am also making a waterproof copy of everything."\n\nAppeal Status: No record of receipt.',category:'discoveries',chance:0.015,collections:['bellini','caruso']},
{id:'weighted_coat',title:'The Weighted Coat',text:'A man\'s overcoat, pulled from the lake sediment. Italian wool, charcoal grey. Label reads "Sartoria Ferrante — Napoli." Good quality. Expensive for a 29-year-old who hadn\'t opened his restaurant yet.\n\nLeft pocket contents:\n— Wallet (leather, waterlogged)\n  — Driver\'s license: Marco Bellini, DOB 03/11/1958, 26 Lakeside Dr., Millhaven\n  — $14 in cash\n  — A photograph of an older woman, smiling, standing in front of a building with a hand-painted sign in Italian\n  — A business card: "Bellini\'s Ristorante — Coming Soon"\n\nRight pocket contents:\n— Stone (river rock, smooth, ~8 oz)\n— Stone (river rock, smooth, ~10 oz)\n— Stone (river rock, smooth, ~12 oz)\n— Stone (river rock, smooth, ~9 oz)\n— Stone (river rock, smooth, ~11 oz)\n— Stone (river rock, smooth, ~8 oz)\n\nThe stones are not from this lake. They are from the riverbed near La Dolce Via.\n\nThe coat\'s buttons are fastened. All of them. Top to bottom.',category:'discoveries',chance:0.008,collections:['bellini','caruso']},
{id:'bridge_foundation',title:'Unfinished Bridge Foundation',text:'MILLHAVEN DEPT. OF PUBLIC WORKS — DIVE SURVEY\nDate: 08/03/2009\nDiver: K. Nguyen (contracted)\nSite: Lake bed, northwest quadrant, depth 22ft\n\n"Located four vertical support columns embedded in the lake bed. Approximately 18 inches in diameter, spaced at 30-foot intervals — consistent with a two-lane bridge span.\n\nConstruction is incomplete. The columns end 6 feet below the waterline. No deck, no crossbeams, no road surface.\n\nMaterial is unidentifiable. Not concrete, not steel, not wood. It is smooth and warm to the touch. I held my hand against it for ten seconds. I did not want to let go.\n\nThere is no construction permit, no engineering plan, no work order for a bridge at this location. The lake has been surveyed four times since 1923. No previous survey mentions these columns.\n\nThey were not here before. They are here now.\n\nI am declining further dive work at this site."',category:'discoveries',chance:0.01,collections:['entity','deep_history']},
{id:'drowned_signpost',title:'Drowned Road Signpost',text:'A metal signpost recovered from twelve feet of water, pulled up attached to a section of poured-concrete base.\n\nThe signs are intact. Four arms, four directions.\n\nNORTH: MILLHAVEN — 0 MILES\nSOUTH: [illegible, badly corroded]\nEAST: VEIN ROAD — 3 MILES\nWEST: THE CENTER — FOLLOW THE CURRENT\n\nThe signpost is Municipal Standard Issue. The style matches signs from the 1940s.\n\nNo road has ever run near this lake. The lake is the oldest feature on any survey map of the valley. It predates all settlement records.',category:'discoveries',chance:0.012,collections:['entity','deep_history']},
{id:'bellini_photo',title:'Waterproof Photo Envelope',text:'A sealed waterproof envelope, recovered from the lake bed near Bellini\'s Pond.\n\nInside: six photographs, still clear.\n\nPhotos 1-4: Marco Bellini fishing at various lakes — cheerful, sunlit, ordinary.\n\nPhoto 5: Bellini at a restaurant table, raising a glass. The restaurant interior is unfamiliar — not Millhaven. The other people at the table are not looking at the camera. They are all looking at someone outside the frame to the left.\n\nPhoto 6: The same restaurant. Empty. The table is set for eight. Glasses are full. No one is there.\n\nOn the back of photo 6, in Bellini\'s handwriting:\n"They said come for dinner. I asked when. They said: you\'ll know.\n\nI know now."',category:'discoveries',chance:0.01,collections:['bellini','caruso']},
{id:'old_survey_stake',title:'1923 Survey Stake',text:'A wooden stake, painted orange, with a brass cap engraved:\nU.S. SURVEY — E. HOLT — 1923\nLOT 00 — BLOCK 00 — SECTION 00\n\nThe all-zero designation does not exist in any survey grid. Lot 00, Block 00, Section 00 is the official designation for a parcel that is recorded but has never been assigned a location.\n\nIn Millhaven\'s property records, this parcel is listed as:\nOwner: The Valley\nAddress: None\nValue: Not assessed\nStatus: In use\n\nThe parcel has been "in use" since the first property records were filed. Nothing has ever been built on it. No tax has ever been assessed. No one has ever filed a complaint about it.',category:'history',chance:0.008,collections:['founding','entity']},
{id:'stoke_letter_lake',title:'Commissioner Stoke\'s Last Letter',text:'Found in a sealed bottle — glass, cork, wax seal — at the bottom of Mirror Lake.\n\n"To whoever finds this,\n\nI have served as commissioner for four years. I have read Voss\'s notes. I have been to the eastern tunnels. I have not gone past the second junction, and I will not.\n\nBut I know what\'s down there. I know what the roads are for. I know why the town keeps growing and why it always grows in the same direction and why nobody leaves.\n\nI am not writing this to warn you. You can\'t be warned. You\'re already here, which means it already has you.\n\nI am writing this because I want someone to know that I understood. That I saw it clearly, even at the end.\n\nBuild the roads, Commissioner. Not because you have to. Because it\'s the only thing left to do.\n\nIt\'s beautiful, in a way. I hope you see that too.\n\n— Dr. H. Stoke, Commissioner, Millhaven\n\nP.S. The lake is lovely at this time of year."',category:'discoveries',chance:0.005,collections:['voss','entity','millhaven']}
]
};
// Tutorial-only artifacts (never spawn in normal games)
ARTIFACT_POOL.tutorial = [
  {
    id: 'teddy_note_1',
    title: 'A Child\'s Note',
    text: 'A crumpled note in a child\'s handwriting: "Today was the last day I played with Mr. Buttons in the park. Mama says we have to move away. I left him under the big oak tree so he wouldn\'t be scared."',
    pool: 'tutorial'
  },
  {
    id: 'teddy_note_2',
    title: 'A Torn Diary Page',
    text: 'A torn diary page: "I went back to find Mr. Buttons but he was gone. Someone must have taken him. I hope wherever he is, someone is taking care of him."',
    pool: 'tutorial'
  }
];

// Commissioner history for game over screen (procedurally supplemented)
const COMMISSIONER_HISTORY = [
{name:'Elias Holt',days:312,pct:6},
{name:'Margaret Holt-Webb',days:1847,pct:18},
{name:'Raymond Voss',days:4015,pct:29},
{name:'Patricia Alderton',days:203,pct:4},
{name:'James Coldwell',days:567,pct:9},
{name:'Dorothea Fenwick',days:1122,pct:15},
{name:'Bernard Ashcroft',days:88,pct:2},
{name:'Lucille Hargrove',days:2341,pct:22},
{name:'Tobias Cairn',days:14,pct:1},
{name:'Evelyn Moorfield',days:730,pct:11},
{name:'Gerald Caruso',days:0,pct:0,note:'Served as Deputy Commissioner. Never held the top office. Many believe he preferred it that way.'},
{name:'Winifred Roach',days:441,pct:7},
{name:'Cornelius Vane',days:3,pct:0,note:'Resigned the third morning. Left a note that read only: "I heard it."'},
{name:'Dr. Harriet Stoke',days:1560,pct:19},
{name:'Franklin Lye',days:27,pct:1},
{name:'Augustina Blackmoor',days:892,pct:13},
{name:'Percy Holt-Webb II',days:1100,pct:16}
];

// Special family traits for lore
const LORE_FAMILIES = {
aldridge:{note:'The Aldridge family has lived at the same address since 1923. Same names. Same ages. Every generation.',trait:'retained'},
chen:{note:'Mei Chen has run the Golden Lotus since 1941. She\'s listed as 94. She looks about 40.',trait:'retained'},
caruso:{note:'Rosa Caruso runs La Dolce Via. Beloved community figure. Famous for her tiramisu. Her father Gerald was Deputy Commissioner.',trait:'mob'},
reyes:{note:'Jorge and Carmen Reyes run El Camino. Best margaritas in town. Jorge plays poker on Tuesdays.',trait:'normal'},
anand:{note:'Priya Anand opened Spice Meridian last year. Born in Millhaven, left as an infant, came back following a recipe box.',trait:'drawn'},
pitts:{note:'Tommy Pitts inherited Holt\'s Diner. Found a note from Gerald Caruso in the back room. Decided not to know.',trait:'complicit'},
voss:{note:'Raymond Voss. Retired. Enjoys long walks. Says this is the only place he\'s ever felt truly at home. Doesn\'t remember much.',trait:'retained'},
// New family lore
holt:{note:'Descendants of Elias Holt still live in Millhaven. They all become engineers, surveyors, or planners. Without exception. Without being asked.',trait:'founding'},
bellini:{note:'No Bellinis remain in Millhaven. The last one arrived in 1987 with plans to open a restaurant. He went fishing in October. His boat came back without him.',trait:'absent'},
hargrove:{note:'The Hargroves run the insurance company. They have always run the insurance company. Nobody in the family has ever moved away. Nobody has ever tried.',trait:'retained'},
fothergill:{note:'Fothergill & Associates has employed a member of the Fothergill family in every generation since 1952. The current Fothergill doesn\'t know how the filing cabinets work either.',trait:'complicit'},
fenwick:{note:'The Fenwicks were geologists before the survey work dried up. Dorothea Fenwick was commissioner for three years. Her grandson refuses to discuss her tenure.',trait:'complicit'},
stoke:{note:'Dr. Harriet Stoke was the longest-serving commissioner after Voss. She kept detailed journals. Her family burned them at her request. She was very specific about the burning.',trait:'complicit'},
cairn:{note:'Tobias Cairn lasted three days as commissioner. His descendants still live on Cairn Lake Road. They are polite and do not discuss their great-grandfather.',trait:'complicit'},
morrison:{note:'An unremarkable family by every measure. They have lived on the same street since 1947. Their house has been remodeled six times. The floorplan has never changed.',trait:'normal'},
okafor:{note:'Emeka Okafor moved to Millhaven in 2019 for work. He planned to stay two years. He cannot explain why he is still here. He has stopped trying to explain it.',trait:'drawn'},
park:{note:'The Parks moved here from Seoul in 2015. They describe feeling "recognized" by the town, though they had never been here before.',trait:'drawn'},
delacroix:{note:'A branch of the missionary\'s family settled in Millhaven in the 1890s, forty years after Father Delacroix warned people away from the valley. They do not read French.',trait:'retained'},
nightingale:{note:'The Nightingales are a quiet family. They work at Nightingale Digital. They have always worked there, even when the firm had a different name. Or perhaps the firm has always been Nightingale.',trait:'retained'}
};

// Caruso escalation events (triggered by days without road building)
const CARUSO_EVENTS = {
whispers:[
{text:'Residents report an unpleasant smell near the eastern lots. Probably drainage.', collections:['caruso']},
{text:'A dog on Holt Street hasn\'t stopped barking since last night. Neighbors are complaining.', collections:['caruso','entity']},
{text:'The streetlights on the main square flickered for an hour last night. Electrical issue, likely.', collections:['entity']},
{text:'A crow has been sitting on the roof of La Dolce Via for three days straight. Rosa Caruso says she\'s named it.', collections:['caruso']},
{text:'Someone rearranged the road planning maps in the commissioner\'s office overnight. Nothing is missing. They\'re just sorted differently.', collections:['caruso','entity']},
{text:'A family on the east side reports their basement flooded. The water smelled like motor oil.', collections:['entity']},
{text:'Three residents on different streets independently reported the same dream last night: a city with no center, roads folding inward.', collections:['entity']},
{text:'The traffic signal at the main intersection changed on its own at 3am and stayed red for an hour. No one was there.', collections:['entity']},
{text:'Holt\'s Diner reported a power surge that fried the register. Tommy Pitts is hand-writing receipts. He seems more shaken than the circumstances warrant.', collections:['pitts']},
{text:'Children on the south block have started drawing roads on the sidewalk with chalk. The routes they draw match the oldest part of the network exactly.', collections:['entity','deep_history']},
{text:'A new pothole appeared on Main Street overnight. It\'s perfectly circular. No utility crew claims responsibility.', collections:['entity']},
{text:'Residents near Van Kleek Lake report hearing something moving in the water after midnight. The fishing boats are docked and accounted for.', collections:['entity']},
// New whisper events
{text:'The Aldridge & Aldridge filing room was found locked from the inside this morning. There was no one in it.', collections:['entity','millhaven']},
{text:'A maintenance worker found warm asphalt under a residential road that hasn\'t been repaved in thirty years. The warmth has no source.', collections:['entity']},
{text:'Someone left a bouquet of flowers at the Voss family mailbox. The flowers are the same kind found at the eastern tunnel entrance every spring.', collections:['voss']},
{text:'The Golden Lotus was closed for exactly one hour this week — 3am to 4am on Thursday. Mei Chen has not explained why. The lights were on.', collections:['mei_chen','entity']},
{text:'A resident tried to take a photo of the road network from the water tower. Her camera wouldn\'t focus on the pattern. Individual streets came out fine.', collections:['entity']},
{text:'The eastern district electrical substation hummed at a different frequency last night. An engineer called it "harmonically interesting" and asked not to be quoted.', collections:['entity']},
{text:'Someone has been leaving stacks of coins at every road intersection in the northwest quarter. A local coin dealer identified them as pre-1923 Millhaven municipal tokens. There were no municipal tokens before 1923.', collections:['founding','entity']},
{text:'A child reported seeing "the road man" near Stillwater Mere — a figure in a surveyor\'s coat carrying equipment. No surveyors are currently active in that area.', collections:['voss','entity']},
{text:'The town clock ran three minutes fast this week. Public Works corrected it. It returned to being three minutes fast by morning. This has happened before.', collections:['entity']},
{text:'A section of road on Meridian Street spontaneously filled in overnight — a pothole that was scheduled to be repaired next week. The patch is a slightly different type of asphalt. It\'s the old type.', collections:['entity','deep_history']},
{text:'Spice Meridian\'s outdoor seating has been occupied every night this week, long after closing time, by people no one can describe clearly.', collections:['anand','entity']},
{text:'The river changed color briefly this morning — dark, briefly, like deep water — and then returned to normal. The water department tested it and found nothing unusual.', collections:['entity']},
{text:'An old road sign was found nailed to a power pole on the north side: VEIN ROAD — NO OUTLET. No such street exists. The sign is old.', collections:['entity','millhaven']},
{text:'The Public Works bulletin board was found covered in sticky notes this morning. Each note contains a road address. None of the addresses exist.', collections:['entity']},
{text:'Rosa Caruso\'s restaurant was seen with every light on at 4am. When staff arrived at opening time, everything was in order. Rosa says she slept at home.', collections:['caruso','entity']}
],
pressure:[
{text:'Several families report feeling "restless" and "having trouble sleeping" this week.', collections:['caruso','entity']},
{text:'Office revenue dipped slightly. Tooltip says "employee morale" with no further detail.', collections:['caruso']},
{text:'Rosa Caruso stopped by the commissioner\'s office. She left her card and says she\'d love to discuss development plans.', collections:['caruso']},
{text:'A window broke at the Public Works office. No projectile was found. The glass fell outward.', collections:['caruso']},
{text:'Two road maintenance workers quit the same day. Neither gave a reason. One left a note: "I\'m not going back near the eastern grid."', collections:['entity','voss']},
{text:'The Caruso family reserved the private dining room at La Dolce Via for the entire week. No one knows who attended.', collections:['caruso']},
{text:'Property values in the connected districts jumped 12% this week. In unconnected areas they dropped the same. Nobody reported this in the paper.', collections:['caruso']},
{text:'A building inspector resigned after filing a report about Spice Meridian\'s foundation. The report is sealed. The inspector moved away.', collections:['anand','entity']},
{text:'The commissioner\'s mail was delayed three days. When it arrived, one envelope had already been opened and re-sealed. It contained routine budget paperwork.', collections:['caruso']},
// New pressure events
{text:'Three new families are reportedly considering leaving Millhaven. Their houses have already been listed. New buyers have already inquired. The timing is unusual.', collections:['caruso','entity']},
{text:'The town\'s road permit processing time doubled this week without explanation. Clearing the backlog will require new road construction.', collections:['caruso']},
{text:'An anonymous note was slipped under the commissioner\'s office door: "The town gets nervous when the roads stop. Don\'t let it get nervous."', collections:['entity','caruso']},
{text:'Rosa Caruso hosted a dinner for local business owners. The commissioner was not invited. A summary arrived by mail the next morning. It contained suggestions.', collections:['caruso']},
{text:'Business owners in the unconnected districts have begun a quiet campaign — not complaints exactly, more of a conversation about whether the commissioner is managing things correctly.', collections:['caruso']},
{text:'Fothergill & Associates quietly advised three clients to reduce investment in properties near unconnected roads. The timing is not subtle.', collections:['caruso','fothergill']},
{text:'The town\'s weekly newspaper ran a front-page story about traffic flow. It included a photograph of the commissioner\'s office window. From outside.', collections:['caruso']},
{text:'Hargrove Mutual raised premiums by 8% in the unconnected districts. They cited "infrastructure risk." The increase takes effect immediately.', collections:['caruso']},
{text:'A delegation from the eastern families visited the commissioner\'s office. They were polite. They were very specific about what they wanted. They left a plant. The plant does not appear to be dying.', collections:['caruso','entity']}
],
fire:'A fire broke out overnight. Cause: undetermined. Arson has not been ruled out.',
rosa_letter:`Dear Commissioner,\nMillhaven is a town that rewards movement. People need to get places. A town without roads is like a body without circulation \u2014 things start to go wrong in ways that are hard to predict and harder to fix.\nI've watched this town for a long time. I've seen commissioners who understood this thrive. I've seen those who didn't... struggle.\nCome for dinner sometime. First meal is on me.\nWarmly, Rosa Caruso`,
final_warning:'Commissioner,\n\nI\'ll be direct. My family opened La Dolce Via in 1951. Seventeen commissioners have sat in your chair since then. Some built roads. Some didn\'t.\n\nThe ones who built roads are remembered fondly. The ones who didn\'t are not remembered at all.\n\nI\'m not threatening you. I\'m telling you what I\'ve seen. This town has a way of replacing people who don\'t keep things moving. I don\'t mean elections. I mean something quieter than that.\n\nBuild the roads, Commissioner. For your own sake.\n\n— Rosa Caruso'
};

// ===== MYSTERY DEDUCTIONS =====
const MYSTERY_DEDUCTIONS = [
{
  id:'bellini_murder',
  requiredPins:['bellini_matchbook','police_report'],
  question:'The matchbook was printed before Bellini\'s restaurant opened, and the police report was closed by Deputy Commissioner Caruso. What does this suggest?',
  choices:['Bellini was a criminal who fled town','The Carusos eliminated a business competitor before he could start','The police report is about an unrelated case','Bellini moved away voluntarily'],
  correctIndex:1,
  revealsCollections:['bellini','caruso'],
  bonusLore:'An internal memo surfaces, typed on Deputy Commissioner\'s letterhead:\n\n"To file —\nThe Bellini situation has been resolved. The permit will not be reissued. No restaurant of that type will open on the Lakeside block or any adjacent block.\nThe applicant has been made aware of the town\'s position. He will not reapply.\n— G.C."\n\nDate stamp: October 2, 1987. One day before Bellini\'s last letter home.',
  bonusCategory:'discoveries',
  bonusCollections:['bellini','caruso'],
  hint:'Think about who benefits from a competing restaurant never opening.',
  difficulty:1
},
{
  id:'bellini_lake',
  requiredPins:['tackle_box','weighted_coat'],
  question:'A tackle box with a final entry about being followed, and a coat with stones in the pockets. Both belong to Marco Bellini. What happened at the lake?',
  choices:['Bellini drowned in a fishing accident','Bellini staged his own death and fled','Bellini was murdered and his death made to look like drowning','The coat belonged to someone else'],
  correctIndex:2,
  revealsCollections:['bellini','caruso'],
  bonusLore:'A handwritten note on Millhaven PD stationery, paperclipped to the back of Case #87-0441. Never entered into evidence.\n\n"Sgt. Holbrook — I was night fishing Oct 4, north shore. Around 3 AM I saw headlights on the access road. Black car, couldn\'t make the model. Two men walked onto the dock. One was tall. The other was shorter, walking unsteady — maybe drunk, maybe not walking by choice.\nI heard a splash. One man walked back to the car.\nI\'m writing this down but I don\'t want my name on anything. You understand.\n— [name redacted by Holbrook]"',
  bonusCategory:'discoveries',
  bonusCollections:['bellini','caruso'],
  hint:'Why would stones be placed in someone\'s coat pockets?',
  difficulty:1
},
{
  id:'voss_discovery',
  requiredPins:['voss_notebook','voss_journal'],
  question:'Voss started with normal survey notes but ended mapping a "closed loop" network. His roads unknowingly completed something. What was Voss building?',
  choices:['A highway bypass for traffic relief','The entity\'s preferred network — finishing a design that predates the town','A secret escape route out of Millhaven','An irrigation system for the valley'],
  correctIndex:1,
  revealsCollections:['voss','entity'],
  bonusLore:'Voss\'s wife later found a note taped under his desk: "11 years. Every road I built was a suggestion. Not mine. I thought I was planning routes. I was taking dictation."',
  bonusCategory:'discoveries',
  bonusCollections:['voss','entity'],
  hint:'Voss discovered his roads matched something ancient underneath the town.',
  difficulty:2
},
{
  id:'voss_disappearance',
  requiredPins:['voss_final','voss_map'],
  question:'Voss mapped a subsurface structure identical to the road network and wrote "the roads brought Millhaven to them." Who are "them"?',
  choices:['The Caruso family','The original Potawatomi inhabitants','The entity — something beneath the roads that has been here longer than humans','The state government'],
  correctIndex:2,
  revealsCollections:['voss','entity'],
  bonusLore:'The tunnel entrance where Voss wrote his last entry has been sealed with concrete. No work order exists for the sealing. The concrete is warm to the touch, year-round.',
  bonusCategory:'discoveries',
  bonusCollections:['voss','entity'],
  hint:'"The roads didn\'t bring people to Millhaven." Something else was already here.',
  difficulty:2
},
{
  id:'deep_network',
  requiredPins:['fossil_roads','cave_paintings'],
  question:'Fossil pathways from prehistoric organisms follow the same routes as modern roads. Ancient cave paintings show lines radiating from an underground center. What pattern emerges?',
  choices:['Coincidental geological formations','A network entity that has guided road-building across multiple species and eras','Ancient humans built the first roads','Natural water drainage patterns'],
  correctIndex:1,
  revealsCollections:['entity','deep_history'],
  bonusLore:'A geologist who studied both sites in 1994 wrote: "The fossil paths aren\'t random burrowing. They\'re infrastructure. Something was already building a transportation network 300 million years before humans arrived. We just paved over it."',
  bonusCategory:'discoveries',
  bonusCollections:['entity','deep_history'],
  hint:'The same network pattern appears across millions of years and different species.',
  difficulty:3
},
{
  id:'mei_chen_immortal',
  requiredPins:['mei_journal','health_inspection'],
  question:'Mei Chen\'s 1943 journal says "I will be here for a long time." A 1987 inspector noted she looks 40 but should be at least 65. What is Mei Chen?',
  choices:['She has excellent genes','The restaurant is a front and "Mei Chen" is a title passed down','Something in the valley — perhaps the entity — has preserved her','She is lying about her age on documents'],
  correctIndex:2,
  revealsCollections:['mei_chen','entity'],
  bonusLore:'Mei Chen\'s restaurant sits directly above what Voss identified as a major junction in the subsurface network. Her daily revenue — $4,847.00, never varying — matches the numerical value ancient pictographs assign to the central node.',
  bonusCategory:'discoveries',
  bonusCollections:['mei_chen','entity'],
  hint:'Her journal mentions feeling "fuller" as if something is paying attention.',
  difficulty:2
},
{
  id:'caruso_pitts',
  requiredPins:['dale_note','caruso_ledger'],
  question:'Gerald Caruso arranged a secret room at the diner with Dale Pitts. The ledger shows a "family" column three times larger than reported revenue. What was the arrangement?',
  choices:['A private dining room for VIPs','A money laundering operation using local businesses as fronts','A storage space for restaurant supplies','A gambling operation'],
  correctIndex:1,
  revealsCollections:['caruso','pitts'],
  bonusLore:'Tommy Pitts found a second ledger in Storage B, hidden under a false floor panel. The entries are in Gerald Caruso\'s handwriting.\n\nHolt\'s Diner — Key #1 — $200/mo — "storage"\nSilverline Inc — Key #2 — $350/mo — "document archival"\nHargrove Mutual — Key #3 — $400/mo — "overflow records"\nGilded Ledger Accounting — Key #4 — $275/mo — "seasonal inventory"\nHollow Creek Advisory — Key #5 — $300/mo — "client materials"\nCairn Insurance — Key #6 — $325/mo — "secure filing"\n\nSix businesses. Six keys. Monthly payments in cash. No receipts. No questions.\n\nTommy closed the panel and put the rug back. He hasn\'t opened it since.',
  bonusCategory:'discoveries',
  bonusCollections:['caruso','pitts'],
  hint:'The "visible" and "family" columns suggest two sets of books.',
  difficulty:1
},
{
  id:'founding_entity',
  requiredPins:['holt_survey','1940s_plan'],
  question:'Holt described the valley as "eager to be connected" in 1923. By the 1940s, recommended road routes formed a circulatory system pattern. What guided the town\'s founding?',
  choices:['Smart urban planning by educated surveyors','The entity\'s influence — the terrain itself guided where roads should go','Natural geography that happens to look like veins','Federal highway standards'],
  correctIndex:1,
  revealsCollections:['founding','entity'],
  bonusLore:'A letter from Elias Holt to his wife, dated May 1923:\n\n"Dearest Martha,\nI know I said we\'d settle near the Hendricks plot up north. I know the paperwork is filed. But I have to tell you what happened.\n\nTwenty miles out, the horse stopped. Wouldn\'t go north. I turned her west — nothing. East — nothing. South — she started walking before I touched the reins.\n\nI let her lead. After ten miles I felt it too. A pulling, Martha. Not in my chest. In the wheels. Like the ground itself had ruts already laid down for us.\n\nThe valley opened up and I knew. My pen moved across the survey paper like it had been here before. I drew the road plan in twenty minutes. It usually takes me weeks.\n\nI\'m sorry. We\'re not going north. This is the place.\n\nYours,\nElias"',
  bonusCategory:'history',
  bonusCollections:['founding','entity'],
  hint:'Holt said the terrain "guided his pen." The valley wanted to be found.',
  difficulty:2
},
{
  id:'anand_return',
  requiredPins:['spice_survey','mei_journal'],
  question:'Spice Meridian\'s foundation has been rebuilt seven times with ancient materials. Mei Chen\'s journal describes the entity\'s attention. Both sit on the network. What draws people to these specific locations?',
  choices:['Good real estate prices in those neighborhoods','The entity feeds on human activity at network junctions and ensures they remain active','Historical zoning requirements','Family tradition and cultural heritage'],
  correctIndex:1,
  revealsCollections:['anand','entity','deep_history'],
  bonusLore:'Priya Anand\'s mother kept a diary. Entry from 1983: "Left Millhaven today. The baby won\'t stop crying. I feel something pulling us back. We have to keep driving." Priya returned 40 years later, following a recipe box she doesn\'t remember packing.',
  bonusCategory:'discoveries',
  bonusCollections:['anand','entity'],
  hint:'Seven rebuilds across unknown time periods — someone or something keeps bringing people back.',
  difficulty:3
},
{
  id:'voss_caruso_link',
  requiredPins:['voss_caruso_note','civic_surcharge'],
  question:'Voss confirmed the Caruso operation but left it alone. Caruso created a corrupt surcharge to pressure commissioners into building roads. Why would Voss ignore the Carusos?',
  choices:['Voss was paid off by the Carusos','Voss realized the Carusos\' pressure to build roads served the entity\'s purpose — they were useful','Voss was afraid of the Caruso family','Voss didn\'t have enough evidence'],
  correctIndex:1,
  revealsCollections:['voss','caruso'],
  bonusLore:'A margin note in Voss\'s journal, barely legible: "The Carusos think they run this town. They don\'t know what runs them. Every commissioner they pressure into building roads feeds the same thing I found in the tunnels. Let them keep pushing. It would happen anyway."',
  bonusCategory:'discoveries',
  bonusCollections:['voss','caruso','entity'],
  hint:'Both the Carusos and the entity want the same thing: more roads built.',
  difficulty:3
},
{
  id:'mystery_of_the_teddy_bear',
  requiredPins:['teddy_note_1','teddy_note_2'],
  question:'The girl left Mr. Buttons behind and someone took him. What happened to the bear?',
  choices:[
    'He was thrown away by a groundskeeper',
    'A lonely elderly neighbor found him and kept him on their windowsill',
    'He was lost forever in the move'
  ],
  correctIndex:1,
  difficulty:1,
  hint:'Think about who would treasure a found toy most.',
  bonusLore:'\ud83d\udcec A thank-you letter arrives years later: "Dear stranger, I\'m all grown up now. I walked past old Mr. Henderson\'s house last week and saw Mr. Buttons in the window. He looked happy. Thank you for helping me find peace." \u2014 Sarah',
  bonusCategory:'discoveries',
  bonusCollections:[],
  revealsCollections:[],
  tutorialOnly:true
}
];

// Specific restaurant lore names (guaranteed to spawn)
const LORE_RESTAURANT_NAMES = {
Italian: 'La Dolce Via',
Chinese: 'Golden Lotus',
American: "Holt's Diner",
Indian: 'Spice Meridian',
Mexican: 'El Camino'
};

// Specific restaurant lore descriptions
const RESTAURANT_LORE = {
'La Dolce Via':{desc:'Run by Rosa Caruso, age 71. Family-owned since 1951. Four generations. Famous tiramisu. Beloved community figure.',dark:'Revenue never fluctuates normally. The Carusos have been here a long time.'},
'Golden Lotus':{desc:'Run by Mei Chen since 1941. Warmest lunch atmosphere in town. Red lanterns, star anise on the breeze. Mei works the front of house every single day.',dark:'Revenue is exactly $4,847.00 every week. Mei is listed as 94. She looks 40.'},
"Holt's Diner":{desc:'Named after the town founder. Classic American diner. Red vinyl booths. Pie under glass. Current owner Tommy Pitts inherited it reluctantly.',dark:'Storage B generates $200/week. No traffic. A car parks behind the diner late at night and leaves before morning.'},
'Spice Meridian':{desc:'Opened recently by Priya Anand from Chicago. Exceptional food. Best lunch crowds of any new restaurant. She did extensive renovations — kept the bones.',dark:'The foundation has been rebuilt at least seven times. Priya was born here. She doesn\'t remember.'},
'El Camino':{desc:'Run by Jorge and Carmen Reyes from San Antonio. Best margaritas in town. Loud on Friday nights. Their teenage daughter waitresses on weekends.',dark:'Jorge plays poker on Tuesdays. He\'s been winning. That\'s the whole secret.'}
};

const CAR_COLORS = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#ecf0f1','#34495e','#d35400','#c0392b','#2980b9','#27ae60','#f39c12','#8e44ad'];
const TRUCK_COLORS = ['#f5f5dc','#e8e8e8','#c0c8d0','#d4a574','#8b7355','#b0b0b0'];

const TUTORIAL_PAGES = [
{icon:'🏛️',title:'Welcome, Commissioner',body:`Welcome to <b>Tiny Town Traffic</b> — you are the newly appointed Transport Commissioner of Millhaven.\n\nYour job: build roads, connect homes to workplaces, and keep traffic flowing.\n\nThree game modes:\n• <b>Normal</b> — balanced economy, go bankrupt and it's game over\n• <b>Endless</b> — relaxed, no game-over condition\n• <b>Creative</b> — unlimited money, build freely`,hint:'The previous Commissioner vanished under unclear circumstances. Nobody talks about it.'},
{icon:'🛣️',title:'Building Roads',body:`Click a road type in the side panel (or use a hotkey), then click tiles on the map to place them.\n\n<b>Road Types:</b>\n• <kbd>R</kbd> Dirt Road — $10, capacity 2\n• <kbd>T</kbd> Two-Lane Road — $25, capacity 4\n• <kbd>V</kbd> One-Way Road — $30, forced direction with adjustable speed limit\n• <kbd>Y</kbd> Multi-Lane — $50, capacity 8\n• <kbd>H</kbd> Highway — $100, capacity 12\n• <kbd>B</kbd> Flyover — $75, elevated overpass\n• <kbd>U</kbd> Tunnel — $120, goes through mountains\n\nPress <kbd>L</kbd> to toggle <b>Straight Line</b> mode for quick road drawing.`,hint:'The roads didn\'t bring people to Millhaven. Something else did.'},
{icon:'💰',title:'Paid Roads & Tolls',body:`Paid roads generate toll revenue but come with a risk.\n\n• <kbd>4</kbd> Paid 2-Lane — $40\n• <kbd>5</kbd> Paid Multi — $70\n• <kbd>6</kbd> Paid Highway — $140\n\n<b>Warning:</b> If paid roads exceed <b>20%</b> of your total network, workers may go on <b>strike</b> — refusing to commute until you reduce tolls.\n\nWatch the <b>Toll %</b> indicator in the HUD.`,hint:'Certain old families have lived here since before the roads were built. They never seem to age.'},
{icon:'🏗️',title:'Buildings & Infrastructure',body:`<b>Buildings:</b>\n• <kbd>K</kbd> Parking Lot ($60) — reduces congestion near busy areas\n• <kbd>M</kbd> Maintenance Depot ($200) — repairs nearby roads automatically\n\nHouses, offices, restaurants, and schools spawn <b>automatically</b> as you build roads near open land.\n\nLook for disconnect indicators in the HUD — <b>🏚️</b> means houses can't reach any workplace. Click the indicator to cycle through them.`,hint:'Rosa Caruso stopped by the commissioner\'s office. She left her card and says she\'d love to discuss development plans.'},
{icon:'🔧',title:'Tools & Road Upkeep',body:`<b>Tools:</b>\n• <kbd>X</kbd> Demolish — remove roads/buildings (click & drag for area)\n• <kbd>I</kbd> Inspect — click a road or building to see details\n• <kbd>F</kbd> Traffic Control — place signals at intersections\n\n<b>Road Upkeep</b> affects road durability:\n• <kbd>7</kbd> Low — $2/road/week, more breakdowns\n• <kbd>8</kbd> Medium — $5/road/week, balanced\n• <kbd>9</kbd> High — $10/road/week, fewest breakdowns\n\nBroken roads block traffic until repaired by a maintenance depot.`,hint:'Some roads, when demolished, reveal ghost asphalt underneath — from a network that predates the town.'},
{icon:'🚗',title:'Traffic & Commutes',body:`Each family has members who commute to work, school, or restaurants. Cars appear on the roads during rush hours.\n\n<b>Congestion</b> happens when a road's traffic exceeds its capacity. Congested roads slow everyone down and can cascade through the network.\n\nUse <kbd>I</kbd> Inspect on a road to see its current traffic load, capacity, and which families use it.\n\nUpgrade busy roads to higher-capacity types to keep traffic flowing.`,hint:'Late at night, some residents report seeing a car on the road that doesn\'t belong to anyone.'},
{icon:'🏦',title:'Economy & Bank',body:`<b>Revenue sources:</b> weekly tax from houses & businesses, toll road income\n<b>Expenses:</b> road upkeep, maintenance depots, loan interest\n\nA <b>weekly report</b> appears every 7 in-game days summarizing your finances.\n\nIf your balance goes negative, you'll automatically take a <b>bank loan</b> at 5% weekly interest. Too much debt = game over (in Normal mode).\n\nKeep an eye on the <b>Balance</b> and <b>Weekly Rev</b> indicators in the HUD.`,hint:'The Golden Lotus has reported exactly $4,847.00 in revenue every single week since 1941.'},
{icon:'🗺️',title:'Camera & Navigation',body:`<b>Camera controls:</b>\n• <kbd>↑↓←→</kbd> Arrow keys — pan the camera\n• <kbd>+</kbd> / <kbd>-</kbd> — zoom in and out\n• <kbd>Q</kbd> / <kbd>E</kbd> — rotate the isometric view\n• <kbd>C</kbd> — center camera on the map\n• Mouse wheel — zoom\n\nThe <b>minimap</b> (bottom-right) shows your whole network. Click it to jump to that location.\n\nUse the <b>search bar</b> in the HUD to find roads, families, or buildings by name.`,hint:'Elias Holt described the valley as "almost eager to be connected" in his 1923 survey notes.'},
{icon:'📜',title:'Lore Journal & Discoveries',body:`Press <kbd>N</kbd> to open the <b>Lore Journal</b> — it tracks discoveries about Millhaven's mysterious history.\n\n<b>Categories:</b> History, Discoveries, Events\n\nYou'll find artifacts by:\n• Building roads (rare chance per tile)\n• Tunneling through mountains (higher chance)\n• Clicking on lakes and water tiles\n\nEach discovery adds a journal entry. Some reveal dark secrets about the town's past and the families that run it.`,hint:'A child\'s drawing found under a road shows a town with roads spreading outward like roots.'},
{icon:'⌨️',title:'All Keyboard Shortcuts',body:`<b>General:</b> <kbd>Space</kbd>/<kbd>P</kbd> pause, <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> speed\n<b>Camera:</b> <kbd>Arrows</kbd> pan, <kbd>+/-</kbd> zoom, <kbd>Q/E</kbd> rotate, <kbd>C</kbd> center\n<b>Roads:</b> <kbd>R</kbd> <kbd>T</kbd> <kbd>Y</kbd> <kbd>H</kbd> <kbd>B</kbd> <kbd>U</kbd> <kbd>V</kbd>\n<b>Paid:</b> <kbd>4</kbd> <kbd>5</kbd> <kbd>6</kbd>\n<b>Buildings:</b> <kbd>K</kbd> parking, <kbd>M</kbd> maintenance\n<b>Tools:</b> <kbd>X</kbd> demolish, <kbd>I</kbd> inspect, <kbd>F</kbd> traffic, <kbd>L</kbd> straight line\n<b>Upkeep:</b> <kbd>7</kbd> <kbd>8</kbd> <kbd>9</kbd>\n<b>Panels:</b> <kbd>N</kbd> journal, <kbd>G</kbd> settings, <kbd>?</kbd> keybinds\n<b>Other:</b> <kbd>Esc</kbd> deselect, <kbd>\`</kbd> debug\n\nYou can also see these in <b>Settings → View Keybinds</b>.`,hint:'The bedrock underneath the town has structure. Almost like architecture. Good luck, Commissioner.'}
];

const COLLECTION_META = {
caruso:     { icon:'🍽️', label:'The Caruso Family',        desc:'La Dolce Via. Four generations. A long history of quiet influence.' },
bellini:    { icon:'🎣', label:'The Bellini Murder',        desc:'Marco Bellini. A permit denied. A weighted coat at the bottom of a lake.' },
mei_chen:   { icon:'🏮', label:'Mei Chen & the Golden Lotus', desc:'The restaurant opened in 1941. She hasn\'t aged. The revenue never changes.' },
voss:       { icon:'🗺️', label:'Commissioner Voss',          desc:'He lasted 11 years. He found something in the eastern hills. He wrote it all down.' },
entity:     { icon:'🌀', label:'The Network Entity',         desc:'Something beneath the roads. It has been here longer than the town.' },
deep_history:{ icon:'🗿',label:'Deep History',               desc:'Before the town. Before the roads. Something was already building here.' },
pitts:      { icon:'🥧', label:'Holt\'s Diner & the Pittses', desc:'Tommy Pitts. Storage B. A note from Gerald Caruso. He decided not to know.' },
anand:      { icon:'🌶️', label:'Spice Meridian & Priya Anand',desc:'She was born here. She doesn\'t remember. The foundation has been rebuilt seven times.' },
founding:   { icon:'📐', label:'The Founding of Millhaven',  desc:'Elias Holt. 1923. He described the valley as eager to be connected.' },
millhaven:  { icon:'🏘️', label:'Millhaven Mysteries',        desc:'Loose threads. Things that don\'t quite fit. The town has a long memory.' },
};
