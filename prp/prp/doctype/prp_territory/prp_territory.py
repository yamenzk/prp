import frappe
import json
import requests
import time
from frappe.model.document import Document
from shapely.geometry import shape, Point, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union
from frappe.utils import flt, cint, get_datetime, now

# Utility functions for geometry processing


def calculate_centroid(geometry):
    """Calculate centroid for a GeoJSON geometry"""
    try:
        if geometry["type"] == "Point":
            return geometry["coordinates"]
        elif geometry["type"] == "Polygon":
            coords = geometry["coordinates"][0]  # Outer ring
            x = sum(point[0] for point in coords) / len(coords)
            y = sum(point[1] for point in coords) / len(coords)
            return [x, y]
        elif geometry["type"] == "MultiPolygon":
            # Use the largest polygon for centroid
            largest_poly = max(geometry["coordinates"], key=lambda poly: len(poly[0]))
            coords = largest_poly[0]  # Outer ring of largest polygon
            x = sum(point[0] for point in coords) / len(coords)
            y = sum(point[1] for point in coords) / len(coords)
            return [x, y]
        return None
    except Exception as e:
        frappe.log_error(f"Error calculating centroid: {str(e)}", "Territory Geometry")
        return None


def calculate_bounds(geometry):
    """Calculate bounding box for a GeoJSON geometry"""
    try:
        geom = shape(geometry)
        bounds = geom.bounds  # (minx, miny, maxx, maxy)
        return {
            "min_lng": bounds[0],
            "min_lat": bounds[1],
            "max_lng": bounds[2],
            "max_lat": bounds[3],
        }
    except Exception as e:
        frappe.log_error(f"Error calculating bounds: {str(e)}", "Territory Geometry")
        return None


def verify_geometry_within(child_geometry, parent_geometry):
    """Verify if a geometry is completely within another geometry"""
    try:
        child_shape = shape(child_geometry)
        parent_shape = shape(parent_geometry)

        # Check if child is within parent
        return parent_shape.contains(child_shape)
    except Exception as e:
        frappe.log_error(
            f"Error verifying geometry containment: {str(e)}", "Territory Geometry"
        )
        return False


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


# OSM Data Fetching functions


def fetch_osm_data(osm_id):
    """Fetch geometry and metadata from OSM by ID"""
    try:
        osm_type = "relation"
        id_value = osm_id

        # Handle prefixed OSM IDs (R, W, N)
        if osm_id.upper().startswith(("R", "W", "N")):
            type_map = {"R": "relation", "W": "way", "N": "node"}
            osm_type = type_map[osm_id[0].upper()]
            id_value = osm_id[1:]

        frappe.log(f"Fetching OSM data for {osm_type}/{id_value}")

        overpass_url = "http://overpass-api.de/api/interpreter"
        overpass_query = f"""
           [out:json][timeout:25];
           {osm_type}({id_value});
           (._;>;);
           out body;
           out skel qt;
       """

        response = requests.post(overpass_url, data=overpass_query)
        if response.status_code != 200:
            frappe.log_error(
                f"Failed to fetch OSM data. Status code: {response.status_code}",
                "OSM Fetch",
            )
            return None

        osm_data = response.json()
        return process_osm_data(osm_data, osm_type, id_value)

    except Exception as e:
        frappe.log_error(f"Error in fetch_osm_data: {str(e)}", "OSM Fetch")
        return None


