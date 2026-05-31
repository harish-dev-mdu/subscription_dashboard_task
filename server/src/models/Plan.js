  const mongoose = require('mongoose');

  const planSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Plan name cannot exceed 50 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day']
    },
    durationUnit: {
      type: String,
      enum: ['minutes', 'hours', 'days', 'months', 'years'],
      default: 'days'
    },
    features: [{
      type: String,
      trim: true
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    stripeProductId: {
      type: String,
      default: null
    },
    razorpayPlanId: {
      type: String,
      default: null
    },
    maxUsers: {
      type: Number,
      default: 1
    },
    maxProjects: {
      type: Number,
      default: 1
    },
    storageLimit: {
      type: Number, // in MB
      default: 100
    }
  }, {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function(doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  });

  planSchema.virtual('formattedPrice').get(function() {
    return `₹${this.price}`;
  });

  planSchema.virtual('formattedDuration').get(function() {
    if (this.duration === 30 && this.durationUnit === 'days') return 'Monthly';
    if (this.duration === 90 && this.durationUnit === 'days') return 'Quarterly';
    if (this.duration === 365 && this.durationUnit === 'days') return 'Yearly';
    return `${this.duration} ${this.durationUnit}`;
  });

  const Plan = mongoose.model('Plan', planSchema);

  module.exports = Plan;
