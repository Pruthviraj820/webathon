import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

// Import db to initialize tables
import '../db.js';
import { createUser, deleteAllUsers } from '../models/User.js';
import { createReport, deleteAllReports } from '../models/Report.js';
import { deleteAllInterests } from '../models/Interest.js';
import { deleteAllMessages } from '../models/Message.js';
import { deleteAllMatchResults } from '../models/MatchResult.js';

/**
 * Seed script — populates the SQLite database with sample data.
 *
 * Run:  node scripts/seed.js
 */
const sampleUsers = [
  {
    name: 'Priya Sharma', email: 'priya@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1997-03-15'), city: 'Mumbai',
    state: 'Maharashtra', country: 'India', education: 'MBA',
    occupation: 'Marketing Manager',
    bio: 'Love traveling and exploring new cultures. Looking for a partner who shares my curiosity.',
    interests: ['travel', 'cooking', 'reading', 'yoga', 'photography'],
    preferredAgeMin: 25, preferredAgeMax: 35, preferredCity: 'Mumbai',
    preferredEducation: 'MBA', role: 'user',
  },
  {
    name: 'Rahul Verma', email: 'rahul@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1995-07-22'), city: 'Mumbai',
    state: 'Maharashtra', country: 'India', education: 'B.Tech',
    occupation: 'Software Engineer',
    bio: 'Tech enthusiast and weekend trekker. Believe in honest communication.',
    interests: ['coding', 'trekking', 'reading', 'cooking', 'music'],
    preferredAgeMin: 23, preferredAgeMax: 32, preferredCity: 'Mumbai',
    preferredEducation: 'MBA', role: 'user',
  },
  {
    name: 'Ananya Patel', email: 'ananya@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1998-11-05'), city: 'Pune',
    state: 'Maharashtra', country: 'India', education: 'B.Tech',
    occupation: 'Data Analyst',
    bio: 'Data nerd by day, dancer by night. Looking for someone who can keep up!',
    interests: ['dancing', 'data science', 'cooking', 'travel', 'fitness'],
    preferredAgeMin: 24, preferredAgeMax: 34, preferredCity: 'Pune',
    preferredEducation: 'B.Tech', role: 'user',
  },
  {
    name: 'Vikram Singh', email: 'vikram@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1993-01-30'), city: 'Delhi',
    state: 'Delhi', country: 'India', education: 'MBA',
    occupation: 'Business Analyst',
    bio: 'Fitness freak and entrepreneur. Looking for a life partner who values ambition.',
    interests: ['fitness', 'business', 'travel', 'photography', 'cooking'],
    preferredAgeMin: 22, preferredAgeMax: 30, preferredCity: 'Delhi',
    preferredEducation: 'MBA', role: 'user',
  },
  {
    name: 'Sneha Iyer', email: 'sneha@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1996-06-18'), city: 'Bangalore',
    state: 'Karnataka', country: 'India', education: 'M.Sc',
    occupation: 'Researcher',
    bio: 'Science enthusiast with a love for classical music. Quiet evenings > loud parties.',
    interests: ['research', 'music', 'reading', 'yoga', 'painting'],
    preferredAgeMin: 26, preferredAgeMax: 36, preferredCity: 'Bangalore',
    preferredEducation: 'M.Sc', role: 'user',
  },
  {
    name: 'Arjun Mehta', email: 'arjun@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1994-09-12'), city: 'Pune',
    state: 'Maharashtra', country: 'India', education: 'B.Tech',
    occupation: 'Product Manager',
    bio: 'Product guy who builds things. Love dogs, coffee, and long drives.',
    interests: ['product management', 'coffee', 'dogs', 'driving', 'cooking'],
    preferredAgeMin: 23, preferredAgeMax: 31, preferredCity: 'Pune',
    preferredEducation: 'B.Tech', role: 'user',
  },
  {
    name: 'Kavya Reddy', email: 'kavya@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1999-02-28'), city: 'Hyderabad',
    state: 'Telangana', country: 'India', education: 'B.Com',
    occupation: 'CA Aspirant',
    bio: 'Numbers are my thing. Looking for someone who loves deep conversations.',
    interests: ['finance', 'reading', 'movies', 'travel', 'sketching'],
    preferredAgeMin: 24, preferredAgeMax: 33, preferredCity: 'Hyderabad',
    preferredEducation: 'B.Com', role: 'user',
  },
  {
    name: 'Rohan Kulkarni', email: 'rohan.kulkarni@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1994-04-09'), city: 'Bangalore',
    state: 'Karnataka', country: 'India', education: 'M.Tech',
    occupation: 'DevOps Engineer',
    bio: 'Early riser, runner, and cloud engineer. Prefer simple living and meaningful relationships.',
    interests: ['running', 'cloud computing', 'cricket', 'podcasts', 'cooking'],
    preferredAgeMin: 24, preferredAgeMax: 33, preferredCity: 'Bangalore',
    preferredEducation: 'M.Tech', role: 'user',
  },
  {
    name: 'Nisha Gupta', email: 'nisha.gupta@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1997-08-14'), city: 'Delhi',
    state: 'Delhi', country: 'India', education: 'M.A',
    occupation: 'Content Strategist',
    bio: 'Book lover and storyteller. Looking for someone kind, grounded, and family-oriented.',
    interests: ['writing', 'reading', 'theatre', 'travel', 'coffee'],
    preferredAgeMin: 26, preferredAgeMax: 35, preferredCity: 'Delhi',
    preferredEducation: 'M.A', role: 'user',
  },
  {
    name: 'Siddharth Nair', email: 'siddharth.nair@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1992-12-03'), city: 'Chennai',
    state: 'Tamil Nadu', country: 'India', education: 'B.E',
    occupation: 'Mechanical Engineer',
    bio: 'Calm and practical. Enjoy beach drives, badminton, and spending weekends with family.',
    interests: ['badminton', 'automobiles', 'movies', 'travel', 'music'],
    preferredAgeMin: 25, preferredAgeMax: 34, preferredCity: 'Chennai',
    preferredEducation: 'B.E', role: 'user',
  },
  {
    name: 'Pooja Bansal', email: 'pooja.bansal@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1998-01-27'), city: 'Jaipur',
    state: 'Rajasthan', country: 'India', education: 'B.Des',
    occupation: 'UI/UX Designer',
    bio: 'Designer with a soft corner for art, cafes, and thoughtful conversations.',
    interests: ['design', 'painting', 'photography', 'travel', 'music'],
    preferredAgeMin: 25, preferredAgeMax: 33, preferredCity: 'Jaipur',
    preferredEducation: 'B.Des', role: 'user',
  },
  {
    name: 'Karthik Raman', email: 'karthik.raman@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1991-10-19'), city: 'Hyderabad',
    state: 'Telangana', country: 'India', education: 'MBA',
    occupation: 'Sales Manager',
    bio: 'Outgoing and optimistic. Enjoy meeting new people and trying local food spots.',
    interests: ['sales', 'food', 'travel', 'fitness', 'networking'],
    preferredAgeMin: 25, preferredAgeMax: 34, preferredCity: 'Hyderabad',
    preferredEducation: 'MBA', role: 'user',
  },
  {
    name: 'Meera Joshi', email: 'meera.joshi@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1995-05-11'), city: 'Ahmedabad',
    state: 'Gujarat', country: 'India', education: 'M.Com',
    occupation: 'Finance Analyst',
    bio: 'Family-focused and ambitious. I like planning, road trips, and Sunday brunch.',
    interests: ['finance', 'travel', 'cooking', 'yoga', 'board games'],
    preferredAgeMin: 27, preferredAgeMax: 36, preferredCity: 'Ahmedabad',
    preferredEducation: 'M.Com', role: 'user',
  },
  {
    name: 'Aditya Chawla', email: 'aditya.chawla@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1996-02-16'), city: 'Pune',
    state: 'Maharashtra', country: 'India', education: 'B.Sc',
    occupation: 'Digital Marketer',
    bio: 'Creative thinker who enjoys cricket, memes, and long evening walks.',
    interests: ['marketing', 'cricket', 'movies', 'gaming', 'travel'],
    preferredAgeMin: 23, preferredAgeMax: 32, preferredCity: 'Pune',
    preferredEducation: 'B.Sc', role: 'user',
  },
  {
    name: 'Ishita Sen', email: 'ishita.sen@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1994-09-29'), city: 'Kolkata',
    state: 'West Bengal', country: 'India', education: 'M.Sc',
    occupation: 'School Teacher',
    bio: 'Patient and cheerful. I value trust, respect, and shared goals in a relationship.',
    interests: ['teaching', 'music', 'reading', 'gardening', 'cooking'],
    preferredAgeMin: 27, preferredAgeMax: 36, preferredCity: 'Kolkata',
    preferredEducation: 'M.Sc', role: 'user',
  },
  {
    name: 'Manav Arora', email: 'manav.arora@example.com', password: 'password123',
    gender: 'male', dateOfBirth: new Date('1993-06-06'), city: 'Noida',
    state: 'Uttar Pradesh', country: 'India', education: 'B.Tech',
    occupation: 'Backend Developer',
    bio: 'Introvert with a good sense of humor. Looking for a partner who appreciates honesty.',
    interests: ['coding', 'chess', 'cycling', 'podcasts', 'coffee'],
    preferredAgeMin: 24, preferredAgeMax: 33, preferredCity: 'Noida',
    preferredEducation: 'B.Tech', role: 'user',
  },
  {
    name: 'Tanvi Kapoor', email: 'tanvi.kapoor@example.com', password: 'password123',
    gender: 'female', dateOfBirth: new Date('1999-07-02'), city: 'Mumbai',
    state: 'Maharashtra', country: 'India', education: 'BBA',
    occupation: 'HR Executive',
    bio: 'People person who enjoys concerts and spontaneous weekend plans.',
    interests: ['human resources', 'music', 'travel', 'fitness', 'movies'],
    preferredAgeMin: 25, preferredAgeMax: 34, preferredCity: 'Mumbai',
    preferredEducation: 'BBA', role: 'user',
  },
  {
    name: 'Admin User', email: 'admin@example.com', password: 'admin123',
    gender: 'male', dateOfBirth: new Date('1990-01-01'), city: 'Mumbai',
    state: 'Maharashtra', country: 'India', education: 'MBA',
    occupation: 'Platform Admin',
    bio: 'Platform administrator account.',
    interests: [], role: 'admin',
  },
];

async function seed() {
  try {
    // Clear existing data (order matters for foreign keys)
    deleteAllMessages();
    deleteAllMatchResults();
    deleteAllInterests();
    deleteAllReports();
    deleteAllUsers();
    console.log('🗑️  Cleared existing data');

    // Hash passwords and create users
    const createdUsers = [];
    for (const u of sampleUsers) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const user = createUser({ ...u, password: hashedPassword });
      createdUsers.push(user);
    }
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create sample reports
    const [priya, , ananya, vikram] = createdUsers;
    createReport({
      reportedBy: priya._id, reportedUser: vikram._id,
      reason: 'spam', description: 'Sending repetitive messages',
    });
    createReport({
      reportedBy: ananya._id, reportedUser: vikram._id,
      reason: 'harassment', description: 'Inappropriate language in chat',
    });
    console.log('🚩 Created sample reports');

    console.log('\n── Sample Login Credentials ──');
    console.log('User:  priya@example.com / password123');
    console.log('User:  rahul@example.com / password123');
    console.log('Admin: admin@example.com / admin123');
    console.log('\n✅ Seed complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