def process_osm_data(osm_data, osm_type, osm_id):
    """Process OSM data into a structured format with geometry"""
    try:
        if not osm_data.get("elements"):
            frappe.log_error(
                f"No elements found for OSM ID: {osm_id}", "OSM Processing"
            )
            return None

        # Find the main element
        main_element = next(
            (e for e in osm_data["elements"] if str(e["id"]) == osm_id), None
        )
        if not main_element:
            frappe.log_error(
                f"Main element not found for OSM ID: {osm_id}", "OSM Processing"
            )
            return None

        # Extract metadata
        tags = main_element.get("tags", {})
        result = {
            "name": tags.get("name", ""),
            "name_en": tags.get("name:en", tags.get("name", "")),
            "name_ar": tags.get("name:ar", ""),
            "wikidata": tags.get("wikidata", ""),
            "admin_level": tags.get("admin_level", ""),
            "boundary": tags.get("boundary", ""),
            "border_type": tags.get("border_type", ""),
            "place": tags.get("place", ""),
            "landuse": tags.get("landuse", ""),
            "residential": tags.get("residential", ""),
        }

        # Process geometry based on OSM type
        if osm_type == "node":
            geometry = {
                "type": "Point",
                "coordinates": [
                    flt(main_element.get("lon")),
                    flt(main_element.get("lat")),
                ],
            }
            result.update(
                {
                    "lat": flt(main_element.get("lat")),
                    "lng": flt(main_element.get("lon")),
                    "min_lat": flt(main_element.get("lat")),
                    "max_lat": flt(main_element.get("lat")),
                    "min_lng": flt(main_element.get("lon")),
                    "max_lng": flt(main_element.get("lon")),
                }
            )

        elif osm_type == "way":
            nodes = {n["id"]: n for n in osm_data["elements"] if n["type"] == "node"}
            coordinates = []
            for nd_ref in main_element.get("nodes", []):
                if nd_ref in nodes:
                    node = nodes[nd_ref]
                    coordinates.append([flt(node["lon"]), flt(node["lat"])])

            is_closed = (
                (main_element["nodes"][0] == main_element["nodes"][-1])
                if main_element.get("nodes")
                else False
            )

            if is_closed and len(coordinates) >= 4:
                geometry = {"type": "Polygon", "coordinates": [coordinates]}
            else:
                geometry = {"type": "LineString", "coordinates": coordinates}

            # Calculate bounds
            if coordinates:
                all_lats = [coord[1] for coord in coordinates]
                all_lons = [coord[0] for coord in coordinates]
                result.update(
                    {
                        "min_lat": flt(min(all_lats)),
                        "max_lat": flt(max(all_lats)),
                        "min_lng": flt(min(all_lons)),
                        "max_lng": flt(max(all_lons)),
                        "lng": flt(sum(all_lons) / len(all_lons)),
                        "lat": flt(sum(all_lats) / len(all_lats)),
                    }
                )

        else:  # relation
            # Process relation members into a MultiPolygon
            nodes = {n["id"]: n for n in osm_data["elements"] if n["type"] == "node"}
            ways = {w["id"]: w for w in osm_data["elements"] if w["type"] == "way"}

            frappe.log(f"Processing relation {osm_id}")
            frappe.log(f"Number of nodes: {len(nodes)}")
            frappe.log(f"Number of ways: {len(ways)}")

            outer_rings = []
            inner_rings = []

            # Process outer ways (role = outer)
            for member in main_element.get("members", []):
                if member["type"] == "way" and member["ref"] in ways:
                    way = ways[member["ref"]]
                    coords = []

                    for node_id in way.get("nodes", []):
                        if node_id in nodes:
                            node = nodes[node_id]
                            coords.append([flt(node["lon"]), flt(node["lat"])])

                    # Ensure it's a closed loop
                    if (
                        coords
                        and coords[0] != coords[-1]
                        and way["nodes"][0] == way["nodes"][-1]
                    ):
                        coords.append(coords[0])

                    if len(coords) >= 4:
                        if member.get("role") == "inner":
                            inner_rings.append(coords)
                        else:  # Default to outer
                            outer_rings.append(coords)

            # If we have outer rings, create a MultiPolygon
            if outer_rings:
                # For each outer ring, combine with its inner rings
                polygons = []
                for outer in outer_rings:
                    # Find inner rings that are inside this outer ring
                    # (Simplified - we should really check containment)
                    polygon = [outer]
                    for inner in inner_rings:
                        polygon.append(inner)
                    polygons.append(polygon)

                geometry = {"type": "MultiPolygon", "coordinates": polygons}

                # Calculate bounds from all coordinates
                all_coords = [coord for ring in outer_rings for coord in ring]
                if all_coords:
                    all_lats = [coord[1] for coord in all_coords]
                    all_lons = [coord[0] for coord in all_coords]
                    result.update(
                        {
                            "min_lat": flt(min(all_lats)),
                            "max_lat": flt(max(all_lats)),
                            "min_lng": flt(min(all_lons)),
                            "max_lng": flt(max(all_lons)),
                            "lng": flt(sum(all_lons) / len(all_coords)),
                            "lat": flt(sum(all_lats) / len(all_coords)),
                        }
                    )

                    frappe.log(f"Created MultiPolygon with {len(outer_rings)} rings")
                    frappe.log(
                        f"Bounding box: lat [{result['min_lat']}, {result['max_lat']}], lng [{result['min_lng']}, {result['max_lng']}]"
                    )
            else:
                frappe.log_error(
                    f"No valid outer rings found for relation {osm_id}",
                    "OSM Processing",
                )
                return None

        result["geo"] = json.dumps(geometry)
        return result

    except Exception as e:
        frappe.log_error(f"Error processing OSM data: {str(e)}", "OSM Processing")
        return None


