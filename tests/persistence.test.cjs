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
const { isJobApplicationList, getValidJobUrl, isValidDate } = require("../src/validation.ts");
const App = require("../src/App.tsx").default;
const ApplicationForm = require("../src/components/ApplicationForm.tsx").default;
const ApplicationCard = require("../src/components/ApplicationCard.tsx").default;
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

// Exercise the real components and event handlers without adding a DOM library.
// Hook state survives each explicit render; DOM focus is checked in the browser.
function createRenderer(t, Component, props = {}) {
  const state = [];
  return () => {
    let index = 0;
    const hooks = [
      t.mock.method(React, "useState", (initial) => {
        const slot = index++;
        if (!(slot in state)) state[slot] = typeof initial === "function" ? initial() : initial;
        return [state[slot], (next) => {
          state[slot] = typeof next === "function" ? next(state[slot]) : next;
        }];
      }),
      t.mock.method(React, "useRef", () => ({ current: null })),
      t.mock.method(React, "useEffect", () => {}),
    ];
    try {
      return Component(props);
    } finally {
      for (const hook of hooks) hook.mock.restore();
    }
  };
}

function findElement(element, predicate) {
  if (!React.isValidElement(element)) return null;
  if (predicate(element)) return element;
  for (const child of React.Children.toArray(element.props.children)) {
    const found = findElement(child, predicate);
    if (found) return found;
  }
  return null;
}

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

const dateCases = [
  ["", true],
  ["2026-10-06", true],
  ["2024-02-29", true],
  ["2000-02-29", true],
  ["20266-10-06", false],
  ["2026-02-29", false],
  ["1900-02-29", false],
  ["2026-04-31", false],
  ["0000-01-01", false],
  ["2026-13-01", false],
];

test("shared date validation agrees with persisted application validation", () => {
  for (const [dateApplied, expected] of dateCases) {
    assert.equal(isValidDate(dateApplied), expected, dateApplied);
    assert.equal(isJobApplicationList([{ ...validApplication, dateApplied }]), expected, dateApplied);
  }
});

for (const mode of ["Add", "Edit"]) {
  for (const [dateApplied, accepted] of dateCases) {
    test(`${mode} submit -> save -> reload: ${JSON.stringify(dateApplied)} is ${accepted ? "accepted" : "rejected"}`, (t) => {
      const untouched = { ...validApplication, id: 2, company: "Untouched" };
      const raw = JSON.stringify([validApplication, untouched]);
      values.set(applicationsKey, raw);
      const renderApp = createRenderer(t, App);
      if (mode === "Edit") {
        const card = findElement(renderApp(), (el) =>
          el.type === ApplicationCard && el.props.application.id === validApplication.id);
        const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
        Object.defineProperty(globalThis, "window", { configurable: true, value: { scrollTo() {} } });
        try {
          card.props.onEdit(validApplication);
        } finally {
          if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
          else delete globalThis.window;
        }
      }
      const formProps = findElement(renderApp(), (el) => el.type === ApplicationForm).props;
      const onAdd = t.mock.fn(formProps.onAddApplication);
      const onUpdate = t.mock.fn(formProps.onUpdateApplication);
      const renderForm = createRenderer(t, ApplicationForm, {
        ...formProps, onAddApplication: onAdd, onUpdateApplication: onUpdate,
      });
      const field = (id) => findElement(renderForm(), (el) => el.props.id === id);
      for (const [id, value] of [
        ["application-company", "Draft company"],
        ["application-position", "Draft position"],
        ["application-notes", "Draft first line\nDraft second line"],
        ["application-date", dateApplied],
      ]) field(id).props.onChange({ target: { value } });

      renderForm().props.onSubmit({ preventDefault() {} });
      assert.equal(onAdd.mock.callCount(), accepted && mode === "Add" ? 1 : 0);
      assert.equal(onUpdate.mock.callCount(), accepted && mode === "Edit" ? 1 : 0);
      assert.equal(writes.length, accepted ? 1 : 0);

      if (!accepted) {
        assert.equal(values.get(applicationsKey), raw);
        assert.equal(field("application-date").props.value, dateApplied);
        assert.equal(field("application-company").props.value, "Draft company");
        assert.equal(field("application-position").props.value, "Draft position");
        assert.equal(field("application-notes").props.value, "Draft first line\nDraft second line");
        assert.equal(field("application-date").props["aria-invalid"], true);
        assert.equal(field("application-date").props["aria-describedby"], "application-date-error");
        const error = field("application-date-error");
        assert.equal(error.props.role, "alert");
        assert.equal(error.props.children, formProps.formText.dateInvalid);
        assert.deepEqual(loadApplications().applications, [validApplication, untouched]);
        // Correcting the draft must also restore the complete save/reload path.
        field("application-date").props.onChange({ target: { value: "2026-10-06" } });
        assert.equal(field("application-date").props["aria-invalid"], false);
        assert.equal(field("application-date").props["aria-describedby"], undefined);
        assert.equal(field("application-date-error"), null);
        renderForm().props.onSubmit({ preventDefault() {} });
      }

      const reloaded = loadApplications();
      assert.equal(reloaded.issue, null);
      assert.equal(reloaded.canSave, true);
      assert.equal(reloaded.applications.length, mode === "Add" ? 3 : 2);
      const saved = reloaded.applications.find((app) => app.company === "Draft company");
      assert.equal(saved.dateApplied, accepted ? dateApplied : "2026-10-06");
      assert.equal(saved.notes, "Draft first line\nDraft second line");
      if (mode === "Edit") assert.equal(saved.id, validApplication.id);
      else assert.deepEqual(reloaded.applications.find((app) => app.id === validApplication.id), validApplication);
      assert.deepEqual(reloaded.applications.find((app) => app.id === untouched.id), untouched);
      const html = renderToString(React.createElement(App));
      assert.match(html, /Draft company/);
      assert.doesNotMatch(html, /Storage notice/);
    });
  }
}

test("an incomplete native date is rejected; clearing it restores the optional empty date", (t) => {
  const renderApp = createRenderer(t, App);
  const formProps = findElement(renderApp(), (el) => el.type === ApplicationForm).props;
  const onAdd = t.mock.fn(formProps.onAddApplication);
  const renderForm = createRenderer(t, ApplicationForm, { ...formProps, onAddApplication: onAdd });
  const field = (id) => findElement(renderForm(), (el) => el.props.id === id);
  field("application-company").props.onChange({ target: { value: "Acme" } });
  field("application-position").props.onChange({ target: { value: "Engineer" } });
  field("application-date").props.onInput({ currentTarget: { validity: { badInput: true } } });
  renderForm().props.onSubmit({ preventDefault() {} });
  assert.equal(onAdd.mock.callCount(), 0);
  assert.equal(field("application-date").props["aria-invalid"], true);
  field("application-date").props.onInput({ currentTarget: { validity: { badInput: false } } });
  assert.equal(field("application-date").props["aria-invalid"], false);
  renderForm().props.onSubmit({ preventDefault() {} });
  assert.equal(onAdd.mock.callCount(), 1);
  assert.equal(loadApplications().applications[0].dateApplied, "");
});
