export interface JokeTemplate {
  label: string;
  text: string;
}

export const templates: Record<string, JokeTemplate[]> = {
  "misdirection": [
    { label: "Important meeting", text: "This meeting could have been an email." },
    { label: "Research paper", text: "We found nothing. Absolutely nothing." },
    { label: "Breaking news", text: "You just got played." },
  ],
  "yo-mama": [
    { label: "Classic weight", text: "Yo mama so fat, she uses Google Earth as a mirror." },
    { label: "Classic old", text: "Yo mama so old, her birth certificate says expired." },
    { label: "Classic slow", text: "Yo mama so slow, she took 9 months to make a joke." },
  ],
  "deez-nuts": [
    { label: "Classic", text: "Got 'em!" },
    { label: "Formal", text: "Deez nuts. You have been got." },
    { label: "Ligma", text: "Ligma balls." },
  ],
  "thats-what-she-said": [
    { label: "Classic", text: "That's what she said." },
    { label: "Extended", text: "That's what she said. And she was right." },
  ],
  "anti-joke": [
    { label: "Nothing", text: "There is no joke. You clicked a link for nothing." },
    { label: "Honest", text: "This is just a website. Nothing funny here." },
    { label: "Existential", text: "The real joke is the time you spent clicking this link." },
  ],
  "callback": [
    { label: "Remember?", text: "I told you so." },
    { label: "Payoff", text: "And THAT is why you don't trust links from me." },
  ],
};
