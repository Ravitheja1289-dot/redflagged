export type MockReport = {
  id: string;
  incidentTypes: string[];
  context: string;
  city: string;
  year: number;
  excerpt: string;
  narrative: string;
  behaviors: string[];
  advice: string;
  pseudonym: string;
  commentCount: number;
};

export const MOCK_REPORTS: MockReport[] = [
  {
    id: "1",
    incidentTypes: ["PHYSICAL ASSAULT", "HARASSMENT"],
    context: "Former partner",
    city: "Hyderabad",
    year: 2026,
    excerpt: "During an argument, he blocked the doorway when I tried to leave...",
    narrative: "During an argument, he blocked the doorway when I tried to leave. This happened repeatedly over several months. It started as him just wanting to finish the conversation, but escalated into him physically preventing me from exiting rooms until he was satisfied with my responses. It made me feel trapped and eventually led to physical intimidation.",
    behaviors: ["Physical intimidation", "Threats", "Controlling behavior", "Isolation"],
    advice: "If someone blocks your exit even once, recognize it as a major red flag for physical control.",
    pseudonym: "Anonymous Cedar",
    commentCount: 12,
  },
  {
    id: "2",
    incidentTypes: ["STALKING"],
    context: "Acquaintance",
    city: "Bengaluru",
    year: 2025,
    excerpt: "He started showing up at my workplace unannounced after I declined a date.",
    narrative: "We met briefly through mutual friends. After I politely declined to go out with him, he began appearing at my office building during lunch hours. He claimed it was a coincidence, but he knew exactly what time I took my breaks. He then started messaging my coworkers on LinkedIn to ask about my schedule.",
    behaviors: ["Unwanted repeated contact", "Monitoring", "Boundary violation"],
    advice: "Document every instance of uninvited contact. Tell your workplace security immediately.",
    pseudonym: "Anonymous River",
    commentCount: 8,
  },
  {
    id: "3",
    incidentTypes: ["CONTROLLING BEHAVIOR", "DOMESTIC ABUSE"],
    context: "Spouse",
    city: "Delhi",
    year: 2024,
    excerpt: "He demanded to check my phone every night and got angry if I changed my password.",
    narrative: "It was framed as 'total transparency in our marriage'. He demanded to know all my passwords. If I changed a PIN, he would throw things and accuse me of hiding things. Slowly, he made me cut off male friends, and then female friends who he said were 'bad influences'.",
    behaviors: ["Extreme jealousy", "Controlling communication", "Isolation", "Gaslighting"],
    advice: "Love doesn't require surrendering your privacy. Financial and social independence is crucial.",
    pseudonym: "Anonymous Sparrow",
    commentCount: 24,
  },
  {
    id: "4",
    incidentTypes: ["WORKPLACE MISCONDUCT"],
    context: "Manager",
    city: "Mumbai",
    year: 2026,
    excerpt: "My manager would schedule one-on-one meetings late in the evening when the office was empty.",
    narrative: "He slowly shifted our check-ins from 2 PM to 6 PM, then 7:30 PM. He would buy dinner and insist we eat in his private cabin. The conversations became uncomfortably personal. When I tried to push back the meetings to daytime, he threatened to give me a poor performance review.",
    behaviors: ["Power abuse", "Boundary testing", "Retaliation threats"],
    advice: "Trust your gut if a professional setting starts feeling unprofessionally intimate. Leave a paper trail of requests to meet during regular hours.",
    pseudonym: "Anonymous Maple",
    commentCount: 5,
  }
];

export type Comment = {
  id: string;
  reportId: string;
  pseudonym: string;
  content: string;
  timestamp: string;
};

export const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    reportId: "1",
    pseudonym: "Anonymous Pine",
    content: "This helped me recognize something similar. My ex used to stand in front of the door too. It's terrifying.",
    timestamp: "2026-08-10T10:00:00Z"
  },
  {
    id: "c2",
    reportId: "1",
    pseudonym: "Anonymous Oak",
    content: "Thank you for sharing this. Blocking an exit is absolutely a form of physical intimidation.",
    timestamp: "2026-08-11T14:30:00Z"
  }
];
