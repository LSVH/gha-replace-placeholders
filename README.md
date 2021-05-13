# Replace Placeholders Action

Find and replace placeholders across files in the repository 

## Inputs

### `include`

The file(s) where in the placeholders should be replaced. Default: All files (`.*`).

- A file name can also be a [glob pattern](https://www.npmjs.com/package/replace-in-files).
- Multiple file names can be listed, by adding one per line:
  ```
  include: |
    file1.txt
    file2.txt
  ```

### `exclude`

The opposite of `include`, file(s) which should be ignored when replacing.

### `placeholders`

**Required**: A key-value list of placeholders.

Use key-value pairs separated by `=`, the key can be a string or regex:
```
placeholders: |
  MY_PLACEHOLDER=foo
  %%HELLO%%=World
  /^.*\/\/.*/g=
```

# Outputs

## `changed-files`

A list of files what where changed during the replace operation.

## Example usage

```
- uses: LSVH/gha-replace-placeholders@v1
  with:
    placeholders: |
      %%REPOSITORY_OWNER%%=${{github.repository_owner}}
      [REPOSITORY]=${{github.repository}}
```