def find_osm_id_for_place(name, place_type=None):
    """Try to find the OSM ID for a place by name and type"""
    try:
        # Ensure we're not hitting rate limits
        time.sleep(1)

        # Create search query
        search_url = (
            f"https://nominatim.openstreetmap.org/search?q={name}&format=json&limit=5"
        )

        # Add type-specific parameters
        if place_type:
            if place_type == "Country":
                search_url += "&countrycodes=" + name[:2].lower()
            elif place_type in ["City", "State", "District"]:
                search_url += f"&featureType={place_type.lower()}"

        response = requests.get(search_url, headers={"User-Agent": "RealEstateCRM/1.0"})

        if response.status_code != 200:
            return None

        results = response.json()
        if not results:
            return None

        # Try to find best match
        for result in results:
            display_name = result.get("display_name", "").lower()

            # Simple check if the name is in the display name
            if name.lower() in display_name:
                osm_type = result.get("osm_type", "")
                osm_id = result.get("osm_id", "")

                if osm_type and osm_id:
                    # Convert to your OSM ID format
                    type_prefix = {"relation": "R", "way": "W", "node": "N"}
                    return f"{type_prefix.get(osm_type, '')}{osm_id}"

        return None
    except Exception as e:
        frappe.log_error(f"Error finding OSM ID: {str(e)}", "OSM Search")
        return None


# Nominatim reverse geocoding


def get_location_hierarchy(lat, lng):
    """Get location hierarchy from coordinates using Nominatim"""
    try:
        # Ensure we're not hitting rate limits
        time.sleep(1)

        nominatim_url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=json&addressdetails=1&zoom=18"
        response = requests.get(
            nominatim_url, headers={"User-Agent": "RealEstateCRM/1.0"}
        )

        if response.status_code != 200:
            frappe.log_error(
                f"Nominatim API error: {response.status_code}", "Reverse Geocoding"
            )
            return None

        result = response.json()
        address = result.get("address", {})
        display_name = result.get("display_name", "")

        frappe.log(f"Reverse geocoded: {display_name}")

        # Map the address fields to territory types
        hierarchy_map = [
            {"field": "country", "type": "Country"},
            {"field": "state", "type": "State"},
            {"field": "county", "type": "County"},
            {"field": "city", "type": "City"},
            {"field": "suburb", "type": "Suburb"},
            {"field": "district", "type": "District"},
            {"field": "neighbourhood", "type": "Neighborhood"},
            {"field": "quarter", "type": "Quarter"},
            {"field": "building", "type": "Building"},
        ]

        hierarchy = []
        for level in hierarchy_map:
            field = level["field"]
            if field in address:
                hierarchy.append(
                    {
                        "name": address[field],
                        "type": level["type"],
                        "value": address[field],
                    }
                )

        return hierarchy

    except Exception as e:
        frappe.log_error(f"Error in reverse geocoding: {str(e)}", "Reverse Geocoding")
        return None


# Territory hierarchy processing


