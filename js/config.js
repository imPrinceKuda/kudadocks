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
  sha256: "6D06D583A4DC51E2EDF84490F2CB38381E5336CFC8B8D0F62AE6A1890EBFA0AF",

  // ---- Shown on the legal pages (a public handle, not a legal name)
  // Also the name in KudaDocks/EULA.txt and the Copyright line of both .csproj files; keep them all the same.
  owner: "Kuda",
  email: "contact@kudaxd.com",
  jurisdiction: "the State of California, United States",
  legalUpdated: "November 16, 2026",
};
