const assert = require("node:assert/strict");
const fs = require("node:fs");
const { afterEach, beforeEach, test } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToString } = require("react-dom/server");

// Use the project's existing TypeScript dependency; compile only in memory.
for (const extension of [".ts", ".tsx"]) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2023,
        esModuleInterop: true,
      },
    });
    module._compile(outputText, filename);
  };
}
require.extensions[".css"] = () => {};

const { loadApplications, loadLanguage, saveApplications, saveLanguage } =
  require("../src/storage.ts");
const { isJobApplicationList, getValidJobUrl } = require("../src/validation.ts");
const App = require("../src/App.tsx").default;
const applicationsKey = "job-applications";
const languageKey = "job-tracker-language";
const validApplication = {
  id: 1,
  company: "Acme",
  position: "Engineer",
  status: "Applied",
  dateApplied: "2026-10-04",
  jobLink: "https://example.com/jobs/1",
  notes: "First line\nSecond line",
  rating: 8,
};

let originalStorage;
let values;
let writes;

beforeEach(() => {
  originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  values = new Map();
  writes = [];
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        writes.push([key, value]);
        values.set(key, value);
      },
    },
  });
});

afterEach(() => {
  if (originalStorage) {
    Object.defineProperty(globalThis, "localStorage", originalStorage);
  } else {
    delete globalThis.localStorage;
  }
});

test("missing storage starts empty without writing defaults", () => {
  assert.deepEqual(loadApplications(), {
    applications: [], issue: null, canSave: true,
  });
  assert.deepEqual(loadLanguage(), { language: "en", issue: null });
  assert.equal(writes.length, 0);
});

test("valid stored applications and language are loaded unchanged", () => {
  values.set(applicationsKey, JSON.stringify([validApplication]));
  values.set(languageKey, "es");
  assert.deepEqual(loadApplications(), {
    applications: [validApplication], issue: null, canSave: true,
  });
  assert.deepEqual(loadLanguage(), { language: "es", issue: null });
  assert.equal(writes.length, 0);
});

for (const [name, raw] of [
  ["malformed JSON", "{"],
  ["empty stored string", ""],
  ["JSON null", "null"],
  ["JSON object", "{}"],
  ["non-object entry", "[null]"],
  ["wrong field type", JSON.stringify([{ ...validApplication, company: 7 }])],
  ["missing field", JSON.stringify([{ id: 1, company: "Acme" }])],
  ["unknown status", JSON.stringify([{ ...validApplication, status: "Unknown" }])],
  ["impossible date", JSON.stringify([{ ...validApplication, dateApplied: "2026-02-29" }])],
  ["rating out of range", JSON.stringify([{ ...validApplication, rating: 11 }])],
  ["fractional rating", JSON.stringify([{ ...validApplication, rating: 1.5 }])],
  ["invalid ID", JSON.stringify([{ ...validApplication, id: -1 }])],
  ["duplicate IDs", JSON.stringify([validApplication, validApplication])],
]) {
  test(`${name} is protected and never overwritten during loading`, () => {
    values.set(applicationsKey, raw);
    assert.deepEqual(loadApplications(), {
      applications: [], issue: "invalid-data", canSave: false,
    });
    assert.equal(values.get(applicationsKey), raw);
    assert.equal(writes.length, 0);
  });
}

test("optional fields, valid leap days and every current status are accepted", () => {
  const application = { ...validApplication, dateApplied: "", rating: undefined };
  assert.equal(isJobApplicationList([application]), true);
  for (const status of ["Applied", "Interview", "Rejected", "Offer", "Saved"]) {
    assert.equal(isJobApplicationList([{ ...application, status }]), true);
  }
  for (const dateApplied of ["2024-02-29", "2000-02-29", "0099-01-01"]) {
    assert.equal(isJobApplicationList([{ ...application, dateApplied }]), true);
  }
  for (const dateApplied of ["1900-02-29", "2026-04-31", "0000-01-01", "2026-13-01", "2026-01-00", "04/10/2026"]) {
    assert.equal(isJobApplicationList([{ ...application, dateApplied }]), false);
  }
});

test("read failures preserve existing data and protect future writes", () => {
  const raw = JSON.stringify([validApplication]);
  values.set(applicationsKey, raw);
  globalThis.localStorage.getItem = () => { throw new Error("Access denied"); };
  assert.deepEqual(loadApplications(), {
    applications: [], issue: "read-error", canSave: false,
  });
  assert.deepEqual(loadLanguage(), { language: "en", issue: "read-error" });
  assert.equal(values.get(applicationsKey), raw);
  assert.equal(writes.length, 0);
});

