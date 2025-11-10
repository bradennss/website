use std::fs;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("io error: {0}")]
    Io(std::io::Error),
    #[error("version error: {0}")]
    Version(String),
    #[error("semver error: {0}")]
    Semver(semver::Error),
    #[error("serde error: {0}")]
    Serde(serde_json::Error),
    #[error("toml error: {0}")]
    Toml(toml::de::Error),
}

/// Specifies which file should be the authoritative source for version numbers.
#[derive(Clone, Debug, PartialEq)]
pub enum SourceOfTruth {
    /// Use Cargo.toml version
    CargoToml,
    /// Use package.json version
    PackageJson,
}

/// Result of syncing version numbers between Cargo.toml and package.json files.
#[derive(Clone, Debug)]
pub enum SyncContentsResult {
    /// No changes needed - versions already in sync
    NoChanges,
    /// Cargo.toml was updated
    UpdatedCargoToml(String),
    /// package.json was updated
    UpdatedPackageJson(String),
}

fn patch_cargo_toml_version(
    cargo_toml_contents: &str,
    old_version: &str,
    new_version: &str,
) -> String {
    cargo_toml_contents.replace(
        format!("version = \"{}\"", old_version).as_str(),
        format!("version = \"{}\"", new_version).as_str(),
    )
}

fn patch_package_json_version(
    package_json_contents: &str,
    old_version: &str,
    new_version: &str,
) -> String {
    package_json_contents.replace(
        format!("\"version\": \"{}\"", old_version).as_str(),
        format!("\"version\": \"{}\"", new_version).as_str(),
    )
}

