export interface ArchivePost {
  id: string;
  slug: string;
  date: string; // ISO date string
  qic: string[]; // Q in charge (supports multiple co-Qs)
  pax: string[]; // Members that attended
  ao: string[]; // Location (supports multiple AOs if workout moves)
  title: string;
  content: string; // Rich text content
  author: string;
}

// Mock data for archive posts
export const mockArchivePosts: ArchivePost[] = [
  {
    id: '1',
    slug: 'crushing-the-pyramid',
    date: '2024-03-15T06:00:00.000Z',
    qic: ['Shocker'],
    pax: ['Shocker', 'Twinkle Toes', 'Hammer', 'Spiderman', 'Goose', 'Maverick', 'Ice Man', 'Rooster'],
    ao: ['Innsbrook Corporate Center'],
    title: 'Crushing the Pyramid',
    content: `
      <p>What an incredible morning we had at Innsbrook! The gloom was thick but our spirits were high as we gathered for another episode of "How Much Can We Suffer Together?"</p>

      <h3>The Warm-Up</h3>
      <p>Started with the usual suspects:</p>
      <ul>
        <li>20 SSH (Side Straddle Hops)</li>
        <li>15 Windmills</li>
        <li>10 Imperial Walkers</li>
        <li>Arm circles forward and back</li>
      </ul>

      <h3>The Main Event: Pyramid of Pain</h3>
      <p>Today's beatdown focused on a pyramid workout that had the PAX questioning their life choices. We started at the bottom of the parking lot and worked our way up with increasing reps:</p>

      <p><strong>Round 1:</strong> 10 Burpees, 20 Merkins, 30 Squats<br/>
      <strong>Round 2:</strong> 20 Burpees, 40 Merkins, 60 Squats<br/>
      <strong>Round 3:</strong> 30 Burpees, 60 Merkins, 90 Squats<br/>
      <strong>Round 4:</strong> Back down - 20 Burpees, 40 Merkins, 60 Squats<br/>
      <strong>Round 5:</strong> 10 Burpees, 20 Merkins, 30 Squats</p>

      <p>Between each round, we bear crawled 50 yards to the next station. The mumblechatter was at an all-time high as the PAX "encouraged" each other through the pain.</p>

      <h3>The Finish</h3>
      <p>Finished with a quick Mary session:</p>
      <ul>
        <li>30 Flutter kicks</li>
        <li>20 American Hammers</li>
        <li>15 LBCs (Little Baby Crunches)</li>
      </ul>

      <p>Great work by all the PAX this morning. Special shoutout to our FNG Ice Man for posting for his first F3 workout and crushing it! And to Goose for not complaining (much) about the burpees.</p>
    `,
    author: 'Shocker'
  },
  {
    id: '2',
    slug: 'running-with-the-devil',
    date: '2024-03-08T06:00:00.000Z',
    qic: ['Road Runner', 'Flash'],
    pax: ['Road Runner', 'Flash', 'Sonic', 'Bolt', 'Sprint', 'Dash'],
    ao: ['Deep Run Park', 'Trail System'],
    title: 'Running with the Devil',
    content: `
      <p>The forecast called for perfect running weather, and the PAX delivered with a solid showing for our weekly run-focused beatdown. Road Runner and Flash co-Q'd this one, splitting duties between Deep Run Park and the trail system.</p>

      <h3>The Warm-Up</h3>
      <p>Quick and efficient to get the blood flowing:</p>
      <ul>
        <li>Light jog around the parking lot</li>
        <li>Leg swings and high knees</li>
        <li>Butt kicks and carioca</li>
      </ul>

      <h3>The Run</h3>
      <p>Today's main event was a 5-mile loop through the park trails with interval training mixed in. We hit the following stations:</p>

      <p><strong>Mile 1:</strong> Easy pace to warm up the legs<br/>
      <strong>Mile 2:</strong> 30-second sprint intervals every quarter mile<br/>
      <strong>Mile 3:</strong> Hill repeats on the big hill (5 times up and down)<br/>
      <strong>Mile 4:</strong> Tempo pace - comfortably hard<br/>
      <strong>Mile 5:</strong> Cool down back to the start</p>

      <p>At each mile marker, we stopped for 20 burpees because apparently we're gluttons for punishment.</p>

      <h3>The Finish</h3>
      <p>Ended with some stretching and core work:</p>
      <ul>
        <li>Plank hold - 1 minute</li>
        <li>Mountain climbers - 30 seconds</li>
        <li>Cool down walk</li>
      </ul>

      <p>Excellent work by all the PAX! Flash set a new PR on the hill repeats, and Sonic managed to keep up despite claiming he was "taking it easy" today. The mumblechatter about who's faster was entertaining as always.</p>
    `,
    author: 'Road Runner'
  },
  {
    id: '3',
    slug: 'deck-of-cards-beatdown',
    date: '2024-02-29T06:00:00.000Z',
    qic: ['Ace', 'King'],
    pax: ['Ace', 'King', 'Queen', 'Jack', 'Joker', 'Dealer', 'Shuffle', 'Bluff'],
    ao: ['Tuckahoe Elementary'],
    title: 'Deck of Cards Beatdown',
    content: `
      <p>This morning we played a high-stakes game where the house always wins and the PAX always suffer. Ace and King co-Q'd this deck of cards beatdown where every draw meant more pain!</p>

      <h3>The Rules</h3>
      <p>Each suit represented a different exercise:</p>
      <ul>
        <li><strong>Hearts:</strong> Merkins</li>
        <li><strong>Diamonds:</strong> Squats</li>
        <li><strong>Clubs:</strong> Burpees</li>
        <li><strong>Spades:</strong> Mountain Climbers (each leg counts as one)</li>
      </ul>

      <p>Face cards were worth 10, Aces were 15, and Jokers meant everyone planks for 30 seconds while the drawer does 20 of everything.</p>

      <h3>The Game</h3>
      <p>We worked through the entire deck, with each PAX taking turns drawing cards. Some highlights (lowlights?):</p>

      <ul>
        <li>Queen drew the Ace of Clubs early on - 15 burpees had everyone questioning their Thursday morning decisions</li>
        <li>Joker lived up to his name by drawing both actual Jokers in the deck</li>
        <li>Jack thought he was lucky until he pulled the King of Spades</li>
        <li>Dealer kept trying to stack the deck but we weren't having it</li>
      </ul>

      <h3>The Final Hand</h3>
      <p>Finished strong with a quick round of Mary:</p>
      <ul>
        <li>20 American Hammers</li>
        <li>15 Dolly Partons</li>
        <li>30-second plank hold</li>
      </ul>

      <p>Great work by all the PAX! This workout proved that the house always wins, but we all left as winners having pushed each other to be better. Special mention to Shuffle for somehow making every exercise look effortless.</p>
    `,
    author: 'Ace'
  }
];

