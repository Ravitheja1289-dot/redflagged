// Random nature-based pseudonym generator
const trees = [
  "Cedar", "River", "Sparrow", "Maple", "Oak", "Rowan", 
  "Pine", "Willow", "Birch", "Ash", "Elm", "Lark", 
  "Finch", "Robin", "Hawk", "Cypress", "Juniper", "Aspen", 
  "Brook", "Stone", "Moss", "Fern", "Sage", "Thistle"
];

export function generateAnonymousPseudonym(): string {
  const randomIndex = Math.floor(Math.random() * trees.length);
  const randomSuffix = Math.floor(Math.random() * 900) + 100; // 100-999
  return `Anonymous ${trees[randomIndex]} ${randomSuffix}`;
}
