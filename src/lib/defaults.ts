import type { DateItem, Place, Planner } from "./types";
import { mapsUrl } from "./format";

function D(id: string, day: number, title: string, cat: string, desc: string, place: string, planned: number, transport: number, food: number, q: string, extra: Partial<DateItem> = {}): DateItem {
  return { id, day, title, cat, desc, place, planned, transport, food, q, status: "Planned", actual: null, notes: "", rating: 0, span: 1, ...extra };
}
function P(id: string, name: string, area: string, cat: string, cost: number, note: string): Place {
  return { id, name, area, cat, cost, link: mapsUrl(name + " " + area), who: "idea", note, visited: false, dateId: null };
}
export function defaultPlaces(): Place[] {
  return [
  P("p1","People's Park in the Sky","Tagaytay","Outdoor",400,"Highest viewpoint in Tagaytay. Go early on a clear day for the Taal view."),
  P("p2","Puzzle Mansion","Tagaytay","Other",600,"Museum of giant jigsaw puzzles. Fun if you both like games."),
  P("p3","Museo Orlina","Tagaytay","Other",800,"Glass sculpture museum with a garden café. Quiet and pretty."),
  P("p4","Mahogany Market","Tagaytay","Food trip",700,"Classic bulalo food trip. Cheaper than the ridge restaurants."),
  P("p5","Caleruega Church","Nasugbu, Batangas","Outdoor",900,"Hilltop chapel and gardens. Nice for photos; about 40 min from Tagaytay."),
  P("p6","Mt. Gulugod Baboy","Mabini, Batangas","Outdoor",1500,"Beginner-friendly sunrise hike with sea views. Needs an early start."),
  P("p7","Nuvali","Santa Rosa, Laguna","Outdoor",800,"Bike around, feed the koi, then dinner at the lakeside strip.")
];
}

/** The original May plan, including clearly marked demo progress. */
export function defaults(): Planner {
  return {
  v: 1,names:{p1:"Boyet",p2:"Peachy"},budget:10000,target:10000,demo:true,
  dates:[
    D("d1",1,"Taal View Café Date","Café","Ride up to Tagaytay, pick a ridge café facing Taal Lake, and share coffee and cake while you plan the rest of the month together.","A ridge café along Aguinaldo Hwy, Tagaytay",900,300,600,"Tagaytay cafe with Taal view",{status:"Completed",actual:850,notes:"Demo: windy but worth it, we split a slice of cheesecake.",rating:5,demoP:true}),
    D("d2",2,"Mall & Arcade Showdown","Games","Load one arcade card and play best of five: basketball, racing, air hockey, and the claw machine. The loser treats the winner to milk tea.","Nearest mall arcade · arcade card",800,150,250,"couple arcade date",{status:"Completed",actual:920,notes:"Demo: Peachy won 3–2.",rating:4,demoP:true}),
    D("d3",5,"Home Movie Night","Home","Lights off, blankets on, a double feature where each of you picks one film. Use snacks already in the kitchen.","Home · TV or laptop, blankets, pillows",0,0,0,"at home movie date night ideas",{status:"Completed",notes:"Demo: no-spend night.",rating:4,demoP:true}),
    D("d4",8,"Bake Together Day","Cooking","Pick one recipe neither of you has tried, like ube crinkles, banana bread, or homemade pizza, and make it from scratch. Share a plate with family after.","Home kitchen · flour, sugar, eggs, butter, flavoring",600,0,600,"couple baking date at home"),
    D("d5",9,"Paint Each Other Night","Crafts","Set a 30-minute timer and paint each other's portraits. Swap them at the end and keep the funniest one on display.","Home · 2 small canvases, acrylic set, brushes from a bookstore",500,0,0,"paint each other couple challenge"),
    D("d6",12,"Couple Photo Challenge","Home","Recreate an old photo of yourselves, then shoot a 10-shot list: matching poses, a golden-hour silhouette, a candid laugh. Pick one to print later.","Your barangay, a park, or the subdivision clubhouse",0,0,0,"couple photo challenge ideas"),
    D("d7",15,"Picnic at Picnic Grove","Outdoor","Pack sandwiches, fruit, and a mat, then picnic on the grass with the Taal breeze. Bring a deck of cards for after lunch.","Picnic Grove, Tagaytay · mat, packed food, cards",900,300,450,"couple picnic ideas Philippines"),
    D("d8",16,"Sky Ranch Rides + Bulalo","Food trip","Ride the big Ferris wheel and a few rides, then a classic bulalo lunch and a buko pie to bring home.","Sky Ranch Tagaytay, then a bulalo spot on the ridge",1300,300,500,"Tagaytay food trip bulalo"),
    D("d9",19,"Sunset & Stargazing Walk","Outdoor","Walk to the highest open spot near you before 6 PM, watch the sunset, then stay to find constellations with a free sky-map app.","A nearby open field, rooftop, or overlooking",0,0,0,"sunset date ideas"),
    D("d10",22,"Tagaytay Staycation","Staycation","Check in Saturday afternoon to a cozy room with a view. Order in, play board games, sleep in, and have a slow breakfast before Sunday checkout.","Budget hotel or Airbnb in Tagaytay · board game, speaker",3500,300,1000,"Tagaytay staycation couple",{span:2}),
    D("d11",26,"Memory Jar & Handmade Gifts","Crafts","Each of you writes 15 small notes of favorite memories for a shared jar and makes a small gift from things at home. Exchange them over coffee.","Home · a jar, paper, pens, craft scraps",0,0,0,"handmade gift ideas for couples"),
    D("d12",28,"Romantic Dinner Date","Dinner","Dress up a little, book a table with a view, and end the month with a toast to what you saved together.","A ridge restaurant in Tagaytay, or somewhere special closer to home",1200,200,1000,"romantic dinner date Tagaytay")
  ],
  places:defaultPlaces(),
  contribs:[
    {id:"c1",date:"2027-05-01",who:"p1",amount:2000,type:"Digital",note:"Payday transfer",purpose:"Staycation",demo:true},
    {id:"c2",date:"2027-05-01",who:"p2",amount:1500,type:"Cash",note:"",purpose:"Date fund",demo:true},
    {id:"c3",date:"2027-05-08",who:"p1",amount:1000,type:"Cash",note:"",purpose:"Date fund",demo:true},
    {id:"c4",date:"2027-05-10",who:"p2",amount:1500,type:"Digital",note:"GCash",purpose:"Staycation",demo:true}
  ]};
}

/** True when an object looks like a saved planner. */
export function isPlanner(o: unknown): o is Planner {
  const p = o as Planner;
  return !!p && typeof p === "object" && Array.isArray(p.dates) && Array.isArray(p.contribs) && !!p.names;
}

/** Fills in anything older saves are missing. */
export function normalize(p: Planner): Planner {
  if (!Array.isArray(p.places)) p.places = defaultPlaces();
  return p;
}
