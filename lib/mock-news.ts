export type NewsArticle = {
  id: string;
  locale: "en" | "bn";
  title: string;
  slug: string;
  excerpt: string;
  body: string[];
  category: string;
  categoryLabel: string;
  tags: string[];
  author: string;
  publishedAt: string;
  readTime: number;
  heroImage: string;
};

const articles: NewsArticle[] = [
  {
    id: "n1",
    locale: "en",
    title: "Riverfront Transit Plan Approved for Dhaka Outer Ring",
    slug: "riverfront-transit-plan-approved",
    excerpt:
      "City planners approved a staged transit corridor that links five dense neighborhoods and introduces dedicated cycling lanes.",
    body: [
      "After months of public consultation, the city board approved the riverfront transit corridor in a 9-2 vote. The project includes electric bus lines, improved walkways, and pedestrian bridges across key junctions.",
      "Planners estimate the first construction phase will start in six months and reduce average commute times by up to 18 percent for residents in western districts.",
      "Editors say transport and climate coverage will remain a major focus as implementation details are finalized during budget hearings.",
    ],
    category: "city",
    categoryLabel: "City",
    tags: ["transport", "policy", "infrastructure"],
    author: "Nadia Rahman",
    publishedAt: "2026-04-16T08:00:00.000Z",
    readTime: 5,
    heroImage: "/newsroom.jpg",
  },
  {
    id: "n2",
    locale: "bn",
    title: "সিলেট চা-বাগানে নতুন সৌরশক্তি চালু",
    slug: "sylhet-tea-garden-solar-grid",
    excerpt:
      "উৎপাদন খরচ কমাতে এবং বিদ্যুৎ সাশ্রয়ে তিনটি বড় বাগানে সৌরশক্তি প্রকল্প চালু করা হয়েছে।",
    body: [
      "সিলেটের তিনটি চা-বাগানে পরীক্ষামূলকভাবে সৌরবিদ্যুৎ প্ল্যান্ট চালু হয়েছে। কর্তৃপক্ষ বলছে, এতে মাসিক বিদ্যুৎ বিল ৩০ শতাংশ পর্যন্ত কমে আসতে পারে।",
      "প্রকল্প সংশ্লিষ্টরা জানিয়েছেন, আগামী শীত মৌসুমে আরও দুটি বাগানে একই মডেল সম্প্রসারণ করা হবে।",
      "স্থানীয় শ্রমিক সংগঠন উৎপাদন ও কর্মপরিবেশের উন্নতিতে এই উদ্যোগকে ইতিবাচক হিসেবে দেখছে।",
    ],
    category: "economy",
    categoryLabel: "অর্থনীতি",
    tags: ["energy", "sylhet", "business"],
    author: "তানভীর ইসলাম",
    publishedAt: "2026-04-15T11:30:00.000Z",
    readTime: 4,
    heroImage: "/newsroom.jpg",
  },
  {
    id: "n3",
    locale: "en",
    title: "Weekend Sports Roundup: New Faces Dominate the League",
    slug: "weekend-sports-roundup-new-faces",
    excerpt:
      "Three academy graduates scored decisive goals in a dramatic weekend that reshaped the title race.",
    body: [
      "The weekend opened with an upset as the defending champions conceded two late goals and dropped points for the third straight match.",
      "Youth coaches praised the confidence shown by under-21 players who stepped into critical roles during injury absences.",
      "Analysts now expect a tighter run-in with four teams separated by just five points.",
    ],
    category: "sports",
    categoryLabel: "Sports",
    tags: ["football", "league", "analysis"],
    author: "Arif Chowdhury",
    publishedAt: "2026-04-14T18:20:00.000Z",
    readTime: 6,
    heroImage: "/newsroom.jpg",
  },
  {
    id: "n4",
    locale: "bn",
    title: "বিশ্ববিদ্যালয়ে গবেষণা অনুদান বাড়ছে ২০ শতাংশ",
    slug: "university-research-grant-increase",
    excerpt:
      "উচ্চশিক্ষা খাতে নতুন তহবিল ঘোষণা করেছে শিক্ষা মন্ত্রণালয়, অগ্রাধিকার পাবে প্রযুক্তি ও স্বাস্থ্য গবেষণা।",
    body: [
      "নতুন বাজেট প্রস্তাবে বিশ্ববিদ্যালয় গবেষণার জন্য বরাদ্দ ২০ শতাংশ বাড়ানোর সুপারিশ করা হয়েছে।",
      "শিক্ষাবিদদের মতে, গবেষণার মান ও আন্তর্জাতিক জার্নালে প্রকাশনা বাড়াতে দীর্ঘমেয়াদি তহবিল জরুরি।",
      "ছাত্র প্রতিনিধিরা বলছেন, গবেষণা সহকারী পদের সংখ্যা বাড়লে তরুণ গবেষকদের জন্য আরও সুযোগ তৈরি হবে।",
    ],
    category: "education",
    categoryLabel: "শিক্ষা",
    tags: ["research", "budget", "campus"],
    author: "মেহরিন হক",
    publishedAt: "2026-04-13T09:10:00.000Z",
    readTime: 5,
    heroImage: "/newsroom.jpg",
  },
  {
    id: "n5",
    locale: "en",
    title: "Health Desk: District Clinics Expand Evening Services",
    slug: "district-clinics-expand-evening-services",
    excerpt:
      "Forty-eight district clinics will offer evening appointments to reduce daytime queues and travel pressure.",
    body: [
      "The health ministry announced an evening shift pilot across district clinics beginning next month. Officials say the change is aimed at workers who struggle to visit during office hours.",
      "Community health workers welcomed the decision but requested stronger medicine supply chains to prevent shortages during peak periods.",
      "If successful, the model may be rolled out nationwide before the end of the year.",
    ],
    category: "health",
    categoryLabel: "Health",
    tags: ["public-health", "policy", "district"],
    author: "Shamima Noor",
    publishedAt: "2026-04-12T07:45:00.000Z",
    readTime: 4,
    heroImage: "/newsroom.jpg",
  },
];

export function getPublishedArticles(): NewsArticle[] {
  return [...articles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getArticleBySlug(slug: string): NewsArticle | undefined {
  return articles.find((item) => item.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): NewsArticle[] {
  return getPublishedArticles().filter(
    (article) => article.category === categorySlug,
  );
}

export function getArticlesByTag(tagSlug: string): NewsArticle[] {
  return getPublishedArticles().filter((article) =>
    article.tags.includes(tagSlug),
  );
}

export function getCategoryMap(): Array<{ slug: string; label: string }> {
  const map = new Map<string, string>();

  for (const article of articles) {
    map.set(article.category, article.categoryLabel);
  }

  return Array.from(map.entries()).map(([slug, label]) => ({ slug, label }));
}

export function getTagList(): string[] {
  const tags = new Set<string>();

  for (const article of articles) {
    for (const tag of article.tags) {
      tags.add(tag);
    }
  }

  return Array.from(tags).sort((a, b) => a.localeCompare(b));
}

export function formatStoryDate(dateISO: string, locale: "en" | "bn") {
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateISO));
}
