  <div class="container">
    <h1><code>profanity-nsfw-violence-checker</code></h1>
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
      <a href="https://img.shields.io/bundlephobia/minzip/profanity-nsfw-violence-checker">
        <img src="https://img.shields.io/bundlephobia/minzip/profanity-nsfw-violence-checker" alt="bundle size" />
      </a>
      <a href="https://www.typescriptlang.org">
        <img src="https://img.shields.io/badge/TypeScript-supported-blue.svg" alt="TypeScript" />
      </a>
    </p>

    <p><strong>A powerful TypeScript library to detect and censor profanity, sexual content, violence, and hate speech in both plain text and HTML.</strong></p>

    <h2>✨ Features</h2>
    <ul>
      <li>✅ Categorized detection: <strong>profanity</strong>, <strong>sexual</strong>, <strong>violence</strong>, and <strong>hate speech</strong>.</li>
      <li>🚨 Severity-based classification: <code>low</code>, <code>medium</code>, <code>high</code>.</li>
      <li>💬 Leetspeak & character normalization support (e.g. <code>f*ck</code>, <code>s3x</code>).</li>
      <li>🧼 HTML-safe censoring that preserves tag structure.</li>
      <li>🧩 Extensible via <code>addWords</code>, <code>removeWords</code>, and <code>addToWhitelist</code>.</li>
      <li>🔒 Whitelist control to skip flagged terms contextually.</li>
      <li>🔧 Strict vs. non-strict (exact match) modes.</li>
      <li>🧠 Written in TypeScript with full type support.</li>
    </ul>

    <h2>📦 Installation</h2>
    <pre><code>npm install profanity-nsfw-violence-checker</code></pre>
    <pre><code>yarn add profanity-nsfw-violence-checker</code></pre>

    <h2>🚀 Basic Usage</h2>
    <pre><code class="language-typescript">import { ProfanityChecker } from 'profanity-nsfw-violence-checker';

const checker = new ProfanityChecker();
const result = checker.check("This is damn annoying and violent!");

console.log(result);
console.log(checker.censor("This is damn annoying and violent!"));
</code></pre>

    <h2>🖼 HTML Content Support</h2>
    <p>Safely censor inner text without affecting the structure:</p>
    <pre><code class="language-typescript">
const html = '&lt;p&gt;This is &lt;strong&gt;damn&lt;/strong&gt; annoying.&lt;/p&gt;';
const output = checker.censorHtml(html);
console.log(output);
</code></pre>

    <h2>⚙️ Configuration Options</h2>
    <pre><code class="language-typescript">
new ProfanityChecker({
  censorCharacter: '#',
  strictMode: true,
  allowWhitelist: true,
  customWords: {
    profanity: ['frick'],
    violence: ['smash'],
  },
  severity: {
    profanity: 'medium',
    violence: 'high'
  }
});
</code></pre>

    <h2>📘 API Reference</h2>
    <ul>
      <li><code>check(text: string): CheckResult</code> - Analyze content and get detailed result.</li>
      <li><code>censor(text: string): string</code> - Replace flagged words in plain text.</li>
      <li><code>censorHtml(html: string): string</code> - HTML-safe censoring.</li>
      <li><code>addWords(category, words, severity?)</code> - Add new words dynamically.</li>
      <li><code>removeWords(category, words)</code> - Remove flagged words.</li>
      <li><code>addToWhitelist(words)</code> - Prevent certain words from being flagged.</li>
      <li><code>getStats()</code> - Return stats about current word lists.</li>
    </ul>

    <h3>Types</h3>
    <table>
      <thead>
        <tr><th>Property</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr><td><code>originalText</code></td><td><code>string</code></td><td>The raw input text.</td></tr>
        <tr><td><code>isFlagged</code></td><td><code>boolean</code></td><td>True if any category is flagged.</td></tr>
        <tr><td><code>severity</code></td><td><code>'low' | 'medium' | 'high'</code></td><td>Highest severity matched.</td></tr>
        <tr><td><code>matches</code></td><td><code>object</code></td><td>Matched terms categorized.</td></tr>
      </tbody>
    </table>

    <h2>🙋 Contributing</h2>
    <p>Pull requests and issues are welcome! Please make sure your changes are well-tested and linted.</p>

    <h2>📄 License</h2>
    <p>This project is licensed under the <a href="https://github.com/victorolayemi/profanity-nsfw-violence-checker/blob/main/LICENSE">MIT License</a>.</p>
  </div>
