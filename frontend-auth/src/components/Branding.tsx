export default interface Branding {
  // Name of product
  name: string,
  // Quick few word description of product
  tagline: string,
  // url to homepage
  homeUrl: string,
  // TOS url
  tosUrl?: string,
  // Copyright
  copyrightOrg?: string,
  // Image element adapted for light theme
  iconSrc: string,
}
