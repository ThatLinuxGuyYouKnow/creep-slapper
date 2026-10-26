// Vercel serverless stub for slice 1: proves the functions wiring with
// seeded data. Slice 2 replaces the body with the real DeepSeek call.

const MOCK = {
  keep: [
    'One paste box for the brain dump',
    'SLAP button that returns keep / checklist / creeps',
    'Result panel with struck-through cuts',
  ],
  checklist: [
    'Paste a dump and hit SLAP',
    'See keep, checklist, and creeps render',
    'Record the 1-minute demo',
  ],
  creeps: [
    'User accounts and login',
    'Realtime multi-user sync',
    'Full hackathon-site scraper with judging weights',
    'Native mobile apps for iOS and Android',
    'Blockchain-based slap ledger',
  ],
};

export default function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'POST only' });
    return;
  }
  res.status(200).json(MOCK);
}
