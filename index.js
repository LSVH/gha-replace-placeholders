const core = require("@actions/core");
const replace = require("replace-in-file");

if (require.main === module) {
  run();
}

async function run(inject = {}) {
  try {
    const getInput = inject.getInput || core.getInput;
    const setOutput = inject.setOutput || core.setOutput;

    const include = split(getInput("include"));
    const exclude = split(getInput("exclude"));
    const placeholders = split(getInput("placeholders"));

    for (const placeholder of placeholders) {
      const key = maybeRegExp(
        unescapeEquals(placeholder.replace(/([^\\])\=.*/, "$1"))
      );
      const val = unescapeEquals(placeholder.replace(/(.*[^\\])\=/, ""));

      const options = {
        from: key,
        to: val,
        files: include,
        ignore: exclude,
      };

      const { paths } = await replace(options);

      setOutput("changed-files", paths);
    }
  } catch (error) {
    const setFailed = inject.setFailed || core.setFailed;
    setFailed(error.message);
  }
}

function maybeRegExp(str) {
  const flags = str.replace(/.*\/(?!.*(.).*\1)([gimy]*)$/, "$2");
  const pattern = str.replace(new RegExp("^\/(.*)\/" + flags + "$"), "$1");

  return flags !== str && pattern !== str ? new RegExp(pattern, flags) : str;
}

function split(str) {
  return str != null ? str.split("\n").filter(Boolean) : [];
}

function unescapeEquals(str) {
  return str.replace(/\\=/g, "=");
}

module.exports = { run };