// Helper function to get posts by date range
export const getPostsByDateRange = (startDate: string, endDate: string): ArchivePost[] => {
  return mockArchivePosts.filter(post => {
    const postDate = new Date(post.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return postDate >= start && postDate <= end;
  });
};

// Helper function to get post by date and slug
export const getPostByDateAndSlug = (year: string, month: string, day: string, slug: string): ArchivePost | undefined => {
  return mockArchivePosts.find(post => {
    const postDate = new Date(post.date);
    return (
      postDate.getFullYear().toString() === year &&
      (postDate.getMonth() + 1).toString().padStart(2, '0') === month &&
      postDate.getDate().toString().padStart(2, '0') === day &&
      post.slug === slug
    );
  });
};

// Helper function to get posts by year
export const getPostsByYear = (year: string): ArchivePost[] => {
  return mockArchivePosts.filter(post => {
    const postDate = new Date(post.date);
    return postDate.getFullYear().toString() === year;
  });
};

// Helper function to get posts by year and month
export const getPostsByYearMonth = (year: string, month: string): ArchivePost[] => {
  return mockArchivePosts.filter(post => {
    const postDate = new Date(post.date);
    return (
      postDate.getFullYear().toString() === year &&
      (postDate.getMonth() + 1).toString().padStart(2, '0') === month
    );
  });
};

// Helper function to get posts by year, month, and day
export const getPostsByYearMonthDay = (year: string, month: string, day: string): ArchivePost[] => {
  return mockArchivePosts.filter(post => {
    const postDate = new Date(post.date);
    return (
      postDate.getFullYear().toString() === year &&
      (postDate.getMonth() + 1).toString().padStart(2, '0') === month &&
      postDate.getDate().toString().padStart(2, '0') === day
    );
  });
};

// Helper function to format date for URL
export const formatDateForUrl = (date: string): { year: string; month: string; day: string } => {
  const d = new Date(date);
  return {
    year: d.getFullYear().toString(),
    month: (d.getMonth() + 1).toString().padStart(2, '0'),
    day: d.getDate().toString().padStart(2, '0')
  };
};