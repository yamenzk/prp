import frappe
import requests
import json
from frappe.model.document import Document
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from frappe.utils import flt


class QuadTreeNode:
    def __init__(self, bounds, level=0, max_level=6):
        self.bounds = bounds  # [min_lng, min_lat, max_lng, max_lat]
        self.level = level
        self.max_level = max_level
        self.territories = []
        self.children = None  # NW, NE, SW, SE

    def subdivide(self):
        if self.level >= self.max_level:
            return

        mid_lng = (self.bounds[0] + self.bounds[2]) / 2
        mid_lat = (self.bounds[1] + self.bounds[3]) / 2

        self.children = [
            QuadTreeNode(
                [self.bounds[0], mid_lat, mid_lng, self.bounds[3]],
                self.level + 1,
                self.max_level,
            ),
            QuadTreeNode(
                [mid_lng, mid_lat, self.bounds[2], self.bounds[3]],
                self.level + 1,
                self.max_level,
            ),
            QuadTreeNode(
                [self.bounds[0], self.bounds[1], mid_lng, mid_lat],
                self.level + 1,
                self.max_level,
            ),
            QuadTreeNode(
                [mid_lng, self.bounds[1], self.bounds[2], mid_lat],
                self.level + 1,
                self.max_level,
            ),
        ]

class SpatialIndex:
    def __init__(self):
        # Get the bounds from existing territories or use default Middle East bounds
        territories = frappe.get_all(
            "PRP Territory", fields=["min_lat", "max_lat", "min_lng", "max_lng"]
        )

        if territories:
            min_lng = min(flt(t.min_lng) for t in territories)
            min_lat = min(flt(t.min_lat) for t in territories)
            max_lng = max(flt(t.max_lng) for t in territories)
            max_lat = max(flt(t.max_lat) for t in territories)

            # Add buffer
            buffer = 5.0  # 5 degrees buffer
            min_lng -= buffer
            min_lat -= buffer
            max_lng += buffer
            max_lat += buffer
        else:
            # Default to Middle East bounds if no territories exist
            min_lng, min_lat = 35.0, 12.0
            max_lng, max_lat = 60.0, 32.0

        self.root = QuadTreeNode([min_lng, min_lat, max_lng, max_lat])
        self.territory_cells = {}

    def generate_cell_id(self, lat, lng, level):
        """Generate a hierarchical cell ID based on location"""
        cell_id = ""
        bounds = self.root.bounds
        min_lat, max_lat = bounds[1], bounds[3]
        min_lng, max_lng = bounds[0], bounds[2]

        for _ in range(level):
            mid_lat = (min_lat + max_lat) / 2
            mid_lng = (min_lng + max_lng) / 2

            quadrant = 0
            if flt(lat) > mid_lat:
                quadrant += 1
            if flt(lng) > mid_lng:
                quadrant += 2

            cell_id += str(quadrant)

            if flt(lat) > mid_lat:
                min_lat = mid_lat
            else:
                max_lat = mid_lat
            if flt(lng) > mid_lng:
                min_lng = mid_lng
            else:
                max_lng = mid_lng

        return cell_id

    def get_cell_bounds(self, cell_id):
        """Get bounds for a specific cell ID"""
        bounds = list(self.root.bounds)  # Copy root bounds

        for digit in cell_id:
            mid_lng = (bounds[0] + bounds[2]) / 2
            mid_lat = (bounds[1] + bounds[3]) / 2

            quadrant = int(digit)
            if quadrant in (0, 2):  # West
                bounds[2] = mid_lng
            else:  # East
                bounds[0] = mid_lng
            if quadrant in (0, 1):  # South
                bounds[3] = mid_lat
            else:  # North
                bounds[1] = mid_lat

        return bounds

    def get_covering_cells(self, bounds, max_level=6):
        """Get all cells that cover a territory's bounds"""
        min_cell = self.generate_cell_id(bounds[1], bounds[0], max_level)
        max_cell = self.generate_cell_id(bounds[3], bounds[2], max_level)

        # Find common prefix
        common_prefix = ""
        for i in range(min(len(min_cell), len(max_cell))):
            if min_cell[i] == max_cell[i]:
                common_prefix += min_cell[i]
            else:
                break

        # Use common prefix as the cell ID
        return [common_prefix] if common_prefix else [min_cell]

spatial_index = SpatialIndex()