test("the localStorage property itself can throw without crashing the loaders", () => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    get() { throw new Error("SecurityError"); },
  });
  assert.equal(loadApplications().issue, "read-error");
  assert.equal(loadLanguage().issue, "read-error");
  assert.equal(saveApplications([validApplication]), false);
  assert.equal(saveLanguage("es"), false);
});

test("write failures return failure and leave previously saved data intact", () => {
  const raw = JSON.stringify([validApplication]);
  values.set(applicationsKey, raw);
  values.set(languageKey, "en");
  globalThis.localStorage.setItem = () => { throw new Error("QuotaExceededError"); };
  assert.equal(saveApplications([]), false);
  assert.equal(saveLanguage("es"), false);
  assert.equal(values.get(applicationsKey), raw);
  assert.equal(values.get(languageKey), "en");
});

test("saved edits, additions and deletions survive a fresh load", () => {
  const updated = { ...validApplication, notes: "Updated\nStill multiline" };
  const added = { ...validApplication, id: 2, company: "Second company" };
  assert.equal(saveApplications([added, updated]), true);
  assert.deepEqual(loadApplications().applications, [added, updated]);
  assert.equal(saveApplications([updated]), true);
  assert.deepEqual(loadApplications().applications, [updated]);
  assert.equal(saveApplications([]), true);
  assert.deepEqual(loadApplications().applications, []);
  assert.equal(saveLanguage("es"), true);
  assert.deepEqual(loadLanguage(), { language: "es", issue: null });
});

test("invalid language falls back without overwriting the original preference", () => {
  values.set(languageKey, "fr");
  assert.deepEqual(loadLanguage(), { language: "en", issue: "invalid-data" });
  assert.equal(values.get(languageKey), "fr");
  assert.equal(writes.length, 0);
});

test("App renders a translated warning for corrupt data without writing storage", () => {
  values.set(applicationsKey, "{");
  values.set(languageKey, "es");
  const html = renderToString(React.createElement(App));
  assert.match(html, /Aviso de almacenamiento/);
  assert.match(html, /guardado automático está pausado/);
  assert.match(html, /Reemplazar datos guardados con la lista actual/);
  assert.equal(values.get(applicationsKey), "{");
  assert.equal(writes.length, 0);
});

test("App renders with storage blocked instead of crashing", () => {
  globalThis.localStorage.getItem = () => { throw new Error("Access denied"); };
  const html = renderToString(React.createElement(App));
  assert.match(html, /Storage notice/);
  assert.match(html, /Saved applications could not be read/);
  assert.match(html, /language preference could not be read/);
  assert.equal(writes.length, 0);
});

test("job URL validation normalizes web links and rejects other protocols", () => {
  for (const [input, expected] of [
    ["https://example.com/jobs/1", "https://example.com/jobs/1"],
    ["http://example.com", "http://example.com/"],
    ["  HTTPS://EXAMPLE.COM/jobs  ", "https://example.com/jobs"],
    ["", null],
    ["not-a-url", null],
    ["https://", null],
    ["/jobs/1", null],
    ["ftp://example.com/jobs", null],
    ["javascript:alert(1)", null],
    ["data:text/html,<script>alert(1)</script>", null],
  ]) {
    assert.equal(getValidJobUrl(input), expected, input);
  }
});

test("legacy invalid links are hidden without discarding stored applications", () => {
  for (const jobLink of ["ftp://example.com/jobs", "javascript:alert(1)", "not-a-url", ""]) {
    const raw = JSON.stringify([{ ...validApplication, jobLink }]);
    values.set(applicationsKey, raw);
    const html = renderToString(React.createElement(App));
    assert.match(html, /Acme/);
    assert.doesNotMatch(html, /class="job-link"/);
    assert.doesNotMatch(html, /Storage notice/);
    assert.equal(values.get(applicationsKey), raw);
  }
  values.set(applicationsKey, JSON.stringify([validApplication]));
  const html = renderToString(React.createElement(App));
  assert.match(html, /class="job-link" href="https:\/\/example.com\/jobs\/1"/);
  assert.equal(writes.length, 0);
});
