// For production, it is highly recommended to replace the standard <img> tag in the content 
// with the Next.js <Image> component for automatic image optimization. 
// This would involve:
// 1. Modifying the blog post rendering logic (e.g., using a library like 'html-react-parser') 
//    to replace <img> tags with <Image> components.
// 2. Configuring 'next.config.mjs' to allow the external image domain:
//    images: {
//      remotePatterns: [
//        {
//          protocol: 'https',
//          hostname: 'images.unsplash.com',
//        },
//      ],
//    },

export interface Post {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  content: string;
  author: string;
}

export const posts: Post[] = [
  {
    title: 'Getting Started with Hydroponics: A Beginner\'s Guide',
    slug: 'getting-started-with-hydroponics',
    date: 'January 15, 2026',
    author: 'Jane Doe',
    excerpt: 'Learn the basics of setting up your very first hydroponics system, from choosing the right equipment to mixing your first batch of nutrients.',
    content: `
      <h2 class="text-2xl font-bold mb-4">1. Introduction to Hydroponics</h2>
      <p class="mb-4">Hydroponics is a method of growing plants without soil, using mineral nutrient solutions in a water solvent. It's an efficient way to grow fresh produce indoors, year-round.</p>
      <h2 class="text-2xl font-bold mb-4">2. Choosing Your System</h2>
      <p class="mb-4">There are several types of hydroponic systems, including Deep Water Culture (DWC), Nutrient Film Technique (NFT), and Drip Systems. For beginners, DWC is often the simplest and most cost-effective to start with.</p>
      <img src="https://images.unsplash.com/photo-1599599810694-b5b37304c3a9?q=80&w=2070&auto=format&fit=crop" alt="Hydroponics setup" class="rounded-lg my-6"/>
      <h2 class="text-2xl font-bold mb-4">3. Nutrients and pH</h2>
      <p>Your plants need a balanced mix of macro and micronutrients. You'll also need to monitor and adjust the pH of your nutrient solution regularly, aiming for a range of 5.5 to 6.5 for most lettuce varieties.</p>
    `,
  },
  {
    title: 'The Perfect Environment for Lettuce',
    slug: 'perfect-environment-for-lettuce',
    date: 'January 22, 2026',
    author: 'John Smith',
    excerpt: 'Discover the ideal temperature, humidity, and light cycles to maximize your lettuce yield and quality.',
    content: `
      <h2 class="text-2xl font-bold mb-4">1. Ideal Temperature</h2>
      <p class="mb-4">Lettuce is a cool-weather crop. Aim for a temperature range of 18-24°C (65-75°F) during the day and slightly cooler at night. Temperatures that are too high can cause bolting.</p>
      <h2 class="text-2xl font-bold mb-4">2. Humidity Levels</h2>
      <p class="mb-4">Maintain a relative humidity of 50-70%. Good air circulation is key to preventing fungal diseases like powdery mildew.</p>
      <h2 class="text-2xl font-bold mb-4">3. Lighting</h2>
      <p>Lettuce requires about 10-12 hours of light per day. Full-spectrum LED grow lights are an excellent, energy-efficient choice for indoor hydroponic gardens.</p>
    `,
  },
  {
    title: 'Troubleshooting Common Hydroponics Issues',
    slug: 'troubleshooting-hydroponics-issues',
    date: 'January 29, 2026',
    author: 'Emily White',
    excerpt: 'From nutrient deficiencies to pest control, learn how to identify and solve common problems in your hydroponic garden.',
    content: `
      <h2 class="text-2xl font-bold mb-4">1. Nutrient Deficiencies</h2>
      <p class="mb-4">Yellowing leaves can indicate a nitrogen deficiency, while purple stems might mean a lack of phosphorus. Learn to read the signs your plants are giving you.</p>
      <h2 class="text-2xl font-bold mb-4">2. Pest Management</h2>
      <p>Even indoor gardens can get pests. Aphids and spider mites are common. Introduce beneficial insects like ladybugs or use organic neem oil spray to keep them at bay.</p>
    `,
  },
];
