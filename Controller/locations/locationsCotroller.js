const LocationsSchema = require("../../model/locations/locationsSchema");
const axios = require("axios");

// Function to get location coordinates using OpenCage Geocoding API
async function getCoordinates(locationName) {
  try {
    // Extract the first location name if multiple are provided
    // Handle various separators: slashes, commas, ampersands
    const firstLocation = locationName
      .split(/[\/,&]/) // Split by /, , or &
      .map((name) => name.trim())
      .filter((name) => name.length > 0)[0]; // Get first non-empty part

    console.log(`Attempting to geocode: ${firstLocation}, UK`);

    // Using OpenCage Data geocoding API (you'll need to add your API key)
    // You can sign up for a free API key at: https://opencagedata.com/
    const API_KEY = process.env.OPENCAGE_API_KEY || "c880b9d9cac4473b9715e90886be4f81"; // Replace with your API key or use environment variable
    const response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json`,
      {
        params: {
          q: `${firstLocation}, UK`,
          key: API_KEY,
          countrycode: "gb",
          limit: 1,
        },
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      // Verify the result is in the UK
      const isInUK =
        result.components.country === "United Kingdom" ||
        result.components.country_code === "gb" ||
        result.components.country_code === "uk";

      if (isInUK) {
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
        };
      }
    }

    // Default to London coordinates if not found or not in UK
    console.log("Location not found in UK, defaulting to London coordinates");
    return { lat: 51.5074, lng: -0.1278 }; // London coordinates
  } catch (error) {
    console.error("Error geocoding location:", error.message);
    // Default to London coordinates on error
    return { lat: 51.5074, lng: -0.1278 }; // London coordinates
  }
}

exports.createLocations = (req, res) => {
  const locationsSchema = new LocationsSchema(req.body);

  console.log(req.body);
  locationsSchema
    .save()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.locationss = (req, res) => {
  // result =   object  inside mongo database
  // LocationsSchema.findById(req.params.id)
  console.log("req.body" + req.body);
  LocationsSchema.findById("654beda5ab97a73c1a91a53e")
    .then((result) => {
      res.status(200).json({ data: result });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

exports.locationsUpdate = (req, res) => {
  // result =   object  inside mongo database
  console.log(req.body);
  LocationsSchema.findByIdAndUpdate("654beda5ab97a73c1a91a53e")
    .updateOne(req.body)
    .then((result) => {
      res.json({ data: result.data });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteLocations = (req, res) => {
  LocationsSchema.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.send("Delete " + result.response);
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Adds one or multiple locations to the locations array
 * Expected body format for single location:
 * {
 *   name: "Location Name",
 *   location: { lat: number, lng: number }, // Optional - will be calculated if not provided
 *   subAreas: [{ name: "Sub Area 1" }, { name: "Sub Area 2" }, ...]
 * }
 *
 * Expected body format for multiple locations:
 * [
 *   {
 *     name: "Location Name 1",
 *     location: { lat: number, lng: number }, // Optional - will be calculated if not provided
 *     subAreas: [{ name: "Sub Area 1" }, { name: "Sub Area 2" }, ...]
 *   },
 *   ...
 * ]
 */
exports.addLocations = async (req, res) => {
  try {
    let locationsToAdd;
    let isSingleLocation = false;

    // Check if the request body is an array or a single object
    if (Array.isArray(req.body)) {
      locationsToAdd = req.body;
    } else {
      locationsToAdd = [req.body];
      isSingleLocation = true;
    }

    // Validate each location and get coordinates
    for (let i = 0; i < locationsToAdd.length; i++) {
      const location = locationsToAdd[i];

      // Validate location has a name
      if (!location.name) {
        return res.status(400).json({
          error: isSingleLocation
            ? "Location name is required"
            : `Location at index ${i} is missing a name`,
        });
      }

      // If location coordinates are not provided or empty, get them from the name
      if (
        !location.location ||
        !location.location.lat ||
        !location.location.lng
      ) {
        location.location = await getCoordinates(location.name);
        console.log(
          `Generated coordinates for "${location.name}":`,
          location.location
        );
      }

      // If subAreas are not provided, initialize with an empty array
      if (!location.subAreas || !Array.isArray(location.subAreas)) {
        location.subAreas = [];
      }
    }

    // Use different MongoDB update operation based on whether it's a single location or multiple
    const updateOperation = isSingleLocation
      ? { $push: { locations: locationsToAdd[0] } }
      : { $push: { locations: { $each: locationsToAdd } } };

    const result = await LocationsSchema.findByIdAndUpdate(
      "654beda5ab97a73c1a91a53e",
      updateOperation,
      { new: true, useFindAndModify: false }
    );

    if (!result) {
      return res.status(404).json({ error: "Locations document not found" });
    }

    if (isSingleLocation) {
      res.status(200).json({
        message: "New location added successfully",
        addedLocation: locationsToAdd[0],
        data: result,
      });
    } else {
      res.status(200).json({
        message: `Successfully added ${locationsToAdd.length} new locations`,
        addedLocations: locationsToAdd,
        data: result,
      });
    }
  } catch (err) {
    console.log("Error adding locations:", err);
    res.status(500).json({
      error: "An error occurred while adding locations",
      details: err.message,
    });
  }
};

/**
 * Updates a specific location in the locations array by its ID
 * Expected URL: PUT /locations/location/:locationId
 * Expected body format:
 * {
 *   name: "Updated Location Name",
 *   location: { lat: number, lng: number }, // Optional - will be calculated if name changes
 *   subAreas: [{ name: "Sub Area 1" }, { name: "Sub Area 2" }, ...]
 * }
 */
exports.updateLocation = async (req, res) => {
  try {
    const locationId = req.params.locationId || req.query.locationId;
    const updateData = req.body;

    console.log("Attempting to update location with ID:", locationId);
    console.log("Update data:", updateData);

    // Validate location ID
    if (!locationId) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    // Validate update data
    if (!updateData.name) {
      return res.status(400).json({ error: "Location name is required" });
    }

    // Find the document and the location
    const document = await LocationsSchema.findById("654beda5ab97a73c1a91a53e");

    if (!document) {
      console.log("Document not found");
      return res.status(404).json({ error: "Locations document not found" });
    }

    // Find the location in the array
    const locationIndex = document.locations.findIndex(
      (location) => location._id.toString() === locationId
    );

    console.log("Location index:", locationIndex);

    if (locationIndex === -1) {
      return res
        .status(404)
        .json({ error: "Location not found in the document" });
    }

    const existingLocation = document.locations[locationIndex];

    // If name has changed or no location provided, recalculate coordinates
    if (updateData.name !== existingLocation.name || !updateData.location) {
      updateData.location = await getCoordinates(updateData.name);
      console.log(
        `Generated coordinates for "${updateData.name}":`,
        updateData.location
      );
    }

    // Ensure subAreas are properly structured
    if (!updateData.subAreas || !Array.isArray(updateData.subAreas)) {
      updateData.subAreas = existingLocation.subAreas || [];
    }

    // Update the location
    document.locations[locationIndex] = {
      ...existingLocation.toObject(),
      ...updateData,
      _id: existingLocation._id, // Preserve the original ID
    };

    const updatedDocument = await document.save();

    if (!updatedDocument) {
      return res.status(500).json({ error: "Failed to save updated document" });
    }

    const updatedLocation = updatedDocument.locations.find(
      (location) => location._id.toString() === locationId
    );

    res.status(200).json({
      message: "Location updated successfully",
      updatedLocation,
      data: updatedDocument,
    });
  } catch (err) {
    console.log("Error updating location:", err);
    res.status(500).json({
      error: "An error occurred while updating the location",
      details: err.message,
    });
  }
};

/**
 * Deletes a specific location from the locations array by its ID
 * Expected URL: DELETE /locations/location/:locationId
 * OR with query parameter: DELETE /locations/location?locationId=xyz
 */
exports.deleteLocation = (req, res) => {
  const locationId = req.params.locationId || req.query.locationId;

  console.log("Attempting to delete location with ID:", locationId);

  // Validate location ID
  if (!locationId) {
    return res.status(400).json({ error: "Location ID is required" });
  }

  LocationsSchema.findById("654beda5ab97a73c1a91a53e")
    .then((document) => {
      if (!document) {
        console.log("Document not found");
        return res.status(404).json({ error: "Locations document not found" });
      }

      // Find the location in the array
      const locationIndex = document.locations.findIndex(
        (location) => location._id.toString() === locationId
      );

      console.log("Location index:", locationIndex);

      if (locationIndex === -1) {
        return res
          .status(404)
          .json({ error: "Location not found in the document" });
      }

      // Store location for response
      const deletedLocation = document.locations[locationIndex];

      // Pull the location from the array
      document.locations.splice(locationIndex, 1);
      return document.save().then((result) => ({ result, deletedLocation }));
    })
    .then(({ result, deletedLocation }) => {
      res.status(200).json({
        message: "Location deleted successfully",
        deletedLocation,
        data: result,
      });
    })
    .catch((err) => {
      console.log("Error deleting location:", err);
      res.status(500).json({
        error: "An error occurred while deleting the location",
        details: err.message,
      });
    });
};

/**
 * Gets all locations or a specific location by ID
 * Expected URL: GET /locations
 * OR with query parameter: GET /locations?locationId=xyz
 */
exports.getLocations = (req, res) => {
  const locationId = req.params.locationId || req.query.locationId;

  console.log("Getting locations, locationId:", locationId);

  LocationsSchema.findById("654beda5ab97a73c1a91a53e")
    .then((document) => {
      if (!document) {
        console.log("Document not found");
        return res.status(404).json({ error: "Locations document not found" });
      }

      // If a specific location ID is provided, return only that location
      if (locationId) {
        const location = document.locations.find(
          (loc) => loc._id.toString() === locationId
        );

        if (!location) {
          return res.status(404).json({ error: "Location not found" });
        }

        return res.status(200).json({
          message: "Location retrieved successfully",
          location: location,
        });
      }

      // Otherwise return all locations
      res.status(200).json({
        message: "Locations retrieved successfully",
        count: document.locations.length,
        locations: document.locations,
      });
    })
    .catch((err) => {
      console.log("Error getting locations:", err);
      res.status(500).json({
        error: "An error occurred while retrieving locations",
        details: err.message,
      });
    });
};
