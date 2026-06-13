/** Display labels for website media folders (API may still use legacy names). */
export function displayWebsiteFolderName(name: string): string {
  if (name === 'Other') return 'Team'
  return name
}

export function websiteFolderUploadHint(folderName: string): string {
  const label = displayWebsiteFolderName(folderName)
  return `Uploads go into your site's ${label} folder in the repository.`
}