def process_territory_hierarchy(hierarchy):
    """Process territory hierarchy data, creating territories as needed"""
    if not hierarchy:
        return []

    result_hierarchy = []
    current_parent = None

    # Process from largest area (country) to smallest (neighborhood)
    for level in hierarchy:
        name = level["name"]
        place_type = level["type"]

        frappe.log(f"Processing hierarchy level: {place_type} - {name}")

        # Check if this territory already exists
        existing = frappe.get_all(
            "PRP Territory",
            filters=[
                ["territory_name", "=", name],
                # Optional: Add more precise filters if needed
            ],
            fields=["name", "parent_territory", "osm_id"],
        )

        if existing:
            # Use existing territory
            territory_id = existing[0].name
            territory_osm_id = existing[0].osm_id

            frappe.log(f"Found existing territory: {territory_id}")

            # If territory has no parent but should have one, update it
            if current_parent and not existing[0].parent_territory:
                frappe.db.set_value(
                    "PRP Territory", territory_id, "parent_territory", current_parent
                )
                frappe.log(f"Updated parent of {territory_id} to {current_parent}")
        else:
            # Try to find OSM ID for this place
            osm_id = find_osm_id_for_place(name, place_type)

            if osm_id:
                frappe.log(f"Found OSM ID for {name}: {osm_id}")

                # Fetch OSM data including boundaries
                osm_data = fetch_osm_data(osm_id)

                if osm_data:
                    # Create new territory with OSM data
                    new_territory = frappe.new_doc("PRP Territory")
                    new_territory.osm_id = osm_id
                    new_territory.territory_name = osm_data.get("name") or name
                    new_territory.name_en = osm_data.get("name_en") or name
                    new_territory.name_ar = osm_data.get("name_ar", "")
                    new_territory.wikidata = osm_data.get("wikidata", "")
                    new_territory.admin_level = osm_data.get("admin_level", "")
                    new_territory.boundary = osm_data.get("boundary", "")
                    new_territory.border_type = osm_data.get("border_type", "")
                    new_territory.place = osm_data.get("place", "")
                    new_territory.landuse = osm_data.get("landuse", "")
                    new_territory.residential = osm_data.get("residential", "")
                    new_territory.is_project = 0
                    new_territory.is_phase = 0
                    new_territory.is_custom = 0

                    # Set geometry data
                    new_territory.geo = osm_data.get("geo", "")
                    new_territory.lat = str(osm_data.get("lat", ""))
                    new_territory.lng = str(osm_data.get("lng", ""))
                    new_territory.min_lat = osm_data.get("min_lat", "")
                    new_territory.max_lat = osm_data.get("max_lat", "")
                    new_territory.min_lng = osm_data.get("min_lng", "")
                    new_territory.max_lng = osm_data.get("max_lng", "")

                    # Set parent
                    if current_parent:
                        new_territory.parent_territory = current_parent

                    try:
                        new_territory.insert(ignore_permissions=True)
                        territory_id = new_territory.name
                        territory_osm_id = osm_id
                        frappe.log(f"Created new territory from OSM: {territory_id}")
                    except Exception as e:
                        frappe.log_error(
                            f"Failed to insert territory: {str(e)}",
                            "Territory Creation",
                        )
                        continue
                else:
                    # OSM data fetch failed, create placeholder
                    frappe.log(
                        f"OSM data fetch failed for {osm_id}, creating placeholder"
                    )
                    territory_id, territory_osm_id = create_placeholder_territory(
                        name, place_type, current_parent, osm_id
                    )
            else:
                # No OSM ID found, create placeholder
                frappe.log(f"No OSM ID found for {name}, creating placeholder")
                territory_id, territory_osm_id = create_placeholder_territory(
                    name, place_type, current_parent
                )

        # Add to result hierarchy
        result_hierarchy.append(
            {
                "id": territory_id,
                "name": name,
                "type": place_type,
                "osm_id": territory_osm_id,
            }
        )

        # Update current parent for next level
        current_parent = territory_id

    return result_hierarchy


def create_placeholder_territory(name, territory_type, parent=None, osm_id=None):
    """Create a placeholder territory when OSM data isn't available"""
    try:
        # Generate a custom OSM ID if none provided
        if not osm_id:
            osm_id = f"PH_{frappe.generate_hash(length=8)}"

        new_territory = frappe.new_doc("PRP Territory")
        new_territory.osm_id = osm_id
        new_territory.territory_name = name
        new_territory.name_en = name
        new_territory.is_project = 0
        new_territory.is_phase = 0
        new_territory.is_custom = 1

        # Set parent if provided
        if parent:
            new_territory.parent_territory = parent

        new_territory.insert(ignore_permissions=True)
        return new_territory.name, osm_id

    except Exception as e:
        frappe.log_error(
            f"Error creating placeholder territory: {str(e)}", "Territory Creation"
        )
        return None, None


