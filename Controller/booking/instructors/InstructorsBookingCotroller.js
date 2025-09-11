const InstructorsSchema = require("../../../model/booking/instructors/instructorsSchema");
const LessonEvent = require("../../../model/booking/instructors/lessonEventSchema");
const InstructorsUserSchema = require("../../../model/user/Instructor");
const TraineesUserSchema = require("../../../model/user/Trainees");
const LessonSchema = require("../../../model/booking/lesson/lessonSchema");
const PackageSchema = require("../../../model/booking/package/packageSchema");
const Pupil = require("../../../model/user/Pupil");

exports.createBookingInstructors = (req, res) => {
    const lessonSchema = new InstructorsSchema(req.body);

    console.log(req.body);
    lessonSchema.save()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });

}

exports.getBookingInstructors = (req, res) => {
    // result = Array of objects inside mongo database
    InstructorsSchema.findById("64859e62519ba1e3fcc98866")
        .then((result) => {
            res.status(200).json({ data: result });
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.bookingInstructorsUpdate = (req, res) => {
    // result =   object  inside mongo database
    InstructorsSchema.findByIdAndUpdate("64859e62519ba1e3fcc98866").updateOne(req.body)
        .then((result) => {
            res.json({ data: result });
        })
        .catch((err) => {
            console.log(err);
        });
}

exports.deleteBookingInstructors = (req, res) => {
    InstructorsSchema.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.send("Delete " + result.response)
        })
        .catch((err) => {
            console.log(err);
        });
}


/////////////////////////// end cred ///////////////////////////////////////

// Function to get instructors and trainees by postcode, available time, and gearbox
exports.instructorsByPostcodeAndAvailableTimeAndGearBox = async (req, res) => {
    try {
      let { postcode, availableTime, gearbox, studentGender } = req.query;
  
      // if (!postcode || !availableTime) {
      //     return res.status(400).json({ message: 'Postcode and availableTime are required query parameters.' });
      // }
      postcode = postcode.replace(/\s+/g, '');
      const areaLength = determinePostcodeAreaLength(postcode);
      const areaPrefix = postcode.substring(0, areaLength).trim();
      const regexPostcode = new RegExp("^" + areaPrefix + "$", "i");
      const regexPattern = new RegExp(gearbox, "i");
  
      // Define filter criteria for instructors
      const instructorFilter = {
        areas: regexPostcode,
        AcceptStudent: true,
        status: "active",
      };
  
      // Define filter criteria for trainers (without gearbox)
      const trainerFilter = {
        areas: regexPostcode,
        gearbox: { $regex: regexPattern },
        AcceptStudent: true,
      };
      // Conditionally add gearbox filter if gearbox is not "all"
      if (gearbox && gearbox.toLowerCase() !== "all") {
        const regexPattern = new RegExp(gearbox, "i");
        instructorFilter["gearbox"] = { $regex: regexPattern };
        trainerFilter["gearbox"] = { $regex: regexPattern };
      }
  
      // Find instructors and trainees
      let [instructors, trainers] = await Promise.all([
        InstructorsUserSchema.find(instructorFilter),
        TraineesUserSchema.find(trainerFilter),
      ]);
  
      let users = [...instructors, ...trainers];
  
      if (!users.length) {
        return res.json({ data: [] });
      }
      if (studentGender === "male") {
        users = users.filter(
          (user) => 
            // Include instructors who don't exclusively accept female students
            !user.AcceptFemaleStudent || 
            // OR include male instructors
            user.gender === 0 ||
            // OR include instructors who exclusively accept male students
            user.AcceptMaleStudent
        );
      } else if (studentGender === "female") {
        users = users.filter(
          (user) => 
            // Include instructors who don't exclusively accept male students
            !user.AcceptMaleStudent || 
            // OR include female instructors
            user.gender === 1 ||
            // OR include instructors who exclusively accept female students
            user.AcceptFemaleStudent
        );
      }
      return res.json({ data: users });
  
    } catch (error) {
      console.error("Outer Error:", error);
      res.status(500).json({ message: "An error occurred", error });
    }
  };

  const determinePostcodeAreaLength = (postcode) => {
    switch (postcode.length) {
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
        case 5:
            return 2;
        case 6:
            return 3;
        case 7:
            return 4;
        default:
            return 3; // Default value, can be adjusted as needed
    }
};


////////////////////// get Booking   //////////////////
exports.getBookingPackagesByPostcodeAndtype = async (req, res) => {
    try {
        const { postcode, type: typeId, packageId } = req.query;

        if (!postcode) {
            return res.status(404).json({ message: 'Postcode is not defined.' });
        }

        // Directly fetch and format booking packages based on the provided parameters
        const formattedData = await fetchAndFormatBookingPackages(postcode, typeId, packageId);

        // Create a new InstructorsSchema instance with the formatted data and save it
        const bookingInstructor = new InstructorsSchema(formattedData);

        // Sort the data by price
        const sortedData = sortDataByNumberHour(bookingInstructor);

        return res.json({ data: sortedData });
    } catch (error) {
        console.error(error);
        // Use the error message directly for simplicity in this example
        // Adjust status codes and messages as necessary for your application's needs
        return res.status(500).json({ message: error.message });
    }
};

function sortDataByNumberHour(formattedData) {
    formattedData.gearbox.forEach(gearbox => {
        gearbox.package.sort((a, b) => a.numberHour - b.numberHour);
    });
    return formattedData;
}

async function fetchAndFormatBookingPackages(postcode, typeId, packageId) {
    let formattedData;

    if (packageId) {
        // Fetch a single booking package by ID and ensure it matches the postcode
        const bookingPackage = await fetchPackageById(packageId);
        if (!bookingPackage) {
            throw new Error("No booking package found for the given packageId and postcode.");
        }
        formattedData = formatDataForBooking([bookingPackage]); // Format single package
    } else if (typeId) {
        // Fetch booking packages by type and postcode
        const targetTypeOfLesson = await fetchLessonTypeById(typeId);
        if (!targetTypeOfLesson) {
            throw new Error("Invalid type provided");
        }
        const bookingPackages = await fetchBookingPackages(postcode, targetTypeOfLesson.slug);
        if (!bookingPackages.length) {
            throw new Error("No booking packages found for the given postcode and type.");
        }
        formattedData = formatDataForBooking(bookingPackages); // Format multiple packages
    } else {
        throw new Error('Either type or packageId must be provided.');
    }

    return formattedData;
}
async function fetchPackageById(packageId) {
    try {
        console.log(packageId);
        const bookingPackage = await PackageSchema.findById(packageId).sort({ "gearbox": 1 });
        return bookingPackage;
    } catch (error) {
        console.error('Error fetching package by ID:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}




const fetchLessonTypeById = async (typeId) => {
    const lesson = await LessonSchema.findById("64876d775160ba7ae603516e");
    return lesson.typeOfLesson.find(l => l.id === typeId);
};

const fetchBookingPackages = async (postcode, slugOfTypeLesson) => {
    const areaLength = determinePostcodeAreaLength(postcode);
    const areaPrefix = postcode.substring(0, areaLength).trim();
    const regexPostcode = new RegExp("^" + areaPrefix, "i");

    console.log("regexPostcode = " + regexPostcode)
    console.log("slugOfTypeLesson = " + slugOfTypeLesson)
    return await PackageSchema.find({
        "postCode.postCode": regexPostcode,
        slugOfType: slugOfTypeLesson,
        status: "active"
    });
};

const formatDataForBooking = (bookingPackages) => {
    const order = { 'manual': 1, 'automatic': 2, 'electric': 3 };

    // Check if 'manual' exists in the booking packages
    let selectedGearbox = bookingPackages.some(package => package.slugOfGearbox === 'manual') ? 'manual' : '';

    // If 'manual' doesn't exist, check if 'automatic' exists
    if (!selectedGearbox) {
        selectedGearbox = bookingPackages.some(package => package.slugOfGearbox === 'automatic') ? 'automatic' : '';
    }

    // If neither 'manual' nor 'automatic' exists, default to 'electric'
    if (!selectedGearbox) {
        selectedGearbox = 'electric';
    }

    const groupedPackages = bookingPackages.reduce((acc, curr) => {
        if (!acc[curr.slugOfGearbox]) {
            acc[curr.slugOfGearbox] = {
                slug: curr.slugOfGearbox,
                name: curr.gearbox,
                selected: curr.slugOfGearbox === selectedGearbox,
                packages: []
            };
        }

        console.log(`curr ${curr.title}`);
        const total = convertToNumber(curr.price, "price");
        const totalBeforeSale = convertToNumber(curr.priecBeforeSele, "priecBeforeSele");

        // Calculate the savings
        const savings = totalBeforeSale - total;
        const savingsPercentage = (savings / totalBeforeSale) * 100;

        acc[curr.slugOfGearbox].packages.push({
            packageId: curr.id,
            numberHour: parseInt(curr.numberHour),
            numberOfLessons: parseInt(curr.numberHour) / 2,
            total: total,
            totalBeforeSale: totalBeforeSale,
            saveUp: `Save Up To ${savingsPercentage.toFixed(0)}%!`,
            priceSave: `Saving of £${savings.toFixed(2)}`
        });

        return acc;
    }, {});

    const gearboxData = Object.values(groupedPackages)
        .sort((a, b) => order[a.slug] - order[b.slug])
        .map(gearbox => ({
            slug: gearbox.slug,
            name: gearbox.name,
            selected: gearbox.slug === selectedGearbox,
            package: gearbox.packages
        }));

    return {
        title: "Choose Gearbox…",
        gearbox: gearboxData
    };
};


function convertToNumber(value, name) {
    console.log(`value ${value}`);
    if (value) {
        const withoutCommaAndExtraPeriods = value.replace(/,/g, '').replace(/\.+(?=\d*\.)/g, '');
        return parseFloat(withoutCommaAndExtraPeriods);
    } else {
        console.error(`Cannot convert '${value}' to a number in function '${name}'`);
        throw new Error(`Cannot convert '${value}' to a number in function '${name}'`);
    }

}

exports.availableTimeSlots = async (req, res) => {
    try {
        const { instructorId, instructorIds, month, year, postcode } = req.query;
        let areaPrefix = '';
        if (postcode) {
            const areaLength = determinePostcodeAreaLength(postcode);
            areaPrefix = postcode.substring(0, areaLength).trim();
        }

        // Handle both single and multiple instructor cases
        if (!instructorId && !instructorIds) {
            return res.status(400).json({ 
                message: 'Either instructorId or instructorIds is required.' 
            });
        }

        // Get array of instructor IDs
        const instructorIdArray = instructorId ? 
            [instructorId] : 
            instructorIds.split(',');

        // Get all instructors
        const instructors = await InstructorsUserSchema.find({ 
            _id: { $in: instructorIdArray } 
        });

        if (instructors.length === 0) {
            return res.status(404).json({ message: 'No instructors found' });
        }

        // If month or year is missing, find the nearest available month
        if (!month || !year) {
            // Find nearest slot for all instructors
            const nearestSlots = await Promise.all(
                instructors.map(instructor => findNearestAvailableSlot(instructor._id))
            );

            // Filter out null values and sort by date
            const validSlots = nearestSlots
                .filter(slot => slot !== null)
                .sort((a, b) => a - b);

            if (validSlots.length === 0) {
                return res.status(404).json({ message: 'No available slots found' });
            }

            // Use the earliest slot to determine month and year
            const nearestDate = new Date(validSlots[0]);
            const nearestMonth = nearestDate.getMonth() + 1;
            const nearestYear = nearestDate.getFullYear();

            // Get availability for all instructors for the nearest month
            const instructorResults = await Promise.all(
                instructors.map(async (instructor) => {
                    const availability = await getInstructorAvailability(
                        instructor,
                        nearestMonth,
                        nearestYear,
                        areaPrefix
                    );
                    return {
                        instructorId: instructor._id,
                        instructorName: `${instructor.firstName} ${instructor.lastName}`,
                        availableDays: availability.availableDays
                    };
                })
            );

            return res.json({
                month: nearestMonth.toString(),
                year: nearestYear.toString(),
                postcode: areaPrefix,
                instructors: instructorResults
            });
        }

        // For specified month and year, get availability for all instructors
        const instructorResults = await Promise.all(
            instructors.map(async (instructor) => {
                const availability = await getInstructorAvailability(
                    instructor,
                    parseInt(month),
                    parseInt(year),
                    areaPrefix
                );
                return {
                    instructorId: instructor._id,
                    instructorName: `${instructor.firstName} ${instructor.lastName}`,
                    availableDays: availability.availableDays
                };
            })
        );

        res.json({
            month: month.toString(),
            year: year.toString(),
            postcode: areaPrefix,
            instructors: instructorResults
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "An error occurred", error: error.message });
    }
};

exports.availableTimeSlotsV2 = async (req, res) => {
  try {
    const {
      instructorId,
      instructorIds,
      month,
      year,
      postcode,
      isGapCreating = false,
      pupilId,
    } = req.query;
    const isGapCreatingBool = isGapCreating === "true";
    let areaPrefix = "";
    if (postcode) {
      const areaLength = determinePostcodeAreaLength(postcode);
      areaPrefix = postcode.substring(0, areaLength).trim();
    }

    // Extract pupilId from bearer token if available
    let tokenPupilId = null;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        console.log('Decoded token:', decoded);
        // Check if the token contains pupil information
        if (decoded.pupilId) {
          tokenPupilId = decoded.pupilId;
        } else if (decoded._id && decoded.roles && decoded.roles.includes('pupil')) {
          tokenPupilId = decoded._id;
        }
      }
    } catch (error) {
      // Token verification failed or token doesn't exist, continue without token-based pupilId
      console.log('Token verification failed or no valid pupil token:', error.message);
    }

    // Use pupilId from query parameter first, then fall back to token
    const effectivePupilId = pupilId || tokenPupilId;

    // Handle both single and multiple instructor cases
    if (!instructorId && !instructorIds && !effectivePupilId) {
      return res.status(400).json({
        message: "Either instructorId or instructorIds is required.",
      });
    }
    let instructors = [];

    if (effectivePupilId) {
      const pupil = await Pupil.findById(effectivePupilId).populate("instructors");
      instructors = (pupil.instructors || []).filter(instructor => instructor.status === "active");
    } else {
      // Get array of instructor IDs
      const instructorIdArray = instructorId
        ? [instructorId]
        : instructorIds.split(",");

      // Get all instructors
      instructors = await InstructorsUserSchema.find({
        _id: { $in: instructorIdArray },
      });
    }

    if (instructors.length === 0) {
      const isFlutterApp = req.headers['user-agent']?.includes('Flutter') || 
                           req.headers['user-agent']?.includes('Dart') ||
                           req.headers['user-agent']?.includes('dart') ||
                           req.headers['user-agent']?.includes('flutter')

      
      const message = isFlutterApp 
        ? "No instructors available, please contact Alps office"
        : "No instructors found";
        
      return res.status(404).json({ message });
    }

    // If month or year is missing, find the nearest available month
    if (!month || !year) {
      // Find nearest slot for all instructors
      const nearestSlots = await Promise.all(
        instructors.map((instructor) =>
          findNearestAvailableSlot(instructor._id)
        )
      );
      // Filter out null values and sort by date
      const validSlots = nearestSlots
        .filter((slot) => slot !== null)
        .sort((a, b) => a - b);

      if (validSlots.length === 0) {
        return res.status(404).json({ message: "No available slots found" });
      }

      // Use the earliest slot to determine month and year
      const nearestDate = new Date(validSlots[0]);
      let nearestMonth = nearestDate.getMonth() + 1;
      let nearestYear = nearestDate.getFullYear();

      // Function to check next month
      const checkNextMonth = (currentMonth, currentYear) => {
        if (currentMonth === 12) {
          return { month: 1, year: currentYear + 1 };
        } else {
          return { month: currentMonth + 1, year: currentYear };
        }
      };

      // Try to get availability for all instructors for the nearest month
      let instructorResults = await Promise.all(
        instructors.map(async (instructor) => {
          const availability = await getInstructorAvailability(
            instructor,
            nearestMonth,
            nearestYear,
            areaPrefix,
            isGapCreatingBool,
            true
          );
          return {
            instructorId: instructor._id,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
            availableDays: availability.availableDays,
          };
        })
      );

      // Check if any instructor has available days
      let hasAvailableSlots = instructorResults.some(
        (instructor) =>
          instructor.availableDays && instructor.availableDays.length > 0
      );

      // If no available slots in the nearest month, check the next month
      if (!hasAvailableSlots) {
        const nextMonthInfo = checkNextMonth(nearestMonth, nearestYear);
        nearestMonth = nextMonthInfo.month;
        nearestYear = nextMonthInfo.year;

        instructorResults = await Promise.all(
          instructors.map(async (instructor) => {
            const availability = await getInstructorAvailability(
              instructor,
              nearestMonth,
              nearestYear,
              areaPrefix,
              isGapCreatingBool
            );
            return {
              instructorId: instructor._id,
              instructorName: `${instructor.firstName} ${instructor.lastName}`,
              availableDays: availability.availableDays,
            };
          })
        );
      }

      return res.json({
        month: nearestMonth.toString(),
        year: nearestYear.toString(),
        postcode: areaPrefix,
        instructors: instructorResults,
      });
    }

    // For specified month and year, get availability for all instructors
    const instructorResults = await Promise.all(
      instructors.map(async (instructor) => {
        const availability = await getInstructorAvailability(
          instructor,
          parseInt(month),
          parseInt(year),
          areaPrefix,
          isGapCreatingBool
        );
        return {
          instructorId: instructor._id,
          instructorName: `${instructor.firstName} ${instructor.lastName}`,
          availableDays: availability.availableDays,
        };
      })
    );

    res.json({
      month: month.toString(),
      year: year.toString(),
      postcode: areaPrefix,
      instructors: instructorResults,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

exports.availableGapTimeSlots = async (req, res) => {
    try {
        const { instructorId, instructorIds, month, year } = req.query;

        // Handle both single and multiple instructor cases
        if (!instructorId && !instructorIds) {
            return res.status(400).json({ 
                message: 'Either instructorId or instructorIds is required.' 
            });
        }

        // Get array of instructor IDs
        const instructorIdArray = instructorId ? 
            [instructorId] : 
            instructorIds.split(',');

        // Get all instructors
        const instructors = await InstructorsUserSchema.find({ 
            _id: { $in: instructorIdArray } 
        });

        if (instructors.length === 0) {
            return res.status(404).json({ message: 'No instructors found' });
        }

        // If month or year is missing, find the nearest available month
        if (!month || !year) {
            // Find nearest gap for any instructor
            const nearestGaps = await Promise.all(
                instructors.map(instructor => findNearestGapSlot(instructor._id))
            );

            // Filter out null values and sort by date
            const validGaps = nearestGaps
                .filter(gap => gap !== null)
                .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

            // Create instructor results with empty arrays for those without gaps
            const instructorResults = await Promise.all(
                instructors.map(async (instructor) => {
                    // If we have a valid month/year from gaps, use it
                    if (validGaps.length > 0) {
                        const nearestDate = new Date(validGaps[0].startTime);
                        const nearestMonth = nearestDate.getMonth() + 1;
                        const nearestYear = nearestDate.getFullYear();
                        
                        const gapEvents = await fetchGapEventsForInstructor(
                            instructor._id, 
                            nearestMonth, 
                            nearestYear
                        );
                        
                        return {
                            instructorId: instructor._id,
                            instructorName: `${instructor.firstName} ${instructor.lastName}`,
                            availableDays: formatGapEvents(gapEvents)
                        };
                    } else {
                        // No valid gaps for any instructor, return empty arrays
                        return {
                            instructorId: instructor._id,
                            instructorName: `${instructor.firstName} ${instructor.lastName}`,
                            availableDays: []
                        };
                    }
                })
            );

            // Use current month/year if no valid gaps found
            const currentDate = new Date();
            const responseMonth = validGaps.length > 0 
                ? new Date(validGaps[0].startTime).getMonth() + 1 
                : currentDate.getMonth() + 1;
            const responseYear = validGaps.length > 0 
                ? new Date(validGaps[0].startTime).getFullYear() 
                : currentDate.getFullYear();

            return res.json({
                month: responseMonth.toString(),
                year: responseYear.toString(),
                instructors: instructorResults
            });
        }

        // For specified month and year, get gaps for all instructors
        const instructorResults = await Promise.all(
            instructors.map(async (instructor) => {
                const gapEvents = await fetchGapEventsForInstructor(
                    instructor._id, 
                    parseInt(month), 
                    parseInt(year)
                );
                return {
                    instructorId: instructor._id,
                    instructorName: `${instructor.firstName} ${instructor.lastName}`,
                    availableDays: formatGapEvents(gapEvents)
                };
            })
        );

        res.json({
            month: month.toString(),
            year: year.toString(),
            instructors: instructorResults
        });

    } catch (error) {
        console.error('Error fetching gap events:', error);
        return res.status(500).json({ message: 'An error occurred', error });
    }
}

async function fetchGapEventsForInstructor(instructorId, month, year) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    const now = new Date(); // Get current time

    return await LessonEvent.find({
        $or: [
            { instructorId: instructorId },
            { trainerId: instructorId }
        ],
        eventType: 'Gap',
        startTime: { 
            $gte: now > startDate ? now : startDate, // Use the later of now or startDate
            $lte: endDate 
        },
        status: 'active'
    });
}

async function findNearestGapSlot(instructorId) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // Look up to 6 months ahead

    return await LessonEvent.findOne({
        $or: [
            { instructorId: instructorId },
            { trainerId: instructorId }
        ],
        eventType: 'Gap',
        startTime: { $gte: startDate, $lte: endDate },
        status: 'active'
    }).sort({ startTime: 1 });
}

async function fetchGapEventsForMonth(instructorQuery, month, year) {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return await LessonEvent.find({
        ...instructorQuery,
        eventType: 'Gap',
        startTime: { $gte: startDate, $lte: endDate },
        status: 'active'
    });
}

function formatGapEvents(gapEvents) {
    if (!gapEvents || gapEvents.length === 0) {
        return [];
    }
    
    // Group events by date
    const groupedSlots = gapEvents.reduce((acc, event) => {
        const date = new Date(event.startTime).toISOString().split('T')[0];
        
        if (!acc[date]) {
            acc[date] = {
                date,
                dayOfWeek: new Date(event.startTime).toLocaleString('en-US', { weekday: 'long' }),
                availableHours: []
            };
        }

        acc[date].availableHours.push({
            id: event._id,
            time: new Date(event.startTime).toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'UTC'
            }),
            timestamp: event.startTime,
            duration: event.durationMinutes,
            endTime: event.endTime,
            gearbox: event.gearbox
        });

        return acc;
    }, {});

    // Convert to array and sort by date
    const formattedSlots = Object.values(groupedSlots)
        .sort((a, b) => a.date.localeCompare(b.date));

    // Sort availableHours within each day by time
    formattedSlots.forEach(day => {
        day.availableHours.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    });

    return formattedSlots;
}

async function findNearestAvailableSlot(instructorId) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // Look up to 6 months ahead

    const instructor = await InstructorsUserSchema.findById(instructorId);
    if (!instructor) return null;

    const lessons = await LessonEvent.find({
        $or: [
            { instructorId: instructor._id },
            { trainerId: instructor._id }
        ],
        startTime: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
    });

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dayStart = new Date(Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            6, // Start at 6 AM
            0,
            0,
            0
        ));

        const dayEnd = new Date(Date.UTC(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            23, // End at 11 PM
            0,
            0,
            0
        ));

        const hasConflict = lessons.some(lesson => {
            const lessonStart = new Date(lesson.startTime);
            const lessonEnd = new Date(lesson.endTime);
            return (dayStart < lessonEnd && dayEnd > lessonStart);
        });

        if (!hasConflict) {
            return dayStart;
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
}

async function getInstructorAvailability(instructor, month, year, postcode) {
    try {
        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        // Update the workingHoursEvents query to include LUNCH_BREAK
        const [existingLessons, workingHoursEvents] = await Promise.all([
            LessonEvent.find({
                $or: [
                    { instructorId: instructor._id },
                    { trainerId: instructor._id }
                ],
                startTime: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' },
                eventType: { $ne: 'Gap' }
            }),
            LessonEvent.find({
                $or: [
                    { instructorId: instructor._id },
                    { trainerId: instructor._id }
                ],
                startTime: { $gte: startDate, $lte: endDate },
                awayType: { $in: ['WORKING_HOURS_MORNING', 'WORKING_HOURS_EVENING', 'LUNCH_BREAK'] },
            })
        ]);

        console.log("WOKRING HOURS EVENTS", workingHoursEvents);
        console.log('Debug - Instructor:', instructor._id);
        console.log('Debug - Date Range:', { startDate, endDate });


        console.log('Debug - Existing Lessons:', existingLessons.length);

        const slotsGroupedByDay = {};
        const currentDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
        const travelTimeInMinutes = instructor.travelingTime === "disable" ? "0" : parseInt(
          instructor.travelingTime.split(" ")[0]
        );

        const workingHoursOverrides = workingHoursEvents.reduce((acc, event) => {
            const dayKey = new Date(event.startTime).toISOString().split('T')[0];
            if (!acc[dayKey]) {
                acc[dayKey] = {
                    start: undefined,
                    end: undefined,
                    lunchBreak: null
                };
            }
            
            if (event.awayType === 'WORKING_HOURS_MORNING') {
                acc[dayKey].start = new Date(event.endTime).getUTCHours();
            } else if (event.awayType === 'WORKING_HOURS_EVENING') {
                acc[dayKey].end = new Date(event.startTime).getUTCHours();
            } else if (event.awayType === 'LUNCH_BREAK' && event.startTime && event.endTime) {
                // Only set lunch break if both start and end times are valid and different
                const startTime = new Date(event.startTime);
                const endTime = new Date(event.endTime);
                    acc[dayKey].lunchBreak = {
                        start: startTime,
                        end: endTime
                    };
                
            }
            return acc;
        }, {});

        while (currentDate <= endDate) {
            if (currentDate < new Date()) {
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }

            const dayKey = currentDate.toISOString().split('T')[0];
            const currentDay = currentDate.toLocaleString('en-US', { weekday: 'long' });        

            console.log('Debug - Checking day:', currentDay);

            // Check for working hours override first, then fall back to default working hours
            const workingHoursOverride = workingHoursOverrides[dayKey];
            const defaultWorkingHours = instructor.workingHours?.[currentDay];


            // Determine actual working hours for the day with minutes
            const getTimeComponents = (timeString) => {
                if (!timeString) return { hours: 6, minutes: 0 }; // Default start time
                const date = new Date(timeString);
                return {
                    hours: date.getUTCHours(),
                    minutes: date.getUTCMinutes()
                };
            };

            const defaultStart = defaultWorkingHours?.open ? getTimeComponents(defaultWorkingHours.open) : { hours: 6, minutes: 0 };
            const defaultEnd = defaultWorkingHours?.close ? getTimeComponents(defaultWorkingHours.close) : { hours: 23, minutes: 0 };

            // Use override hours if available, otherwise use defaults
            const workingStartTime = workingHoursOverride?.start !== undefined
                ? { hours: workingHoursOverride.start, minutes: 0 }
                : defaultStart;
            const workingEndTime = workingHoursOverride?.end !== undefined
                ? { hours: workingHoursOverride.end, minutes: 0 }
                : defaultEnd;

            // Ensure minimum start time is 6 AM
            if (workingStartTime.hours < 6) {
                workingStartTime.hours = 6;
                workingStartTime.minutes = 0;
            }

            console.log('Debug - Working hours:', { workingStartTime, workingEndTime });

            // const isAvailableOnDay = instructor.availableAreas?.some(area => {
            //     if (postcode) {
            //         const matchesPostcode = area.postcode.toLowerCase() === postcode.toLowerCase();
            //         const matchesDay = area.days.includes('All Days') || area.days.includes(currentDay);
            //         console.log('Debug - Area check:', { 
            //             area: area.postcode, 
            //             matchesPostcode, 
            //             matchesDay,
            //             availableDays: area.days 
            //         });
            //         return matchesPostcode && matchesDay;
            //     }
            //     return area.days.includes('All Days') || area.days.includes(currentDay);
            // });

            // console.log('Debug - Is available on day:', isAvailableOnDay);

            // if (!isAvailableOnDay) {
            //     currentDate.setDate(currentDate.getDate() + 1);
            //     continue;
            // }

            slotsGroupedByDay[dayKey] = {
                date: dayKey,
                dayOfWeek: currentDay,
                availableHours: []
            };

            // Get lunch break times
            const lunchStart = instructor.lunchBreak?.start ? new Date(instructor.lunchBreak.start).getUTCHours() : null;
            const lunchEnd = instructor.lunchBreak?.end ? new Date(instructor.lunchBreak.end).getUTCHours() : null;

            let currentTime = new Date(Date.UTC(
                currentDate.getUTCFullYear(),
                currentDate.getUTCMonth(),
                currentDate.getUTCDate(),
                workingStartTime.hours,
                workingStartTime.minutes,
                0,
                0
            ));
            
            const dayEnd = new Date(Date.UTC(
                currentDate.getUTCFullYear(),
                currentDate.getUTCMonth(),
                currentDate.getUTCDate(),
                workingEndTime.hours,
                workingEndTime.minutes,
                0,
                0
            ));

            while (currentTime < dayEnd) {
                const slotEndTime = new Date(currentTime);
                slotEndTime.setTime(currentTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours lesson

                // Create lunch break times for current day using the full ISO time
                let lunchStartTime = null;
                let lunchEndTime = null;

                // First check for override lunch break
                if (workingHoursOverride?.lunchBreak) {
                    lunchStartTime = new Date(Date.UTC(
                        currentDate.getUTCFullYear(),
                        currentDate.getUTCMonth(),
                        currentDate.getUTCDate(),
                        workingHoursOverride.lunchBreak.start.getUTCHours(),
                        workingHoursOverride.lunchBreak.start.getUTCMinutes(),
                        0,
                        0
                    ));

                    lunchEndTime = new Date(Date.UTC(
                        currentDate.getUTCFullYear(),
                        currentDate.getUTCMonth(),
                        currentDate.getUTCDate(),
                        workingHoursOverride.lunchBreak.end.getUTCHours(),
                        workingHoursOverride.lunchBreak.end.getUTCMinutes(),
                        0,
                        0
                    ));
                } 
                // Fall back to instructor's default lunch break if no override exists
                else if (instructor.lunchBreak?.start && instructor.lunchBreak?.end) {
                    const lunchStartTemp = new Date(instructor.lunchBreak.start);
                    const lunchEndTemp = new Date(instructor.lunchBreak.end);

                    lunchStartTime = new Date(Date.UTC(
                        currentDate.getUTCFullYear(),
                        currentDate.getUTCMonth(),
                        currentDate.getUTCDate(),
                        lunchStartTemp.getUTCHours(),
                        lunchStartTemp.getUTCMinutes(),
                        0,
                        0
                    ));

                    lunchEndTime = new Date(Date.UTC(
                        currentDate.getUTCFullYear(),
                        currentDate.getUTCMonth(),
                        currentDate.getUTCDate(),
                        lunchEndTemp.getUTCHours(),
                        lunchEndTemp.getUTCMinutes(),
                        0,
                        0
                    ));
                }

                console.log('Debug - Lunch times:', {
                    source: workingHoursOverride?.lunchBreak ? 'override' : 'default',
                    start: lunchStartTime?.toLocaleTimeString(),
                    end: lunchEndTime?.toLocaleTimeString(),
                    dayKey
                });

                // Check if slot overlaps with lunch break using exact times
                const overlapsLunch = lunchStartTime && lunchEndTime && (
                    (currentTime < lunchEndTime && slotEndTime > lunchStartTime)
                );

                if (overlapsLunch) {
                    // Skip to after lunch
                    currentTime = new Date(lunchEndTime);
                    console.log('Debug - Skipping lunch period, next slot starts at:', 
                        currentTime.toLocaleTimeString());
                    continue;
                }

                if (slotEndTime > dayEnd) {
                    break;
                }

                const hasConflict = existingLessons.some(lesson => {
                    const lessonStart = new Date(lesson.startTime);
                    const lessonEnd = new Date(lesson.endTime);
                    return (
                        (currentTime >= lessonStart && currentTime < lessonEnd) ||
                        (slotEndTime > lessonStart && slotEndTime <= lessonEnd) ||
                        (currentTime <= lessonStart && slotEndTime >= lessonEnd)
                    );
                });

                if (!hasConflict) {
                    const timeSlot = {
                        id: `${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                        time: currentTime.toLocaleTimeString('en-GB', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            timeZone: 'UTC'
                        }),
                        timestamp: currentTime.toISOString()
                    };
                    slotsGroupedByDay[dayKey].availableHours.push(timeSlot);
                    console.log('Debug - Added slot:', timeSlot.time);
                }

                // Move to next slot: 2 hours + travel time
                const travelTimeInMs = travelTimeInMinutes * 60 * 1000;
                currentTime = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000) + travelTimeInMs);
            }

            if (slotsGroupedByDay[dayKey]?.availableHours.length === 0) {
                delete slotsGroupedByDay[dayKey];
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        const formattedSlots = Object.values(slotsGroupedByDay).sort((a, b) => 
            a.date.localeCompare(b.date)
        );

        console.log('Debug - Final slots count:', formattedSlots.length);
        return {
            instructorId: instructor._id,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
            availableDays: formattedSlots
        };

    } catch (error) {
        console.error('Debug - Error:', error);
        throw error;
    }
}