/// Syncs version numbers between Cargo.toml and package.json files.
///
/// Compares versions and updates the older one to match the newer. Supports semantic
/// versioning, pre-release versions, and build metadata.
///
/// # Parameters
///
/// * `cargo_toml_contents` - Raw Cargo.toml file contents
/// * `package_json_contents` - Raw package.json file contents  
/// * `source_of_truth` - Force which file's version to use (None = use newer version)
///
/// # Returns
///
/// * `NoChanges` - Versions already in sync
/// * `UpdatedCargoToml(String)` - Cargo.toml was updated
/// * `UpdatedPackageJson(String)` - package.json was updated
///
/// # Errors
///
/// * `Error::Serde` - Invalid JSON in package.json
/// * `Error::Toml` - Invalid TOML in Cargo.toml
/// * `Error::Version` - Missing or malformed version fields
/// * `Error::Semver` - Invalid semantic version strings
///
/// # Examples
///
/// ## Basic usage - let the function decide which version is newer
/// ```rust
/// use package_version_sync::{sync_contents, SourceOfTruth, SyncContentsResult};
///
/// let cargo_toml = r#"[package]
/// name = "my-app"
/// version = "1.0.0"
/// edition = "2021"
/// "#;
///
/// let package_json = r#"{
///   "name": "my-app",
///   "version": "1.1.0"
/// }"#;
///
/// let result = sync_contents(cargo_toml, package_json, None)?;
/// match result {
///     SyncContentsResult::UpdatedCargoToml(contents) => {
///         // Cargo.toml was updated to version "1.1.0"
///         println!("Updated Cargo.toml: {}", contents);
///     }
///     _ => {}
/// }
/// # Ok::<(), package_version_sync::Error>(())
/// ```
///
/// ## Force package.json to be the source of truth
/// ```rust
/// use package_version_sync::{sync_contents, SourceOfTruth, SyncContentsResult};
///
/// let cargo_toml = r#"[package]
/// name = "my-app"
/// version = "2.0.0"
/// edition = "2021"
/// "#;
///
/// let package_json = r#"{
///   "name": "my-app",
///   "version": "1.0.0"
/// }"#;
///
/// let result = sync_contents(cargo_toml, package_json, Some(SourceOfTruth::PackageJson))?;
/// match result {
///     SyncContentsResult::UpdatedCargoToml(contents) => {
///         // Cargo.toml was updated to version "1.0.0"
///         println!("Updated Cargo.toml: {}", contents);
///     }
///     _ => {}
/// }
/// # Ok::<(), package_version_sync::Error>(())
/// ```
///
/// ## Handle pre-release versions
/// ```rust
/// use package_version_sync::{sync_contents, SyncContentsResult};
///
/// let cargo_toml = r#"[package]
/// name = "my-app"
/// version = "1.0.0-alpha.1"
/// edition = "2021"
/// "#;
///
/// let package_json = r#"{
///   "name": "my-app",
///   "version": "1.0.0"
/// }"#;
///
/// let result = sync_contents(cargo_toml, package_json, None)?;
/// match result {
///     SyncContentsResult::UpdatedCargoToml(contents) => {
///         // Pre-release version is considered older, so cargo.toml gets updated to "1.0.0"
///         println!("Updated Cargo.toml: {}", contents);
///     }
///     _ => {}
/// }
/// # Ok::<(), package_version_sync::Error>(())
/// ```
///
/// ## Error handling
/// ```rust
/// use package_version_sync::{sync_contents, SyncContentsResult};
///
/// let cargo_toml = r#"[package]
/// name = "my-app"
/// version = "1.0.0"
/// edition = "2021"
/// "#;
///
/// let package_json = r#"{
///   "name": "my-app"
///   // Missing version field
/// }"#;
///
/// match sync_contents(cargo_toml, package_json, None) {
///     Ok(SyncContentsResult::NoChanges) => println!("Versions already synchronized"),
///     Ok(SyncContentsResult::UpdatedCargoToml(_)) => println!("Cargo.toml was updated"),
///     Ok(SyncContentsResult::UpdatedPackageJson(_)) => println!("package.json was updated"),
///     Err(package_version_sync::Error::Version(msg)) => {
///         println!("Parse error: {}", msg);
///     }
///     Err(e) => println!("Other error: {}", e),
/// }
/// ```
pub fn sync_contents(
    cargo_toml_contents: &str,
    package_json_contents: &str,
    source_of_truth: Option<SourceOfTruth>,
) -> Result<SyncContentsResult, Error> {
    let parsed_package_json =
        serde_json::from_str::<serde_json::Value>(package_json_contents).map_err(Error::Serde)?;
    let package_json_version = parsed_package_json
        .get("version")
        .and_then(|version| version.as_str())
        .ok_or_else(|| Error::Version("package version not found".to_string()))?;
    let package_json_version_semver =
        semver::Version::parse(package_json_version).map_err(Error::Semver)?;

    let parsed_cargo_toml =
        toml::from_str::<toml::Table>(cargo_toml_contents).map_err(Error::Toml)?;
    let cargo_toml_version = parsed_cargo_toml
        .get("package")
        .and_then(|package| package.get("version"))
        .and_then(|version| version.as_str())
        .ok_or_else(|| Error::Version("cargo toml version not found".to_string()))?;
    let cargo_toml_version_semver =
        semver::Version::parse(cargo_toml_version).map_err(Error::Semver)?;

    if cargo_toml_version_semver.eq(&package_json_version_semver) {
        return Ok(SyncContentsResult::NoChanges);
    }

    match source_of_truth {
        Some(SourceOfTruth::PackageJson) => {
            return Ok(SyncContentsResult::UpdatedCargoToml(
                patch_cargo_toml_version(
                    cargo_toml_contents,
                    cargo_toml_version,
                    package_json_version,
                )
                .to_string(),
            ));
        }
        Some(SourceOfTruth::CargoToml) => {
            return Ok(SyncContentsResult::UpdatedPackageJson(
                patch_package_json_version(
                    package_json_contents,
                    package_json_version,
                    cargo_toml_version,
                )
                .to_string(),
            ));
        }
        None => {}
    }

    if package_json_version_semver.gt(&cargo_toml_version_semver) {
        return Ok(SyncContentsResult::UpdatedCargoToml(
            patch_cargo_toml_version(
                cargo_toml_contents,
                cargo_toml_version,
                package_json_version,
            )
            .to_string(),
        ));
    }

    if cargo_toml_version_semver.gt(&package_json_version_semver) {
        return Ok(SyncContentsResult::UpdatedPackageJson(
            patch_package_json_version(
                package_json_contents,
                package_json_version,
                cargo_toml_version,
            )
            .to_string(),
        ));
    }

    Ok(SyncContentsResult::NoChanges)
}

