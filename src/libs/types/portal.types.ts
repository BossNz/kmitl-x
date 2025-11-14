export interface PortalMeta {
    title: string;
    initialServerTime: string;
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

export interface PortalSection {
    id: string;
    title: string;
    description: string;
    icon: string;
    items: PortalMenuItem[];
}

export interface PortalScraperResult {
    meta: PortalMeta;
    sections: PortalSection[];
}