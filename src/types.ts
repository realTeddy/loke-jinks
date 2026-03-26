export interface Joke {
  punchline: string;
  category: string;
  createdAt: string;
}

export interface Env {
  JOKES: KVNamespace;
}

export const CATEGORIES = [
  { id: "misdirection", label: "Misdirection", description: "URL looks like a legit resource, punchline recontextualizes it" },
  { id: "yo-mama", label: "Yo Mama", description: "Shared in a plausible context, absurd by contrast" },
  { id: "deez-nuts", label: "Deez Nuts / Ligma", description: "URL is the setup, page is the punchline" },
  { id: "thats-what-she-said", label: "That's What She Said", description: "Innocuous URL, sexual reframe" },
  { id: "anti-joke", label: "Anti-joke", description: "Subverts expectation, no real punchline" },
  { id: "callback", label: "Callback", description: "Sender sets up context in chat, URL is the closer" },
  { id: "custom", label: "Custom", description: "Write your own joke" },
] as const;
