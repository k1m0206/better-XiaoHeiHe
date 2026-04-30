# Firefox MV2 Adaptation Guide

## Manifest Differences

The transition from Manifest V2 (MV2) to Manifest V3 (MV3) in Firefox brings various changes, particularly in how extensions declare their capabilities and permissions. Key differences include:
- **Background scripts:** MV3 uses service workers instead of persistent background pages.
- **Permissions:** There are stricter rules around certain permissions, requiring explicit user authorization.
- **Host permissions:** Declaring host permissions must now be explicitly done at runtime.

Refer to the [Firefox documentation](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json) for a comprehensive list.

## Local Debugging Steps

To debug your extension locally in Firefox:
1. Open Firefox and navigate to `about:debugging`
2. Select "This Firefox" or "This Nightly" depending on your version.
3. Click `Load Temporary Add-on...` and select your extension's manifest file.
4. Use `Ctrl + Shift + I` to open the Developer Tools and inspect your extension as needed.

## Packaging Instructions

When packaging your extension for release:
1. Ensure that all files are included in the manifest.
2. Use the `web-ext` tool to package your extension:
   ```bash
   web-ext build
   ```
3. This will generate a `.zip` file containing your extension that can be submitted to the Firefox Add-ons site.

## Common Q&A
- **Q: What is the primary difference between MV2 and MV3?**  
  A: MV3 introduces service workers as a replacement for background scripts, enhancing performance and privacy.
- **Q: Can I use all the APIs available in MV2?**  
  A: Not all MV2 APIs are available in MV3; some may require alternatives or have been deprecated.

## Code Checklist
- [ ] Ensure all APIs used are compatible with MV3.
- [ ] Update the manifest file to reflect MV3 changes.
- [ ] Test all functionalities in the latest version of Firefox.
- [ ] Validate permissions and hosts are correctly declared.

For more detailed guides, consult the [Mozilla Developer Network](https://developer.mozilla.org/).