# API endpoints


@frappe.whitelist()
def create_territory_from_geometry():
    """Create territory from user-drawn geometry with automatic parent detection"""
    try:
        data = json.loads(frappe.request.data)

        territory_name = data.get("name")
        geometry = data.get("geometry")
        is_project = cint(data.get("is_project", 1))

        if not territory_name or not geometry:
            return {
                "success": False,
                "message": "Territory name and geometry are required",
            }

        # Calculate centroid and bounds
        centroid = calculate_centroid(geometry)
        bounds = calculate_bounds(geometry)

        if not centroid or not bounds:
            return {"success": False, "message": "Failed to process geometry"}

        # Get location hierarchy from centroid
        hierarchy = get_location_hierarchy(centroid[1], centroid[0])

        if not hierarchy:
            return {
                "success": False,
                "message": "Failed to determine location hierarchy",
            }

        # Process hierarchy, creating territories as needed
        processed_hierarchy = process_territory_hierarchy(hierarchy)

        # Create the project territory
        territory = frappe.new_doc("PRP Territory")
        territory.territory_name = territory_name
        territory.name_en = territory_name
        territory.is_project = is_project
        territory.is_phase = 0
        territory.is_custom = 1

        # Generate a custom OSM ID
        territory.osm_id = f"PROJ_{frappe.generate_hash(length=8)}"

        # Set geometry
        territory.geo = json.dumps(geometry)
        territory.lat = str(centroid[1])
        territory.lng = str(centroid[0])
        territory.min_lat = bounds["min_lat"]
        territory.max_lat = bounds["max_lat"]
        territory.min_lng = bounds["min_lng"]
        territory.max_lng = bounds["max_lng"]

        # Set parent to the smallest area in hierarchy
        if processed_hierarchy:
            territory.parent_territory = processed_hierarchy[-1]["id"]

        # Insert the territory
        territory.insert(ignore_permissions=True)

        # After inserting, check for territories that should be phases of this project
        territory.detect_potential_subprojects()

        # Get potential phases if they exist
        potential_phases = []
        cached_phases = frappe.cache().get_value(f"potential_phases_{territory.name}")
        if cached_phases:
            potential_phases = json.loads(cached_phases)

        # Return success response with hierarchy info and potential phases
        return {
            "success": True,
            "territory_id": territory.name,
            "hierarchy": [h["name"] for h in processed_hierarchy],
            "potential_phases": potential_phases
        }

    except Exception as e:
        frappe.log_error(f"Error creating territory: {str(e)}", "Territory Creation")
        return {"success": False, "message": str(e)}


@frappe.whitelist()
def create_phase_for_project(project_id, phase_data):
    """Create a new phase within an existing project"""
    try:
        # Parse phase data if needed
        if isinstance(phase_data, str):
            phase_data = json.loads(phase_data)

        # Get the parent project
        parent_project = frappe.get_doc("PRP Territory", project_id)
        if not parent_project or not parent_project.is_project:
            return {"success": False, "message": "Invalid parent project"}

        # Extract phase data
        phase_name = phase_data.get("name")
        geometry = phase_data.get("geometry")

        if not phase_name or not geometry:
            return {"success": False, "message": "Phase name and geometry are required"}

        # Calculate centroid and bounds
        centroid = calculate_centroid(geometry)
        bounds = calculate_bounds(geometry)

        if not centroid or not bounds:
            return {"success": False, "message": "Failed to process geometry"}

        # Verify phase is within project boundaries
        is_within = verify_geometry_within(geometry, json.loads(parent_project.geo))
        if not is_within:
            return {
                "success": False,
                "message": "Phase boundaries must be within project boundaries",
            }

        # Create phase territory
        phase = frappe.new_doc("PRP Territory")
        phase.territory_name = phase_name
        phase.name_en = phase_name
        phase.is_project = 1
        phase.is_phase = 1
        phase.is_custom = 1
        phase.parent_territory = project_id
        phase.osm_id = f"PHASE_{frappe.generate_hash(length=8)}"

        # Set geometry
        phase.geo = json.dumps(geometry)
        phase.lat = str(centroid[1])
        phase.lng = str(centroid[0])
        phase.min_lat = bounds["min_lat"]
        phase.max_lat = bounds["max_lat"]
        phase.min_lng = bounds["min_lng"]
        phase.max_lng = bounds["max_lng"]

        phase.insert(ignore_permissions=True)

        return {
            "success": True,
            "phase_id": phase.name,
            "message": f"Created phase '{phase_name}' in project '{parent_project.territory_name}'",
        }

    except Exception as e:
        frappe.log_error(f"Error creating phase: {str(e)}", "Phase Creation")
        return {"success": False, "message": str(e)}