/// Syncs version numbers between Cargo.toml and package.json files on disk.
///
/// Reads files, syncs versions using `sync_contents`, and writes updates back.
///
/// # Parameters
///
/// * `cargo_toml_path` - Path to Cargo.toml file
/// * `package_json_path` - Path to package.json file
/// * `source_of_truth` - Force which file's version to use (None = use newer version)
///
/// # Returns
///
/// Returns `Ok(())` on success. Only writes files when updates are needed.
///
/// # Errors
///
/// Returns errors for file I/O issues, invalid JSON/TOML, missing version fields,
/// or invalid semantic version strings.
///
/// # Examples
///
/// ```rust
/// use package_version_sync::{sync_files, SourceOfTruth};
///
/// // Let function decide which version is newer
/// // sync_files("Cargo.toml", "package.json", None)?;
///
/// // Force package.json as source of truth
/// // sync_files("Cargo.toml", "package.json", Some(SourceOfTruth::PackageJson))?;
/// # Ok::<(), package_version_sync::Error>(())
/// ```
pub fn sync_files(
    cargo_toml_path: &str,
    package_json_path: &str,
    source_of_truth: Option<SourceOfTruth>,
) -> Result<(), Error> {
    match sync_contents(
        &fs::read_to_string(cargo_toml_path).map_err(Error::Io)?,
        &fs::read_to_string(package_json_path).map_err(Error::Io)?,
        source_of_truth,
    )? {
        SyncContentsResult::UpdatedCargoToml(cargo_toml_contents) => {
            fs::write(cargo_toml_path, cargo_toml_contents).map_err(Error::Io)?;
        }
        SyncContentsResult::UpdatedPackageJson(package_json_contents) => {
            fs::write(package_json_path, package_json_contents).map_err(Error::Io)?;
        }
        SyncContentsResult::NoChanges => (),
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_cargo_toml(version: &str) -> String {
        format!(
            r#"[package]
name = "test-package"
version = "{}"
edition = "2021"
"#,
            version
        )
    }

    fn create_package_json(version: &str) -> String {
        format!(
            r#"{{
  "name": "test-package",
  "version": "{}",
  "type": "module"
}}"#,
            version
        )
    }

    #[test]
    fn test_versions_already_equal() {
        let cargo_toml = create_cargo_toml("1.2.3");
        let package_json = create_package_json("1.2.3");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        match result {
            SyncContentsResult::NoChanges => {
                // This is expected when versions are equal
            }
            _ => panic!("Expected NoChanges result when versions are equal"),
        }
    }

    #[test]
    fn test_package_json_version_newer() {
        let cargo_toml = create_cargo_toml("1.2.3");
        let package_json = create_package_json("1.2.4");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_cargo_toml = create_cargo_toml("1.2.4");
        match result {
            SyncContentsResult::UpdatedCargoToml(updated_contents) => {
                assert_eq!(updated_contents, expected_cargo_toml);
            }
            _ => panic!("Expected UpdatedCargoToml result"),
        }
    }

    #[test]
    fn test_cargo_toml_version_newer() {
        let cargo_toml = create_cargo_toml("1.2.4");
        let package_json = create_package_json("1.2.3");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_package_json = create_package_json("1.2.4");
        match result {
            SyncContentsResult::UpdatedPackageJson(updated_contents) => {
                assert_eq!(updated_contents, expected_package_json);
            }
            _ => panic!("Expected UpdatedPackageJson result"),
        }
    }

    #[test]
    fn test_source_of_truth_package_json() {
        let cargo_toml = create_cargo_toml("1.2.4");
        let package_json = create_package_json("1.2.3");

        let result =
            sync_contents(&cargo_toml, &package_json, Some(SourceOfTruth::PackageJson)).unwrap();

        let expected_cargo_toml = create_cargo_toml("1.2.3");
        match result {
            SyncContentsResult::UpdatedCargoToml(updated_contents) => {
                assert_eq!(updated_contents, expected_cargo_toml);
            }
            _ => panic!("Expected UpdatedCargoToml result"),
        }
    }

    #[test]
    fn test_source_of_truth_cargo_toml() {
        let cargo_toml = create_cargo_toml("1.2.3");
        let package_json = create_package_json("1.2.4");

        let result =
            sync_contents(&cargo_toml, &package_json, Some(SourceOfTruth::CargoToml)).unwrap();

        let expected_package_json = create_package_json("1.2.3");
        match result {
            SyncContentsResult::UpdatedPackageJson(updated_contents) => {
                assert_eq!(updated_contents, expected_package_json);
            }
            _ => panic!("Expected UpdatedPackageJson result"),
        }
    }

    #[test]
    fn test_major_version_differences() {
        let cargo_toml = create_cargo_toml("2.0.0");
        let package_json = create_package_json("1.9.9");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_package_json = create_package_json("2.0.0");
        match result {
            SyncContentsResult::UpdatedPackageJson(updated_contents) => {
                assert_eq!(updated_contents, expected_package_json);
            }
            _ => panic!("Expected UpdatedPackageJson result"),
        }
    }

    #[test]
    fn test_minor_version_differences() {
        let cargo_toml = create_cargo_toml("1.1.0");
        let package_json = create_package_json("1.0.9");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_package_json = create_package_json("1.1.0");
        match result {
            SyncContentsResult::UpdatedPackageJson(updated_contents) => {
                assert_eq!(updated_contents, expected_package_json);
            }
            _ => panic!("Expected UpdatedPackageJson result"),
        }
    }

    #[test]
    fn test_patch_version_differences() {
        let cargo_toml = create_cargo_toml("1.0.1");
        let package_json = create_package_json("1.0.0");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_package_json = create_package_json("1.0.1");
        match result {
            SyncContentsResult::UpdatedPackageJson(updated_contents) => {
                assert_eq!(updated_contents, expected_package_json);
            }
            _ => panic!("Expected UpdatedPackageJson result"),
        }
    }

    #[test]
    fn test_pre_release_versions() {
        let cargo_toml = create_cargo_toml("1.0.0-alpha.1");
        let package_json = create_package_json("1.0.0");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_cargo_toml = create_cargo_toml("1.0.0");
        match result {
            SyncContentsResult::UpdatedCargoToml(updated_contents) => {
                assert_eq!(updated_contents, expected_cargo_toml);
            }
            _ => panic!("Expected UpdatedCargoToml result"),
        }
    }

    #[test]
    fn test_build_metadata() {
        let cargo_toml = create_cargo_toml("1.0.0+build.1");
        let package_json = create_package_json("1.0.0");

        let result = sync_contents(&cargo_toml, &package_json, None).unwrap();

        let expected_package_json = create_package_json("1.0.0+build.1");
        match result {
            SyncContentsResult::UpdatedPackageJson(updated_contents) => {
                assert_eq!(updated_contents, expected_package_json);
            }
            _ => panic!("Expected UpdatedPackageJson result"),
        }
    }

    #[test]
    fn test_invalid_package_json() {
        let cargo_toml = create_cargo_toml("1.0.0");
        let package_json = "{ invalid json }";

        let result = sync_contents(&cargo_toml, package_json, None);

        assert!(result.is_err());
        match result.unwrap_err() {
            Error::Serde(_) => {}
            _ => panic!("Expected Serde error"),
        }
    }

    #[test]
    fn test_invalid_cargo_toml() {
        let cargo_toml = "[package]\ninvalid toml";
        let package_json = create_package_json("1.0.0");

        let result = sync_contents(cargo_toml, &package_json, None);

        assert!(result.is_err());
        match result.unwrap_err() {
            Error::Toml(_) => {}
            _ => panic!("Expected Toml error"),
        }
    }

    #[test]
    fn test_missing_package_json_version() {
        let cargo_toml = create_cargo_toml("1.0.0");
        let package_json = r#"{
  "name": "test-package"
}"#;

        let result = sync_contents(&cargo_toml, package_json, None);

        assert!(result.is_err());
        match result.unwrap_err() {
            Error::Version(msg) => assert_eq!(msg, "package version not found"),
            _ => panic!("Expected Parse error"),
        }
    }

    #[test]
    fn test_missing_cargo_toml_version() {
        let cargo_toml = r#"[package]
name = "test-package"
edition = "2021"
"#;
        let package_json = create_package_json("1.0.0");

        let result = sync_contents(cargo_toml, &package_json, None);

        assert!(result.is_err());
        match result.unwrap_err() {
            Error::Version(msg) => assert_eq!(msg, "cargo toml version not found"),
            _ => panic!("Expected Parse error"),
        }
    }

    #[test]
    fn test_invalid_semver_package_json() {
        let cargo_toml = create_cargo_toml("1.0.0");
        let package_json = r#"{
  "name": "test-package",
  "version": "not-a-version"
}"#;

        let result = sync_contents(&cargo_toml, package_json, None);

        assert!(result.is_err());
        match result.unwrap_err() {
            Error::Semver(_) => {}
            _ => panic!("Expected Semver error"),
        }
    }

    #[test]
    fn test_invalid_semver_cargo_toml() {
        let cargo_toml = r#"[package]
name = "test-package"
version = "not-a-version"
edition = "2021"
"#;
        let package_json = create_package_json("1.0.0");

        let result = sync_contents(cargo_toml, &package_json, None);

        assert!(result.is_err());
        match result.unwrap_err() {
            Error::Semver(_) => {}
            _ => panic!("Expected Semver error"),
        }
    }

    #[test]
    fn test_complex_cargo_toml_structure() {
        let cargo_toml = r#"[package]
name = "test-package"
version = "1.0.0"
edition = "2021"

[dependencies]
serde = "1.0"

[dev-dependencies]
tokio = "1.0"
"#;
        let package_json = create_package_json("2.0.0");

        let result = sync_contents(cargo_toml, &package_json, None).unwrap();

        let expected_cargo_toml = r#"[package]
name = "test-package"
version = "2.0.0"
edition = "2021"

[dependencies]
serde = "1.0"

[dev-dependencies]
tokio = "1.0"
"#;
        match result {
            SyncContentsResult::UpdatedCargoToml(updated_contents) => {
                assert_eq!(updated_contents, expected_cargo_toml);
            }
            _ => panic!("Expected UpdatedCargoToml result"),
        }
    }

    #[test]
    fn test_complex_package_json_structure() {
        let cargo_toml = create_cargo_toml("1.0.0");
        let package_json = r#"{
  "name": "test-package",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "build": "echo 'building'"
  },
  "dependencies": {
    "react": "^18.0.0"
  }
}"#;

        let result = sync_contents(&cargo_toml, package_json, None).unwrap();

        let expected_cargo_toml = create_cargo_toml("2.0.0");
        match result {
            SyncContentsResult::UpdatedCargoToml(updated_contents) => {
                assert_eq!(updated_contents, expected_cargo_toml);
            }
            _ => panic!("Expected UpdatedCargoToml result"),
        }
    }
}
