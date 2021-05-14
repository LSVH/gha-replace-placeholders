const fs = require("fs").promises;
const fse = require("fs-extra");
const { run } = require("./");

const input = "./input/";
const output = "./output/";

let inputs = {};
let outputs = {};
const injections = {
  getInput: jest.fn((k) => getInput(k)),
  setOutput: jest.fn((k, v) => (outputs[k] = v)),
  setFailed: jest.fn((err) => console.error(err)),
};

function getInput(k) {
  return ["include", "exclude"].includes(k)
    ? getInputPrefixPaths(k)
    : inputs[k];
}

function getInputPrefixPaths(k) {
  return inputs[k] != null
    ? inputs[k]
        .split("\n")
        .map((f) => output + f)
        .join("\n")
    : "";
}

function reset(defaultInputs = {}, defaultOutputs = {}) {
  inputs = defaultInputs;
  outputs = defaultOutputs;
}

async function copyFiles() {
  await fse.copy(input, output);
}

async function replaceFiles() {
  await copyFiles();
  return run(injections);
}

async function readFile(path) {
  const encoding = "utf8";

  return {
    input: await fs.readFile(input + path, encoding),
    output: await fs.readFile(output + path, encoding),
  };
}

describe("run()", () => {
  describe("replacing one placeholder", () => {
    const expected = "bye world";
    const placeholders = "hello=bye"
    const localReset = () => reset({ placeholders });

    test("in a single file", async () => {
      localReset();
      inputs.include = "foo.txt";
      await replaceFiles();
      const rf = await readFile(inputs.include);

      expect(rf.input).not.toBe(rf.output);
      expect(rf.output).toBe(expected);
    });

    describe("in multiple files", () => {
      const files = ["foo.txt", "bar.txt", "foo/bar.txt"];
      const include = files.join("\n");
      beforeAll(() => {
        localReset();
        inputs.include = include;
        return replaceFiles();
      });

      test.each(files)("in %s", async (file) => {
        const rf = await readFile(file);
        expect(rf.input).not.toBe(rf.output);
        expect(rf.output).toBe(expected);
      });
    });
  });

  describe("replacing multiple placeholder", () => {
    const expected = "foo bar";
    const placeholders = "hello=foo\nworld=bar"
    const localReset = () => reset({ placeholders });

    test("in a single file", async () => {
      localReset();
      inputs.include = "foo.txt";
      await replaceFiles();
      const rf = await readFile(inputs.include);

      expect(rf.input).not.toBe(rf.output);
      expect(rf.output).toBe(expected);
    });

    describe("in multiple files", () => {
      const files = ["foo.txt", "bar.txt", "foo/bar.txt"];
      const include = files.join("\n");
      beforeAll(() => {
        localReset();
        inputs.include = include;
        return replaceFiles();
      });

      test.each(files)("in %s", async (file) => {
        const rf = await readFile(file);
        expect(rf.input).not.toBe(rf.output);
        expect(rf.output).toBe(expected);
      });
    });
  });
});