def calculate_overlap_percentage(geom1, geom2):
    """Calculate what percentage of geom1 is contained within geom2"""
    try:
        if not geom1.is_valid or not geom2.is_valid:
            geom1 = geom1.buffer(0)
            geom2 = geom2.buffer(0)
        
        intersection_area = geom1.intersection(geom2).area
        geom1_area = geom1.area
        
        frappe.log(f"Areas - Intersection: {intersection_area}, Total: {geom1_area}")
        
        if geom1_area == 0:
            return 0
            
        percentage = (intersection_area / geom1_area) * 100
        frappe.log(f"Calculated overlap percentage: {percentage}")
        return percentage
    except Exception as e:
        frappe.log(f"Error in overlap calculation: {str(e)}")
        return 0

class PRPTerritory(Document):
    def before_insert(self):
        if self.osm_id and not self.is_custom:
            try:
                osm_type = "relation"
                osm_id = self.osm_id

                if self.osm_id.upper().startswith(("R", "W", "N")):
                    type_map = {"R": "relation", "W": "way", "N": "node"}
                    osm_type = type_map[self.osm_id[0]]
                    osm_id = self.osm_id[1:]

                overpass_url = "http://overpass-api.de/api/interpreter"
                overpass_query = f"""
                    [out:json][timeout:25];
                    {osm_type}({osm_id});
                    (._;>;);
                    out body;
                    out skel qt;
                """

                response = requests.post(overpass_url, data=overpass_query)
                if response.status_code != 200:
                    frappe.throw(f"Failed to fetch OSM data. Status code: {response.status_code}")

                osm_data = response.json()
                frappe.log(f"OSM Response for {self.osm_id}:")
                frappe.log(json.dumps(osm_data, indent=2))

                if not osm_data.get("elements"):
                    frappe.throw(f"No data found for OSM ID: {self.osm_id}")

                main_element = next((e for e in osm_data["elements"] if str(e["id"]) == osm_id), None)
                if not main_element:
                    frappe.throw(f"Main element not found for OSM ID: {self.osm_id}")

                tags = main_element.get("tags", {})
                self.territory_name = tags.get("name", "")
                self.name_en = tags.get("name:en", tags.get("name", ""))
                self.name_ar = tags.get("name:ar", "")
                self.wikidata = tags.get("wikidata", "")
                self.admin_level = tags.get("admin_level", "")
                self.boundary = tags.get("boundary", "")
                self.border_type = tags.get("border_type", "")
                self.place = tags.get("place", "")
                self.landuse = tags.get("landuse", "")
                self.residential = tags.get("residential", "")

                if osm_type == "node":
                    geometry = {
                        "type": "Point",
                        "coordinates": [
                            flt(main_element.get("lon")),
                            flt(main_element.get("lat")),
                        ],
                    }
                    self.lat = str(flt(main_element.get("lat")))
                    self.lng = str(flt(main_element.get("lon")))
                    self.min_lat = flt(main_element.get("lat"))
                    self.max_lat = flt(main_element.get("lat"))
                    self.min_lng = flt(main_element.get("lon"))
                    self.max_lng = flt(main_element.get("lon"))

                elif osm_type == "way":
                    nodes = {n["id"]: n for n in osm_data["elements"] if n["type"] == "node"}
                    coordinates = []
                    for nd_ref in main_element.get("nodes", []):
                        if nd_ref in nodes:
                            node = nodes[nd_ref]
                            coordinates.append([flt(node["lon"]), flt(node["lat"])])

                    is_closed = (main_element["nodes"][0] == main_element["nodes"][-1]) if main_element.get("nodes") else False

                    if is_closed and len(coordinates) >= 4:
                        geometry = {"type": "Polygon", "coordinates": [coordinates]}
                    else:
                        geometry = {"type": "LineString", "coordinates": coordinates}

                    if coordinates:
                        all_lats = [coord[1] for coord in coordinates]
                        all_lons = [coord[0] for coord in coordinates]
                        self.min_lat = flt(min(all_lats))
                        self.max_lat = flt(max(all_lats))
                        self.min_lng = flt(min(all_lons))
                        self.max_lng = flt(max(all_lons))
                        self.lng = str(flt(sum(all_lons) / len(all_lons)))
                        self.lat = str(flt(sum(all_lats) / len(all_lats)))

                else:  # relation
                    nodes = {n["id"]: n for n in osm_data["elements"] if n["type"] == "node"}
                    ways = {w["id"]: w for w in osm_data["elements"] if w["type"] == "way"}

                    frappe.log(f"Processing relation {self.osm_id}")
                    frappe.log(f"Number of nodes: {len(nodes)}")
                    frappe.log(f"Number of ways: {len(ways)}")

                    outer_rings = []
                    processed_nodes = set()

                    members = sorted(
                        [m for m in main_element.get("members", []) 
                         if m["type"] == "way" and m.get("role") == "outer"],
                        key=lambda x: x["ref"],
                    )

                    current_ring = []
                    for member in members:
                        if member["ref"] in ways:
                            way = ways[member["ref"]]
                            for node_id in way.get("nodes", []):
                                if node_id in nodes:
                                    node = nodes[node_id]
                                    coord = [flt(node["lon"]), flt(node["lat"])]
                                    if node_id not in processed_nodes:
                                        current_ring.append(coord)
                                        processed_nodes.add(node_id)

                    if current_ring and current_ring[0] != current_ring[-1]:
                        current_ring.append(current_ring[0])

                    if len(current_ring) >= 4:
                        outer_rings.append(current_ring)

                    if outer_rings:
                        geometry = {
                            "type": "MultiPolygon",
                            "coordinates": [[ring] for ring in outer_rings]
                        }

                        all_lats = [coord[1] for ring in outer_rings for coord in ring]
                        all_lons = [coord[0] for ring in outer_rings for coord in ring]

                        self.min_lat = flt(min(all_lats))
                        self.max_lat = flt(max(all_lats))
                        self.min_lng = flt(min(all_lons))
                        self.max_lng = flt(max(all_lons))
                        self.lng = str(flt(sum(all_lons) / len(all_lons)))
                        self.lat = str(flt(sum(all_lats) / len(all_lats)))

                        frappe.log(f"Created MultiPolygon with {len(outer_rings)} rings")
                        frappe.log(f"Bounding box: lat [{self.min_lat}, {self.max_lat}], lng [{self.min_lng}, {self.max_lng}]")

                self.geo = json.dumps(geometry)
                if self.osm_id.upper().startswith(("R", "W", "N")):
                    self.osm_id = self.osm_id[1:]

            except Exception as e:
                frappe.log_error(f"Error fetching OSM data: {str(e)}", "PRP Territory OSM Fetch")
                frappe.throw(f"Error fetching OSM data: {str(e)}")

    def update_spatial_index(self):
        """Update spatial index information for the territory"""
        try:
            # Get covering cells
            bounds = [
                flt(self.min_lng),
                flt(self.min_lat),
                flt(self.max_lng),
                flt(self.max_lat)
            ]

            # Calculate appropriate quadtree level based on territory size
            lng_span = bounds[2] - bounds[0]
            lat_span = bounds[3] - bounds[1]
            max_span = max(lng_span, lat_span)

            # Adjust level based on territory size and set to db
            quadtree_level = 6  # default
            if max_span > 1.0:
                quadtree_level = 2
            elif max_span > 0.1:
                quadtree_level = 4

            frappe.db.set_value(
                "PRP Territory", 
                self.name, 
                "quadtree_level", 
                quadtree_level
            )

            cells = spatial_index.get_covering_cells(bounds, quadtree_level)
            frappe.db.set_value(
                "PRP Territory", 
                self.name, 
                "spatial_index_cell", 
                cells[0]
            )

            # Store cell bounds
            cell_bounds = spatial_index.get_cell_bounds(cells[0])
            frappe.db.set_value(
                "PRP Territory", 
                self.name, 
                "cell_bounds", 
                json.dumps(cell_bounds)
            )

            frappe.db.commit()

            frappe.log(f"Updated spatial index for {self.name}: Level {quadtree_level}, Cell {cells[0]}")

        except Exception as e:
            frappe.log_error(f"Error updating spatial index: {str(e)}", "PRP Territory Spatial Index")

    def get_potential_overlaps(self):
        """Enhanced territory overlap detection using spatial index"""
        frappe.log(f"\n=== Checking potential overlaps ===")

        # Get territories in the same or adjacent cells
        cell_id = self.spatial_index_cell
        parent_cell = cell_id[:-1] if cell_id else ""

        potential_territories = frappe.get_all(
            "PRP Territory",
            filters={
                "name": ["!=", self.name],
                "spatial_index_cell": ["like", f"{parent_cell}%"]
            },
            fields=[
                "name", "geo", "parent_territory", "min_lat", "max_lat",
                "min_lng", "max_lng", "territory_name", "spatial_index_cell"
            ]
        )

        frappe.log(f"Found {len(potential_territories)} territories in nearby cells")

        # Filter by bounding box
        filtered_territories = []
        for territory in potential_territories:
            if (
                flt(territory.min_lat) <= flt(self.max_lat)
                and flt(territory.max_lat) >= flt(self.min_lat)
                and flt(territory.min_lng) <= flt(self.max_lng)
                and flt(territory.max_lng) >= flt(self.min_lng)
            ):
                filtered_territories.append(territory)
                frappe.log(f"Added {territory.name} as potential overlap")

        return filtered_territories

    def update_territory_hierarchy(self):
        frappe.log(f"\n=== Starting hierarchy update for territory {self.name} ===")
        frappe.log(f"Territory Name: {self.territory_name}")

        current_geo = shape(json.loads(self.geo))
        frappe.log(f"Current territory geometry type: {current_geo.geom_type}")

        potential_territories = self.get_potential_overlaps()
        frappe.log(
            f"Found {len(potential_territories)} potential overlapping territories"
        )

        overlap_threshold = 80
        potential_parents = []
        potential_children = []

        # First, get existing territory hierarchy
        all_territories = frappe.get_all(
            "PRP Territory", fields=["name", "parent_territory"]
        )
        territory_hierarchy = {t.name: t.parent_territory for t in all_territories}

        def get_direct_children(territory_name):
            return [
                name
                for name, parent in territory_hierarchy.items()
                if parent == territory_name
            ]

        for territory in potential_territories:
            frappe.log(
                f"\nChecking territory: {territory.name} ({territory.territory_name})"
            )
            try:
                other_geo = shape(json.loads(territory.geo))

                frappe.log(f"Current territory area: {current_geo.area}")
                frappe.log(f"Other territory area: {other_geo.area}")

                # Check if other territory is inside current territory
                overlap = calculate_overlap_percentage(other_geo, current_geo)
                frappe.log(f"{territory.name} is {overlap}% inside current territory")
                if overlap >= overlap_threshold:
                    potential_children.append(
                        {
                            "name": territory.name,
                            "current_parent": territory_hierarchy.get(territory.name),
                            "area": other_geo.area,
                        }
                    )
                    frappe.log(f"Added {territory.name} as potential child")

                # Check if current territory is inside other territory
                overlap = calculate_overlap_percentage(current_geo, other_geo)
                frappe.log(f"Current territory is {overlap}% inside {territory.name}")
                if overlap >= overlap_threshold:
                    potential_parents.append(
                        {
                            "name": territory.name,
                            "overlap": overlap,
                            "area": other_geo.area,
                        }
                    )
                    frappe.log(f"Added {territory.name} as potential parent")
            except Exception as e:
                frappe.log(f"Error processing territory {territory.name}: {str(e)}")
                continue

        # Set parent for current territory if found
        if potential_parents:
            parent = min(potential_parents, key=lambda x: x["area"])
            frappe.log(f"Setting parent of {self.name} to {parent['name']}")
            frappe.db.set_value(
                "PRP Territory", self.name, "parent_territory", parent["name"]
            )

        # Process children
        if potential_children:
            # Sort children by area from largest to smallest to process larger territories first
            potential_children.sort(key=lambda x: x["area"], reverse=True)

            # First, identify which territories are already children of another potential child
            child_names = {child["name"] for child in potential_children}
            territories_to_skip = set()

            for child in potential_children:
                child_name = child["name"]
                current_parent = child["current_parent"]

                # If current parent is also in our potential children list, skip this territory
                if current_parent in child_names:
                    territories_to_skip.add(child_name)
                    frappe.log(
                        f"Skipping {child_name} as its parent {current_parent} is also a potential child"
                    )

            # Now process only the top-level territories
            for child in potential_children:
                child_name = child["name"]

                if child_name not in territories_to_skip:
                    frappe.log(f"Setting parent of {child_name} to {self.name}")
                    frappe.db.set_value(
                        "PRP Territory", child_name, "parent_territory", self.name
                    )

                    # Log the maintained hierarchy
                    direct_children = get_direct_children(child_name)
                    if direct_children:
                        frappe.log(
                            f"Maintaining existing hierarchy under {child_name}: {direct_children}"
                        )

        frappe.log("\n=== Finished hierarchy update ===")
        frappe.db.commit()

    def after_insert(self):
        self.update_spatial_index()
        self.update_territory_hierarchy()

    def validate(self):
        if not self.territory_name:
            frappe.throw("Territory Name is required")
