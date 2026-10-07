/**
 * Database Schema Mock (MongoDB/Mongoose syntax representation)
 */

export const UserSchema = {
  name: "String",
  phone: "String", // Used for WhatsApp/OTP auth
  role: "Enum['DRIVER', 'FLEET_OWNER', 'CONTRACTOR']",
  vehicles: ["String"], // List of vehicle registration numbers
  preferences: {
    language: "Enum['ml', 'en']",
    highContrastMode: "Boolean"
  }
};

export const TripSchema = {
  tripId: "String",
  vehicleNo: "String",
  driverId: "ObjectId(User)",
  status: "Enum['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']",
  documents: {
    ewayBill: {
      url: "String",
      parsedData: {
        pickup: "String",
        destination: "String",
        cargo: "String",
        validity: "Date"
      }
    }
  },
  logs: [{
    timestamp: "Date",
    location: "String",
    event: "String" // e.g., "Started", "Toll Passed", "Breakdown"
  }],
  expenses: [{
    category: "Enum['FUEL', 'TOLL', 'FOOD', 'REPAIR']",
    amount: "Number",
    date: "Date",
    receiptUrl: "String"
  }]
};
