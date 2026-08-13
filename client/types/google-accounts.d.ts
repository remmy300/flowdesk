interface IdConfiguration {
  client_id: string;
  auto_select?: boolean;
  callback: (response: CredentialResponse) => void;
  prompt_parent_id?: string;
  state_cookie_domain?: string;
  ux_mode?: "popup" | "redirect";
  cancel_on_tap_outside?: boolean;
}

interface CredentialResponse {
  credential?: string;
  select_by?: string;
  clientId?: string;
}

interface GsiButtonConfiguration {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: IdConfiguration) => void;
        renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
        prompt: (momentListener?: (notification: unknown) => void) => void;
        disableAutoSelect: () => void;
        cancel: () => void;
      };
    };
  };
}
