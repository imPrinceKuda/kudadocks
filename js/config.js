/*
  KudaDocks website settings — the only file you need to edit.
  Every page reads these values: the download buttons, version details and the legal pages.
  See README.md for the full setup guide.
*/
window.KUDADOCKS = {
  // ---- Your GitHub account and repository (where the website and the downloads live)
  githubUser: "imPrinceKuda",
  githubRepo: "kudadocks",
  // The installer's file name, exactly as uploaded to the GitHub release. Keep it the same for every release.
  assetName: "KudaDocks-Setup.exe",

  // ---- Current release (update these each time you publish a new version)
  version: "1.0.0",
  released: "November 16, 2026",
  sizeMB: 131,
  // SHA-256 of KudaDocks-Setup.exe. Get it in PowerShell with:  Get-FileHash .\dist\KudaDocks-Setup.exe
  sha256: "F8399672BF3EF0BC933B79CF1246406A491E71CF03ACC3638A1BA5FC0E6E5677",

  // ---- Shown on the legal pages (a public handle, not a legal name)
  owner: "imPrinceKuda",
  email: "contact@kudaxd.com",
  jurisdiction: "the State of California, United States",
  legalUpdated: "November 16, 2026",
};
