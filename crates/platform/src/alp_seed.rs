//! First-run data seeding for VRCX-0-alp.
//!
//! VRCX-0-alp keeps its own data directory so it can run beside the official
//! VRCX-0. On the first launch it copies the official profile so sign-in,
//! settings and Game Log history carry over; after that the two diverge.

use std::path::{Path, PathBuf};

use crate::app_paths::{read_persisted_app_data_dir_from_default, PROFILE_DB_FILE};
use crate::error::Error;

const OFFICIAL_APP_DIR_NAME: &str = "VRCX-0";
const COPY_SUFFIX: &str = "alp-seed.tmp";

/// Runtime and diagnostic files that belong to the running official app,
/// not to the profile.
const SKIPPED_FILES: &[&str] = &[
    "runtime.lock",
    "error-log.txt",
    "VRCX-0.data-dir.json",
    ".vrcx-0-write-test",
];

pub fn official_app_data_dir() -> Result<PathBuf, Error> {
    let official_default = dirs::config_dir()
        .ok_or_else(|| Error::Custom("cannot resolve AppData".into()))?
        .join(OFFICIAL_APP_DIR_NAME);
    // Follow the official app's data-dir pointer if the user moved its data.
    Ok(read_persisted_app_data_dir_from_default(&official_default)
        .ok()
        .flatten()
        .unwrap_or(official_default))
}

/// Copies the official profile files into `target_dir` when it has no
/// profile database yet. Returns whether anything was copied.
pub fn seed_from_official(source_dir: &Path, target_dir: &Path) -> Result<bool, Error> {
    if target_dir.join(PROFILE_DB_FILE).exists() || !source_dir.join(PROFILE_DB_FILE).exists() {
        return Ok(false);
    }
    std::fs::create_dir_all(target_dir)?;

    let mut files = Vec::new();
    for entry in std::fs::read_dir(source_dir)? {
        let entry = entry?;
        let name = entry.file_name();
        let skipped = name
            .to_str()
            .is_some_and(|name| SKIPPED_FILES.contains(&name));
        if entry.file_type()?.is_file() && !skipped {
            files.push(name);
        }
    }
    // The profile database goes last: its presence marks a finished seed, so
    // an interrupted copy is simply retried on the next launch.
    files.sort_by_key(|name| name == PROFILE_DB_FILE);

    for name in files {
        let destination = target_dir.join(&name);
        let mut temporary_name = name.clone();
        temporary_name.push(".");
        temporary_name.push(COPY_SUFFIX);
        let temporary = target_dir.join(temporary_name);
        std::fs::copy(source_dir.join(&name), &temporary)?;
        std::fs::rename(&temporary, &destination)?;
    }
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn temp_dir(name: &str) -> PathBuf {
        let path = std::env::temp_dir().join(format!(
            "vrcx-0-alp-seed-{name}-{}-{}",
            std::process::id(),
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        std::fs::create_dir_all(&path).unwrap();
        path
    }

    #[test]
    fn copies_profile_files_and_skips_runtime_files_and_folders() {
        let source = temp_dir("source");
        let target = temp_dir("target").join("VRCX-0-alp");
        std::fs::write(source.join(PROFILE_DB_FILE), b"db").unwrap();
        std::fs::write(source.join("VRCX-0.json"), b"{}").unwrap();
        std::fs::write(source.join("runtime.lock"), b"1").unwrap();
        std::fs::create_dir_all(source.join("ImageCache")).unwrap();

        assert!(seed_from_official(&source, &target).unwrap());

        assert_eq!(std::fs::read(target.join(PROFILE_DB_FILE)).unwrap(), b"db");
        assert!(target.join("VRCX-0.json").exists());
        assert!(!target.join("runtime.lock").exists());
        assert!(!target.join("ImageCache").exists());
    }

    #[test]
    fn leaves_an_existing_profile_untouched() {
        let source = temp_dir("source-existing");
        let target = temp_dir("target-existing");
        std::fs::write(source.join(PROFILE_DB_FILE), b"official").unwrap();
        std::fs::write(target.join(PROFILE_DB_FILE), b"alp").unwrap();

        assert!(!seed_from_official(&source, &target).unwrap());
        assert_eq!(std::fs::read(target.join(PROFILE_DB_FILE)).unwrap(), b"alp");
    }

    #[test]
    fn does_nothing_without_an_official_profile() {
        let source = temp_dir("source-empty");
        let target = temp_dir("target-empty");

        assert!(!seed_from_official(&source, &target).unwrap());
        assert!(!target.join(PROFILE_DB_FILE).exists());
    }
}
