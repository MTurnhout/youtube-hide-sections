# Youtube Hide Sections

Hide sections that perhaps do not serve your watching preference like breaking/top news or shorts.

## Usage

- Click **(Hide)** next to a section title on the YouTube home page to hide that section.
- Manage the hidden sections on the add-on's options page (`about:addons` → Youtube Hide Sections → Options).
  Titles added there must match the section title on YouTube exactly.

## Development

Requires [Node.js](https://nodejs.org/) 22 or newer.

```bash
npm ci
```

```bash
npm start
```

`npm start` opens Firefox with the extension loaded and reloads it when files in `src/` change.

- `npm run lint` validates the extension with the same checks addons.mozilla.org runs on upload.
- `npm run build` creates `dist/youtube-hide-sections-<version>.zip`.

## Releasing

1. Bump `version` in `src/manifest.json` and commit it.
2. Tag the commit with that version and push the tag:
   ```bash
   git tag v1.1
   ```
   ```bash
   git push origin v1.1
   ```
3. The build workflow lints the extension, checks that the tag matches the manifest version and creates a GitHub
   release with `youtube-hide-sections-<version>.zip` attached.
4. Upload that zip as-is on the [Developer Hub](https://addons.mozilla.org/developers/addon/youtube-hide-sections/versions/submit/).

## Links

[Firefox add-ons](https://addons.mozilla.org/en-US/firefox/addon/youtube-hide-sections/)
