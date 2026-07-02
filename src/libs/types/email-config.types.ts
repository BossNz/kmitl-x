export interface EmailConfigOption {
  value: string;
  label: string;
}

export interface EmailConfigData {
  question: string;
  options: EmailConfigOption[];
  selected: string;
  ssid: string;
}
