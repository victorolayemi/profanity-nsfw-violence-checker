<h1>🛡️ profanity-nsfw-violence-checker</h1>

<p>
  A robust and customizable TypeScript/JavaScript library for detecting and censoring profanity, sexual content, violence, and hate speech in plain text and HTML.
</p>

<p>
  <a href="https://www.npmjs.com/package/profanity-nsfw-violence-checker">
    <img src="https://img.shields.io/npm/v/profanity-nsfw-violence-checker.svg" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/profanity-nsfw-violence-checker">
    <img src="https://img.shields.io/npm/dm/profanity-nsfw-violence-checker.svg" alt="npm downloads" />
  </a>
  <a href="https://github.com/victorolayemi/profanity-nsfw-violence-checker/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/profanity-nsfw-violence-checker.svg" alt="license" />
  </a>
</p>

<hr />

<h2>✨ Features</h2>
<ul>
  <li>🚨 Detects <strong>profanity, sexual content, violence, and hate speech</strong></li>
  <li>🧠 Supports <strong>leetspeak & misspellings</strong> (e.g., <code>s3x</code>, <code>f@ck</code>)</li>
  <li>🧪 Customizable <strong>severity levels</strong> (low/medium/high)</li>
  <li>🛡️ Safe <strong>HTML censoring</strong> without breaking markup</li>
  <li>📦 Built-in <strong>TypeScript types</strong> and full support</li>
  <li>🧰 Add/remove words, enable <strong>whitelist</strong>, toggle <code>strictMode</code></li>
</ul>

<hr />

<h2>📦 Installation</h2>

<pre><code>npm install profanity-nsfw-violence-checker</code></pre>
<pre><code>yarn add profanity-nsfw-violence-checker</code></pre>

<hr />

<h2>🚀 Quick Start</h2>

<pre><code>import { ProfanityChecker } from 'profanity-nsfw-violence-checker';

const checker = new ProfanityChecker();

const result = checker.check("That fucking movie was damn violent!");
console.log(result);

const censored = checker.censor("That fucking movie was damn violent!");
console.log(censored); // That ******* movie was **** violent!
</code></pre>

<hr />

<h2>🖼️ HTML Censoring</h2>

<pre><code>const html = '&lt;p&gt;This is &lt;strong&gt;damn&lt;/strong&gt; violent.&lt;/p&gt;';
const cleanHtml = checker.censorHtml(html);
console.log(cleanHtml);
// &lt;p&gt;This is &lt;strong&gt;****&lt;/strong&gt; violent.&lt;/p&gt;
</code></pre>

<hr />

<h2>⚙️ Configuration</h2>

<pre><code>const customChecker = new ProfanityChecker({
  censorCharacter: '#',
  strictMode: true,
  allowWhitelist: true,
  customWords: {
    profanity: ['frick', 'dang'],
    hateSpeech: ['subhuman']
  }
});
</code></pre>

<hr />

<h2>📚 API Methods</h2>
<ul>
  <li><code>checker.check(text: string): CheckResult</code> → Analyze text and get details</li>
  <li><code>checker.censor(text: string): string</code> → Censor words in plain text</li>
  <li><code>checker.censorHtml(html: string): string</code> → Censor inside HTML safely</li>
  <li><code>checker.addWords(category, words, severity?)</code> → Add words to a category</li>
  <li><code>checker.removeWords(category, words)</code> → Remove words from category</li>
  <li><code>checker.addToWhitelist(words)</code> → Exclude words from detection</li>
  <li><code>checker.getStats()</code> → Dictionary stats (count per category)</li>
</ul>

<hr />

<h2>🧠 Supported Categories</h2>
<ul>
  <li><strong>profanity</strong>: e.g., f***, s***, etc.</li>
  <li><strong>sexual</strong>: e.g., p***, blowjob, etc.</li>
  <li><strong>violence</strong>: e.g., kill, stab, etc.</li>
  <li><strong>hateSpeech</strong>: e.g., racial slurs, subhuman, etc.</li>
</ul>

<hr />

<h2>🧪 TypeScript Support</h2>

<pre><code>type Severity = 'low' | 'medium' | 'high';

interface Match {
  word: string;
  position: number;
  severity: Severity;
  context: string;
}

interface CheckResult {
  originalText: string;
  isFlagged: boolean;
  isProfane: boolean;
  isSexual: boolean;
  isViolent: boolean;
  isHateSpeech: boolean;
  severity: Severity;
  matches: {
    profanity: Match[];
    sexual: Match[];
    violence: Match[];
    hateSpeech: Match[];
  };
}
</code></pre>

<hr />

<h2>📈 Example Output</h2>

<pre><code>{
  isFlagged: true,
  isProfane: true,
  isSexual: false,
  isViolent: true,
  isHateSpeech: false,
  severity: 'high',
  matches: {
    profanity: [{ word: 'fucking', position: 5, severity: 'high' }],
    sexual: [],
    violence: [{ word: 'violent', position: 42, severity: 'high' }],
    hateSpeech: []
  }
}
</code></pre>

<hr />

<h2>🙌 Contributions</h2>
<p>
  PRs and issues are welcome. Help improve detection accuracy, word lists, or features!
</p>

<hr />

<h2>📄 License</h2>
<p>
  MIT License – Victor Olayemi
</p>
