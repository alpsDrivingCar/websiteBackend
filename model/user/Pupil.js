const mongoose = require('mongoose');

const PupilSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Instructor',
      },
    ],
    phoneNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    licenceNumber: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    postCode: {
      type: String,
    },
    privateNote: {
      type: String,
    },
    contentMethod: {
      type: String,
    },
    theoryStatus: {
      type: String,
    },
    roles: {
      type: Array,
    },
    profileImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Pupil = mongoose.models.Pupil || mongoose.model('Pupil', PupilSchema);

module.exports = Pupil;
