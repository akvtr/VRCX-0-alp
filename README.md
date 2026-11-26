# VRCX-0-alp

A personal fork of [VRCX-0](https://github.com/Map1en/VRCX-0) that runs as a
separate app beside the official one and adds a few extra features.

This README only covers what is different in VRCX-0-alp. For everything else
(features, screenshots, the dev blog, the architecture) see the
[upstream README](https://github.com/Map1en/VRCX-0#readme) and
[ARCHITECTURE.md](ARCHITECTURE.md).

> [!NOTE]
> VRCX-0-alp is not affiliated with or supported by the VRCX-0 project.
> Please do not report VRCX-0-alp problems to the upstream Discord or issue
> tracker.

## What's different

### Runs as its own app

VRCX-0-alp can run at the same time as the official VRCX-0 without the two
interfering with each other.

|                       | VRCX-0                          | VRCX-0-alp             |
| --------------------- | ------------------------------- | ---------------------- |
| App identifier        | `com.vrcx-0.app`                | `com.vrcx-0-alp.app`   |
| Data folder (Windows) | `%AppData%\VRCX-0`              | `%AppData%\VRCX-0-alp` |
| Deep links            | `vrcx-0://`                     | `vrcx-0-alp://`        |
| Single-instance guard | shared with other VRCX-0 builds | its own                |
| Update check          | official releases               | disabled               |
| Anonymous usage data  | on by default                   | never sent             |

### Data on first launch

On its first launch VRCX-0-alp fills its data folder in this order:

1. **VRCX-0**: copies the official profile (database, settings and caches that
   live next to the database), following the official app's data-folder
   pointer if you moved it. Image and screenshot caches are not copied.
2. **VRCX**: if there is no VRCX-0 profile, the usual VRCX-0 import of a legacy
   VRCX database is offered.
3. Otherwise it starts empty.

This happens once. After that, VRCX-0-alp and the official app keep separate
records. Implementation: `crates/platform/src/alp_seed.rs`.

### No updates or installer

There is no installer. VRCX-0-alp is run from source (see below) or from an
unsigned executable on the
[Releases](https://github.com/akvtr/VRCX-0-alp/releases) page. The built-in
update check is turned off so it never offers to replace itself with the
official VRCX-0; download a newer release by hand.

### ALP Modules

Extra features live under **ALP Modules** in the sidebar. They are kept in
`src/alp/` and hook into the upstream code at only two places
(`src/app/routes.tsx` and `src/shared/constants/ui.ts`), which keeps upstream
merges simple.

#### Instance Hopper

Find the busy public instances of a world and send yourself invites to them.

- Enter a world ID or a vrchat.com world URL and press Enter, or pick one of
  the world templates.
- Lists the world's public instances with at least the chosen number of
  players, busiest first.
- **Invite me to all** sends a self-invite to every listed instance, one every
  5 seconds, and stops after one pass.
- Each row shows when you last joined that instance (from your local Game Log),
  e.g. `3h 12m ago` or `4d ago`.

VRChat only lists public instances, so Friends+, Invite and Group instances
never appear.

## Running from source

### Requirements (Windows)

- Node.js ≥ 24.10 and npm ≥ 11.5
- A stable Rust toolchain installed with [rustup](https://rustup.rs/)
- Visual Studio Build Tools with the **Desktop development with C++** workload
- LLVM, for the `lld-link` linker that the repository's `.cargo/config.toml`
  selects:

    ```powershell
    winget install LLVM.LLVM
    ```

- CMake. The copy bundled with Visual Studio Build Tools is enough.

Add both of these to your user `PATH`, then open a new terminal:

```text
C:\Program Files\LLVM\bin
C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin
```

Check that they are found:

```powershell
lld-link --version
cmake --version
```

### Start the app

```powershell
git clone https://github.com/akvtr/VRCX-0-alp
cd VRCX-0-alp
npm install
npm run tauri:dev
```

The first build compiles the whole Rust workspace and takes a while; later
runs are much faster. Frontend changes reload without a restart.

To stop it, press `Ctrl+C` in the terminal. Closing the window may only hide
it in the tray; use the tray icon's quit option in that case.

### Build an executable

```powershell
npm run tauri:build -- --no-sign --no-bundle
```

The executable is written to `target\release\VRCX-0-alp.exe`.

### Before the first launch

- **Close the official VRCX-0** so its database is not copied mid-write.
  Afterwards both apps can run together.
- **Local servers share ports.** The copied settings keep the MCP server
  (`8798`) and the Integration API (`8799`) as they were. If they are enabled
  in both apps, turn them off or change the port in one of them.
- **VR overlay**: use it in one app at a time.

## Keeping up with upstream

```powershell
git remote add upstream https://github.com/Map1en/VRCX-0.git  # once
git fetch upstream
git merge upstream/master
```

Conflicts are usually limited to the app-identity changes listed above and the
two ALP Modules hook points.

## Privacy

VRCX-0-alp sends no anonymous usage data. Upstream VRCX-0 reports usage to
help its development (see the
[Privacy section of the upstream README](https://github.com/Map1en/VRCX-0#privacy)),
but numbers from a modified build would only blur that data, so the reporting
endpoint is left empty at build time (`VRCX_0_TELEMETRY_ENDPOINT` in
`.cargo/config.toml`). The setting under **Settings → Advanced** is still
shown but has no effect.

Features that talk to VRCX-0 web services on request, such as community themes
and shared world collections, work as they do upstream.

## License

VRCX-0-alp, like VRCX-0, is licensed under the GNU General Public License v3.0
(GPLv3). See [LICENSE](LICENSE) and [NOTICE](NOTICE). Portions that originate
from VRCX are licensed under the MIT License; see
[LICENSES/MIT.txt](LICENSES/MIT.txt).

VRCX-0-alp is not endorsed by VRChat Inc. VRChat and all associated properties
are trademarks or registered trademarks of VRChat Inc.
