import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

(async () => {
  try {
    const original = process.env.MONGODB_URI;
    console.log('Using MONGODB_URI present:', !!original);
    const mask = (uri) => uri.replace(/\/\/(.*?):(.*?)@/, '//$1:***@');

    console.log('Trying original URI (credentials masked):', mask(original || ''));
    try {
      await mongoose.connect(original);
      console.log('Connected to MongoDB successfully with original URI');
      await mongoose.connection.close();
      process.exit(0);
    } catch (errOriginal) {
      console.error('Original URI connection failed:', errOriginal.message);

      // Attempt with URL-encoded password
      const m = (original || '').match(/\/\/([^:]+):([^@]+)@(.+)/);
      if (!m) {
        console.error('Cannot parse credentials from MONGODB_URI to retry with encoded password.');
        throw errOriginal;
      }

      const username = m[1];
      const password = m[2];
      const rest = m[3];
      const encodedPassword = encodeURIComponent(password);
      const rebuilt = `mongodb+srv://${username}:${encodedPassword}@${rest}`;

      console.log('Trying rebuilt URI with encoded password (credentials masked):', mask(rebuilt));
      await mongoose.connect(rebuilt);
      console.log('Connected to MongoDB successfully with encoded password URI');
      await mongoose.connection.close();
      process.exit(0);
    }
  } catch (err) {
    console.error('Final connection error:');
    console.error(err);
    process.exit(1);
  }
})();
