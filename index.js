const core = require("@actions/core");
const replaceInFiles = require("replace-in-files");

if (require.main === module) {
  run();
}

async function run(callback = {}) {
  try {
    const getInput = callback.getInput ?? core.getInput;
    const setOutput = callback.setOutput ?? core.setOutput;

    const include = getInput("include").split("\n");
    const exclude = getInput("exclude").split("\n");
    const placeholders = getInput("placeholders").split("\n");

    placeholders.forEach((placeholder) => {
      const key = placeholder.replace(/([^\\])\=.*/, "$1").replace(/\\=/g, "=");
      const val = placeholder.replace(/(.*[^\\])\=/, "").replace(/\\=/g, "=");

      const options = {
        from: isRegEx(key) ? new RegExp(key) : key,
        to: val,
        files: include,
        optionsForFiles: {
          ignore: exclude,
        },
      };

      const { changedFiles } = await replaceInFiles(options);

      setOutput("changed-files", changedFiles);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function isRegEx(str) {
  let isValid = true;
  try {
    new RegExp(str);
  } catch (e) {
    isValid = false;
  }

  return isValid;
}

module.exports = { run };
