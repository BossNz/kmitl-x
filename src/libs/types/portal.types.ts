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
    key: string;
    id: string;
    title: string;
    description: string;
    icon: string;
    order: number;
    items: PortalMenuItem[];
}

export interface PortalScraperResult {
    meta: PortalMeta;
    sections: PortalSection[];
}