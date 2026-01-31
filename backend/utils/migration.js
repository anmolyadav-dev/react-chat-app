import User from "../models/user.model.js";
import encryption from "./encryption.js";

export const migrateExistingUsers = async () => {
  try {
    console.log("Starting migration for existing users...");
    
    // Find all users without encryption keys
    const usersWithoutKeys = await User.find({ 
      $or: [
        { encryptionKeys: { $exists: false } },
        { "encryptionKeys.privateKey": { $exists: false } },
        { "encryptionKeys.publicKey": { $exists: false } }
      ]
    });

    console.log(`Found ${usersWithoutKeys.length} users without encryption keys`);

    for (const user of usersWithoutKeys) {
      // Generate encryption keys for the user
      const { privateKey, publicKey } = encryption.generateKeyPair();
      
      // Update the user with encryption keys
      await User.findByIdAndUpdate(user._id, {
        encryptionKeys: {
          privateKey,
          publicKey
        }
      });
      
      console.log(`Updated user: ${user.username}`);
    }

    console.log("Migration completed successfully!");
    return usersWithoutKeys.length;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExistingUsers()
    .then((count) => {
      console.log(`Migrated ${count} users`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
