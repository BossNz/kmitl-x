export interface PortalMeta {
  title: string;
  initialServerTime: number;
  homeUrl: string;
}

export interface PortalMenuItem {
  id: string;
  label: string;
  url: string;
  absoluteUrl: string;
  isInternal: boolean;
  openInNewTab: boolean;
}

export interface PortalSectionColor {
  bg: string;
  text: string;
}

export interface PortalSection {
  key: string;
  id: string;
  title: string;
  description: string;
  icon: string;
  color: {
    closed: PortalSectionColor;
    open: PortalSectionColor;
    hover: PortalSectionColor;
  };
  order: number;
  items: PortalMenuItem[];
}

export interface PortalScraperResult {
  meta: PortalMeta;
  sections: PortalSection[];
}