@frappe.whitelist()
def convert_to_phases(project_id, phase_ids=None):
    """Convert detected territories to phases of this project"""
    try:
        # If phase_ids were provided, use them
        if phase_ids:
            if isinstance(phase_ids, str):
                phase_ids = json.loads(phase_ids)
        else:
            # Otherwise, get potential phases from cache
            potential_phases = json.loads(
                frappe.cache().get_value(f"potential_phases_{project_id}") or "[]"
            )
            phase_ids = [phase["id"] for phase in potential_phases]

        if not phase_ids:
            return {"success": False, "message": "No potential phases found"}

        converted = []

        for phase_id in phase_ids:
            # Get territory details before updating
            territory = frappe.get_doc("PRP Territory", phase_id)
            # Update territory to be a phase of the project
            frappe.db.set_value(
                "PRP Territory",
                phase_id,
                {"parent_territory": project_id, "is_phase": 1},
            )
            converted.append(territory.territory_name)

        return {
            "success": True,
            "message": f"Converted {len(converted)} territories to phases",
            "converted": converted,
        }

    except Exception as e:
        frappe.log_error(f"Error converting phases: {str(e)}", "Phase Conversion")
        return {"success": False, "message": str(e)}


# QuadTree spatial indexing
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

# Create global spatial index
spatial_index = SpatialIndex()

