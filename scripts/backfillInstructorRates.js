const mongoose = require('mongoose');
const Instructor = require('../model/user/Instructor');
const BookingPackage = require('../model/booking/package/packageSchema');

const areaLength = (postcode) => {
  switch ((postcode || '').length) {
    case 2: return 2;
    case 3: return 3;
    case 4: return 4;
    case 5: return 2;
    case 6: return 3;
    case 7: return 4;
    default: return 3;
  }
};

const toNumber = (value) => {
  if (!value) return NaN;
  return parseFloat(String(value).replace(/,/g, '').replace(/\.+(?=\d*\.)/g, ''));
};

const computeAverageHourlyRate = (instructor, packages) => {
  const gearbox = (instructor.gearbox || '').toLowerCase();
  const areas = (instructor.areas || []).map((a) => String(a).toLowerCase());

  const perHourRates = packages
    .filter((p) => {
      const slug = (p.slugOfGearbox || '').toLowerCase();
      const gearboxMatches = slug === 'all' || (gearbox && gearbox.includes(slug));
      if (!gearboxMatches) return false;
      const prefixes = (p.postCode || [])
        .map((x) => (x.postCode || '').slice(0, areaLength(x.postCode)).toLowerCase())
        .filter(Boolean);
      return prefixes.some((prefix) => areas.includes(prefix));
    })
    .map((p) => toNumber(p.price) / parseInt(p.numberHour))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (!perHourRates.length) return null;
  const average = perHourRates.reduce((a, b) => a + b, 0) / perHourRates.length;
  return Math.round(average);
};

(async () => {
  const dryRun = process.argv.includes('--dry-run');
  await mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true });

  const packages = await BookingPackage.find({ status: 'active' }).lean();
  const instructors = await Instructor.find({ status: 'active' });

  let set = 0;
  let skippedExisting = 0;
  let noMatchingPackages = 0;

  for (const instructor of instructors) {
    if (typeof instructor.lessonHourlyRate === 'number' && instructor.lessonHourlyRate > 0) {
      skippedExisting += 1;
      continue;
    }
    const rate = computeAverageHourlyRate(instructor, packages);
    if (rate == null) {
      noMatchingPackages += 1;
      console.log(`SKIP (no matching global packages): ${instructor.firstName} ${instructor.lastName} areas=${JSON.stringify(instructor.areas)} gearbox=${instructor.gearbox}`);
      continue;
    }
    console.log(`${dryRun ? '[dry-run] ' : ''}SET ${instructor.firstName} ${instructor.lastName} -> £${rate}/h (areas=${JSON.stringify(instructor.areas)}, gearbox=${instructor.gearbox})`);
    if (!dryRun) {
      instructor.lessonHourlyRate = rate;
      instructor.pricingMode = 'hourly';
      await instructor.save();
      set += 1;
    }
  }

  console.log(`\nDone. set=${set} skippedExisting=${skippedExisting} noMatchingPackages=${noMatchingPackages} dryRun=${dryRun}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
