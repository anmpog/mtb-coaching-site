export interface NavigationLink {
  /** A descriptive string to serve as the human-readable, visually displayed link title. */
  title: string

  /** A string that will serve as the href attribute to the underlying <a> element. */
  path: string

  /** An optional object that describes sub-navigation */
  subNavOptions?: SubNavigationOptions
}

export interface SubNavigationOptions {
  /** A descriptive string to serve as the human-readable, visually displayed title of the sub-navigation element. */
  subNavigationTitle: string
  subNavigationLinks: { title: string; path: string }[]
}