# Territory document class
class PRPTerritory(Document):
    def before_insert(self):
        if self.osm_id and not self.is_custom and not self.osm_id.startswith(("PROJ_", "PH_", "PHASE_")):
            try:
                # Fetch OSM data for real OSM IDs
                osm_data = fetch_osm_data(self.osm_id)

                if osm_data:
                    # Update document with OSM data
                    for field, value in osm_data.items():
                        if hasattr(self, field) and value is not None:
                            setattr(self, field, value)

            except Exception as e:
                frappe.log_error(f"Error in before_insert: {str(e)}", "PRP Territory")

    def update_spatial_index(self):
        """Update spatial index information for the territory"""
        try:
            # Get bounds
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

            # Adjust level based on territory size
            quadtree_level = 6  # default
            if max_span > 1.0:
                quadtree_level = 2
            elif max_span > 0.1:
                quadtree_level = 4

            # Get covering cells
            cells = spatial_index.get_covering_cells(bounds, quadtree_level)
            cell_bounds = spatial_index.get_cell_bounds(cells[0])

            # Update document fields
            frappe.db.set_value(
               "PRP Territory", 
               self.name, 
               {
                   "quadtree_level": quadtree_level,
                   "spatial_index_cell": cells[0],
                   "cell_bounds": json.dumps(cell_bounds)
               }
           )

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
               "min_lng", "max_lng", "territory_name", "spatial_index_cell",
               "is_project", "is_phase"
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
        """Update territory hierarchy based on spatial relationships"""
        frappe.log(f"\n=== Starting hierarchy update for territory {self.name} ===")
        frappe.log(f"Territory Name: {self.territory_name}")

        # Skip for phases, as their parent is explicitly set
        if self.is_phase:
            frappe.log(f"Skipping hierarchy update for phase territory")
            return

        try:
            current_geo = shape(json.loads(self.geo))
            frappe.log(f"Current territory geometry type: {current_geo.geom_type}")

            potential_territories = self.get_potential_overlaps()
            frappe.log(
               f"Found {len(potential_territories)} potential overlapping territories"
           )

            overlap_threshold = 80
            potential_parents = []
            potential_children = []

            # Get existing territory hierarchy
            all_territories = frappe.get_all(
               "PRP Territory", fields=["name", "parent_territory"]
           )
            territory_hierarchy = {t.name: t.parent_territory for t in all_territories}

            for territory in potential_territories:
                frappe.log(
                   f"\nChecking territory: {territory.name} ({territory.territory_name})"
               )
                try:
                    other_geo = shape(json.loads(territory.geo))

                    # Check if other territory is inside current territory
                    overlap = calculate_overlap_percentage(other_geo, current_geo)
                    frappe.log(f"{territory.name} is {overlap}% inside current territory")

                    # Skip phases for assignment as children (they should stay with their project)
                    if overlap >= overlap_threshold and not territory.is_phase:
                        potential_children.append(
                           {
                               "name": territory.name,
                               "current_parent": territory_hierarchy.get(territory.name),
                               "area": other_geo.area,
                           }
                       )
                        frappe.log(f"Added {territory.name} as potential child")

                    # Check if current territory is inside other territory
                    # Skip projects as parents for projects unless they're phases
                    skip_as_parent = territory.is_project and self.is_project and not self.is_phase

                    overlap = calculate_overlap_percentage(current_geo, other_geo)
                    frappe.log(f"Current territory is {overlap}% inside {territory.name}")

                    if overlap >= overlap_threshold and not skip_as_parent:
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
                # Find the smallest area that contains this territory
                parent = min(potential_parents, key=lambda x: x["area"])
                frappe.log(f"Setting parent of {self.name} to {parent['name']}")
                frappe.db.set_value(
                   "PRP Territory", self.name, "parent_territory", parent['name']
               )

            # Process children
            if potential_children:
                # Sort children by area from largest to smallest
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

            frappe.log("\n=== Finished hierarchy update ===")
            frappe.db.commit()

        except Exception as e:
            frappe.log_error(
                f"Error in update_territory_hierarchy: {str(e)}", "Territory Hierarchy"
            )

    def detect_potential_subprojects(self):
        """Detect if this territory fully contains other territories that should be phases"""
        try:
            # Only run for projects that aren't phases
            if not self.is_project or self.is_phase:
                return
            

            # Get our geometry
            parent_geo = shape(json.loads(self.geo))

            # Find potential territories that might be contained
            potential_subprojects = frappe.get_all(
                "PRP Territory",
                filters={
                    "name": ["!=", self.name],
                    "is_project": 1,
                    "is_phase": 0,  # Not already a phase
                    "parent_territory": ["!=", self.name],  # Not already our children
                    "spatial_index_cell": ["like", f"{self.spatial_index_cell}%"],
                },
                fields=["name", "geo", "territory_name"],
            )

            contained_projects = []

            for territory in potential_subprojects:
                try:
                    # Check if fully contained
                    territory_geo = shape(json.loads(territory.geo))
                    containment_pct = calculate_overlap_percentage(territory_geo, parent_geo)

                    # If 95%+ contained, it's a candidate phase
                    if containment_pct >= 95:
                        contained_projects.append({
                           "id": territory.name,
                           "name": territory.territory_name
                       })
                except Exception:
                    continue

            if contained_projects:
                # Store for later processing
                frappe.cache().set_value(
                   f"potential_phases_{self.name}", 
                   json.dumps(contained_projects),
                   expires_in_sec=86400
               )

                # Notify user about potential phases
                frappe.msgprint(
                   f"Found {len(contained_projects)} projects that appear to be phases of this project. "
                   f"Would you like to convert them to phases?",
                   title="Potential Phases Detected"
               )

        except Exception as e:
            frappe.log_error(f"Error detecting subprojects: {str(e)}", "Project Hierarchy")

    def after_insert(self):
        self.update_spatial_index()

        # Only run overlap detection for non-placeholder territories
        # and don't run for territories that are explicitly phases
        if not self.is_phase:
            self.update_territory_hierarchy()

        # If this is a project, check for potential phases
        if self.is_project and not self.is_phase:
            self.detect_potential_subprojects()

    def validate(self):
        if not self.territory_name:
            frappe.throw("Territory Name is required")

        # Ensure we have geo data
        if not self.geo:
            frappe.throw("Geometry data is required")

        # Validate phase relationships
        if self.is_phase:
            # Check if parent is a project
            if self.parent_territory:
                parent = frappe.get_doc("PRP Territory", self.parent_territory)
                if not parent.is_project:
                    frappe.throw("Phases must have projects as their parent")
