export const PROFILES = [
  {
    id: "patricia",
    name: "Patricia",
    avatar: "👩‍🦰",
    color: "#e63946"
  },
  {
    id: "marie-christine",
    name: "Marie-Christine",
    avatar: "👩‍🦱",
    color: "#457b9d"
  }
];

export function loadProfileData(profileId) {
  const savedData = localStorage.getItem(`mi-espanol-${profileId}`);

  if (savedData) {
    return JSON.parse(savedData);
  }

  return {
    score: 0,
    completedExercises: [],
    categoryProgress: {},
    badges: [],
    streak: 0
  };
}

export function saveProfileData(profileId, data) {
  localStorage.setItem(
    `mi-espanol-${profileId}`,
    JSON.stringify(data)
  );
}
