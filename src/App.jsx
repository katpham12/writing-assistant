import { useState } from 'react';
import { Send, Copy, Check, Mail, Sparkles, MessageSquare, Briefcase, RefreshCw } from 'lucide-react';

const tones = [
  { value: 'warm-professional', label: 'Warm & Professional', description: 'Friendly but still polished' },
  { value: 'concise', label: 'Short & Clear', description: 'Get to the point, no fluff' },
  { value: 'job-outreach', label: 'Job Outreach', description: 'Cold email to recruiter or hiring manager' },
  { value: 'follow-up', label: 'Follow Up', description: 'After interview or no reply' },
  { value: 'grateful', label: 'Thankful', description: "Appreciate someone's time or help" },
  { value: 'assertive', label: 'Assertive', description: 'Stand your ground, still respectful' },
];

export default function App() {
  const [rawThoughts, setRawThoughts] = useState('');
  const [tone, setTone] = useState('warm-professional');
  const [jobDesc, setJobDesc] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('email');

  const generateEmail = async () => {
    if (!rawThoughts.trim()) return;
    setIsLoading(true);
    setError('');
    setGeneratedEmail('');

    try {
      const jobPart = jobDesc.trim()
        ? `\n\nHere is the job description or context for the outreach:\n"""\n${jobDesc}\n"""\n`
        : '';

      const isMessage = mode === 'message';
      const prompt = isMessage
        ? `You are helping Kat, a Vietnamese American professional, write messages (LinkedIn, text, DM, etc). She communicates in a simple, clear, and direct way — no fancy words, no overly formal language, and definitely not robotic. Her messages should sound like a real, warm human wrote them.

Tone requested: ${tone}

Raw thoughts from Kat: "${rawThoughts}"${jobPart}

Rules:
- Keep it short and conversational — this is a message, not an email
- Avoid corporate buzzwords like "leverage", "synergy", "circle back", "touch base"
- Sound natural, like Kat actually wrote it herself
- No subject line
- Do not add any explanation outside the message

Write the message now.`
        : `You are helping Kat, a Vietnamese American professional, write emails. She communicates in a simple, clear, and direct way — no fancy words, no overly formal language, and definitely not robotic. Her emails should sound like a real, warm human wrote them — professional but approachable.

Tone requested: ${tone}

Raw thoughts from Kat: "${rawThoughts}"${jobPart}

Rules:
- Keep sentences short and easy to read
- Avoid corporate buzzwords like "leverage", "synergy", "circle back", "touch base"
- Sound natural, like Kat actually wrote it herself
- Do NOT start with "I hope this email finds you well" or similar clichés
- Include a subject line on the first line formatted as: Subject: [subject here]
- Then leave a blank line
- Then write the email body
- Do not add any explanation outside the email

Write the email now.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.error?.message || 'API error');
      }

      const data = await response.json();
      const text = data.content?.filter(b => b.type === 'text').map(b => b.text).join('').trim();
      if (!text) throw new Error('Empty response');
      setGeneratedEmail(text);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateEmail();
  };

  const subjectLine = generatedEmail.startsWith('Subject:')
    ? generatedEmail.split('\n')[0].replace('Subject:', '').trim()
    : null;
  const emailBody = subjectLine
    ? generatedEmail.split('\n').slice(2).join('\n').trim()
    : generatedEmail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Kat's Writing Assistant</h1>
          <p className="text-slate-500 text-base">Type your rough thoughts → get a clean, natural email</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-slate-700 text-lg">What do you want to say?</h2>
              </div>
              <textarea
                value={rawThoughts}
                onChange={e => setRawThoughts(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Just write it out however it comes. Like: 'I want to reach out to this recruiter about a data analyst job, say I'm interested and ask if we can chat'"
                className="w-full h-36 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-700 placeholder-slate-400 text-sm bg-slate-50"
              />
              <p className="text-xs text-slate-400 mt-2">💡 Cmd/Ctrl + Enter to generate</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-slate-700 text-lg">Pick a tone</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {tones.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                      tone === t.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-medium text-slate-800 text-sm">{t.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-slate-500" />
                  <h2 className="font-semibold text-slate-700 text-lg">Job Description <span className="text-slate-400 font-normal text-sm">(optional)</span></h2>
                </div>
                <button
                  onClick={() => setShowJobDesc(!showJobDesc)}
                  className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                >
                  {showJobDesc ? 'Hide' : 'Add'}
                </button>
              </div>
              {showJobDesc && (
                <textarea
                  value={jobDesc}
                  onChange={e => setJobDesc(e.target.value)}
                  placeholder="Paste the job posting here so the email can reference it..."
                  className="mt-4 w-full h-28 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-700 placeholder-slate-400 text-sm bg-slate-50"
                />
              )}
            </div>

            <button
              onClick={generateEmail}
              disabled={isLoading || !rawThoughts.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-semibold text-base shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Writing your {mode}...</>
              ) : (
                <><Send className="w-5 h-5" /> Generate {mode === 'email' ? 'Email' : 'Message'}</>
              )}
            </button>

            <button
              onClick={() => { setMode(mode === 'email' ? 'message' : 'email'); setGeneratedEmail(''); }}
              className="w-full py-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-700 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Switch to {mode === 'email' ? 'Message (LinkedIn, Text, DM)' : 'Email'}
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-500" />
                <h2 className="font-semibold text-slate-700 text-lg">Your Response</h2>
              </div>
              {generatedEmail && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-600 font-medium transition-colors"
                >
                  {copied ? <><Check className="w-4 h-4 text-green-500" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                </button>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm mb-4">{error}</div>
            )}

            {generatedEmail ? (
              <div className="flex-1 bg-slate-50 rounded-xl p-5 border border-slate-200 overflow-auto">
                {mode === 'email' && subjectLine && (
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Subject</span>
                    <p className="text-slate-800 font-semibold mt-1">{subjectLine}</p>
                  </div>
                )}
                <pre className="whitespace-pre-wrap font-sans text-slate-700 text-sm leading-relaxed">{mode === 'email' ? emailBody : generatedEmail}</pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                <Mail className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-base">Your {mode === 'email' ? 'email' : 'message'} will show up here</p>
                <p className="text-sm mt-1 text-slate-400">Fill in your thoughts and hit Generate</p>
              </div>
            )}

            {generatedEmail && (
              <button
                onClick={() => { setGeneratedEmail(''); setRawThoughts(''); setJobDesc(''); }}
                className="mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
              >
                Start over
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
