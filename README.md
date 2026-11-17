# KudaDocks website

The official website for KudaDocks: a free dock that replaces the Windows 11 taskbar.

It's plain HTML, CSS and JavaScript with no build step, no frameworks and no third-party code, so it runs
on GitHub Pages for free. To preview it, double-click `index.html`.

Everything you'll need to change lives in **one file: `js/config.js`**.

---

## Contents

1. [Before you publish](#1-before-you-publish)
2. [Put the website online with GitHub Pages](#2-put-the-website-online-with-github-pages)
3. [Set up the free download with GitHub Releases](#3-set-up-the-free-download-with-github-releases)
4. [Releasing an update](#4-releasing-an-update)
5. [The "Windows protected your PC" warning and code signing](#5-the-windows-protected-your-pc-warning-and-code-signing)
6. [Optional: your own domain name](#6-optional-your-own-domain-name)
7. [Legal checklist](#7-legal-checklist)
8. [What each file does](#8-what-each-file-does)

---

## 1. Before you publish

This site is set up for the GitHub account **imPrinceKuda** and a repository named **`kudadocks`**, so the
website will be at `https://imprincekuda.github.io/kudadocks/`. Create the repository with exactly that
name, or change the values below to match.

These details are already filled in. If you change any of them later, change them everywhere in this table.
While anything is missing, a yellow note at the top of the website lists it.

| File | Value | Currently |
|---|---|---|
| `website/js/config.js` | `githubUser`, `githubRepo` | `imPrinceKuda`, `kudadocks` |
| `website/js/config.js` | `owner`: the public name on the legal pages | `Kuda` (a public name, not a legal name) |
| `website/js/config.js` | `email`: the public contact address | `contact@kudaxd.com` |
| `website/js/config.js` | `jurisdiction`: whose laws apply | `the State of California, United States` |
| `KudaDocks/EULA.txt` | the same owner, jurisdiction and email | filled in |
| `KudaDocks/AppInfo.cs` | `Website` | `https://imprincekuda.github.io/kudadocks/` |
| `website/index.html` | `og:url` and `og:image` near the top | the same website address |
| `KudaDocks/KudaDocks.csproj`, `Installer/KudaDocksSetup.csproj` | `Copyright` (shown in each exe's Properties) | `Copyright © 2026 Kuda` |

The email address appears publicly on the legal pages and in the License Agreement.

`AppInfo.Website` matters for more than looks. The weather service (MET Norway) requires every app to
identify itself with a contact website, and KudaDocks sends this address with its weather requests.

Then **build the final installer** from the project folder (the one containing `Build-Installer.ps1`):

```powershell
powershell -ExecutionPolicy Bypass -File .\Build-Installer.ps1
```

It refuses to build while any placeholder is still unfilled, so you can't publish a half-finished license
by accident. The result is `dist\KudaDocks-Setup.exe`.

Finally, record the installer's fingerprint and size in `js/config.js`:

```powershell
Get-FileHash .\dist\KudaDocks-Setup.exe        # copy the Hash value into  sha256
(Get-Item .\dist\KudaDocks-Setup.exe).Length / 1MB   # round it into  sizeMB
```

---

## 2. Put the website online with GitHub Pages

GitHub Pages is free for public repositories.

1. Sign in at [github.com](https://github.com) (create a free account if you don't have one).
2. Select **+** (top right), then **New repository**.
   - Name: `kudadocks`
   - Visibility: **Public** (free GitHub Pages needs a public repository)
   - Select **Create repository**.
3. On the new repository's page, select **uploading an existing file**.
4. Open the `website` folder on your PC, select **everything inside it** (`index.html`, the `css`, `js` and
   `assets` folders, and the other files), and drag it all into the browser. `index.html` must end up at
   the top level of the repository, not inside a `website` folder.
   - The file `.nojekyll` is hidden by default in File Explorer. Turn on **View > Show > Hidden items** so
     you upload it too; it tells GitHub to serve the files exactly as they are.
5. Select **Commit changes**.
6. Open the repository's **Settings**, then **Pages** (left side). Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**, folder **/ (root)**, then **Save**.
7. After a minute or two, your site is live at `https://imprincekuda.github.io/kudadocks/`. The address
   also appears at the top of the Pages settings.

To change the site later, edit or re-upload files in the repository. GitHub republishes it automatically.

> **Keep the app's source code private.** This repository is public, so put only the website in it. Keep
> the `KudaDocks` source code on your PC, or in a separate **private** repository. The installer you attach
> to a release (next step) is the only part of the app that needs to be public.

---

## 3. Set up the free download with GitHub Releases

GitHub hosts release files for free, with no bandwidth charges, and each file can be up to 2 GB.

1. In your `kudadocks` repository, select **Releases** (right side of the main page), then
   **Create a new release** (or **Draft a new release**).
2. Select **Choose a tag**, type `v1.0.0`, and select **Create new tag**.
3. Title: `KudaDocks 1.0.0`. In the description, write a few lines about what's in this version.
4. Drag `dist\KudaDocks-Setup.exe` into the **Attach binaries** box at the bottom and wait for the upload
   to finish.
5. Select **Publish release**.

That's it. Every **Free download** button on the site points to:

```
https://github.com/imPrinceKuda/kudadocks/releases/latest/download/KudaDocks-Setup.exe
```

GitHub always serves that address from your **newest** release, so the website never needs a new link. That
only works if the file is named **exactly** `KudaDocks-Setup.exe` in every release.

Test it: open your live site, select **Free download**, and check the file downloads.

**Don't commit the installer into the repository itself.** GitHub rejects files over 100 MB in a
repository (the installer is about 131 MB). Releases are the right place for it.

---

## 4. Releasing an update

1. In `KudaDocks/KudaDocks.csproj`, raise the version in `<Version>`, `<FileVersion>` and
   `<InformationalVersion>` (for example `1.0.1`).
2. Build: `powershell -ExecutionPolicy Bypass -File .\Build-Installer.ps1`
3. Create a new release with tag `v1.0.1` and attach the new `dist\KudaDocks-Setup.exe`, with the same file
   name as before.
4. In `website/js/config.js`, update `version`, `released`, `sizeMB` and `sha256`, then upload the changed
   file to the repository.

People update by downloading and running the new installer. It closes the running copy, replaces the app and
keeps their settings, which are stored separately in `%AppData%\KudaDocks`.

---

## 5. The "Windows protected your PC" warning and code signing

Windows SmartScreen warns about downloaded programs it hasn't seen before, especially ones without a digital
signature. The download section of the site already tells visitors what to do (**More info**, then
**Run anyway**) and how to check the file's fingerprint.

To make the warning go away for good, sign the installer with a code-signing certificate. Your options,
roughly from cheapest:

- **Do nothing.** Free, but unsigned files struggle to build a good reputation with Windows, and each new
  build starts over.
- **Microsoft's signing service** (Trusted Signing, part of Azure). A low monthly fee after an identity
  check. Check Microsoft's site for current pricing and which countries and individuals qualify.
- **A certificate from a certificate authority** (such as Sectigo, DigiCert or SSL.com). Usually a yearly
  fee, and the certificate is kept on a hardware token or cloud key store.
- **SignPath Foundation**: free, but only for open-source projects.

`Build-Installer.ps1` can already sign with a `.pfx` certificate. Set two environment variables before
building:

```powershell
$env:KUDADOCKS_CERT = "C:\path\to\certificate.pfx"
$env:KUDADOCKS_CERT_PASSWORD = "the certificate password"
powershell -ExecutionPolicy Bypass -File .\Build-Installer.ps1
```

(Signing services that keep the key in the cloud use their own signing tool; follow their instructions and
sign `dist\KudaDocks-Setup.exe` after the build.)

If Microsoft Defender or another antivirus ever flags the installer by mistake, submit the file for review
at [microsoft.com/wdsi/filesubmission](https://www.microsoft.com/wdsi/filesubmission) (and the equivalent
page of any other antivirus that complains).

---

## 6. Optional: your own domain name

If you own a domain (for example `kudadocks.com`):

1. In the repository, go to **Settings > Pages > Custom domain**, enter the domain, and select **Save**.
2. At your domain provider, add the DNS records GitHub shows you, as described in
   [GitHub's custom domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site).
3. Once it works, turn on **Enforce HTTPS** in the same settings page.
4. Update `KudaDocks/AppInfo.cs` (`Website`) and the `og:image` address in `index.html` to the new domain.
   Downloads keep coming from GitHub, so `js/config.js` doesn't need to change.

---

## 7. Legal checklist

The site already includes a Privacy Policy, Terms of Use, License Agreement (EULA), and a Notices and credits
page covering trademarks, open-source licenses, data credits and accessibility. The installer shows the
License Agreement, and the app installs its license texts and the open-source notices next to itself.

These are solid starting documents written for a free app that collects no data, but they are not legal
advice. If you start charging money, add accounts or collect any data, have a lawyer review them.

Keep these in mind:

- **Keep the Privacy Policy true.** If you add analytics to the site, crash reporting, automatic update
  checks, sign-ins, or anything else that sends data, update `privacy.html` first. Analytics or cookies on the
  website may also require a cookie banner for visitors in the EU and UK.
- **The Discord voice widget** connects through the app ID that Discord uses for its own StreamKit overlay,
  not an app ID of your own. That may break Discord's Developer Terms of Service. Before a wide public
  release, consider removing that widget from the public build, or applying to Discord for proper access
  under your own app. The Privacy Policy describes the widget accurately in the meantime.
- **Other companies' names and logos.** The demo docks show real app icons (File Explorer, Chrome, Discord,
  Spotify, Telegram, Teams, Photoshop, Premiere Pro, After Effects, Steam, OBS), taken from those apps as
  Windows displays them and stored in `assets/apps/`. Showing them to demonstrate how a dock displays installed
  apps is a common, low-risk use, and the site carries a trademark notice and a no-endorsement line. It is
  still a risk you're choosing: some companies' brand rules (Adobe's in particular) say not to use their
  product icons in another product's marketing without permission. If any company asks you to remove its
  icon, delete its file from `assets/apps/` and its name from `js/site.js` straight away. Never alter the
  icons, put them in the KudaDocks logo, or suggest a partnership. If you add real screenshots or videos of
  your desktop, also hide personal information such as names, chats and notifications.
- **Don't copy other products' websites.** Keep the wording and visuals original, including when a
  competitor offers similar features.
- **Free data services.** Open-Meteo's free tier is for non-commercial use. If KudaDocks ever earns money
  (sales, ads, sponsorships inside the app), check whether you need their commercial plan. The app credits
  each data source as their terms require.
- **Contact address.** Make sure the email in `config.js` is one you check. The legal pages tell people to
  use it for privacy questions and copyright or trademark concerns.

### Keeping your real name private

The site, the License Agreement, the installer and the app use only the name **Kuda** (and the GitHub handle
**imPrinceKuda** in download links) and the
contact address. A few places outside these files can still show your legal name, so check them:

- **Your GitHub profile.** The **Name** field on your profile appears next to every file you upload. Leave
  it blank or set it to your handle (github.com > your picture > **Settings** > **Public profile**).
- **Your commit email.** In **Settings** > **Emails**, turn on **Keep my email addresses private** so uploads
  use a hidden GitHub address instead of your personal one.
- **Code-signing certificates.** A certificate issued to an individual shows that person's **legal name** in
  the installer's signature, where anyone can see it. To sign under a brand instead, the certificate has to
  be issued to a registered business (for example an LLC or a registered business name).
- **A custom domain.** Turn on WHOIS privacy at the domain provider so your name and address aren't listed.
- **Legal requests.** A handle is fine for a free app's legal pages, but if someone takes legal action, a
  court can still require GitHub or your email provider to reveal who you are. If anonymity matters a lot,
  or you start earning money from KudaDocks, consider forming an LLC and publishing under its name.

---

## 8. What each file does

| File | Purpose |
|---|---|
| `index.html` | Home page with the three interactive demos |
| `privacy.html`, `terms.html`, `eula.html`, `notices.html` | Legal pages |
| `404.html` | Shown for broken links (self-contained on purpose) |
| `js/config.js` | **Your settings:** download link, version, contact details |
| `js/dock.js` | The interactive dock used by every demo |
| `js/site.js` | Fills in values from `config.js` and sets up the demos |
| `css/site.css` | All styles |
| `assets/` | Logo and the image shown when the site is shared |
| `assets/apps/` | The app icons in the demo docks (one PNG per app; `js/dock.js` lists them and `js/site.js` picks which appear where) |
| `favicon.ico` | Browser tab icon |
| `.nojekyll` | Tells GitHub Pages to serve files exactly as they are |
| `robots.txt` | Lets search engines index the site |

The site uses no cookies, analytics, web fonts or outside scripts. A security policy in each page blocks
anything except its own files. If you ever add an outside service, update that policy (the
`Content-Security-Policy` line near the top of each page) and the Privacy Policy.
